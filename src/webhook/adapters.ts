import { TelegramUpdate } from "@gramio/types";

const SECRET_TOKEN_HEADER = "X-Telegram-Bot-Api-Secret-Token";

export interface FrameworkHandler {
	update: TelegramUpdate;
	header?: string;
}
export type FrameworkAdapter = (...args: any[]) => FrameworkHandler;

export const frameworks = {
	elysia: ({ body, headers }) => ({
		update: body,
		header: headers[SECRET_TOKEN_HEADER],
	}),
	fastify: (request) => ({
		update: request.body,
		header: request.headers[SECRET_TOKEN_HEADER],
	}),
} satisfies Record<string, FrameworkAdapter>;
