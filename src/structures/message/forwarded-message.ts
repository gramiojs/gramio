import { Inspect, Inspectable } from "inspectable";
import { TelegramMessage } from "../../generated";
import { Chat } from "../chat";
import { User } from "../user";

/** This object represents a forwarded message. */
@Inspectable()
export class ForwardedMessage {
    constructor(public payload: TelegramMessage) {}

    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }

    /**
     * For messages forwarded from channels, identifier of the original message
     * in the channel
     */
    @Inspect({ nullable: false })
    get id() {
        return this.payload.forward_from_message_id;
    }

    /** For forwarded messages, sender of the original message */
    @Inspect({ nullable: false })
    get from() {
        const { forward_from } = this.payload;

        if (!forward_from) {
            return;
        }

        return new User(forward_from);
    }

    /**
     * For messages forwarded from channels, information about the original
     * channel
     */
    @Inspect({ nullable: false })
    get chat() {
        const { forward_from_chat } = this.payload;

        if (!forward_from_chat) {
            return;
        }

        return new Chat(forward_from_chat);
    }

    /**
     * For messages forwarded from channels, signature of the post author
     * if present
     */
    @Inspect({ nullable: false })
    get signature() {
        return this.payload.forward_signature;
    }

    /**
     * Sender's name for messages forwarded from users who disallow adding a link
     * to their account in forwarded messages
     */
    @Inspect({ nullable: false })
    get senderName() {
        return this.payload.forward_sender_name;
    }

    /**
     * For forwarded messages, date the original message was sent in Unix time
     */
    @Inspect()
    get createdAt() {
        return this.payload.forward_date as number;
    }

    /** `true`, if the message is a channel post that was automatically forwarded to the connected discussion group */
    @Inspect({ compute: true, nullable: false })
    isAutomatic() {
        return this.payload.is_automatic_forward;
    }
}
