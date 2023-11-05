import { Inspect, Inspectable } from "inspectable";
import { TelegramChat } from "../../generated";
import { Message } from "..";
import { ChatLocation } from "./chat-location";
import { ChatPermissions } from "./chat-permissions";
import { ChatPhoto } from "./chat-photo";

@Inspectable()
export class Chat {
    constructor(public payload: TelegramChat) {}

    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }

    /**
     * Unique identifier for this chat. This number may be greater than 32 bits
     * and some programming languages may have difficulty/silent defects in
     * interpreting it. But it is smaller than 52 bits, so a signed 64 bit
     * integer or double-precision float type are safe for storing
     * this identifier.
     */
    @Inspect()
    get id() {
        return this.payload.id;
    }

    /**
     * Type of chat, can be either `private`, `group`, `supergroup` or `channel`
     */
    @Inspect()
    get type() {
        return this.payload.type;
    }

    /** Title, for supergroups, channels and group chats */
    @Inspect({ nullable: false })
    get title() {
        return this.payload.title;
    }

    /** Username, for private chats, supergroups and channels if available */
    @Inspect({ nullable: false })
    get username() {
        return this.payload.username;
    }

    /** First name of the other party in a private chat */
    @Inspect({ nullable: false })
    get firstName() {
        return this.payload.first_name;
    }

    /** Last name of the other party in a private chat */
    @Inspect({ nullable: false })
    get lastName() {
        return this.payload.last_name;
    }

    /** `true`, if the supergroup chat is a forum (has [topics](https://telegram.org/blog/topics-in-groups-collectible-usernames#topics-in-groups) enabled) */
    @Inspect({ compute: true, nullable: false })
    isForum() {
        return !!this.payload.is_forum;
    }

    /**
     * Chat photo.
     *
     * Returned only in `getChat`.
     */
    @Inspect({ nullable: false })
    get photo() {
        return this.payload.photo ? new ChatPhoto(this.payload.photo) : null;
    }

    /**
     * If non-empty, the list of all active chat usernames; for private chats, supergroups and channels.
     *
     * Returned only in `getChat`.
     */
    @Inspect({ nullable: false })
    get activeUsernames() {
        return this.payload.active_usernames;
    }

    /**
     * Custom emoji identifier of emoji status of the other party in a private chat.
     *
     * Returned only in `getChat`.
     */
    @Inspect({ nullable: false })
    get emojiStatusCustomEmojiId() {
        return this.payload.emoji_status_custom_emoji_id;
    }

    /**
     * Expiration date of the emoji status of the other party in a private chat, if any.
     *
     * Returned only in `getChat`.
     */
    @Inspect({ nullable: false })
    get emojiStatusExpirationDate() {
        return this.payload.emoji_status_expiration_date;
    }

    /**
     * Bio of the other party in a private chat.
     *
     * Returned only in `getChat`.
     */
    @Inspect({ nullable: false })
    get bio() {
        return this.payload.bio;
    }

    @Inspect({ compute: true, nullable: false })
    hasPrivateForwards() {
        return !!this.payload.has_private_forwards;
    }

    /**
     * `true`, if the privacy settings of the other party restrict sending voice and video note messages in the private chat.
     *
     * Returned only in `getChat`.
     */
    @Inspect({ compute: true, nullable: false })
    hasRestrictedVoiceAndVideoMessages() {
        return !!this.payload.has_restricted_voice_and_video_messages;
    }

    /**
     * `true`, if users need to join the supergroup before they can send messages.
     *
     * Returned only in `getChat`.
     */
    @Inspect({ compute: true, nullable: false })
    isJoinToSendMessages() {
        return !!this.payload.join_to_send_messages;
    }

    /**
     * `true`, if all users directly joining the supergroup need to be approved
     * by supergroup administrators.
     *
     * Returned only in `getChat`.
     */
    @Inspect({ compute: true, nullable: false })
    isJoinByRequest() {
        return !!this.payload.join_by_request;
    }

    /**
     * For supergroups, the location to which the supergroup is connected
     *
     * Returned only in `getChat`.
     */
    @Inspect({ nullable: false })
    get location() {
        return this.payload.location
            ? new ChatLocation(this.payload.location)
            : null;
    }

    /**
     * Description, for groups, supergroups and channel chats.
     *
     * Returned only in `getChat`.
     */
    @Inspect({ nullable: false })
    get description() {
        return this.payload.description;
    }

    /**
     * Chat invite link, for groups, supergroups and channel chats.
     * Each administrator in a chat generates their own invite links,
     * so the bot must first generate the link using `exportChatInviteLink`.
     *
     * Returned only in `getChat`.
     */
    @Inspect({ nullable: false })
    get inviteLink() {
        return this.payload.invite_link;
    }

    /**
     * Pinned message, for groups, supergroups and channels.
     *
     * Returned only in `getChat`.
     */
    @Inspect({ nullable: false })
    get pinnedMessage(): Message | null {
        return this.payload.pinned_message
            ? new Message(this.payload.pinned_message)
            : null;
    }

    /**
     * Default chat member permissions, for groups and supergroups.
     *
     * Returned only in `getChat`.
     */
    @Inspect({ nullable: false })
    get permissions() {
        return this.payload.permissions
            ? new ChatPermissions(this.payload.permissions)
            : null;
    }

    /**
     * For supergroups, the minimum allowed delay between consecutive messages
     * sent by each unpriviledged user.
     *
     * Returned only in `getChat`.
     */
    @Inspect({ nullable: false })
    get slowModeDelay() {
        return this.payload.slow_mode_delay;
    }

    /**
     * The time after which all messages sent to the chat will be automatically deleted; in seconds.
     *
     * Returned only in `getChat`.
     */
    @Inspect({ nullable: false })
    get messageAutoDeleteTime() {
        return this.payload.message_auto_delete_time;
    }

    /**
     * `true`, if aggressive anti-spam checks are enabled in the supergroup. The field is only available to chat administrators.
     *
     * Returned only in `getChat`.
     */
    @Inspect({ compute: true, nullable: false })
    hasAggressiveAntiSpamEnabled() {
        return this.payload.has_aggressive_anti_spam_enabled;
    }

    /**
     * `true`, if non-administrators can only get the list of bots and administrators in the chat.
     *
     * Returned only in `getChat`.
     */
    @Inspect({ compute: true, nullable: false })
    hasHiddenMembers() {
        return this.payload.has_hidden_members;
    }

    /**
     * `true`, if messages from the chat can't be forwarded to other chats.
     *
     * Returned only in `getChat`.
     */
    @Inspect({ compute: true, nullable: false })
    hasProtectedContent() {
        return this.payload.has_protected_content;
    }

    /**
     * For supergroups, name of group sticker set.
     *
     * Returned only in `getChat`.
     */
    @Inspect({ nullable: false })
    get stickerSetName() {
        return this.payload.sticker_set_name;
    }

    /**
     * `true`, if the bot can change the group sticker set.
     *
     * Returned only in `getChat`.
     */
    @Inspect({ compute: true, nullable: false })
    canSetStickerSet() {
        return this.payload.can_set_sticker_set;
    }

    /**
     * Unique identifier for the linked chat,
     * i.e. the discussion group identifier for a channel and vice versa;
     * for supergroups and channel chats.
     * This identifier may be greater than 32 bits and some programming languages
     * may have difficulty/silent defects in interpreting it.
     * But it is smaller than 52 bits, so a signed 64 bit integer or double-precision
     * float type are safe for storing this identifier.
     *
     * Returned only in `getChat`.
     */
    @Inspect({ nullable: false })
    get linkedChatId() {
        return this.payload.linked_chat_id;
    }
}
