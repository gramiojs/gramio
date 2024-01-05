import type { TelegramChatLocation } from "@gramio/types"
import { Inspect, Inspectable } from "inspectable"
import { Location } from "../location"

@Inspectable()
export class ChatLocation {
    constructor(public payload: TelegramChatLocation) {}

    get [Symbol.toStringTag]() {
        return this.constructor.name
    }

    /** The location to which the supergroup is connected. Can't be a live location. */
    @Inspect()
    get location() {
        return new Location(this.payload.location)
    }

    /** Location address; `1-64` characters, as defined by the chat owner */
    @Inspect()
    get address() {
        return this.payload.address
    }
}
