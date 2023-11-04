import { TelegramMessage } from "../generated";
import * as Params from "../generated/api-params";
import { Optional } from "../types";
import { Context, ContextData } from "./context";

export class MessageContext extends Context {
    payload: TelegramMessage;
    #text: string;

    constructor(data: ContextData) {
        super({
            bot: data.bot,
            raw: data.raw,
        });

        this.payload = data.raw.update.message!;

        this.#text = this.payload.text!;
    }

    /**
     * For text messages, the actual UTF-8 text of the message, 0-4096 characters
     */
    get text() {
        return this.#text;
    }

    set text(text) {
        this.#text = text;
    }

    async send(
        text: Params.SendMessageParams["text"],
        params?: Optional<Params.SendMessageParams, "chat_id" | "text">,
    ) {
        const reponse = await this.bot.api.sendMessage({
            chat_id: this.payload.chat.id || this.payload.from?.id || 0,
            text,
            ...params,
        });
    }
}
