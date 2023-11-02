import { Bot } from ".";
import { TelegramUpdate } from "./generated";

export class Updates {
    private readonly bot: Bot;
    private isStarted = false;
    private offset = 0;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    stopPolling() {
        this.isStarted = false;
    }

    async handleUpdate(data: TelegramUpdate) {
        const updateType = Object.keys(data).at(1)!;

        this.offset = data.update_id + 1;
    }

    async startPolling() {
        if (this.isStarted)
            throw new Error("[UPDATES] Polling already started!");

        this.isStarted = true;

        while (this.isStarted) {
            const updates = await this.bot.api.getUpdates({
                offset: this.offset,
            });

            for await (const update of updates) {
                await this.handleUpdate(update);
            }
        }
    }
}
