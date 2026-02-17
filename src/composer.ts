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
import type { AnyBot } from "./types.js";

type TelegramEventMap = {
	[K in UpdateName]: ContextType<AnyBot, K>;
};

export const { Composer } = createComposer<
	Context<AnyBot> & { [key: string]: unknown },
	TelegramEventMap
>({
	// biome-ignore lint/complexity/useLiteralKeys: updateType is protected on Context
	discriminator: (ctx) => ctx["updateType"],
});

export { EventQueue, compose, noopNext, skip, stop };
export type { Next };
