import type { Context, UpdateName } from "@gramio/contexts";
import type {
	APIMethodParams,
	APIMethodReturn,
	APIMethods,
	TelegramUser,
} from "@gramio/types";
import type { NextMiddleware } from "middleware-io";
import type { Bot } from "./bot.js";
import type { TelegramError } from "./errors.js";
import type { Plugin } from "./plugin.js";

/** Bot options that you can provide to {@link Bot} constructor */
export interface BotOptions {
	/** Bot token */
	token: string;
	/** When the bot begins to listen for updates, `GramIO` retrieves information about the bot to verify if the **bot token is valid**
	 * and to utilize some bot metadata. For example, this metadata will be used to strip bot mentions in commands.
	 *
	 * If you set it up, `GramIO` will not send a `getMe` request on startup.
	 *
	 * @important
	 * **You should set this up when horizontally scaling your bot or working in serverless environments.**
	 * */
	info?: TelegramUser;
	/** List of plugins enabled by default */
	plugins?: {
		/** Pass `false` to disable plugin. @default true */
		format?: boolean;
	};
	/** Options to configure how to send requests to the Telegram Bot API */
	api: {
		/** Configure {@link fetch} parameters */
		fetchOptions?: Parameters<typeof fetch>[1];
		/** URL which will be used to send requests to. @default "https://api.telegram.org/bot" */
		baseURL: string;
		/**
		 * 	Should we send requests to `test` data center?
		 * 	The test environment is completely separate from the main environment, so you will need to create a new user account and a new bot with `@BotFather`.
		 *
		 * 	[Documentation](https://core.telegram.org/bots/webapps#using-bots-in-the-test-environment)
		 * 	@default false
		 * */
		useTest?: boolean;

		/**
		 * Time in milliseconds before calling {@link APIMethods.getUpdates | getUpdates} again
		 * @default 1000
		 */
		retryGetUpdatesWait?: number;
	};
}

/**
 * Handler is a function with context and next function arguments
 *
 * @example
 * ```ts
 * const handler: Handler<ContextType<Bot, "message">> = (context, _next) => context.send("HI!");
 *
 * bot.on("message", handler)
 * ```
 */
export type Handler<T> = (context: T, next: NextMiddleware) => unknown;

interface ErrorHandlerParams<
	Ctx extends Context<AnyBot>,
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

/**
 * Interface for add `suppress` param to params
 */
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

/** Type that assign API params with {@link Suppress} */
export type MaybeSuppressedParams<
	Method extends keyof APIMethods,
	IsSuppressed extends boolean | undefined = undefined,
> = APIMethodParams<Method> & Suppress<IsSuppressed>;

/** Return method params but with {@link Suppress} */
export type SuppressedAPIMethodParams<Method extends keyof APIMethods> =
	undefined extends APIMethodParams<Method>
		? Suppress<true>
		: MaybeSuppressedParams<Method, true>;

/** Type that return MaybeSuppressed API method ReturnType */
export type MaybeSuppressedReturn<
	Method extends keyof APIMethods,
	IsSuppressed extends boolean | undefined = undefined,
> = true extends IsSuppressed
	? TelegramError<Method> | APIMethodReturn<Method>
	: APIMethodReturn<Method>;

/** Type that return {@link Suppress | Suppressed} API method ReturnType */
export type SuppressedAPIMethodReturn<Method extends keyof APIMethods> =
	MaybeSuppressedReturn<Method, true>;

/** Map of APIMethods but with {@link Suppress} */
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

/** Type for maybe {@link Promise} or may not */
export type MaybePromise<T> = Promise<T> | T;

/**
 * Namespace with GramIO hooks types
 *
 * [Documentation](https://gramio.dev/hooks/overview.html)
 * */
export namespace Hooks {
	/** Derive */
	export type Derive<Ctx> = (
		context: Ctx,
	) => MaybePromise<Record<string, unknown>>;

	/** Argument type for {@link PreRequest} */
	export type PreRequestContext<Methods extends keyof APIMethods> =
		AnyTelegramMethod<Methods>;

	/**
	 * Type for `preRequest` hook
	 *
	 * @example
	 * ```typescript
	 * import { Bot } from "gramio";
	 *
	 * const bot = new Bot(process.env.TOKEN!).preRequest((context) => {
	 *     if (context.method === "sendMessage") {
	 *         context.params.text = "mutate params";
	 *     }
	 *
	 *     return context;
	 * });
	 *
	 * bot.start();
	 * ```
	 *
	 * [Documentation](https://gramio.dev/hooks/pre-request.html)
	 *  */
	export type PreRequest<Methods extends keyof APIMethods = keyof APIMethods> =
		(
			ctx: PreRequestContext<Methods>,
		) => MaybePromise<PreRequestContext<Methods>>;

