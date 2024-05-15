import type { Buffer } from "node:buffer";
import type { TelegramUpdate } from "@gramio/types";
import { Response } from "undici";
import type { MaybePromise } from "../types";

const SECRET_TOKEN_HEADER = "X-Telegram-Bot-Api-Secret-Token";

export interface FrameworkHandler {
	update: MaybePromise<TelegramUpdate>;
	header?: string;
	response?: () => unknown;
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
		header: c.req.header(SECRET_TOKEN_HEADER),
	}),
	express: (req) => ({
		update: req.body,
		header: req.header(SECRET_TOKEN_HEADER),
	}),
	koa: (ctx) => ({
		update: ctx.request.body,
		header: ctx.get(SECRET_TOKEN_HEADER),
	}),
	http: (req) => ({
		update: new Promise((resolve) => {
			let body = "";

			req.on("data", (chunk: Buffer) => {
				body += chunk.toString();
			});

			req.on("end", () => resolve(JSON.parse(body)));
		}),
		header: req.headers[SECRET_TOKEN_HEADER.toLowerCase()],
	}),
	stdHTTP: (req) => ({
		update: req.json(),
		header: req.headers.get(SECRET_TOKEN_HEADER),
		response: () => new Response(null, { status: 200 }),
	}),
} satisfies Record<string, FrameworkAdapter>;
