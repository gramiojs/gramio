import type { TelegramMessage } from "@gramio/types"
import { Inspect, Inspectable } from "inspectable"
import {
    AnimationAttachment,
    AudioAttachment,
    Contact,
    DocumentAttachment,
    Location,
    PhotoSize,
    Poll,
    StickerAttachment,
    StoryAttachment,
    User,
    Venue,
    VideoAttachment,
    VideoNoteAttachment,
    VoiceAttachment,
} from ".."
import { Chat } from "../chat"
import { ForwardedMessage } from "./forwarded-message"

/** This object represents a message. */
@Inspectable()
export class Message {
    constructor(public payload: TelegramMessage) {}

    get [Symbol.toStringTag]() {
        return this.constructor.name
    }

    /** Unique message identifier inside this chat */
    @Inspect()
    get id() {
        return this.payload.message_id
    }

    /** Unique identifier of a message thread to which the message belongs; for supergroups only */
    @Inspect({ nullable: false })
    get threadId() {
        return this.payload.message_thread_id
    }

    /** Sender, empty for messages sent to channels */
    @Inspect({ nullable: false })
    get from() {
        return this.payload.from ? new User(this.payload.from) : null
    }

    /**
     * Sender of the message, sent on behalf of a chat.
     * The channel itself for channel messages.
     * The supergroup itself for messages from anonymous group administrators.
     * The linked channel for messages automatically forwarded to the discussion group
     */
    @Inspect({ nullable: false })
    get senderChat() {
        return this.payload.sender_chat
            ? new Chat(this.payload.sender_chat)
            : null
    }

    /** Date the message was sent in Unix time */
    @Inspect()
    get createdAt() {
        return this.payload.date
    }

    /** Conversation the message belongs to */
    @Inspect()
    get chat() {
        return new Chat(this.payload.chat)
    }

    /** Forwarded message if there is any */
    @Inspect({ nullable: false })
    get forwardedMessage() {
        // INFO: this.payload contains forwardedMessage data
        return this.payload.forward_date
            ? new ForwardedMessage(this.payload)
            : null
    }

    /** `true`, if the message is sent to a forum topic */
    @Inspect({ compute: true, nullable: false })
    isTopicMessage() {
        return !!this.payload.is_topic_message
    }

    /** `true`, if the message is a channel post that was automatically forwarded to the connected discussion group */
    @Inspect({ compute: true, nullable: false })
    isAutomaticForward() {
        return !!this.payload.is_automatic_forward
    }

    /** For replies, the original message */
    @Inspect({ nullable: false })
    get repliedMessage(): Omit<Message, "repliedMessage"> | null {
        return this.payload.reply_to_message
            ? new Message(this.payload.reply_to_message)
            : null
    }

    /** Bot through which the message was sent */
    @Inspect({ nullable: false })
    get viaBot() {
        return this.payload.via_bot ? new User(this.payload.via_bot) : null
    }

    /** Date the message was last edited in Unix time */
    @Inspect({ nullable: false })
    get updatedAt() {
        return this.payload.edit_date
    }

    //TODO: omit forward

    /** `true`, if the message can't be forwarded */
    @Inspect({ compute: true, nullable: false })
    hasProtectedContent() {
        return !!this.payload.has_protected_content
    }

    /** The unique identifier of a media message group this message belongs to */
    @Inspect({ nullable: false })
    get mediaGroupId() {
        return this.payload.media_group_id
    }

    /**
     * Signature of the post author for messages in channels,
     * or the custom title of an anonymous group administrator
     */
    @Inspect({ nullable: false })
    get authorSignature() {
        return this.payload.author_signature
    }

    /**
     * For text messages, the actual UTF-8 text of the message, 0-4096 characters
     */
    @Inspect({ nullable: false })
    get text() {
        return this.payload.text
    }

    /**
     * For text messages, special entities like usernames, URLs, bot commands,
     * etc. that appear in the text
     */
    @Inspect({ nullable: false })
    get entities() {
        //TODO: impl a struct
        return this.payload.entities
    }

    /**
     * Message is an animation, information about the animation. For backward
     * compatibility, when this field is set, the `document` field will also be set
     */
    @Inspect({ nullable: false })
    get animation() {
        return this.payload.animation
            ? new AnimationAttachment(this.payload.animation)
            : null
    }

    /** Message is an audio file, information about the file */
    @Inspect({ nullable: false })
    get audio() {
        return this.payload.audio
            ? new AudioAttachment(this.payload.audio)
            : null
    }

    /** Message is a general file, information about the file */
    @Inspect({ nullable: false })
    get document() {
        return this.payload.document
            ? new DocumentAttachment(this.payload.document)
            : null
    }

    /** Message is a photo, available sizes of the photo */
    @Inspect({ nullable: false })
    get photo() {
        return this.payload.photo?.map((size) => new PhotoSize(size))
    }

    /** Message is a sticker, information about the sticker */
    @Inspect({ nullable: false })
    get sticker() {
        return this.payload.sticker
            ? new StickerAttachment(this.payload.sticker)
            : null
    }

