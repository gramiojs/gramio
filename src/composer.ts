import type { CallbackData } from "@gramio/callback-data";
import {
	buildFromOptions,
	compose,
	type ComposerLike,
	type ContextOf,
	createComposer,
	defineComposerMethods,
	EventContextOf,
	EventQueue,
	eventTypes,
	type MacroDefinitions,
	type Next,
	noopNext,
	skip,
	stop,
} from "@gramio/composer";
import type { Context, ContextsMapping } from "@gramio/contexts";
import type { TelegramReactionTypeEmojiEmoji } from "@gramio/types";
import type { AnyBot, AnyPlugin, CommandMeta, Handler } from "./types.js";
import type { MaybeArray } from "./utils.internal.js";

type TelegramEventMap = {
	[K in keyof ContextsMapping<AnyBot>]: InstanceType<
		ContextsMapping<AnyBot>[K]
	>;
};

/** Concrete context type without GetDerives (which collapses to any with AnyBot) */
type Ctx<K extends keyof ContextsMapping<AnyBot>> = InstanceType<
	ContextsMapping<AnyBot>[K]
>;

/**
 * Extends `ComposerLike<T>` with the two internal members that method
 * bodies need: macro registry and the cross-method `chosenInlineResult` call.
 */
type GramIOLike<T> = ComposerLike<T> & {
	"~": { macros: MacroDefinitions; commandsMeta?: Map<string, unknown>; Derives?: Record<string, object> };
	chosenInlineResult(trigger: any, handler: any, macroOptions?: any): T;
};
/** Teach EventComposer about GramIO-specific overloads */
declare module "@gramio/composer" {
	interface EventComposer<TBase, TEventMap, TIn, TOut, TExposed, TDerives, TMethods, TMacros> {
		extend<P extends AnyPlugin>(
			plugin: P,
		): EventComposer<
			TBase,
			TEventMap,
			TIn,
			TOut & P["_"]["Derives"]["global"],
			TExposed,
			TDerives & Omit<P["_"]["Derives"], "global">,
			TMethods,
			TMacros & P["_"]["Macros"]
		>;
		registeredEvents(): Set<string>;
	}
}

