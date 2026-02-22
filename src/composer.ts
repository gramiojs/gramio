import type { CallbackData } from "@gramio/callback-data";
import {
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

/** Teach EventComposer.extend() to accept Plugin with proper type extraction */
declare module "@gramio/composer" {
	interface EventComposer<TBase, TEventMap, TIn, TOut, TExposed, TDerives> {
		extend<P extends AnyPlugin>(
			plugin: P,
		): EventComposer<
			TBase,
			TEventMap,
			TIn,
			TOut & P["_"]["Derives"]["global"],
			TExposed,
			TDerives & Omit<P["_"]["Derives"], "global">
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
		) {
			const reactions = Array.isArray(trigger) ? trigger : [trigger];

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

				return handler(context);
			});
		},

		callbackQuery(
			trigger: CallbackData | string | RegExp,
			handler: (context: CallbackQueryShorthandContext<AnyBot, any>) => unknown,
		) {
			if (typeof trigger === "string") {
				return this.on("callback_query", (context, next) => {
					if (context.data !== trigger) return next();
					return handler(context as any);
				});
			}

			if (trigger instanceof RegExp) {
				return this.on("callback_query", (context, next) => {
					if (!context.data || !trigger.test(context.data)) return next();
					(context as any).queryData = context.data.match(trigger);
					return handler(context as any);
				});
			}

			// CallbackData
			const regexp = trigger.regexp();
			return this.on("callback_query", (context, next) => {
				if (!context.data || !regexp.test(context.data)) return next();
				(context as any).queryData = trigger.unpack(context.data);
				return handler(context as any);
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
		) {
			if (typeof trigger === "string") {
				return this.on("chosen_inline_result", (context, next) => {
					if (context.query !== trigger) return next();
					(context as any).args = null;
					return handler(context as any);
				});
			}

			if (trigger instanceof RegExp) {
				return this.on("chosen_inline_result", (context, next) => {
					if (!trigger.test(context.query)) return next();
					(context as any).args = context.query?.match(trigger);
					return handler(context as any);
				});
			}

			// function predicate
			return this.on("chosen_inline_result", (context, next) => {
				if (!trigger(context)) return next();
				(context as any).args = null;
				return handler(context as any);
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
			} = {},
		) {
			if (options.onResult)
				this.chosenInlineResult(trigger as any, options.onResult as any);

			if (typeof trigger === "string") {
				return this.on("inline_query", (context, next) => {
					if (context.query !== trigger) return next();
					(context as any).args = null;
					return handler(context as any);
				});
			}

			if (trigger instanceof RegExp) {
				return this.on("inline_query", (context, next) => {
					if (!trigger.test(context.query)) return next();
					(context as any).args = context.query?.match(trigger);
					return handler(context as any);
				});
			}

			// function predicate
			return this.on("inline_query", (context, next) => {
				if (!trigger(context)) return next();
				(context as any).args = null;
				return handler(context as any);
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
		) {
			if (typeof trigger === "string") {
				return this.on("message", (context, next) => {
					if ((context.text ?? context.caption) !== trigger) return next();
					(context as any).args = null;
					return handler(context as any);
				});
			}

			if (Array.isArray(trigger)) {
				return this.on("message", (context, next) => {
					const text = context.text ?? context.caption;
					if (!text || !trigger.includes(text)) return next();
					(context as any).args = null;
					return handler(context as any);
				});
			}

			if (trigger instanceof RegExp) {
				return this.on("message", (context, next) => {
					const text = context.text ?? context.caption;
					if (!text || !trigger.test(text)) return next();
					(context as any).args = text.match(trigger);
					return handler(context as any);
				});
			}

			// function predicate
			return this.on("message", (context, next) => {
				if (typeof trigger !== "function" || !trigger(context)) return next();
				(context as any).args = null;
				return handler(context as any);
			});
		},

		command(
			command: MaybeArray<string>,
			handler: (context: Ctx<"message"> & { args: string | null }) => unknown,
		) {
			const normalizedCommands: string[] =
				typeof command === "string" ? [command] : Array.from(command);

			for (const cmd of normalizedCommands) {
				if (cmd.startsWith("/"))
					throw new Error(`Do not use / in command name (${cmd})`);
			}

			return this.on(["message", "business_message"], (context, next) => {
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
					(context as any).args =
						context.text?.slice(entity.length).trim() || null;
					return handler(context as any);
				}

				return next();
			});
		},

		startParameter(
			parameter: RegExp | MaybeArray<string>,
			handler: Handler<Ctx<"message"> & { rawStartPayload: string }>,
		) {
			if (parameter instanceof RegExp) {
				return this.on("message", (context, next) => {
					if (
						!context.rawStartPayload ||
						!parameter.test(context.rawStartPayload)
					)
						return next();
					return handler(context as any, noopNext);
				});
			}

			if (Array.isArray(parameter)) {
				return this.on("message", (context, next) => {
					if (
						!context.rawStartPayload ||
						!parameter.includes(context.rawStartPayload)
					)
						return next();
					return handler(context as any, noopNext);
				});
			}

			// string
			return this.on("message", (context, next) => {
				if (context.rawStartPayload !== parameter) return next();
				return handler(context as any, noopNext);
			});
		},
	},
});

export { EventQueue, compose, noopNext, skip, stop };
export type { Next };
export type { EventComposer, Middleware } from "@gramio/composer";
