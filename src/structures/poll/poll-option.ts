import { Inspect, Inspectable } from "inspectable"
import { TelegramPollOption } from "../../generated"

/** This object contains information about one answer option in a poll. */
@Inspectable()
export class PollOption {
    constructor(public payload: TelegramPollOption) {}

    get [Symbol.toStringTag]() {
        return this.constructor.name
    }

    /** Option text, 1-100 characters */
    @Inspect()
    get text() {
        return this.payload.text
    }

    /** Number of users that voted for this option */
    @Inspect()
    get voterCount() {
        return this.payload.voter_count
    }
}
