import type { BotLike, Context, UpdateName } from "@gramio/contexts";
import type {
	APIMethodParams,
	APIMethodReturn,
	APIMethods,
	TelegramUser,
} from "@gramio/types";
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

type AnyTelegramError<Methods extends keyof APIMethods = keyof APIMethods> = {
	[APIMethod in Methods]: TelegramError<APIMethod>;
}[Methods];

type AnyTelegramMethod<Methods extends keyof APIMethods> = {
	[APIMethod in Methods]: {
		method: APIMethod;
		params: APIMethodParams<APIMethod>;
	};
}[Methods];

// TODO: maybe suppress api?
// type Test<Methods extends keyof APIMethods = keyof APIMethods> = {
// 	[APIMethod in Methods]: APIMethodParams<APIMethod> extends undefined
// 		? () => APIMethodReturn<APIMethod>
// 		: undefined extends APIMethodParams<APIMethod>
// 		  ? (params?: APIMethodParams<APIMethod>) => APIMethodReturn<APIMethod>
// 		  : (params: APIMethodParams<APIMethod>) => APIMethodReturn<APIMethod>;
// };

type AnyTelegramMethodWithReturn<Methods extends keyof APIMethods> = {
	[APIMethod in Methods]: {
		method: APIMethod;
		params: APIMethodParams<APIMethod>;
		response: APIMethodReturn<APIMethod>;
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

	export type OnResponseError<
		Methods extends keyof APIMethods = keyof APIMethods,
	> = (context: AnyTelegramError<Methods>, api: BotLike["api"]) => unknown;

	export type OnResponse<Methods extends keyof APIMethods = keyof APIMethods> =
		(context: AnyTelegramMethodWithReturn<Methods>) => unknown;

	export interface Store<T extends ErrorDefinitions> {
		preRequest: PreRequest[];
		onResponse: OnResponse[];
		onResponseError: OnResponseError[];
		onError: OnError<T>[];
		onStart: OnStart[];
		onStop: OnStop[];
	}
}

export type ErrorDefinitions = Record<string, Error>;

export type DeriveDefinitions = Record<UpdateName | "global", {}>;
