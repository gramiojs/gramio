import { TelegramUpdate } from "@gramio/types";
import { MaybePromise } from "#types";

const SECRET_TOKEN_HEADER = "X-Telegram-Bot-Api-Secret-Token";

export interface FrameworkHandler {
	update: MaybePromise<TelegramUpdate>;
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
	hono: (c) => ({
		update: c.req.json(),
		header: c.req.header(SECRET_TOKEN_HEADER)
	}),
	express: (req) => ({
		update: req.body,
		header: req.header(SECRET_TOKEN_HEADER)
	})
} satisfies Record<string, FrameworkAdapter>;
