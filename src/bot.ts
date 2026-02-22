import fs from "node:fs/promises";
import { Readable } from "node:stream";
import type { CallbackData } from "@gramio/callback-data";
import type { EventComposer } from "@gramio/composer";
import {
	type Attachment,
	type Context,
	type ContextType,
	PhotoAttachment,
	type UpdateName,
} from "@gramio/contexts";
import {
	convertJsonToFormData,
	extractFilesToFormData,
	isMediaUpload,
} from "@gramio/files";
import { FormattableMap } from "@gramio/format";
import type {
	APIMethodParams,
	APIMethods,
	TelegramAPIResponse,
	TelegramReactionTypeEmojiEmoji,
	TelegramUser,
} from "@gramio/types";
import debug from "debug";
import { ErrorKind, TelegramError } from "./errors.js";
import { Plugin } from "./plugin.js";
import type {
	AnyBot,
	AnyPlugin,
	BotOptions,
	BotStartOptions,
	CallbackQueryShorthandContext,
	DeriveDefinitions,
	ErrorDefinitions,
	Handler,
	Hooks,
	MaybePromise,
	MaybeSuppressedParams,
	SuppressedAPIMethods,
} from "./types.js";
import { Updates } from "./updates.js";
import { IS_BUN, type MaybeArray, simplifyObject } from "./utils.internal.ts";
import { withRetries } from "./utils.ts";

/** Bot instance
 *
 * @example
 * ```ts
 * import { Bot } from "gramio";
 *
 * const bot = new Bot("") // put you token here
 *     .command("start", (context) => context.send("Hi!"))
 *     .onStart(console.log);
 *
 * bot.start();
 * ```
 */
export class Bot<
	Errors extends ErrorDefinitions = {},
	Derives extends DeriveDefinitions = DeriveDefinitions,
