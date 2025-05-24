import type { Bot } from "../bot.js";
import { timeoutWebhook } from "../utils.internal.js";
import { type FrameworkAdapter, frameworks } from "./adapters.js";

/** Union type of webhook handlers name */
export type WebhookHandlers = keyof typeof frameworks;

export interface WebhookHandlerOptionsShouldWait {
	/** Action to take when timeout occurs. @default "throw" */
	onTimeout?: "throw" | "return";
	/** Timeout in milliseconds. @default 10_000 */
	timeout?: number;
}

export interface WebhookHandlerOptions {
	secretToken?: string;

	shouldWait?: boolean | WebhookHandlerOptionsShouldWait;
}

/**
 * Setup handler with yours web-framework to receive updates via webhook
 *
 *	@example
 * ```ts
 * import { Bot } from "gramio";
 * import Fastify from "fastify";
 *
 * const bot = new Bot(process.env.TOKEN as string).on(
 * 	"message",
 * 	(context) => {
 * 		return context.send("Fastify!");
 * 	},
 * );
 *
 * const fastify = Fastify();
 *
 * fastify.post("/telegram-webhook", webhookHandler(bot, "fastify"));
 *
 * fastify.listen({ port: 3445, host: "::" });
 *
 * bot.start({
 *     webhook: {
 *         url: "https://example.com:3445/telegram-webhook",
 *     },
 * });
 * ```
 */
export function webhookHandler<Framework extends keyof typeof frameworks>(
	bot: Bot,
	framework: Framework,
	secretTokenOrOptions?: string | WebhookHandlerOptions,
) {
	const frameworkAdapter = frameworks[framework];
	const secretToken =
		typeof secretTokenOrOptions === "string"
			? secretTokenOrOptions
			: secretTokenOrOptions?.secretToken;
	const shouldWaitOptions =
		typeof secretTokenOrOptions === "string"
			? false
			: secretTokenOrOptions?.shouldWait;
	const isShouldWait =
		shouldWaitOptions &&
		(typeof shouldWaitOptions === "object" ||
			typeof shouldWaitOptions === "boolean");

	return (async (...args: any[]) => {
		const { update, response, header, unauthorized } = frameworkAdapter(
			// @ts-expect-error
			...args,
		);

		if (secretToken && header !== secretToken) return unauthorized();

		if (!isShouldWait) {
			// await bot.updates.handleUpdate(await update);
			// TODO: more think about queue based or wait in handler update
			bot.updates.queue.add(await update);

			if (response) return response();
		} else {
			const timeoutOptions =
				typeof shouldWaitOptions === "object" ? shouldWaitOptions : undefined;
			const timeout = timeoutOptions?.timeout ?? 30000;
			const onTimeout = timeoutOptions?.onTimeout ?? "throw";

			await timeoutWebhook(
				bot.updates.handleUpdate(await update, "wait"),
				timeout,
				onTimeout,
			);

			if (response) return response();
		}
	}) as unknown as ReturnType<(typeof frameworks)[Framework]> extends {
		response: () => any;
	}
		? (
				...args: Parameters<(typeof frameworks)[Framework]>
			) => ReturnType<ReturnType<(typeof frameworks)[Framework]>["response"]>
		: (...args: Parameters<(typeof frameworks)[Framework]>) => void;
}
