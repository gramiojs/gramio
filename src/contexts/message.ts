import { inspectable } from "inspectable"
import { TelegramMessage } from "../generated"
import * as Params from "../generated/api-params"
import { applyMixins, filterPayload } from "../helpers"
import {
    ContactAttachment,
    LocationAttachment,
    PhotoAttachment,
    PollAttachment,
    VenueAttachment,
} from "../structures"
import { Message } from "../structures/message/message"
import {
    AttachmentsMapping,
    AttachmentType,
    Optional,
    Require,
    RequireValue,
} from "../types"
import { Context, ContextData } from "./context"
import { CloneMixin } from "./mixins/clone"

export class MessageContext extends Context {
    payload: TelegramMessage
    #text?: string

    constructor(payload: ContextData) {
        super({
            bot: payload.bot,
            raw: payload.raw,
        })

        this.payload = payload.raw.update.message!

        this.#text = this.payload.text
    }

    /**
     * For text messages, the actual UTF-8 text of the message, 0-4096 characters
     */
    get text() {
        return this.#text
    }

    set text(text) {
        this.#text = text
    }

    /** Checks if the message has `text` property */
    hasText(): this is Require<this, "text"> {
        return this.text !== undefined
    }

    /** Message attachment */
    get attachment() {
        if (this.photo) return new PhotoAttachment(this.photo)

        if (this.payload.contact)
            return new ContactAttachment(this.payload.contact)

        if (this.payload.poll) return new PollAttachment(this.payload.poll)

        if (this.payload.venue) return new VenueAttachment(this.payload.venue)

        if (this.payload.location)
            return new LocationAttachment(this.payload.location)

        return (
            this.sticker ??
            this.story ??
            this.animation ??
            this.audio ??
            this.document ??
            this.video ??
            this.videoNote ??
            this.voice
        )
    }

    /** Does this message have an attachment with a specific type `type`? */
    hasAttachmentType<T extends AttachmentType>(
        type: T,
    ): this is RequireValue<this, "attachment", AttachmentsMapping[T]> {
        return this.attachment?.attachmentType === type
    }

    /** Does this message even have an attachment? */
    hasAttachment(): this is Require<this, "attachment"> {
        return this.attachment !== null
    }

    async send(
        text: Params.SendMessageParams["text"],
        params?: Optional<Params.SendMessageParams, "chat_id" | "text">,
    ) {
        const reponse = await this.bot.api.sendMessage({
            chat_id: this.payload.chat.id || this.payload.from?.id || 0,
            text,
            ...params,
        })
    }
}

export interface MessageContext extends Message {}
applyMixins(MessageContext, [Message, CloneMixin])

inspectable(MessageContext, {
    serialize: (context) =>
        filterPayload({
            id: context.id,
            from: context.from,
            createdAt: context.createdAt,
            chat: context.chat,
            forwardedMessage: context.forwardedMessage,
            repliedMessage: context.repliedMessage,
            viaBot: context.viaBot,
            updatedAt: context.updatedAt,
            authorSignature: context.authorSignature,
            text: context.text,
            entities: context.entities,
            // captionEntities: context.captionEntities,
            // dice: context.dice,
            caption: context.caption,
            contact: context.contact,
            location: context.location,
            venue: context.venue,
            poll: context.poll,
            // replyMarkup: context.replyMarkup,
            attachment: context.attachment,
        }),
})
