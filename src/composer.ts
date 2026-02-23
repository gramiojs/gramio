import type { CallbackData } from "@gramio/callback-data";
import {
	buildFromOptions,
	compose,
	createComposer,
	EventQueue,
	eventTypes,
	type Next,
	noopNext,
	skip,
	stop,
} from "@gramio/composer";
import type { Context, ContextsMapping } from "@gramio/contexts";
import type { TelegramReactionTypeEmojiEmoji } from "@gramio/types";
import type {
	AnyBot,
	AnyPlugin,
	CallbackQueryShorthandContext,
	Handler,
} from "./types.js";
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
	}
}

export const { Composer } = createComposer({
	discriminator: (ctx: Context<AnyBot>) => (ctx as any).updateType,
	types: eventTypes<TelegramEventMap>(),
	methods: {
		reaction(
			trigger: MaybeArray<TelegramReactionTypeEmojiEmoji>,
			handler: (context: Ctx<"message_reaction">) => unknown,
			macroOptions?: Record<string, unknown>,
		) {
			const reactions = Array.isArray(trigger) ? trigger : [trigger];
			const macroHandler = macroOptions
				? buildFromOptions(this["~"].macros, macroOptions, (ctx: any, _n: any) => handler(ctx))
				: null;

			return this.on("message_reaction", (context, next) => {
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
			});
		},

		callbackQuery(
			trigger: CallbackData | string | RegExp,
			handler: (context: CallbackQueryShorthandContext<AnyBot, any>) => unknown,
			macroOptions?: Record<string, unknown>,
		) {
			const macroHandler = macroOptions
				? buildFromOptions(this["~"].macros, macroOptions, (ctx: any, _n: any) => handler(ctx))
				: null;

			if (typeof trigger === "string") {
				return this.on<"callback_query", { queryData: string | null }>("callback_query", (context, next) => {
					if (context.data !== trigger) return next();
					return macroHandler ? macroHandler(context, noopNext) : handler(context);
				});
			}

			if (trigger instanceof RegExp) {
				return this.on<"callback_query", { queryData: RegExpMatchArray | null }>("callback_query", (context, next) => {
					if (!context.data || !trigger.test(context.data)) return next();
					context.queryData = context.data.match(trigger);
					return macroHandler ? macroHandler(context, noopNext) : handler(context);
				});
			}

			// CallbackData
			return this.on<"callback_query", { queryData: any }>("callback_query", (context, next) => {
				if (!context.data || !trigger.filter(context.data)) return next();
				context.queryData = trigger.unpack(context.data);
				return macroHandler ? macroHandler(context, noopNext) : handler(context);
			});
		},

		chosenInlineResult(
			trigger:
				| RegExp
				| string
				| ((context: Ctx<"chosen_inline_result">) => boolean),
			handler: (
				context: Ctx<"chosen_inline_result"> & {
					args: RegExpMatchArray | null;
				},
			) => unknown,
			macroOptions?: Record<string, unknown>,
		) {
			const macroHandler = macroOptions
				? buildFromOptions(this["~"].macros, macroOptions, (ctx: any, _n: any) => handler(ctx))
				: null;

			if (typeof trigger === "string") {
				return this.on<"chosen_inline_result", { args: RegExpMatchArray | null }>("chosen_inline_result", (context, next) => {
					if (context.query !== trigger) return next();
					context.args = null;
					return macroHandler ? macroHandler(context, noopNext) : handler(context);
				});
			}

			if (trigger instanceof RegExp) {
				return this.on<"chosen_inline_result", { args: RegExpMatchArray | null }>("chosen_inline_result", (context, next) => {
					if (!trigger.test(context.query)) return next();
					context.args = context.query?.match(trigger);
					return macroHandler ? macroHandler(context, noopNext) : handler(context);
				});
			}

			// function predicate
			return this.on<"chosen_inline_result", { args: RegExpMatchArray | null }>("chosen_inline_result", (context, next) => {
				if (!trigger(context)) return next();
				context.args = null;
				return macroHandler ? macroHandler(context, noopNext) : handler(context);
			});
		},

		inlineQuery(
			trigger: RegExp | string | ((context: Ctx<"inline_query">) => boolean),
			handler: (
				context: Ctx<"inline_query"> & {
					args: RegExpMatchArray | null;
				},
			) => unknown,
			options: {
				onResult?: (
					context: Ctx<"chosen_inline_result"> & {
						args: RegExpMatchArray | null;
					},
				) => unknown;
			} & Record<string, unknown> = {},
		) {
			if (options.onResult)
				this.chosenInlineResult(trigger as any, options.onResult as any);

			const { onResult: _, ...macroOptions } = options;
			const hasMacros = Object.keys(macroOptions).length > 0;
			const macroHandler = hasMacros
				? buildFromOptions(this["~"].macros, macroOptions, (ctx: any, _n: any) => handler(ctx))
				: null;

			if (typeof trigger === "string") {
				return this.on<"inline_query", { args: RegExpMatchArray | null }>("inline_query", (context, next) => {
					if (context.query !== trigger) return next();
					context.args = null;
					return macroHandler ? macroHandler(context, noopNext) : handler(context);
				});
			}

			if (trigger instanceof RegExp) {
				return this.on<"inline_query", { args: RegExpMatchArray | null }>("inline_query", (context, next) => {
					if (!trigger.test(context.query)) return next();
					context.args = context.query?.match(trigger);
					return macroHandler ? macroHandler(context, noopNext) : handler(context);
				});
			}

			// function predicate
			return this.on<"inline_query", { args: RegExpMatchArray | null }>("inline_query", (context, next) => {
				if (!trigger(context)) return next();
				context.args = null;
				return macroHandler ? macroHandler(context, noopNext) : handler(context);
			});
		},

		hears(
			trigger:
				| RegExp
				| MaybeArray<string>
				| ((context: Ctx<"message">) => boolean),
			handler: (
				context: Ctx<"message"> & {
					args: RegExpMatchArray | null;
				},
			) => unknown,
			macroOptions?: Record<string, unknown>,
		) {
			const macroHandler = macroOptions
				? buildFromOptions(this["~"].macros, macroOptions, (ctx: any, _n: any) => handler(ctx))
				: null;

			if (typeof trigger === "string") {
				return this.on<"message", { args: RegExpMatchArray | null }>("message", (context, next) => {
					if ((context.text ?? context.caption) !== trigger) return next();
					context.args = null;
					return macroHandler ? macroHandler(context, noopNext) : handler(context);
				});
			}

			if (Array.isArray(trigger)) {
				return this.on<"message", { args: RegExpMatchArray | null }>("message", (context, next) => {
					const text = context.text ?? context.caption;
					if (!text || !trigger.includes(text)) return next();
					context.args = null;
					return macroHandler ? macroHandler(context, noopNext) : handler(context);
				});
			}

			if (trigger instanceof RegExp) {
				return this.on<"message", { args: RegExpMatchArray | null }>("message", (context, next) => {
					const text = context.text ?? context.caption;
					if (!text || !trigger.test(text)) return next();
					context.args = text.match(trigger);
					return macroHandler ? macroHandler(context, noopNext) : handler(context);
				});
			}

			// function predicate
			return this.on<"message", { args: RegExpMatchArray | null }>("message", (context, next) => {
				if (typeof trigger !== "function" || !trigger(context)) return next();
				context.args = null;
				return macroHandler ? macroHandler(context, noopNext) : handler(context);
			});
		},

		command(
			command: MaybeArray<string>,
			handler: (context: Ctx<"message"> & { args: string | null }) => unknown,
			macroOptions?: Record<string, unknown>,
		) {
			const normalizedCommands: string[] =
				typeof command === "string" ? [command] : Array.from(command);

			for (const cmd of normalizedCommands) {
				if (cmd.startsWith("/"))
					throw new Error(`Do not use / in command name (${cmd})`);
			}

			const macroHandler = macroOptions
				? buildFromOptions(this["~"].macros, macroOptions, (ctx: any, _n: any) => handler(ctx))
				: null;

			return this.on<"message" | "business_message", { args: string | null }>(["message", "business_message"], (context, next) => {
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
					context.args =
						context.text?.slice(entity.length).trim() || null;
					return macroHandler ? macroHandler(context, noopNext) : handler(context);
				}

				return next();
			});
		},

		startParameter(
			parameter: RegExp | MaybeArray<string>,
			handler: Handler<Ctx<"message"> & { rawStartPayload: string }>,
			macroOptions?: Record<string, unknown>,
		) {
			const macroHandler = macroOptions
				? buildFromOptions(this["~"].macros, macroOptions, (ctx: any, n: any) => handler(ctx, n))
				: null;

			if (parameter instanceof RegExp) {
				return this.on<"message", { rawStartPayload: string }>("message", (context, next) => {
					if (
						!context.rawStartPayload ||
						!parameter.test(context.rawStartPayload)
					)
						return next();
					return macroHandler ? macroHandler(context, noopNext) : handler(context, noopNext);
				});
			}

			if (Array.isArray(parameter)) {
				return this.on<"message", { rawStartPayload: string }>("message", (context, next) => {
					if (
						!context.rawStartPayload ||
						!parameter.includes(context.rawStartPayload)
					)
						return next();
					return macroHandler ? macroHandler(context, noopNext) : handler(context, noopNext);
				});
			}

			// string
			return this.on<"message", { rawStartPayload: string }>("message", (context, next) => {
				if (!context.rawStartPayload || context.rawStartPayload !== parameter) return next();
				return macroHandler ? macroHandler(context, noopNext) : handler(context, noopNext);
			});
		},
	},
});

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
