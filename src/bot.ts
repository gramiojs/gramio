import { convertJsonToFormData, isMediaUpload } from "@gramio/files";
import { FormattableMap } from "@gramio/format";
import type { ApiMethods, TelegramAPIResponse } from "@gramio/types";
import { FormDataEncoder } from "form-data-encoder";
import { Inspectable } from "inspectable";
import "reflect-metadata";
import { fetch } from "undici";
import { APIError } from "./apiErrors";
import { BotOptions } from "./types";
import { Updates } from "./updates";

@Inspectable<Bot>({
	serialize: () => ({}),
})
export class Bot {
	readonly options: BotOptions = {};

	readonly api = new Proxy({} as ApiMethods, {
		get:
			<T extends keyof ApiMethods>(_target: ApiMethods, method: T) =>
			(args: Parameters<ApiMethods[T]>[0]) =>
				this._callApi(method, args),
	});

	updates = new Updates(this);

	private async _callApi<T extends keyof ApiMethods>(
		method: T,
		params: Parameters<ApiMethods[T]>[0] = {},
	) {
		const url = `https://api.telegram.org/bot${this.options.token}/${method}`;

		const reqOptions: RequestInit = {
			method: "POST",
			duplex: "half",
		};

		const formattable = FormattableMap[method];
		// biome-ignore lint/style/noParameterAssign: mutate formattable
		if (formattable && params) params = formattable(params);

		if (isMediaUpload(method, params || {})) {
			const formData = await convertJsonToFormData(method, params || {});

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
		if (!data.ok) throw new APIError({ method, params }, data);

		return data.result;
	}

	constructor(token: string, options?: Omit<BotOptions, "token">) {
		this.options = { ...options, token };
	}
}