    /** Message is a forwarded story */
    @Inspect({ nullable: false })
    get story() {
        return this.payload.story
            ? new StoryAttachment(this.payload.story)
            : null
    }

    /** Message is a video, information about the video */
    @Inspect({ nullable: false })
    get video() {
        return this.payload.video
            ? new VideoAttachment(this.payload.video)
            : null
    }

    /** Message is a video note, information about the video message */
    @Inspect({ nullable: false })
    get videoNote() {
        return this.payload.video_note
            ? new VideoNoteAttachment(this.payload.video_note)
            : null
    }

    /** Message is a voice message, information about the file */
    @Inspect({ nullable: false })
    get voice() {
        return this.payload.voice
            ? new VoiceAttachment(this.payload.voice)
            : null
    }

    /**
     * Caption for the animation, audio, document, photo, video or voice,
     * 0-1024 characters
     */
    @Inspect({ nullable: false })
    get caption() {
        return this.payload.caption
    }

    /**
     * For messages with a caption, special entities like usernames, URLs, bot
     * commands, etc. that appear in the caption
     */
    @Inspect({ nullable: false })
    get captionEntities() {
        //TODO: impl
        return this.payload.caption_entities
    }

    /** `true`, if the message media is covered by a spoiler animation */
    @Inspect({ compute: true, nullable: false })
    hasMediaSpoiler() {
        return !!this.payload.has_media_spoiler
    }

    /** Message is a shared contact, information about the contact */
    @Inspect({ nullable: false })
    get contact() {
        return this.payload.contact ? new Contact(this.payload.contact) : null
    }

    /** Message is a native poll, information about the poll */
    @Inspect({ nullable: false })
    get poll() {
        return this.payload.poll ? new Poll(this.payload.poll) : null
    }

    /**
     * Message is a venue, information about the venue.
     * For backward compatibility, when this field is set,
     * the `location` field will also be set
     */
    @Inspect({ nullable: false })
    get venue() {
        return this.payload.venue ? new Venue(this.payload.venue) : null
    }

    /** Message is a shared location, information about the location */
    @Inspect({ nullable: false })
    get location() {
        return this.payload.location
            ? new Location(this.payload.location)
            : null
    }

    /** The domain name of the website on which the user has logged in. */
    @Inspect({ nullable: false })
    get connectedWebsite() {
        return this.payload.connected_website
    }

    /**
     * New members that were added to the group or supergroup and information
     * about them (the bot itself may be one of these members)
     */
    @Inspect({ nullable: false })
    get newChatMembers() {
        return this.payload.new_chat_members?.map((member) => new User(member))
    }

    /**
     * A member was removed from the group, information about them (this member
     * may be the bot itself)
     */
    @Inspect({ nullable: false })
    get leftChatMember() {
        return this.payload.left_chat_member
            ? new User(this.payload.left_chat_member)
            : null
    }

    /** A chat title was changed to this value */
    @Inspect({ nullable: false })
    get newChatTitle() {
        return this.payload.new_chat_title
    }

    /** A chat photo was change to this value */
    @Inspect({ nullable: false })
    get newChatPhoto() {
        return this.payload.new_chat_photo?.map((size) => new PhotoSize(size))
    }

    /** Service message: the chat photo was deleted */
    @Inspect({ compute: true, nullable: false })
    isChatPhotoDeleted() {
        return !!this.payload.delete_chat_photo
    }

    /** Service message: the group has been created */
    @Inspect({ compute: true, nullable: false })
    isGroupChatCreated() {
        return !!this.payload.group_chat_created
    }

    /**
     * Service message: the supergroup has been created. This field can't be
     * received in a message coming through updates, because bot can't be a
     * member of a supergroup when it is created. It can only be found in
     * `replyMessage` if someone replies to a very first message in a
     * directly created supergroup.
     */
    @Inspect({ compute: true, nullable: false })
    isSupergroupChatCreated() {
        return this.payload.supergroup_chat_created
    }

    /**
     * Service message: the channel has been created. This field can't be
     * received in a message coming through updates, because bot can't be a
     * member of a channel when it is created. It can only be found in
     * `replyMessage` if someone replies to a very first message in a channel.
     */
    @Inspect({ compute: true, nullable: false })
    isChannelChatCreated() {
        return this.payload.channel_chat_created
    }

    /**
     * The group has been migrated to a supergroup with the specified identifier.
     * This number may be greater than 32 bits and some programming languages may
     * have difficulty/silent defects in interpreting it. But it is smaller than
     * 52 bits, so a signed 64 bit integer or double-precision float type are
     * safe for storing this identifier.
     */
    @Inspect({ nullable: false })
    get migrateToChatId() {
        return this.payload.migrate_to_chat_id
    }

    /**
     * The supergroup has been migrated from a group with the specified
     * identifier. This number may be greater than 32 bits and some programming
     * languages may have difficulty/silent defects in interpreting it. But it is
     * smaller than 52 bits, so a signed 64 bit integer or double-precision float
     * type are safe for storing this identifier.
     */
    @Inspect({ nullable: false })
    get migrateFromChatId() {
        return this.payload.migrate_from_chat_id
    }
}
