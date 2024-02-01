import { stringify } from "node:querystring";
import type { ApiMethods } from "@gramio/types";
import { Inspectable } from "inspectable";
import "reflect-metadata";
import { fetch } from "undici";
import { APIError } from "./apiErrors";
import {
	APIResponse,
	APIResponseError,
	APIResponseOk,
	BotOptions,
} from "./types";
import { Updates } from "./updates";

@Inspectable<Bot>({
	serialize: () => ({}),
})
export class Bot {
	readonly options: BotOptions = {};

	readonly api = new Proxy<ApiMethods>({} as ApiMethods, {
		get: (_target, method: string) => (args: Record<string, any>) => {
			return this._callApi(method, args);
		},
	});

	updates = new Updates(this);

	private async _callApi(method: string, params: Record<string, any> = {}) {
		const url =
			`http://api.telegram.org/bot` +
			this.options.token +
			"/" +
			method +
			`?${stringify(params).toString()}`;

		const response = await fetch(url, {
			method: "GET",
		});

		const data = (await response.json()) as APIResponse;

		if (!response.ok)
			throw new APIError({ method, params }, data as APIResponseError);

		return (data as APIResponseOk).result;
	}

	constructor(token: string, options?: Omit<BotOptions, "token">) {
		this.options = { ...options, token };
	}
}

export * from "@gramio/types";

const bot = new Bot("5625571394:AAGbN2mjSazNPEAOqynRLnE1I-518BiDl4s");

bot.updates.on("message", async (ctx) => {
	const a = await ctx.send("test");
	console.log(a);
});

bot.updates.startPolling().then(console.log);