const methods = defineComposerMethods({
	reaction<TThis extends GramIOLike<TThis>>(
		this: TThis,
		trigger: MaybeArray<TelegramReactionTypeEmojiEmoji>,
		handler: (context: Ctx<"message_reaction"> & EventContextOf<TThis, "message_reaction">) => unknown,
		macroOptions?: Record<string, unknown>,
	): TThis {
		const reactions = Array.isArray(trigger) ? trigger : [trigger];
		const macroHandler = macroOptions
			? buildFromOptions(this["~"].macros, macroOptions, handler as (ctx: any) => unknown)
			: null;

		type Inner = Ctx<"message_reaction"> & EventContextOf<TThis, "message_reaction">;
		return this.on(
			"message_reaction",
			(context: Inner, next: Next) => {
				const oldEmojis = new Set<string>();
				for (const r of context.oldReactions) {
					if (r.type === "emoji") oldEmojis.add(r.emoji);
				}

				const hasNewMatchingReaction = context.newReactions.some(
					(reaction) =>
						reaction.type === "emoji" &&
						!oldEmojis.has(reaction.emoji) &&
						reactions.includes(reaction.emoji),
				);

				if (!hasNewMatchingReaction) return next();
				return macroHandler ? macroHandler(context, noopNext) : handler(context);
			},
		);
	},

	callbackQuery<TThis extends GramIOLike<TThis>, Trigger extends CallbackData | string | RegExp>(
		this: TThis,
		trigger: Trigger,
		handler: (context: Ctx<"callback_query"> & {
			queryData: Trigger extends CallbackData
				? ReturnType<Trigger["unpack"]>
				: Trigger extends RegExp
					? RegExpMatchArray
					: never;
		} & EventContextOf<TThis, "callback_query">) => unknown,
		macroOptions?: Record<string, unknown>,
	): TThis {
		const macroHandler = macroOptions
			? buildFromOptions(this["~"].macros, macroOptions, handler as (ctx: any) => unknown)
			: null;

		type QueryData = Trigger extends CallbackData
			? ReturnType<Trigger["unpack"]>
			: Trigger extends RegExp
				? RegExpMatchArray
				: never;
		type Inner = Ctx<"callback_query"> & { queryData: QueryData } & EventContextOf<TThis, "callback_query">;

		if (typeof trigger === "string") {
			return this.on("callback_query", (context: Inner, next: Next) => {
				if (context.data !== trigger) return next();
				return macroHandler ? macroHandler(context, noopNext) : handler(context);
			});
		}

		if (trigger instanceof RegExp) {
			return this.on("callback_query", (context: Inner, next: Next) => {
				if (!context.data || !trigger.test(context.data)) return next();
				context.queryData = context.data.match(trigger) as QueryData;
				return macroHandler ? macroHandler(context, noopNext) : handler(context);
			});
		}

		// CallbackData
		return this.on("callback_query", (context: Inner, next: Next) => {
			if (!context.data || !trigger.filter(context.data)) return next();
			context.queryData = trigger.unpack(context.data) as QueryData;
			return macroHandler ? macroHandler(context, noopNext) : handler(context);
		});
	},

	chosenInlineResult<TThis extends GramIOLike<TThis>>(
		this: TThis,
		trigger:
			| RegExp
			| string
			| ((context: Ctx<"chosen_inline_result">) => boolean),
		handler: (
			context: Ctx<"chosen_inline_result"> & {
				args: RegExpMatchArray | null;
			} & EventContextOf<TThis, "chosen_inline_result">,
		) => unknown,
		macroOptions?: Record<string, unknown>,
	): TThis {
		type Inner = Ctx<"chosen_inline_result"> & { args: RegExpMatchArray | null } & EventContextOf<TThis, "chosen_inline_result">;
		const macroHandler = macroOptions
			? buildFromOptions(this["~"].macros, macroOptions, handler as (ctx: any) => unknown)
			: null;

		if (typeof trigger === "string") {
			return this.on("chosen_inline_result", (context: Inner, next: Next) => {
				if (context.query !== trigger) return next();
				context.args = null;
				return macroHandler ? macroHandler(context, noopNext) : handler(context);
			});
		}

		if (trigger instanceof RegExp) {
			return this.on("chosen_inline_result", (context: Inner, next: Next) => {
				if (!trigger.test(context.query)) return next();
				context.args = context.query?.match(trigger);
				return macroHandler ? macroHandler(context, noopNext) : handler(context);
			});
		}

		// function predicate
		return this.on("chosen_inline_result", (context: Inner, next: Next) => {
			if (!trigger(context)) return next();
			context.args = null;
			return macroHandler ? macroHandler(context, noopNext) : handler(context);
		});
	},

	inlineQuery<TThis extends GramIOLike<TThis>>(
		this: TThis,
		trigger: RegExp | string | ((context: Ctx<"inline_query">) => boolean),
		handler: (
			context: Ctx<"inline_query"> & {
				args: RegExpMatchArray | null;
			} & EventContextOf<TThis, "inline_query">,
		) => unknown,
		options: {
			onResult?: (
				context: Ctx<"chosen_inline_result"> & {
					args: RegExpMatchArray | null;
				} & EventContextOf<TThis, "chosen_inline_result">,
			) => unknown;
		} & Record<string, unknown> = {},
	): TThis {
		if (options.onResult) this.chosenInlineResult(trigger, options.onResult);

		type Inner = Ctx<"inline_query"> & { args: RegExpMatchArray | null } & EventContextOf<TThis, "inline_query">;

		const { onResult: _, ...macroOptions } = options;
		const hasMacros = Object.keys(macroOptions).length > 0;
		const macroHandler = hasMacros
			? buildFromOptions(this["~"].macros, macroOptions, handler as (ctx: any) => unknown)
			: null;

		if (typeof trigger === "string") {
			return this.on("inline_query", (context: Inner, next: Next) => {
				if (context.query !== trigger) return next();
				context.args = null;
				return macroHandler ? macroHandler(context, noopNext) : handler(context);
			});
		}

		if (trigger instanceof RegExp) {
			return this.on("inline_query", (context: Inner, next: Next) => {
				if (!trigger.test(context.query)) return next();
				context.args = context.query?.match(trigger);
				return macroHandler ? macroHandler(context, noopNext) : handler(context);
			});
		}

		// function predicate
		return this.on("inline_query", (context: Inner, next: Next) => {
			if (!trigger(context)) return next();
			context.args = null;
			return macroHandler ? macroHandler(context, noopNext) : handler(context);
		});
	},

	hears<TThis extends GramIOLike<TThis>>(
		this: TThis,
		trigger:
			| RegExp
			| MaybeArray<string>
			| ((context: Ctx<"message">) => boolean),
		handler: (
			context: Ctx<"message"> & {
				args: RegExpMatchArray | null;
			} & EventContextOf<TThis, "message">,
		) => unknown,
		macroOptions?: Record<string, unknown>,
	): TThis {
		type Inner = Ctx<"message"> & { args: RegExpMatchArray | null } & EventContextOf<TThis, "message">;
		const macroHandler = macroOptions
			? buildFromOptions(this["~"].macros, macroOptions, handler as (ctx: any) => unknown)
			: null;

		if (typeof trigger === "string") {
			return this.on("message", (context: Inner, next: Next) => {
				if ((context.text ?? context.caption) !== trigger) return next();
				context.args = null;
				return macroHandler ? macroHandler(context, noopNext) : handler(context);
			});
		}

		if (Array.isArray(trigger)) {
			return this.on("message", (context: Inner, next: Next) => {
				const text = context.text ?? context.caption;
				if (!text || !trigger.includes(text)) return next();
				context.args = null;
				return macroHandler ? macroHandler(context, noopNext) : handler(context);
			});
		}

		if (trigger instanceof RegExp) {
			return this.on("message", (context: Inner, next: Next) => {
				const text = context.text ?? context.caption;
				if (!text || !trigger.test(text)) return next();
				context.args = text.match(trigger);
				return macroHandler ? macroHandler(context, noopNext) : handler(context);
			});
		}

		// function predicate
		return this.on("message", (context: Inner, next: Next) => {
			if (typeof trigger !== "function" || !trigger(context as unknown as Ctx<"message">)) return next();
			context.args = null;
			return macroHandler ? macroHandler(context, noopNext) : handler(context);
		});
	},

	command<TThis extends GramIOLike<TThis>>(
		this: TThis,
		command: MaybeArray<string>,
		handlerOrMeta: ((context: Ctx<"message"> & { args: string | null } & EventContextOf<TThis, "message">) => unknown) | CommandMeta,
		handlerOrOptions?: ((context: Ctx<"message"> & { args: string | null } & EventContextOf<TThis, "message">) => unknown) | Record<string, unknown>,
		macroOptions?: Record<string, unknown>,
	): TThis {
		// Disambiguate overloads: (command, handler, options?) vs (command, meta, handler, options?)
		let handler: (context: any) => unknown;
		let meta: CommandMeta | undefined;
		let resolvedMacroOptions: Record<string, unknown> | undefined;

		if (typeof handlerOrMeta === "function") {
			// Existing: command(name, handler, macroOptions?)
			handler = handlerOrMeta;
			resolvedMacroOptions = handlerOrOptions as Record<string, unknown> | undefined;
		} else {
			// New: command(name, meta, handler, macroOptions?)
			meta = handlerOrMeta;
			handler = handlerOrOptions as (context: any) => unknown;
			resolvedMacroOptions = macroOptions;
		}

		const normalizedCommands: string[] =
			typeof command === "string" ? [command] : Array.from(command);

		for (const cmd of normalizedCommands) {
			if (cmd.startsWith("/"))
				throw new Error(`Do not use / in command name (${cmd})`);
		}

		// Store command metadata for syncCommands()
		if (meta) {
			if (!this["~"].commandsMeta) {
				this["~"].commandsMeta = new Map();
			}
			for (const cmd of normalizedCommands) {
				this["~"].commandsMeta.set(cmd, meta);
			}
		}

		type Inner = Ctx<"message"> & { args: string | null } & EventContextOf<TThis, "message">;
		const macroHandler = resolvedMacroOptions
			? buildFromOptions(this["~"].macros, resolvedMacroOptions, handler as (ctx: any) => unknown)
			: null;

		return this.on(["message", "business_message"], (context: Inner, next: Next) => {
			const entity = context.entities?.find((entity) => {
				if (entity.type !== "bot_command" || entity.offset > 0) return false;

				const botInfo: { username?: string } | undefined = context.bot.info;
				const cmd = context.text
					?.slice(1, entity.length)
					?.replace(
						botInfo?.username ? `@${botInfo.username}` : /@[a-zA-Z0-9_]+/,
						"",
					);

				return normalizedCommands.some(
					(normalizedCommand) => cmd === normalizedCommand,
				);
			});

			if (entity) {
				context.args = context.text?.slice(entity.length).trim() || null;
				return macroHandler ? macroHandler(context, noopNext) : handler(context);
			}

			return next();
		});
	},

	startParameter<TThis extends GramIOLike<TThis>>(
		this: TThis,
		parameter: RegExp | MaybeArray<string>,
		handler: Handler<Ctx<"message"> & { rawStartPayload: string } & EventContextOf<TThis, "message">>,
		macroOptions?: Record<string, unknown>,
	): TThis {
		type Inner = Ctx<"message"> & { rawStartPayload: string } & EventContextOf<TThis, "message">;
		const macroHandler = macroOptions
			? buildFromOptions(this["~"].macros, macroOptions, handler as (ctx: any) => unknown)
			: null;

		if (parameter instanceof RegExp) {
			return this.on("message", (context: Inner, next: Next) => {
				if (!context.rawStartPayload || !parameter.test(context.rawStartPayload))
					return next();
				return macroHandler ? macroHandler(context, noopNext) : handler(context, noopNext);
			});
		}

		if (Array.isArray(parameter)) {
			return this.on("message", (context: Inner, next: Next) => {
				if (!context.rawStartPayload || !parameter.includes(context.rawStartPayload))
					return next();
				return macroHandler ? macroHandler(context, noopNext) : handler(context, noopNext);
			});
		}

		// string
		return this.on("message", (context: Inner, next: Next) => {
			if (!context.rawStartPayload || context.rawStartPayload !== parameter) return next();
			return macroHandler ? macroHandler(context, noopNext) : handler(context, noopNext);
		});
	},
});

