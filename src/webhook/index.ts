import type { Bot } from "#bot";
import { type FrameworkAdapter, frameworks } from "./adapters";

/** Union type of webhook handlers name */
export type WebhookHandlers = keyof typeof frameworks;

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
export function webhookHandler(bot: Bot, framework: keyof typeof frameworks) {
	const frameworkAdapter = frameworks[framework] as FrameworkAdapter;

	return async (...args: any[]) => {
		const { update } = frameworkAdapter(...args);

		await bot.updates.handleUpdate(await update);
	};
}
