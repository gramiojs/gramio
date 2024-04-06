import type { Context, UpdateName } from "@gramio/contexts";
import type {
	APIMethodParams,
	APIMethodReturn,
	APIMethods,
	TelegramUser,
} from "@gramio/types";
import type { NextMiddleware } from "middleware-io";
import type { Bot } from "#bot";
import type { TelegramError } from "./errors";

export interface BotOptions {
	token?: string;
	plugins?: {
		format?: boolean;
	};
}

export type Handler<T> = (context: T, next: NextMiddleware) => unknown;

interface ErrorHandlerParams<
	Ctx extends Context<Bot>,
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
		params: MaybeSuppressedParams<APIMethod>;
	};
}[Methods];

export interface Suppress<
	IsSuppressed extends boolean | undefined = undefined,
> {
	/**
	 * Pass `true` if you want to suppress throwing errors of this method.
	 *
	 * **But this does not undo getting into the `onResponseError` hook**.
	 *
	 * @example
	 * ```ts
	 * const response = await bot.api.sendMessage({
	 * 		suppress: true,
	 * 		chat_id: "@not_found",
	 * 		text: "Suppressed method"
	 * });
	 *
	 * if(response instanceof TelegramError) console.error("sendMessage returns an error...")
	 * else console.log("Message has been sent successfully");
	 * ```
	 *
	 * */
	suppress?: IsSuppressed;
}

export type MaybeSuppressedParams<
	Method extends keyof APIMethods,
	IsSuppressed extends boolean | undefined = undefined,
> = APIMethodParams<Method> & Suppress<IsSuppressed>;

export type SuppressedAPIMethodParams<Method extends keyof APIMethods> =
	undefined extends APIMethodParams<Method>
		? Suppress<true>
		: MaybeSuppressedParams<Method, true>;

type MaybeSuppressedReturn<
	Method extends keyof APIMethods,
	IsSuppressed extends boolean | undefined = undefined,
> = true extends IsSuppressed
	? TelegramError<Method> | APIMethodReturn<Method>
	: APIMethodReturn<Method>;

export type SuppressedAPIMethodReturn<Method extends keyof APIMethods> =
	MaybeSuppressedReturn<Method, true>;

export type SuppressedAPIMethods<
	Methods extends keyof APIMethods = keyof APIMethods,
> = {
	[APIMethod in Methods]: APIMethodParams<APIMethod> extends undefined
		? <IsSuppressed extends boolean | undefined = undefined>(
				params?: Suppress<IsSuppressed>,
		  ) => Promise<MaybeSuppressedReturn<APIMethod, IsSuppressed>>
		: undefined extends APIMethodParams<APIMethod>
		  ? <IsSuppressed extends boolean | undefined = undefined>(
					params?: MaybeSuppressedParams<APIMethod, IsSuppressed>,
			  ) => Promise<MaybeSuppressedReturn<APIMethod, IsSuppressed>>
		  : <IsSuppressed extends boolean | undefined = undefined>(
					params: MaybeSuppressedParams<APIMethod, IsSuppressed>,
			  ) => Promise<MaybeSuppressedReturn<APIMethod, IsSuppressed>>;
};

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
		Ctx extends Context<Bot>,
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
		Ctx extends Context<any> = Context<Bot>,
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
	> = (context: AnyTelegramError<Methods>, api: Bot["api"]) => unknown;

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