export const { Composer } = createComposer<
	Context<AnyBot>,
	TelegramEventMap,
	typeof methods
>({
	discriminator: (ctx: Context<AnyBot>) => (ctx as any).updateType,
	types: eventTypes<TelegramEventMap>(),
	methods,
});

// Polyfill registeredEvents() if the installed @gramio/composer doesn't provide it.
// This method scans the middleware list to collect registered event names.
if (typeof (Composer.prototype as any).registeredEvents !== "function") {
	(Composer.prototype as any).registeredEvents = function (
		this: any,
	): Set<string> {
		const events = new Set<string>();
		for (const mw of this["~"].middlewares) {
			if ((mw.type === "on" || mw.type === "derive") && mw.name) {
				for (const part of mw.name.split("|")) {
					const eventPart = part.includes(":") ? part.split(":")[0] : part;
					if (eventPart) events.add(eventPart);
				}
			}
		}
		return events;
	};
}

// Patch extend() to also merge commandsMeta from sub-composers.
// This ensures command metadata is collected transitively when using .extend().
{
	const originalExtend = (Composer.prototype as any).extend;
	(Composer.prototype as any).extend = function (this: any, other: any) {
		const result = originalExtend.call(this, other);
		if (other["~"]?.commandsMeta) {
			if (!this["~"].commandsMeta) {
				this["~"].commandsMeta = new Map();
			}
			for (const [cmd, meta] of other["~"].commandsMeta) {
				this["~"].commandsMeta.set(cmd, meta);
			}
		}
		return result;
	};
}

export { EventQueue, buildFromOptions, compose, noopNext, skip, stop };
export type { Next };
export type { EventComposer, Middleware } from "@gramio/composer";
export type {
	ContextCallback,
	WithCtx,
	MacroHooks,
	MacroDef,
	MacroDefinitions,
	MacroOptionType,
	MacroDeriveType,
	HandlerOptions,
	DeriveFromOptions,
} from "@gramio/composer";