> {
	/** @deprecated use `~` instead*/
	_ = {
		/** @deprecated @internal. Remap generic */
		derives: {} as Derives,
	};
	/** @deprecated use `~.derives` instead @internal. Remap generic */
	__Derives!: Derives;

	"~" = this._;

	/** Options provided to instance */
	readonly options: BotOptions;
	/** Bot data (filled in when calling bot.init/bot.start) */
	info: TelegramUser | undefined;
	/**
	 * Send API Request to Telegram Bot API
	 *
	 * @example
	 * ```ts
	 * const response = await bot.api.sendMessage({
	 *     chat_id: "@gramio_forum",
	 *     text: "some text",
	 * });
	 * ```
	 *
	 * [Documentation](https://gramio.dev/bot-api.html)
	 */
	readonly api = new Proxy({} as SuppressedAPIMethods, {
		get: <T extends keyof SuppressedAPIMethods>(
			_target: SuppressedAPIMethods,
			method: T,
		) =>
			// @ts-expect-error
			// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
			(_target[method] ??= (args: APIMethodParams<T>) => {
				// Capture stack trace at the call site to preserve error context
				const callSite = new Error();
				// Remove this frame from the stack trace (Node.js/Bun feature)
				if (Error.captureStackTrace) {
					Error.captureStackTrace(callSite, _target[method]);
				}

				return this._callApi(method, args, callSite);
			}),
	});
	private lazyloadPlugins: Promise<Plugin>[] = [];
	private dependencies: string[] = [];
	private errorsDefinitions: Record<
		string,
		{ new (...args: any): any; prototype: Error }
	> = {
		TELEGRAM: TelegramError,
	};

	private errorHandler(context: Context<any>, error: Error) {
		if (!this.hooks.onError.length)
			return console.error("[Default Error Handler]", context, error);

		return this.runImmutableHooks("onError", {
			context,
			//@ts-expect-error ErrorKind exists if user register error-class with .error("kind", SomeError);
			kind: error.constructor[ErrorKind] ?? "UNKNOWN",
			error: error,
		});
	}

	/** This instance handle updates */
	updates = new Updates(this, this.errorHandler.bind(this));

	private hooks: Hooks.Store<Errors> = {
		preRequest: [],
		onResponse: [],
		onResponseError: [],
		onError: [],
		onStart: [],
		onStop: [],
		onApiCall: [],
	};

	constructor(
		token: string,
		options?: Omit<BotOptions, "token" | "api"> & {
			api?: Partial<BotOptions["api"]>;
		},
	);
	constructor(
		options: Omit<BotOptions, "api"> & { api?: Partial<BotOptions["api"]> },
	);
	constructor(
		tokenOrOptions:
			| string
			| (Omit<BotOptions, "api"> & { api?: Partial<BotOptions["api"]> }),
		optionsRaw?: Omit<BotOptions, "token" | "api"> & {
			api?: Partial<BotOptions["api"]>;
		},
	) {
		const token =
			typeof tokenOrOptions === "string"
				? tokenOrOptions
				: tokenOrOptions?.token;
		const options =
			typeof tokenOrOptions === "object" ? tokenOrOptions : optionsRaw;

		if (!token) throw new Error("Token is required!");

		if (typeof token !== "string")
			throw new Error(`Token is ${typeof token} but it should be a string!`);

		this.options = {
			...options,
			token,
			api: {
				baseURL: "https://api.telegram.org/bot",
				retryGetUpdatesWait: 1000,
				...options?.api,
			},
		};
		if (options?.info) {
			this.info = options.info;
		}

		if (
			!(
				optionsRaw?.plugins &&
				"format" in optionsRaw.plugins &&
				!optionsRaw.plugins.format
			)
		)
			this.extend(
				new Plugin("@gramio/format").preRequest((context) => {
					if (!context.params) return context;

					const formattable = FormattableMap[
						context.method as keyof typeof FormattableMap
					] as
						| ((
								params: MaybeSuppressedParams<any>,
						  ) => MaybeSuppressedParams<any>)
						| undefined;
					if (formattable)
						context.params = formattable(
							context.params as MaybeSuppressedParams<any>,
						) as typeof context.params;

					return context;
				}),
			);
	}

	private async runHooks<
		T extends Exclude<
			keyof Hooks.Store<Errors>,
			| "onError"
			| "onStart"
			| "onStop"
			| "onResponseError"
			| "onResponse"
			| "onApiCall"
		>,
	>(type: T, context: Parameters<Hooks.Store<Errors>[T][0]>[0]) {
		let data = context;

		for await (const hook of this.hooks[type]) {
			data = await hook(data);
		}

		return data;
	}

	private async runImmutableHooks<
		T extends Extract<
			keyof Hooks.Store<Errors>,
			"onError" | "onStart" | "onStop" | "onResponseError" | "onResponse"
		>,
	>(type: T, ...context: Parameters<Hooks.Store<Errors>[T][0]>) {
		for await (const hook of this.hooks[type] as ((
			...args: Parameters<Hooks.Store<Errors>[T][0]>
		) => unknown)[]) {
			await hook(...context);
		}
	}

	private async _callApi<T extends keyof APIMethods>(
		method: T,
		params: MaybeSuppressedParams<T> = {},
		callSite?: Error,
	) {
		const executeCall = async () => {
			const debug$api$method = debug(`gramio:api:${method}`);
			let url = `${this.options.api.baseURL}${this.options.token}/${this.options.api.useTest ? "test/" : ""}${method}`;

			// Omit<
			// 	NonNullable<Parameters<typeof fetch>[1]>,
			// 	"headers"
			// > & {
			// 	headers: Headers;
			// }
			// idk why it cause https://github.com/gramiojs/gramio/actions/runs/10388006206/job/28762703484
			// also in logs types differs
			const reqOptions: any = {
				method: "POST",
				...this.options.api.fetchOptions,
				headers: new Headers(this.options.api.fetchOptions?.headers as any),
			};

			const context = await this.runHooks("preRequest", {
				method,
				params,
			} as any);

			// biome-ignore lint/style/noParameterAssign: mutate params
			params = context.params as any;

			if (params && isMediaUpload(method as any, params as any)) {
				if (IS_BUN) {
					const formData = await convertJsonToFormData(method as any, params);
					reqOptions.body = formData;
				} else {
					const [formData, paramsWithoutFiles] = await extractFilesToFormData(
						method as any,
						params,
					);
					reqOptions.body = formData;

					const simplifiedParams = simplifyObject(paramsWithoutFiles);
					url += `?${new URLSearchParams(simplifiedParams).toString()}`;
				}
			} else {
				reqOptions.headers.set("Content-Type", "application/json");

				reqOptions.body = JSON.stringify(params);
			}
			debug$api$method("options: %j", reqOptions);

			const response = await fetch(url, reqOptions);

			const data = (await response.json()) as TelegramAPIResponse;
			debug$api$method("response: %j", data);

			if (!data.ok) {
				const err = new TelegramError(data, method, params, callSite);

				// @ts-expect-error
				this.runImmutableHooks("onResponseError", err, this.api);

				if (!params?.suppress) throw err;

				return err;
			}

			this.runImmutableHooks("onResponse", {
				method,
				params,
				response: data.result,
			} as Parameters<Hooks.OnResponse>[0]);

			return data.result;
		};

		if (!this.hooks.onApiCall.length) return executeCall();

		let fn: () => Promise<unknown> = executeCall;
		for (const hook of [...this.hooks.onApiCall].reverse()) {
			const prev = fn;
			// @ts-expect-error distributive union narrowing
			fn = () => hook({ method, params }, prev);
		}

		return fn();
	}

	/**
	 * Download file
	 *
	 * @example
	 * ```ts
	 * bot.on("message", async (context) => {
	 *     if (!context.document) return;
	 *     // download to ./file-name
	 *     await context.download(context.document.fileName || "file-name");
	 *     // get ArrayBuffer
	 *     const buffer = await context.download();
	 *
	 *     return context.send("Thank you!");
	 * });
	 * ```
	 * [Documentation](https://gramio.dev/files/download.html)
	 */
	async downloadFile(
		attachment: Attachment | { file_id: string } | string,
	): Promise<ArrayBuffer>;
	async downloadFile(
		attachment: Attachment | { file_id: string } | string,
		path: string,
	): Promise<string>;

	async downloadFile(
		attachment: Attachment | { file_id: string } | string,
		path?: string,
	): Promise<ArrayBuffer | string> {
		function getFileId(attachment: Attachment | { file_id: string }) {
			if (attachment instanceof PhotoAttachment) {
				return attachment.bigSize.fileId;
			}
			if ("fileId" in attachment && typeof attachment.fileId === "string")
				return attachment.fileId;
			if ("file_id" in attachment) return attachment.file_id;

			throw new Error("Invalid attachment");
		}

		const fileId =
			typeof attachment === "string" ? attachment : getFileId(attachment);

		const file = await this.api.getFile({ file_id: fileId });

		const url = `${this.options.api.baseURL.replace("/bot", "/file/bot")}${
			this.options.token
		}/${file.file_path}`;

		const res = await fetch(url);

		if (path) {
			if (!res.body)
				throw new Error("Response without body (should be never throw)");

			await fs.writeFile(path, Readable.fromWeb(res.body as any));

			return path;
		}

		const buffer = await res.arrayBuffer();

		return buffer;
	}

	/**
	 * Register custom class-error for type-safe catch in `onError` hook
	 *
	 * @example
	 * ```ts
	 * export class NoRights extends Error {
	 *     needRole: "admin" | "moderator";
	 *
	 *     constructor(role: "admin" | "moderator") {
	 *         super();
	 *         this.needRole = role;
	 *     }
	 * }
	 *
	 * const bot = new Bot(process.env.TOKEN!)
	 *     .error("NO_RIGHTS", NoRights)
	 *     .onError(({ context, kind, error }) => {
	 *         if (context.is("message") && kind === "NO_RIGHTS")
	 *             return context.send(
	 *                 format`You don't have enough rights! You need to have an «${bold(
	 *                     error.needRole
	 *                 )}» role.`
	 *             );
	 *     });
	 *
	 * bot.updates.on("message", (context) => {
	 *     if (context.text === "bun") throw new NoRights("admin");
	 * });
	 * ```
	 */
	error<
		Name extends string,
		NewError extends { new (...args: any): any; prototype: Error },
	>(kind: Name, error: NewError) {
		//@ts-expect-error Set ErrorKind
		error[ErrorKind] = kind;
		this.errorsDefinitions[kind] = error;

		return this as unknown as Bot<
			Errors & { [name in Name]: InstanceType<NewError> },
			Derives
		>;
	}

	/**
	 * Set error handler.
	 * @example
	 * ```ts
	 * bot.onError("message", ({ context, kind, error }) => {
	 * 	return context.send(`${kind}: ${error.message}`);
	 * })
	 * ```
	 */

	onError<T extends UpdateName>(
		updateName: MaybeArray<T>,
		handler: Hooks.OnError<Errors, ContextType<typeof this, T>>,
	): this;

	onError(
		handler: Hooks.OnError<Errors, Context<typeof this> & Derives["global"]>,
	): this;

	onError<T extends UpdateName>(
		updateNameOrHandler: T | Hooks.OnError<Errors>,
		handler?: Hooks.OnError<Errors, ContextType<typeof this, T>>,
	): this {
		if (typeof updateNameOrHandler === "function") {
			this.hooks.onError.push(updateNameOrHandler);

			return this;
		}

		if (handler) {
			this.hooks.onError.push(async (errContext) => {
				if (errContext.context.is(updateNameOrHandler))
					await handler(errContext as Parameters<typeof handler>[0]);
			});
		}

		return this;
	}

	/**
	 * Derive some data to handlers
	 *
	 * @example
	 * ```ts
	 * new Bot("token").derive((context) => {
	 * 		return {
	 * 			superSend: () => context.send("Derived method")
	 * 		}
	 * })
	 * ```
	 */
	derive<
		Handler extends Hooks.Derive<Context<typeof this> & Derives["global"]>,
	>(
		handler: Handler,
	): Bot<Errors, Derives & { global: Awaited<ReturnType<Handler>> }>;

	derive<
		Update extends UpdateName,
		Handler extends Hooks.Derive<
			ContextType<typeof this, Update> & Derives["global"] & Derives[Update]
		>,
	>(
		updateName: MaybeArray<Update>,
		handler: Handler,
	): Bot<Errors, Derives & { [K in Update]: Awaited<ReturnType<Handler>> }>;

	derive<
		Update extends UpdateName,
		Handler extends Hooks.Derive<
			ContextType<typeof this, Update> & Derives["global"] & Derives[Update]
		>,
	>(updateNameOrHandler: MaybeArray<Update> | Handler, handler?: Handler) {
		if (typeof updateNameOrHandler === "function")
			this.updates.composer.derive(
				updateNameOrHandler as Hooks.Derive<Context<AnyBot>>,
			);
		else if (handler)
			this.updates.composer.derive(
				updateNameOrHandler as Update | Update[],
				handler as Hooks.Derive<ContextType<AnyBot, Update>>,
			);

		return this;
	}

	decorate<Value extends Record<string, any>>(
		value: Value,
	): Bot<
		Errors,
		Derives & {
			global: {
				[K in keyof Value]: Value[K];
			};
		}
	>;

	decorate<Name extends string, Value>(
		name: Name,
		value: Value,
	): Bot<
		Errors,
		Derives & {
			global: {
				[K in Name]: Value;
			};
		}
	>;
	decorate<Name extends string, Value>(
		nameOrRecordValue: Name | Record<string, any>,
		value?: Value,
	) {
		this.updates.composer.decorate(
			typeof nameOrRecordValue === "string"
				? { [nameOrRecordValue]: value }
				: nameOrRecordValue,
		);
		// TODO: it is interesting choice for perfomance impact. but isolation needed. TODO: research
		// for (const contextName of Object.keys(
		// 	contextsMappings,
		// ) as (keyof typeof contextsMappings)[]) {
		// 	if (typeof nameOrRecordValue === "string")
		// 		Object.defineProperty(
		// 			contextsMappings[contextName].prototype,
		// 			nameOrRecordValue,
		// 			{
		// 				value,
		// 				configurable: true,
		// 			},
		// 		);
		// 	else
		// 		Object.defineProperties(
		// 			contextsMappings[contextName].prototype,
		// 			Object.keys(nameOrRecordValue).reduce<PropertyDescriptorMap>(
		// 				(acc, key) => {
		// 					acc[key] = {
		// 						value: nameOrRecordValue[key],
		// 						configurable: true,
		// 					};
		// 					return acc;
		// 				},
		// 				{},
		// 			),
		// 		);
		// }

		return this;
	}
	/**
	 * This hook called when the bot is `started`.
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
	onStart(handler: Hooks.OnStart) {
		this.hooks.onStart.push(handler);

		return this;
	}

	/**
	 * This hook called when the bot stops.
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
	onStop(handler: Hooks.OnStop) {
		this.hooks.onStop.push(handler);

		return this;
	}

	/**
	 * This hook called before sending a request to Telegram Bot API (allows us to impact the sent parameters).
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
	preRequest<
		Methods extends keyof APIMethods,
		Handler extends Hooks.PreRequest<Methods>,
	>(methods: MaybeArray<Methods>, handler: Handler): this;

	preRequest(handler: Hooks.PreRequest): this;

	preRequest<
		Methods extends keyof APIMethods,
		Handler extends Hooks.PreRequest<Methods>,
	>(
		methodsOrHandler: MaybeArray<Methods> | Hooks.PreRequest,
		handler?: Handler,
	) {
		if (
			typeof methodsOrHandler === "string" ||
			Array.isArray(methodsOrHandler)
		) {
			// TODO: error
			if (!handler) throw new Error("TODO:");

			const methods =
				typeof methodsOrHandler === "string"
					? [methodsOrHandler]
					: methodsOrHandler;

			this.hooks.preRequest.push((async (context) => {
				if ((methods as readonly string[]).includes(context.method))
					return handler(context as Hooks.PreRequestContext<Methods>);

				return context;
			}) as Hooks.PreRequest);
		} else this.hooks.preRequest.push(methodsOrHandler as Hooks.PreRequest);

		return this;
	}

	/**
	 * This hook called when API return successful response
	 *
	 * [Documentation](https://gramio.dev/hooks/on-response.html)
	 * */
	onResponse<
		Methods extends keyof APIMethods,
		Handler extends Hooks.OnResponse<Methods>,
	>(methods: MaybeArray<Methods>, handler: Handler): this;

	onResponse(handler: Hooks.OnResponse): this;

	onResponse<
		Methods extends keyof APIMethods,
		Handler extends Hooks.OnResponse<Methods>,
	>(
		methodsOrHandler: MaybeArray<Methods> | Hooks.OnResponse,
		handler?: Handler,
	) {
		if (
			typeof methodsOrHandler === "string" ||
			Array.isArray(methodsOrHandler)
		) {
			// TODO: error
			if (!handler) throw new Error("TODO:");

			const methods =
				typeof methodsOrHandler === "string"
					? [methodsOrHandler]
					: methodsOrHandler;

			this.hooks.onResponse.push((async (context) => {
				if ((methods as readonly string[]).includes(context.method))
					return handler(context as Parameters<Handler>[0]);
			}) as Hooks.OnResponse);
		} else this.hooks.onResponse.push(methodsOrHandler as Hooks.OnResponse);

		return this;
	}

	/**
	 * This hook called when API return an error
	 *
	 * [Documentation](https://gramio.dev/hooks/on-response-error.html)
	 * */
	onResponseError<
		Methods extends keyof APIMethods,
		Handler extends Hooks.OnResponseError<Methods>,
	>(methods: MaybeArray<Methods>, handler: Handler): this;

	onResponseError(handler: Hooks.OnResponseError): this;

	onResponseError<
		Methods extends keyof APIMethods,
		Handler extends Hooks.OnResponseError<Methods>,
	>(
		methodsOrHandler: MaybeArray<Methods> | Hooks.OnResponseError,
		handler?: Handler,
	) {
		if (
			typeof methodsOrHandler === "string" ||
			Array.isArray(methodsOrHandler)
		) {
			// TODO: error
			if (!handler) throw new Error("TODO:");

			const methods =
				typeof methodsOrHandler === "string"
					? [methodsOrHandler]
					: methodsOrHandler;

			this.hooks.onResponseError.push((async (context, api) => {
				if ((methods as readonly string[]).includes(context.method))
					return handler(context as Parameters<Handler>[0], api);
			}) as Hooks.OnResponseError);
		} else
			this.hooks.onResponseError.push(
				methodsOrHandler as Hooks.OnResponseError,
			);

		return this;
	}

	/**
	 * This hook wraps the entire API call, enabling tracing/instrumentation.
	 *
	 * @example
	 * ```typescript
	 * import { Bot } from "gramio";
	 *
	 * const bot = new Bot(process.env.TOKEN!).onApiCall(async (context, next) => {
	 *     console.log(`Calling ${context.method}`);
	 *     const result = await next();
	 *     console.log(`${context.method} completed`);
	 *     return result;
	 * });
	 * ```
	 *  */
	onApiCall<
		Methods extends keyof APIMethods,
		Handler extends Hooks.OnApiCall<Methods>,
	>(methods: MaybeArray<Methods>, handler: Handler): this;

	onApiCall(handler: Hooks.OnApiCall): this;

	onApiCall<
		Methods extends keyof APIMethods,
		Handler extends Hooks.OnApiCall<Methods>,
	>(
		methodsOrHandler: MaybeArray<Methods> | Hooks.OnApiCall,
		handler?: Handler,
	) {
		if (
			typeof methodsOrHandler === "string" ||
			Array.isArray(methodsOrHandler)
		) {
			// TODO: error
			if (!handler) throw new Error("TODO:");

			const methods =
				typeof methodsOrHandler === "string"
					? [methodsOrHandler]
					: methodsOrHandler;

			this.hooks.onApiCall.push((async (context, next) => {
				if ((methods as readonly string[]).includes(context.method))
					return handler(context as Parameters<Handler>[0], next);

				return next();
			}) as Hooks.OnApiCall);
		} else {
			this.hooks.onApiCall.push(methodsOrHandler as Hooks.OnApiCall);
		}

		return this;
	}

	/** Register handler to one or many Updates with a type-narrowing filter */
	on<T extends UpdateName, Narrowing>(
		updateName: MaybeArray<T>,
		filter: (ctx: any) => ctx is Narrowing,
		handler: Handler<ContextType<typeof this, T> & Narrowing>,
	): this;

	/** Register handler to one or many Updates with a boolean filter (no type narrowing) */
	on<T extends UpdateName>(
		updateName: MaybeArray<T>,
		filter: (ctx: ContextType<typeof this, T>) => boolean,
		handler: Handler<ContextType<typeof this, T>>,
	): this;

	/** Register handler to one or many Updates */
	on<T extends UpdateName>(
		updateName: MaybeArray<T>,
		handler: Handler<ContextType<typeof this, T>>,
	): this;

	on<T extends UpdateName>(
		updateName: MaybeArray<T>,
		filterOrHandler:
			| Handler<ContextType<typeof this, T>>
			| ((ctx: ContextType<typeof this, T>) => boolean),
		handler?: Handler<any>,
	) {
		if (handler) {
			const filter = filterOrHandler as (ctx: any) => boolean;
			this.updates.composer.on(
				updateName as T | T[],
				((ctx: any, next: any) => {
					if (filter(ctx)) return handler(ctx, next);
					return next();
				}) as Handler<ContextType<AnyBot, T>>,
			);
		} else {
			this.updates.composer.on(
				updateName as T | T[],
				filterOrHandler as Handler<ContextType<AnyBot, T>>,
			);
		}

		return this;
	}

	/** Register handler to any Updates */
	use(handler: Handler<Context<typeof this> & Derives["global"]>) {
		this.updates.composer.use(handler as Handler<Context<AnyBot>>);

		return this;
	}

	/**
	 * Extend {@link Plugin} logic and types
	 *
	 * @example
	 * ```ts
	 * import { Plugin, Bot } from "gramio";
	 *
	 * export class PluginError extends Error {
	 *     wow: "type" | "safe" = "type";
	 * }
	 *
	 * const plugin = new Plugin("gramio-example")
	 *     .error("PLUGIN", PluginError)
	 *     .derive(() => {
	 *         return {
	 *             some: ["derived", "props"] as const,
	 *         };
	 *     });
	 *
	 * const bot = new Bot(process.env.TOKEN!)
	 *     .extend(plugin)
	 *     .onError(({ context, kind, error }) => {
	 *         if (context.is("message") && kind === "PLUGIN") {
	 *             console.log(error.wow);
	 *         }
	 *     })
	 *     .use((context) => {
	 *         console.log(context.some);
	 *     });
	 * ```
	 */
	extend<UExposed extends object, UDerives extends Record<string, object>>(
		composer: EventComposer<any, any, any, any, UExposed, UDerives>,
	): Bot<Errors, Derives & { global: UExposed } & UDerives>;

	extend<NewPlugin extends AnyPlugin>(
		plugin: MaybePromise<NewPlugin>,
	): Bot<
		Errors & NewPlugin["_"]["Errors"],
		Derives & NewPlugin["_"]["Derives"]
	>;

	extend(
		pluginOrComposer:
			| MaybePromise<AnyPlugin>
			| EventComposer<any, any, any, any, any, any>,
	): any {
		if (
			"compose" in pluginOrComposer &&
			"run" in pluginOrComposer &&
			!("_" in pluginOrComposer)
		) {
			this.updates.composer.extend(pluginOrComposer);
			return this;
		}

		const plugin = pluginOrComposer as MaybePromise<AnyPlugin>;

		if (plugin instanceof Promise) {
			this.lazyloadPlugins.push(plugin);

			return this;
		}

		if (plugin._.dependencies.some((dep) => !this.dependencies.includes(dep)))
			throw new Error(
				`The «${
					plugin._.name
				}» plugin needs dependencies registered before: ${plugin._.dependencies
					.filter((dep) => !this.dependencies.includes(dep))
					.join(", ")}`,
			);

		if (plugin._.composer["~"].middlewares.length) {
			// Promote to "scoped" so extend() doesn't isolate plugin middleware
			// (plugins are expected to modify shared context via derive/use)
			plugin._.composer.as("scoped");
			this.updates.composer.extend(plugin._.composer);
		}

		this.decorate(plugin._.decorators);

		for (const [key, value] of Object.entries(plugin._.errorsDefinitions)) {
			if (this.errorsDefinitions[key]) this.errorsDefinitions[key] = value;
		}

		for (const value of plugin._.preRequests) {
			const [preRequest, updateName] = value;

			if (!updateName) this.preRequest(preRequest);
			else this.preRequest(updateName, preRequest);
		}

		for (const value of plugin._.onResponses) {
			const [onResponse, updateName] = value;

			if (!updateName) this.onResponse(onResponse);
			else this.onResponse(updateName, onResponse);
		}

		for (const value of plugin._.onResponseErrors) {
			const [onResponseError, updateName] = value;

			if (!updateName) this.onResponseError(onResponseError);
			else this.onResponseError(updateName, onResponseError);
		}

		for (const value of plugin._.onApiCalls) {
			const [onApiCall, methods] = value;

			if (!methods) this.onApiCall(onApiCall);
			else this.onApiCall(methods, onApiCall);
		}

		for (const handler of plugin._.groups) {
			this.group(handler);
		}

		for (const value of plugin._.onErrors) {
			this.onError(value);
		}
		for (const value of plugin._.onStarts) {
			this.onStart(value);
		}
		for (const value of plugin._.onStops) {
			this.onStop(value);
		}

		this.dependencies.push(plugin._.name);

		return this;
	}

	/**
	 * Register handler to reaction (`message_reaction` update)
	 *
	 * @example
	 * ```ts
	 * new Bot().reaction("👍", async (context) => {
	 *     await context.reply(`Thank you!`);
	 * });
	 * ```
	 * */
	reaction(
		trigger: MaybeArray<TelegramReactionTypeEmojiEmoji>,
		handler: (context: ContextType<typeof this, "message_reaction">) => unknown,
	) {
		this.updates.composer.reaction(trigger, handler as any);
		return this;
	}

	/**
	 * Register handler to `callback_query` event
	 *
	 * @example
	 * ```ts
	 * const someData = new CallbackData("example").number("id");
	 *
	 * new Bot()
	 *     .command("start", (context) =>
	 *         context.send("some", {
	 *             reply_markup: new InlineKeyboard().text(
	 *                 "example",
	 *                 someData.pack({
	 *                     id: 1,
	 *                 })
	 *             ),
	 *         })
	 *     )
	 *     .callbackQuery(someData, (context) => {
	 *         context.queryData; // is type-safe
	 *     });
	 * ```
	 */
	callbackQuery<Trigger extends CallbackData | string | RegExp>(
		trigger: Trigger,
		handler: (
			context: CallbackQueryShorthandContext<typeof this, Trigger>,
		) => unknown,
	) {
		this.updates.composer.callbackQuery(trigger, handler as any);
		return this;
	}

	/** Register handler to `chosen_inline_result` update */
	chosenInlineResult<Ctx = ContextType<typeof this, "chosen_inline_result">>(
		trigger: RegExp | string | ((context: Ctx) => boolean),
		handler: (context: Ctx & { args: RegExpMatchArray | null }) => unknown,
	) {
		this.updates.composer.chosenInlineResult(trigger as any, handler as any);
		return this;
	}

	/**
	 * Register handler to `inline_query` update
	 *
	 * @example
	 * ```ts
	 * new Bot().inlineQuery(
	 *     /regular expression with (.*)/i,
	 *     async (context) => {
	 *         if (context.args) {
	 *             await context.answer(
	 *                 [
	 *                     InlineQueryResult.article(
	 *                         "id-1",
	 *                         context.args[1],
	 *                         InputMessageContent.text("some"),
	 *                         {
	 *                             reply_markup: new InlineKeyboard().text(
	 *                                 "some",
	 *                                 "callback-data"
	 *                             ),
	 *                         }
	 *                     ),
	 *                 ],
	 *                 {
	 *                     cache_time: 0,
	 *                 }
	 *             );
	 *         }
	 *     },
	 *     {
	 *         onResult: (context) => context.editText("Message edited!"),
	 *     }
	 * );
	 * ```
	 * */
	inlineQuery<Ctx = ContextType<typeof this, "inline_query">>(
		trigger: RegExp | string | ((context: Ctx) => boolean),
		handler: (context: Ctx & { args: RegExpMatchArray | null }) => unknown,
		options: {
			onResult?: (
				context: ContextType<Bot, "chosen_inline_result"> & {
					args: RegExpMatchArray | null;
				},
			) => unknown;
		} = {},
	) {
		this.updates.composer.inlineQuery(
			trigger as any,
			handler as any,
			options as any,
		);
		return this;
	}

	/**
	 * Register handler to `message` and `business_message` event
	 *
	 * @example
	 * ```ts
	 * new Bot().hears(/regular expression with (.*)/i, async (context) => {
	 *     if (context.args) await context.send(`Params ${context.args[1]}`);
	 * });
	 * ```
	 */
	hears<
		Ctx = ContextType<typeof this, "message">,
		Trigger extends RegExp | MaybeArray<string> | ((context: Ctx) => boolean) =
			| RegExp
			| MaybeArray<string>
			| ((context: Ctx) => boolean),
	>(
		trigger: Trigger,
		handler: (context: Ctx & { args: RegExpMatchArray | null }) => unknown,
	) {
		this.updates.composer.hears(trigger as any, handler as any);
		return this;
	}

	/**
	 * Register handler to `message` and `business_message` event when entities contains a command
	 *
	 * @example
	 * ```ts
	 * new Bot().command("start", async (context) => {
	 *     return context.send(`You message is /start ${context.args}`);
	 * });
	 * ```
	 */
	command(
		command: MaybeArray<string>,
		handler: (
			context: ContextType<typeof this, "message"> & { args: string | null },
		) => unknown,
	) {
		this.updates.composer.command(command, handler as any);
		return this;
	}

	/**
	 * Register handler to `start` command when start parameter is matched
	 *
	 * @example
	 * ```ts
	 * new Bot().startParameter(/^ref_(.+)$/, (context) => {
	 *     return context.send(`Reference: ${context.rawStartPayload}`);
	 * });
	 * ```
	 */
	startParameter(
		parameter: RegExp | MaybeArray<string>,
		handler: Handler<
			ContextType<typeof this, "message"> & {
				rawStartPayload: string;
			}
		>,
	) {
		this.updates.composer.startParameter(parameter, handler as any);
		return this;
	}

	/** Currently not isolated!!! */
	group(grouped: (bot: typeof this) => AnyBot): typeof this {
		return grouped(this) as any;
	}

	/**
	 * Init bot. Call it manually only if you doesn't use {@link Bot.start}
	 */
	async init() {
		await Promise.all(
			this.lazyloadPlugins.map(async (plugin) => this.extend(await plugin)),
		);

		if (!this.info) {
			const info = await this.api.getMe({
				suppress: true,
			});

			if (info instanceof TelegramError) {
				if (info.code === 404)
					info.message = "The bot token is incorrect. Check it in BotFather.";
				throw info;
			}

			this.info = info;
			// expose info on the composer so Composer.command() can strip bot mentions
			(this.updates.composer as any).info = this.info;
		}
	}

	/**
	 * Start receive updates via long-polling or webhook
	 *
	 * @example
	 * ```ts
	 * import { Bot } from "gramio";
	 *
	 * const bot = new Bot("") // put you token here
	 *     .command("start", (context) => context.send("Hi!"))
	 *     .onStart(console.log);
	 *
	 * bot.start();
	 * ```
	 */
	async start({
		webhook,
		longPolling,
		dropPendingUpdates,
		allowedUpdates,
		deleteWebhook: deleteWebhookRaw,
	}: BotStartOptions = {}) {
		await this.init();

		const deleteWebhook = deleteWebhookRaw ?? "on-conflict-with-polling";

		if (!webhook) {
			if (deleteWebhook === true)
				await withRetries(() =>
					this.api.deleteWebhook({
						drop_pending_updates: dropPendingUpdates,
					}),
				);

			this.updates.startPolling(
				{
					...longPolling,
					allowed_updates: allowedUpdates,
				},
				{
					dropPendingUpdates,
					deleteWebhookOnConflict: deleteWebhook === "on-conflict-with-polling",
				},
			);

			this.runImmutableHooks("onStart", {
				plugins: this.dependencies,
				// biome-ignore lint/style/noNonNullAssertion: bot.init() guarantees this.info
				info: this.info!,
				updatesFrom: "long-polling",
			});

			return this.info!;
		}

		if (this.updates.isStarted) this.updates.stopPolling();

		// True means that we don't need to set webhook manually
		if (webhook !== true)
			await withRetries(async () =>
				this.api.setWebhook({
					...(typeof webhook === "string" ? { url: webhook } : webhook),
					drop_pending_updates: dropPendingUpdates,
					allowed_updates: allowedUpdates,
					// suppress: true,
				}),
			);

		this.runImmutableHooks("onStart", {
			plugins: this.dependencies,
			// biome-ignore lint/style/noNonNullAssertion: bot.init() guarantees this.info
			info: this.info!,
			updatesFrom: "webhook",
		});

		return this.info!;
	}

	/**
	 * Stops receiving events via long-polling or webhook
	 * */
	async stop(timeout = 3_000) {
		await Promise.all(
			[
				this.updates.queue.stop(timeout),
				this.updates.isStarted ? this.updates.stopPolling() : undefined,
			].filter(Boolean),
		);

		await this.runImmutableHooks("onStop", {
			plugins: this.dependencies,
			// biome-ignore lint/style/noNonNullAssertion: bot.init() guarantees this.info
			info: this.info!,
		});
	}
}
