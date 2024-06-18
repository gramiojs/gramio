import { Buffer } from "node:buffer";
import fs from "node:fs/promises";
import { CallbackData } from "@gramio/callback-data";
import {
	type Attachment,
	type Context,
	type ContextType,
	type MaybeArray,
	PhotoAttachment,
	type UpdateName,
} from "@gramio/contexts";
import { convertJsonToFormData, isMediaUpload } from "@gramio/files";
import { FormattableMap } from "@gramio/format";
import type {
	APIMethodParams,
	APIMethods,
	SetMyCommandsParams,
	TelegramAPIResponse,
	TelegramBotCommand,
	TelegramReactionType,
	TelegramReactionTypeEmojiEmoji,
	TelegramUser,
} from "@gramio/types";
import { Inspectable } from "inspectable";
import { request } from "undici";
import type { FormData } from "undici";
import { ErrorKind, TelegramError } from "./errors";
import { Plugin } from "./plugin";
import type {
	AnyBot,
	AnyPlugin,
	BotOptions,
	DeriveDefinitions,
	ErrorDefinitions,
	Handler,
	Hooks,
	MaybePromise,
	MaybeSuppressedParams,
	SuppressedAPIMethods,
} from "./types";
import { Updates } from "./updates";

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
@Inspectable<Bot>({
	serialize: () => ({}),
})
export class Bot<
	Errors extends ErrorDefinitions = {},
	Derives extends DeriveDefinitions = DeriveDefinitions,
