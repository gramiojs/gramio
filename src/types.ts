import type { BotLike, Context, UpdateName } from "@gramio/contexts";
import type { APIMethodParams, APIMethods, TelegramUser } from "@gramio/types";
import type { NextMiddleware } from "middleware-io";
import type { TelegramError } from "./errors";

export interface BotOptions {
	token?: string;
	plugins?: {
		format?: boolean;
	};
}

export type Handler<T> = (context: T, next: NextMiddleware) => unknown;

interface ErrorHandlerParams<
	Ctx extends Context<BotLike>,
	Kind extends string,
	Err,
> {
	context: Ctx;
	kind: Kind;
	error: Err;
}

type AnyTelegramError = {
	[APIMethod in keyof APIMethods]: TelegramError<APIMethod>;
}[keyof APIMethods];

type AnyTelegramMethod<Methods extends keyof APIMethods> = {
	[APIMethod in Methods]: {
		method: APIMethod;
		params: APIMethodParams<APIMethod>;
	};
}[Methods];

export type MaybePromise<T> = Promise<T> | T;

export namespace Hooks {
	export type Derive<Ctx> = (
		context: Ctx,
	) => MaybePromise<Record<string, unknown>>;

	export type PreRequestContext<Methods extends keyof APIMethods> =
		AnyTelegramMethod<Methods>;
	export type PreRequest<Methods extends keyof APIMethods = keyof APIMethods> =
		(
			ctx: PreRequestContext<Methods>,
		) => MaybePromise<PreRequestContext<Methods>>;

	export type OnErrorContext<
		Ctx extends Context<BotLike>,
		T extends ErrorDefinitions,
	> =
		| ErrorHandlerParams<Ctx, "TELEGRAM", AnyTelegramError>
		| ErrorHandlerParams<Ctx, "UNKNOWN", Error>
		| {
				// TODO: improve typings
				[K in keyof T]: ErrorHandlerParams<Ctx, K & string, T[K & string]>;
		  }[keyof T];
	export type OnError<
		T extends ErrorDefinitions,
		Ctx extends Context<BotLike> = Context<BotLike>,
	> = (options: OnErrorContext<Ctx, T>) => unknown;

	export type OnStart = (context: {
		plugins: string[];
		info: TelegramUser;
		updatesFrom: "webhook" | "long-polling";
	}) => unknown;

	export type OnStop = (context: {
		plugins: string[];
		info: TelegramUser;
	}) => unknown;

	export interface Store<T extends ErrorDefinitions> {
		preRequest: PreRequest[];
		onError: OnError<T>[];
		onStart: OnStart[];
		onStop: OnStop[];
	}
}

export type ErrorDefinitions = Record<string, Error>;

export type DeriveDefinitions = Record<UpdateName | "global", {}>;
