import type { ApiMethods, TelegramAPIResponse } from "@gramio/types";
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
		get: (_target, method: string) => (args: Record<string, unknown>) => {
			return this._callApi(method, args);
		},
	});

	updates = new Updates(this);

	private async _callApi(method: string, params: Record<string, unknown> = {}) {
		const url = `https://api.telegram.org/bot${this.options.token}/${method}`;

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(params),
		});

		const data = (await response.json()) as TelegramAPIResponse;

		if (!data.ok) throw new APIError({ method, params }, data);

		return data.result;
	}

	constructor(token: string, options?: Omit<BotOptions, "token">) {
		this.options = { ...options, token };
	}
}

export * from "@gramio/types";
