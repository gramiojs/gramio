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
import { TelegramError } from "./TelegramError";
import { BotOptions, Hooks } from "./types";
import { Updates } from "./updates";

@Inspectable<Bot>({
	serialize: () => ({}),
})
export class Bot {
	readonly options: BotOptions = {};

	readonly api = new Proxy({} as APIMethods, {
		get:
			<T extends keyof APIMethods>(_target: APIMethods, method: T) =>
			(args: APIMethodParams<T>) =>
				this._callApi(method, args),
	});

	private errorHandler(context: Context, error: Error) {
		if (error instanceof TelegramError)
			return this.runImmutableHooks("onError", {
				context,
				kind: "TELEGRAM",
				error,
			});

		return this.runImmutableHooks("onError", {
			context,
			kind: "UNKNOWN",
			error,
		});
	}

	updates = new Updates(this, this.errorHandler);

	private hooks: Hooks.Store = {
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

	private async runHooks<T extends Exclude<keyof Hooks.Store, "onError">>(
		type: T,
		context: Parameters<Hooks.Store[T][0]>[0],
	) {
		let data = context;

		for await (const hook of this.hooks[type]) {
			data = await hook(data);
		}

		return data;
	}

	private async runImmutableHooks<
		T extends Extract<keyof Hooks.Store, "onError">,
	>(type: T, context: Parameters<Hooks.Store[T][0]>[0]) {
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
	 * Set error handler.
	 * @example
	 * ```ts
	 * bot.updates.onError(({ context, kind, error }) => {
	 * 	if(context.is("message")) return context.send(`${kind}: ${error.message}`);
	 * })
	 * ```
	 */
	onError(handler: Hooks.OnError) {
		this.hooks.onError.push(handler);
	}
}
