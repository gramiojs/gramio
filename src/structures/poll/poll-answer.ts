import type { TelegramPollAnswer } from "@gramio/types"
import { Inspect, Inspectable } from "inspectable"
import { Chat } from "../chat"
import { User } from "../user"

/** This object represents an answer of a user in a non-anonymous poll. */
@Inspectable()
export class PollAnswer {
    constructor(public payload: TelegramPollAnswer) {}

    get [Symbol.toStringTag]() {
        return this.constructor.name
    }

    /** Unique poll identifier */
    @Inspect()
    get pollId() {
        return this.payload.poll_id
    }

    /** The chat that changed the answer to the poll, if the voter is anonymous */
    @Inspect({ nullable: false })
    get voterChat() {
        return this.payload.voter_chat
            ? new Chat(this.payload.voter_chat)
            : null
    }

    /** The user, who changed the answer to the poll */
    @Inspect({ nullable: false })
    get user() {
        return this.payload.user ? new User(this.payload.user) : null
    }

    /** Sender ID. Since `user` and `voterChat` are mutually exclusive, this field will either contain `user.id` or `voterChat.id` as a shortcut =) */
    @Inspect()
    get senderId() {
        return this.user?.id ?? (this.voterChat?.id as number)
    }

    /**
     * 0-based identifiers of answer options, chosen by the user.
     * May be empty if the user retracted their vote.
     */
    @Inspect()
    get optionIds() {
        return this.payload.option_ids
    }
}
