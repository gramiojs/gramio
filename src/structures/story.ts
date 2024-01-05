import { TelegramStory } from "../generated"

/**
 * This object has not been completed yet
 */
export class Story {
    constructor(public payload: TelegramStory) {}

    get [Symbol.toStringTag]() {
        return this.constructor.name
    }
}
