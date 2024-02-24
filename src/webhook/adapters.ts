import { TelegramUpdate } from "@gramio/types";
import { MaybePromise } from "#types";

const SECRET_TOKEN_HEADER = "X-Telegram-Bot-Api-Secret-Token";

export interface FrameworkHandler {
	update: MaybePromise<TelegramUpdate>;
	header?: string;
}
export type FrameworkAdapter = (...args: any[]) => FrameworkHandler;

const fastifyWebhook: FrameworkAdapter = (request) => ({
	update: request.body,
	header: request.headers[SECRET_TOKEN_HEADER],
});

export const frameworks = {
	fastify: fastifyWebhook,
};
