import { CallbackData } from "@gramio/callback-data";
import type {
	Context,
	ContextType,
	MaybeArray,
	UpdateName,
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
import { Plugin } from "#plugin";
import { ErrorKind, TelegramError } from "./errors";
import type {
	BotOptions,
	DeriveDefinitions,
	ErrorDefinitions,
	Handler,
	Hooks,
	MaybePromise,
} from "./types";
import { Updates } from "./updates";

@Inspectable<Bot>({
	serialize: () => ({}),
})
export class Bot<
	Errors extends ErrorDefinitions = {},
	Derives extends DeriveDefinitions = DeriveDefinitions,
> {
	/** @internal */
	__Derives!: Derives;

	readonly options: BotOptions = {};
	info: TelegramUser | undefined;

	readonly api = new Proxy({} as APIMethods, {
		get:
			<T extends keyof APIMethods>(_target: APIMethods, method: T) =>
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

	private errorHandler(context: Context<typeof this>, error: Error) {
		return this.runImmutableHooks("onError", {
			context,
			//@ts-expect-error ErrorKind exists if user register error-class with .error("kind", SomeError);
			kind: error.constructor[ErrorKind] ?? "UNKNOWN",
			error: error,
		});
	}

	updates = new Updates(this, this.errorHandler.bind(this));

	private hooks: Hooks.Store<Errors> = {
		preRequest: [],
		onError: [],
		onStart: [],
		onStop: [],
	};

	constructor(token: string, options?: Omit<BotOptions, "token">) {
		if (!token || typeof token !== "string")
			throw new Error(`Token is ${typeof token} but it should be a string!`);

		this.options = { ...options, token };

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
			"onError" | "onStart" | "onStop"
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
			"onError" | "onStart" | "onStop"
		>,
	>(type: T, context: Parameters<Hooks.Store<Errors>[T][0]>[0]) {
		for await (const hook of this.hooks[type]) {
			//TODO: solve that later
			//@ts-expect-error
			await hook(context);
		}
	}

	private async _callApi<T extends keyof APIMethods>(
		method: T,
		params: APIMethodParams<T> = {},
	) {
		const url = `https://api.telegram.org/bot${this.options.token}/${method}`;

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

		if (params && isMediaUpload(method, params)) {
			const formData = await convertJsonToFormData(method, params);

			reqOptions.body = formData;
		} else {
			reqOptions.headers = {
				"Content-Type": "application/json",
			};
			reqOptions.body = JSON.stringify(params);
		}

		const response = await request(url, reqOptions);

		const data = (await response.body.json()) as TelegramAPIResponse;
		if (!data.ok) throw new TelegramError(data, method, params);

		return data.result;
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
		if (typeof updateNameOrHandler === "function")
			this.updates.use(async (context, next) => {
				for (const [key, value] of Object.entries(
					await updateNameOrHandler(context),
				)) {
					context[key] = value;
				}

				next();
			});
		else if (handler)
			this.updates.on(updateNameOrHandler, async (context, next) => {
				for (const [key, value] of Object.entries(await handler(context))) {
					context[key] = value;
				}

				next();
			});

		return this;
	}

	onStart(handler: Hooks.OnStart) {
		this.hooks.onStart.push(handler);

		return this;
	}

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

	on<T extends UpdateName>(
		updateName: MaybeArray<T>,
		handler: Handler<
			ContextType<typeof this, T> & Derives["global"] & Derives[T]
		>,
	) {
		this.updates.on(updateName, handler);

		return this;
	}

	use(handler: Handler<Context<typeof this> & Derives["global"]>) {
		this.updates.use(handler);

		return this;
	}

	extend<NewPlugin extends Plugin<any, any>>(
		plugin: MaybePromise<NewPlugin>,
	): Bot<Errors & NewPlugin["Errors"], Derives & NewPlugin["Derives"]> {
		if (plugin instanceof Promise) {
			this.lazyloadPlugins.push(plugin);

			return this;
		}

		if (plugin.dependencies.some((dep) => !this.dependencies.includes(dep)))
			throw new Error(
				`The «${
					plugin.name
				}» plugin needs dependencies registered before: ${plugin.dependencies
					.filter((dep) => !this.dependencies.includes(dep))
					.join(", ")}`,
			);

		for (const [key, value] of Object.entries(plugin.errorsDefinitions)) {
			if (this.errorsDefinitions[key]) this.errorsDefinitions[key] = value;
		}

		for (const value of plugin.derives) {
			const [derive, updateName] = value;

			if (!updateName) this.derive(derive);
			else this.derive(updateName, derive);
		}

		for (const value of plugin.preRequests) {
			const [preRequest, updateName] = value;

			if (!updateName) this.preRequest(preRequest);
			else this.preRequest(updateName, preRequest);
		}

		for (const handler of plugin.groups) {
			this.group(handler);
		}

		this.dependencies.push(plugin.name);

		return this;
	}

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

			// @ts-expect-error
			context.queryData = trigger.unpack(context.data);

			//@ts-expect-error
			return handler(context);
		});
	}

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

		return this.on("message", (context, next) => {
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
	group(grouped: (bot: typeof this) => Bot<any, any>) {
		return grouped(this);
	}

	async init() {
		await Promise.all(
			this.lazyloadPlugins.map(async (plugin) => this.extend(await plugin)),
		);

		this.info = await this.api.getMe();
	}

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
	/** Currently does not implement graceful shutdown */
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
