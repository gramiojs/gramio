import { Bot } from "..";
import { TelegramUpdate } from "../generated/objects";
import { UpdateNames } from "../types";
import { contextMappings } from ".";

export interface RawData {
    updateId: number;
    updateType: "message";
    update: TelegramUpdate;
}

export interface ContextData {
    bot: Bot;
    raw: RawData;
}

export class Context {
    bot: Bot;
    raw: RawData;

    constructor(data: ContextData) {
        this.bot = data.bot;
        this.raw = data.raw;
    }

    is<T extends UpdateNames>(update: T): this is (typeof contextMappings)[T] {
        return this.raw.updateType.includes(update);
    }
}
