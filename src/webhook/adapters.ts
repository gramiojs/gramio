import type { Buffer } from "node:buffer";
import type { TelegramUpdate } from "@gramio/types";
import type { MaybePromise } from "../types.js";

const SECRET_TOKEN_HEADER = "X-Telegram-Bot-Api-Secret-Token";
const WRONG_TOKEN_ERROR = "secret token is invalid";
const RESPONSE_OK = "ok!";

export interface FrameworkHandler {
	update: MaybePromise<TelegramUpdate>;
	header: string;
	unauthorized: () => unknown;
	response?: () => unknown;
}
export type FrameworkAdapter = (...args: any[]) => FrameworkHandler;

// @ts-ignore
const responseOK = () => new Response(RESPONSE_OK) as Response;

const responseUnauthorized = () =>
	new Response(WRONG_TOKEN_ERROR, {
		status: 401,
		// @ts-ignore
	}) as Response;

export const frameworks = {
	elysia: ({ body, headers }) => ({
		update: body,
		header: headers[SECRET_TOKEN_HEADER],
		unauthorized: responseUnauthorized,
		response: responseOK,
	}),
	fastify: (request, reply) => ({
		update: request.body,
		header: request.headers[SECRET_TOKEN_HEADER],
		unauthorized: () => reply.code(401).send(WRONG_TOKEN_ERROR),
		response: () => reply.send(RESPONSE_OK),
	}),
	hono: (c) => ({
		update: c.req.json(),
		header: c.req.header(SECRET_TOKEN_HEADER),
		unauthorized: () => c.text(WRONG_TOKEN_ERROR, 401),
		response: responseOK,
	}),
	express: (req, res) => ({
		update: req.body,
		header: req.header(SECRET_TOKEN_HEADER),
		unauthorized: () => res.status(401).send(WRONG_TOKEN_ERROR),
		response: () => res.send(RESPONSE_OK),
	}),
	koa: (ctx) => ({
		update: ctx.request.body,
		header: ctx.get(SECRET_TOKEN_HEADER),
		unauthorized: () => {
			ctx.status === 401;
			ctx.body = WRONG_TOKEN_ERROR;
		},
		response: () => {
			ctx.status = 200;
			ctx.body = RESPONSE_OK;
		},
	}),
	http: (req, res) => ({
		update: new Promise((resolve) => {
			let body = "";

			req.on("data", (chunk: Buffer) => {
				body += chunk.toString();
			});

			req.on("end", () => resolve(JSON.parse(body)));
		}),
		header: req.headers[SECRET_TOKEN_HEADER.toLowerCase()],
		unauthorized: () => res.writeHead(401).end(WRONG_TOKEN_ERROR),
		response: () => res.writeHead(200).end(RESPONSE_OK),
	}),
	"std/http": (req) => ({
		update: req.json(),
		header: req.headers.get(SECRET_TOKEN_HEADER),
		response: responseOK,
		unauthorized: responseUnauthorized,
	}),
	"Bun.serve": (req) => ({
		update: req.json(),
		header: req.headers.get(SECRET_TOKEN_HEADER),
		response: responseOK,
		unauthorized: responseUnauthorized,
	}),
	cloudflare: (req) => ({
		update: req.json(),
		header: req.headers.get(SECRET_TOKEN_HEADER),
		response: responseOK,
		unauthorized: responseUnauthorized,
	}),
	Request: (req) => ({
		update: req.json(),
		header: req.headers.get(SECRET_TOKEN_HEADER),
		response: responseOK,
		unauthorized: responseUnauthorized,
	}),
} satisfies Record<string, FrameworkAdapter>;