	/** Argument type for {@link OnError} */
	export type OnErrorContext<
		Ctx extends Context<AnyBot>,
		T extends ErrorDefinitions,
	> =
		| ErrorHandlerParams<Ctx, "TELEGRAM", AnyTelegramError>
		| ErrorHandlerParams<Ctx, "UNKNOWN", Error>
		| {
				// TODO: improve typings
				[K in keyof T]: ErrorHandlerParams<Ctx, K & string, T[K & string]>;
		  }[keyof T];

	/**
	 * Type for `onError` hook
	 *
	 * @example
	 * ```typescript
	 * bot.on("message", () => {
	 *     bot.api.sendMessage({
	 *         chat_id: "@not_found",
	 *         text: "Chat not exists....",
	 *     });
	 * });
	 *
	 * bot.onError(({ context, kind, error }) => {
	 *     if (context.is("message")) return context.send(`${kind}: ${error.message}`);
	 * });
	 * ```
	 *
	 * [Documentation](https://gramio.dev/hooks/on-error.html)
	 *  */
	export type OnError<
		T extends ErrorDefinitions,
		Ctx extends Context<any> = Context<AnyBot>,
	> = (options: OnErrorContext<Ctx, T>) => unknown;

	/**
	 * Type for `onStart` hook
	 *
	 * @example
	 * ```typescript
	 * import { Bot } from "gramio";
	 *
	 * const bot = new Bot(process.env.TOKEN!).onStart(
	 *     ({ plugins, info, updatesFrom }) => {
	 *         console.log(`plugin list - ${plugins.join(", ")}`);
	 *         console.log(`bot username is @${info.username}`);
	 * 		   console.log(`updates from ${updatesFrom}`);
	 *     }
	 * );
	 *
	 * bot.start();
	 * ```
	 *
	 * [Documentation](https://gramio.dev/hooks/on-start.html)
	 *  */
	export type OnStart = (context: {
		plugins: string[];
		info: TelegramUser;
		updatesFrom: "webhook" | "long-polling";
	}) => unknown;

	/**
	 * Type for `onStop` hook
	 *
	 * @example
	 * ```typescript
	 * import { Bot } from "gramio";
	 *
	 * const bot = new Bot(process.env.TOKEN!).onStop(
	 *     ({ plugins, info, updatesFrom }) => {
	 *         console.log(`plugin list - ${plugins.join(", ")}`);
	 *         console.log(`bot username is @${info.username}`);
	 *     }
	 * );
	 *
	 * bot.start();
	 * bot.stop();
	 * ```
	 *
	 * [Documentation](https://gramio.dev/hooks/on-stop.html)
	 *  */
	export type OnStop = (context: {
		plugins: string[];
		info: TelegramUser;
	}) => unknown;

	/**
	 * Type for `onResponseError` hook
	 *
	 * [Documentation](https://gramio.dev/hooks/on-response-error.html)
	 * */
	export type OnResponseError<
		Methods extends keyof APIMethods = keyof APIMethods,
	> = (context: AnyTelegramError<Methods>, api: Bot["api"]) => unknown;

	/**
	 * Type for `onResponse` hook
	 *
	 * [Documentation](https://gramio.dev/hooks/on-response.html)
	 *  */
	export type OnResponse<Methods extends keyof APIMethods = keyof APIMethods> =
		(context: AnyTelegramMethodWithReturn<Methods>) => unknown;

	/** Store hooks */
	export interface Store<T extends ErrorDefinitions> {
		preRequest: PreRequest[];
		onResponse: OnResponse[];
		onResponseError: OnResponseError[];
		onError: OnError<T>[];
		onStart: OnStart[];
		onStop: OnStop[];
	}
}

/** Error map should be map of string: error */
export type ErrorDefinitions = Record<string, Error>;

/** Map of derives */
export type DeriveDefinitions = Record<UpdateName | "global", {}>;

export type FilterDefinitions = Record<
	string,
	(...args: any[]) => (context: Context<Bot>) => boolean
>;

/** Type of Bot that accepts any generics */
export type AnyBot = Bot<any, any>;

/** Type of Bot that accepts any generics */
export type AnyPlugin = Plugin<any, any>;
