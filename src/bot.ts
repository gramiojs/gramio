import { Context } from "@gramio/contexts";
import { convertJsonToFormData, isMediaUpload } from "@gramio/files";
import { FormattableMap } from "@gramio/format";
import type {
	APIMethodParams,
	APIMethods,
	TelegramAPIResponse,
} from "@gramio/types";
import { FormDataEncoder } from "form-data-encoder";
import { Inspectable } from "inspectable";
import "reflect-metadata";
import { fetch } from "undici";
import { ErrorKind, TelegramError } from "./errors";
import { BotOptions, ErrorDefinitions, Hooks } from "./types";
import { Updates } from "./updates";

@Inspectable<Bot>({
	serialize: () => ({}),
})
// biome-ignore lint/complexity/noBannedTypes: <explanation>
export class Bot<Errors extends ErrorDefinitions = {}> {
	readonly options: BotOptions = {};

	readonly api = new Proxy({} as APIMethods, {
		get:
			<T extends keyof APIMethods>(_target: APIMethods, method: T) =>
			(args: APIMethodParams<T>) =>
				this._callApi(method, args),
	});

	private errorsDefinitions: ErrorDefinitions = {
		TELEGRAM: TelegramError,
	};

	private errorHandler(context: Context, error: Error) {
		return this.runImmutableHooks("onError", {
			context,
			//@ts-expect-error ErrorKind exists if user register error-class with .error("kind", SomeError);
			kind: error.constructor[ErrorKind] ?? "UNKNOWN",
			error: error,
		});
	}

	updates = new Updates(this, this.errorHandler.bind(this));

	private hooks: Hooks.Store<Errors> = {
		preRequest: [
			(ctx) => {
				if (!ctx.params) return ctx;

				const formattable = FormattableMap[ctx.method];
				if (formattable) ctx.params = formattable(ctx.params);

				return ctx;
			},
		],
		onError: [],
	};

	constructor(token: string, options?: Omit<BotOptions, "token">) {
		this.options = { ...options, token };
	}

	private async runHooks<
		T extends Exclude<keyof Hooks.Store<Errors>, "onError">,
	>(type: T, context: Parameters<Hooks.Store<Errors>[T][0]>[0]) {
		let data = context;

		for await (const hook of this.hooks[type]) {
			data = await hook(data);
		}

		return data;
	}

	private async runImmutableHooks<
		T extends Extract<keyof Hooks.Store<Errors>, "onError">,
	>(type: T, context: Parameters<Hooks.Store<Errors>[T][0]>[0]) {
		for await (const hook of this.hooks[type]) {
			await hook(context);
		}
	}

	private async _callApi<T extends keyof APIMethods>(
		method: T,
		params: APIMethodParams<T> = {},
	) {
		const url = `https://api.telegram.org/bot${this.options.token}/${method}`;

		const reqOptions: RequestInit = {
			method: "POST",
			duplex: "half",
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

			const encoder = new FormDataEncoder(formData);

			reqOptions.body = encoder.encode();
			reqOptions.headers = encoder.headers;
		} else {
			reqOptions.headers = {
				"Content-Type": "application/json",
			};
			reqOptions.body = JSON.stringify(params);
		}

		const response = await fetch(url, reqOptions);

		const data = (await response.json()) as TelegramAPIResponse;
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
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		NewError extends { new (...args: any): any; prototype: Error },
	>(kind: Name, error: NewError) {
		//@ts-expect-error Set ErrorKind
		error[ErrorKind] = kind;
		this.errorsDefinitions[kind] = error;

		return this as unknown as Bot<
			Errors & { [name in Name]: InstanceType<NewError> }
		>;
	}

	/**
	 * Set error handler.
	 * @example
	 * ```ts
	 * bot.updates.onError(({ context, kind, error }) => {
	 * 	if(context.is("message")) return context.send(`${kind}: ${error.message}`);
	 * })
	 * ```
	 */
	onError(handler: Hooks.OnError<Errors>) {
		this.hooks.onError.push(handler);

		return this;
	}
}
