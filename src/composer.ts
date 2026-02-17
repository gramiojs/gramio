import {
	compose,
	createComposer,
	EventQueue,
	type Next,
	noopNext,
	skip,
	stop,
} from "@gramio/composer";
import type { Context, ContextType, UpdateName } from "@gramio/contexts";
import type { AnyBot, AnyPlugin } from "./types.js";

type TelegramEventMap = {
	[K in UpdateName]: ContextType<AnyBot, K>;
};

/** Teach EventComposer.extend() to accept Plugin with proper type extraction */
declare module "@gramio/composer" {
	interface EventComposer<
		TBase,
		TEventMap,
		TIn,
		TOut,
		TExposed,
		TDerives,
	> {
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

export const { Composer } = createComposer<
	Context<AnyBot> & { [key: string]: unknown },
	TelegramEventMap
>({
	// biome-ignore lint/complexity/useLiteralKeys: updateType is protected on Context
	discriminator: (ctx) => ctx["updateType"],
});

export { EventQueue, compose, noopNext, skip, stop };
export type { Next };
export type { EventComposer, Middleware } from "@gramio/composer";