> {
	/** @internal. Remap generic */
	__Derives!: Derives;

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
		get:
			<T extends keyof SuppressedAPIMethods>(
				_target: SuppressedAPIMethods,
				method: T,
			) =>
			(args: APIMethodParams<T>) =>
				this._callApi(method, args),
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
		if (!this.hooks.onError.length) throw error;

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
		options?: Omit<BotOptions, "token" | "api"> & {
			api?: Partial<BotOptions["api"]>;
		},
	) {
		const token =
			typeof tokenOrOptions === "string"
				? tokenOrOptions
				: tokenOrOptions?.token;

		if (!token || typeof token !== "string")
			throw new Error(`Token is ${typeof token} but it should be a string!`);

		this.options = {
			...(typeof tokenOrOptions === "object" ? tokenOrOptions : options),
			token,
			api: { ...options?.api, baseURL: "https://api.telegram.org/bot" },
		};

		if (
			!(
				options?.plugins &&
				"format" in options.plugins &&
				!options.plugins.format
			)
		)
			this.extend(
				new Plugin("@gramio/format").preRequest((context) => {
					if (!context.params) return context;

					// @ts-ignore
					const formattable = FormattableMap[context.method];
					// @ts-ignore add AnyTelegramMethod to @gramio/format
					if (formattable) context.params = formattable(context.params);

					return context;
				}),
			);
	}

	private async runHooks<
		T extends Exclude<
			keyof Hooks.Store<Errors>,
			"onError" | "onStart" | "onStop" | "onResponseError" | "onResponse"
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
		for await (const hook of this.hooks[type]) {
			//TODO: solve that later
			//@ts-expect-error
			await hook(...context);
		}
	}

	private async _callApi<T extends keyof APIMethods>(
		method: T,
		params: MaybeSuppressedParams<T> = {},
	) {
		const url = `${this.options.api.baseURL}${this.options.token}/${method}`;

		const reqOptions: Parameters<typeof request>[1] = {
			method: "POST",
		};

		const context = await this.runHooks(
			"preRequest",
			// TODO: fix type error
			// @ts-expect-error
			{
				method,
				params,
			},
		);

		// biome-ignore lint/style/noParameterAssign: mutate params
		params = context.params;

		// @ts-ignore
		if (params && isMediaUpload(method, params)) {
			// @ts-ignore
			const formData = await convertJsonToFormData(method, params);

			reqOptions.body = formData as FormData;
		} else {
			reqOptions.headers = {
				"Content-Type": "application/json",
			};
			reqOptions.body = JSON.stringify(params);
		}

		const response = await request(url, reqOptions);

		const data = (await response.body.json()) as TelegramAPIResponse;

		if (!data.ok) {
			const err = new TelegramError(data, method, params);

			// @ts-expect-error
			this.runImmutableHooks("onResponseError", err, this.api);

			if (!params?.suppress) throw err;

			return err;
		}

		this.runImmutableHooks(
			"onResponse",
			// TODO: fix type error
			// @ts-expect-error
			{
				method,
				params,
				response: data.result as any,
			},
		);

		return data.result;
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

		const res = await request(url);

		const buffer = await res.body.arrayBuffer();

		if (path) {
			await fs.writeFile(path, Buffer.from(buffer));

			return path;
		}

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
		handler: Hooks.OnError<
			Errors,
			ContextType<typeof this, T> & Derives["global"] & Derives[T]
		>,
	): this;

	onError(
		handler: Hooks.OnError<Errors, Context<typeof this> & Derives["global"]>,
	): this;

	onError<T extends UpdateName>(
		updateNameOrHandler: T | Hooks.OnError<Errors>,
		handler?: Hooks.OnError<
			Errors,
			ContextType<typeof this, T> & Derives["global"] & Derives[T]
		>,
	): this {
		if (typeof updateNameOrHandler === "function") {
			this.hooks.onError.push(updateNameOrHandler);

			return this;
		}

		if (handler) {
			this.hooks.onError.push(async (errContext) => {
				if (errContext.context.is(updateNameOrHandler))
					// TODO:  Sorry... fix later
					//@ts-expect-error
					await handler(errContext);
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
	derive<Handler extends Hooks.Derive<Context<typeof this>>>(
		handler: Handler,
	): Bot<Errors, Derives & { global: Awaited<ReturnType<Handler>> }>;

	derive<
		Update extends UpdateName,
		Handler extends Hooks.Derive<ContextType<typeof this, Update>>,
	>(
		updateName: MaybeArray<Update>,
		handler: Handler,
	): Bot<Errors, Derives & { [K in Update]: Awaited<ReturnType<Handler>> }>;

	derive<
		Update extends UpdateName,
		Handler extends Hooks.Derive<ContextType<typeof this, Update>>,
	>(updateNameOrHandler: MaybeArray<Update> | Handler, handler?: Handler) {
		this.updates.composer.derive(updateNameOrHandler, handler);

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

			// TODO: remove error
			// @ts-expect-error
			this.hooks.preRequest.push(async (context) => {
				// TODO: remove ts-ignore
				// @ts-expect-error
				if (methods.includes(context.method)) return handler(context);

				return context;
			});
		} else this.hooks.preRequest.push(methodsOrHandler);

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

			this.hooks.onResponse.push(async (context) => {
				// TODO: remove ts-ignore
				// @ts-expect-error
				if (methods.includes(context.method)) return handler(context);

				return context;
			});
		} else this.hooks.onResponse.push(methodsOrHandler);

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

			this.hooks.onResponseError.push(async (context) => {
				// TODO: remove ts-ignore
				// @ts-expect-error
				if (methods.includes(context.method)) return handler(context);

				return context;
			});
		} else this.hooks.onResponseError.push(methodsOrHandler);

		return this;
	}

	/** Register handler to one or many Updates */
	on<T extends UpdateName>(
		updateName: MaybeArray<T>,
		handler: Handler<
			ContextType<typeof this, T> & Derives["global"] & Derives[T]
		>,
	) {
		this.updates.composer.on(updateName, handler);

		return this;
	}

	/** Register handler to any Updates */
	use(handler: Handler<Context<typeof this> & Derives["global"]>) {
		this.updates.composer.use(handler);

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
	extend<NewPlugin extends AnyPlugin>(
		plugin: MaybePromise<NewPlugin>,
	): Bot<
		Errors & NewPlugin["_"]["Errors"],
		Derives & NewPlugin["_"]["Derives"]
	> {
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

		if (plugin._.composer.length) {
			this.use(plugin._.composer.composed);
		}

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

		for (const handler of plugin._.groups) {
			this.group(handler);
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
		handler: (
			context: ContextType<typeof this, "message_reaction"> &
				Derives["global"] &
				Derives["message_reaction"],
		) => unknown,
	) {
		const reactions = Array.isArray(trigger) ? trigger : [trigger];

		return this.on("message_reaction", (context, next) => {
			const newReactions: TelegramReactionType[] = [];

			for (const reaction of context.newReactions) {
				if (reaction.type !== "emoji") continue;

				const foundIndex = context.oldReactions.findIndex(
					(oldReaction) =>
						oldReaction.type === "emoji" &&
						oldReaction.emoji === reaction.emoji,
				);
				if (foundIndex === -1) {
					newReactions.push(reaction);
				} else {
					// TODO: REFACTOR
					context.oldReactions.splice(foundIndex, 1);
				}
			}

			if (
				!newReactions.some(
					(x) => x.type === "emoji" && reactions.includes(x.emoji),
				)
			)
				return next();

			return handler(context);
		});
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
			context: Omit<ContextType<typeof this, "callback_query">, "data"> &
				Derives["global"] &
				Derives["callback_query"] & {
					queryData: Trigger extends CallbackData
						? ReturnType<Trigger["unpack"]>
						: RegExpMatchArray | null;
				},
		) => unknown,
	) {
		return this.on("callback_query", (context, next) => {
			if (!context.data) return next();
			if (typeof trigger === "string" && context.data !== trigger)
				return next();
			if (
				trigger instanceof CallbackData &&
				!trigger.regexp().test(context.data)
			)
				return next();
			if (trigger instanceof RegExp && !trigger.test(context.data))
				return next();

			if (trigger instanceof CallbackData)
				// @ts-expect-error
				context.queryData = trigger.unpack(context.data);

			//@ts-expect-error
			return handler(context);
		});
	}

	/** Register handler to `chosen_inline_result` update */
	chosenInlineResult<
		Ctx = ContextType<typeof this, "chosen_inline_result"> &
			Derives["global"] &
			Derives["chosen_inline_result"],
	>(
		trigger: RegExp | string | ((context: Ctx) => boolean),
		handler: (context: Ctx & { args: RegExpMatchArray | null }) => unknown,
	) {
		return this.on("chosen_inline_result", (context, next) => {
			if (
				(typeof trigger === "string" && context.query === trigger) ||
				// @ts-expect-error
				(typeof trigger === "function" && trigger(context)) ||
				(trigger instanceof RegExp &&
					context.query &&
					trigger.test(context.query))
			) {
				//@ts-expect-error
				context.args =
					trigger instanceof RegExp ? context.query?.match(trigger) : null;

				// TODO: remove
				//@ts-expect-error
				return handler(context);
			}

			return next();
		});
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
	inlineQuery<
		Ctx = ContextType<typeof this, "inline_query"> &
			Derives["global"] &
			Derives["inline_query"],
	>(
		trigger: RegExp | string | ((context: Ctx) => boolean),
		handler: (context: Ctx & { args: RegExpMatchArray | null }) => unknown,
		options: {
			onResult?: (
				context: ContextType<Bot, "chosen_inline_result"> &
					Derives["global"] &
					Derives["chosen_inline_result"] & { args: RegExpMatchArray | null },
			) => unknown;
		} = {},
	) {
		// @ts-expect-error fix later...
		if (options.onResult) this.chosenInlineResult(trigger, options.onResult);

		return this.on("inline_query", (context, next) => {
			if (
				(typeof trigger === "string" && context.query === trigger) ||
				// @ts-expect-error
				(typeof trigger === "function" && trigger(context)) ||
				(trigger instanceof RegExp &&
					context.query &&
					trigger.test(context.query))
			) {
				//@ts-expect-error
				context.args =
					trigger instanceof RegExp ? context.query?.match(trigger) : null;

				// TODO: remove
				//@ts-expect-error
				return handler(context);
			}

			return next();
		});
	}

	/**
	 * Register handler to `message` and `business_message` event
	 *
	 * new Bot().hears(/regular expression with (.*)/i, async (context) => {
	 *     if (context.args) await context.send(`Params ${context.args[1]}`);
	 * });
	 */
	hears<
		Ctx = ContextType<typeof this, "message"> &
			Derives["global"] &
			Derives["message"],
	>(
		trigger: RegExp | string | ((context: Ctx) => boolean),
		handler: (context: Ctx & { args: RegExpMatchArray | null }) => unknown,
	) {
		return this.on("message", (context, next) => {
			if (
				(typeof trigger === "string" && context.text === trigger) ||
				// @ts-expect-error
				(typeof trigger === "function" && trigger(context)) ||
				(trigger instanceof RegExp &&
					context.text &&
					trigger.test(context.text))
			) {
				//@ts-expect-error
				context.args =
					trigger instanceof RegExp ? context.text?.match(trigger) : null;

				// TODO: remove
				//@ts-expect-error
				return handler(context);
			}

			return next();
		});
	}

	/**
	 * Register handler to `message` and `business_message` event when entities contains a command
	 *
	 * new Bot().command("start", async (context) => {
	 *     return context.send(`You message is /start ${context.args}`);
	 * });
	 */
	command(
		command: string,
		handler: (
			context: ContextType<typeof this, "message"> &
				Derives["global"] &
				Derives["message"] & { args: string | null },
		) => unknown,
		options?: Omit<SetMyCommandsParams, "commands"> &
			Omit<TelegramBotCommand, "command">,
	) {
		if (command.startsWith("/"))
			throw new Error("Do not use / in command name");

		return this.on(["message", "business_message"], (context, next) => {
			// TODO: change to find
			if (
				context.entities?.some((entity) => {
					if (entity.type !== "bot_command" || entity.offset > 0) return false;

					const cmd = context.text
						?.slice(1, entity.length)
						// biome-ignore lint/style/noNonNullAssertion: <explanation>
						?.replace(`@${this.info!.username!}`, "");
					// @ts-expect-error
					context.args = context.text?.slice(entity.length).trim() || null;

					return cmd?.startsWith(command);
				})
			)
				// @ts-expect-error
				return handler(context);

			return next();
		});
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

		this.info = await this.api.getMe();
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
		dropPendingUpdates,
		allowedUpdates,
	}: {
		webhook?: Omit<
			APIMethodParams<"setWebhook">,
			"drop_pending_updates" | "allowed_updates"
		>;
		dropPendingUpdates?: boolean;
		allowedUpdates?: NonNullable<
			APIMethodParams<"getUpdates">
		>["allowed_updates"];
	} = {}) {
		await this.init();

		if (!webhook) {
			await this.api.deleteWebhook({
				drop_pending_updates: dropPendingUpdates,
			});

			await this.updates.startPolling({
				allowed_updates: allowedUpdates,
			});

			this.runImmutableHooks("onStart", {
				plugins: this.dependencies,
				// biome-ignore lint/style/noNonNullAssertion: bot.init() guarantees this.info
				info: this.info!,
				updatesFrom: "long-polling",
			});

			return this.info;
		}

		if (this.updates.isStarted) this.updates.stopPolling();

		await this.api.setWebhook({
			...webhook,
			drop_pending_updates: dropPendingUpdates,
			allowed_updates: allowedUpdates,
		});

		this.runImmutableHooks("onStart", {
			plugins: this.dependencies,
			// biome-ignore lint/style/noNonNullAssertion: bot.init() guarantees this.info
			info: this.info!,
			updatesFrom: "webhook",
		});

		return this.info;
	}

	/**
	 * Stops receiving events via long-polling or webhook
	 * Currently does not implement graceful shutdown
	 * */
	async stop() {
		if (this.updates.isStarted) this.updates.stopPolling();
		else await this.api.deleteWebhook();

		await this.runImmutableHooks("onStop", {
			plugins: this.dependencies,
			// biome-ignore lint/style/noNonNullAssertion: bot.init() guarantees this.info
			info: this.info!,
		});
	}
}
