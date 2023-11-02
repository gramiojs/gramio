import { stringify } from "node:querystring";
import { fetch } from "undici";
import { ApiMethods } from "./generated";
import { ApiResponse, BotOptions } from "./types";

export class Bot {
    private readonly options: BotOptions = {};
    readonly api = new Proxy<ApiMethods>({} as ApiMethods, {
        get: (_target, method: string) => (args: Record<string, any>) => {
            return this._callApi(method, args);
        },
    });

    private async _callApi(path: string, params: Record<string, any> = {}) {
        const url =
            `http://api.telegram.org/bot` +
            this.options.token +
            "/" +
            path +
            `?${stringify(params).toString()}`;

        const req = await fetch(url, {
            method: "GET",
        });
        const data = (await req.json()) as ApiResponse;

        return data.result;
    }

    constructor(token: string, options?: Omit<BotOptions, "token">) {
        this.options = { ...options, token };
    }
}
