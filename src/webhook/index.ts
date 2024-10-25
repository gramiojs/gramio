import type { Bot } from "../bot.js";
import { type FrameworkAdapter, frameworks } from "./adapters.js";

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
export function webhookHandler<Framework extends keyof typeof frameworks>(
	bot: Bot,
	framework: Framework,
	secretToken?: string,
) {
	const frameworkAdapter = frameworks[framework];

	return (async (...args: any[]) => {
		// @ts-expect-error
		const { update, response, header, unauthorized } = frameworkAdapter(
			// @ts-expect-error
			...args,
		);

		if (secretToken && header !== secretToken) return unauthorized();

		await bot.updates.handleUpdate(await update);

		if (response) return response();
	}) as unknown as ReturnType<(typeof frameworks)[Framework]> extends {
		response: () => any;
	}
		? (
				...args: Parameters<(typeof frameworks)[Framework]>
			) => ReturnType<ReturnType<(typeof frameworks)[Framework]>["response"]>
		: (...args: Parameters<(typeof frameworks)[Framework]>) => void;
}
