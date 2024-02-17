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
import { BotOptions } from "./types";
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

	updates = new Updates(this);

	constructor(token: string, options?: Omit<BotOptions, "token">) {
		this.options = { ...options, token };
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

		const formattable = FormattableMap[method];
		// biome-ignore lint/style/noParameterAssign: mutate formattable
		if (formattable && params) params = formattable(params);

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
}
