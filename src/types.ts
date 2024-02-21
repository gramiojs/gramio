import { Context } from "@gramio/contexts";
import { APIMethodParams, APIMethods } from "@gramio/types";
import { NextMiddleware } from "middleware-io";
import { TelegramError } from "./errors";

export interface BotOptions {
	token?: string;
}

export type Handler<T> = (context: T, next: NextMiddleware) => unknown;

interface ErrorHandlerParams<Ctx extends Context, Kind extends string, Err> {
	context: Ctx;
	kind: Kind;
	error: Err;
}

type AnyTelegramError = {
	[APIMethod in keyof APIMethods]: TelegramError<APIMethod>;
}[keyof APIMethods];

type AnyTelegramMethod = {
	[APIMethod in keyof APIMethods]: {
		method: APIMethod;
		params: APIMethodParams<APIMethod>;
	};
}[keyof APIMethods];

type MaybePromise<T> = T | Promise<T>;

export namespace Hooks {
	export type PreRequestContext = AnyTelegramMethod;
	export type PreRequest = (
		ctx: PreRequestContext,
	) => MaybePromise<PreRequestContext>;

	export type OnErrorContext<Ctx extends Context, T extends ErrorDefinitions> =
		| ErrorHandlerParams<Ctx, "TELEGRAM", AnyTelegramError>
		| ErrorHandlerParams<Ctx, "UNKNOWN", Error>
		| {
				// TODO: improve typings
				[K in keyof T]: ErrorHandlerParams<Ctx, K & string, T[K & string]>;
		  }[keyof T];
	export type OnError<
		T extends ErrorDefinitions,
		Ctx extends Context = Context,
	> = (options: OnErrorContext<Ctx, T>) => unknown;

	export interface Store<T extends ErrorDefinitions> {
		preRequest: PreRequest[];
		onError: OnError<T>[];
	}
}

export type ErrorDefinitions = Record<string, Error>;
