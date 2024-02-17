import { Context } from "@gramio/contexts";
import { APIMethods, TelegramAPIResponseError } from "@gramio/types";
import { NextMiddleware } from "middleware-io";
import { TelegramError } from "./TelegramError";

export interface BotOptions {
	token?: string;
}

export type Handler<T> = (context: T, next: NextMiddleware) => unknown;

interface ErrorHandlerParams<Kind extends string, Err extends Error> {
	context: Context;
	kind: Kind;
	error: Err;
}

type AnyTelegramError = {
	[APIMethod in keyof APIMethods]: TelegramError<APIMethod>;
}[keyof APIMethods];

export type ErrorHandler = (
	options:
		| ErrorHandlerParams<"TELEGRAM", AnyTelegramError>
		| ErrorHandlerParams<"UNKNOWN", Error>,
) => unknown;
