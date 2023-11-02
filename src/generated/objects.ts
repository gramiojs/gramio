// Based on Bot Api v6.9.0

/**
 * This [object](https://core.telegram.org/bots/api/#available-types) represents an incoming update.
 * At most **one** of the optional parameters can be present in any given update.
 *
 * {@link https://core.telegram.org/bots/api/#update | [Documentation]}
 */
export interface TelegramUpdate {
    /**
     * The update's unique identifier. Update identifiers start from a certain positive number and increase sequentially. This ID becomes especially handy if you're using [webhooks](https://core.telegram.org/bots/api/#setwebhook), since it allows you to ignore repeated updates or to restore the correct update sequence, should they get out of order. If there are no new updates for at least a week, then identifier of the next update will be chosen randomly instead of sequentially.
     */
    update_id: number;
    /**
     * *Optional*. New incoming message of any kind - text, photo, sticker, etc.
     */
    message?: TelegramMessage;
    /**
     * *Optional*. New version of a message that is known to the bot and was edited
     */
    edited_message?: TelegramMessage;
    /**
     * *Optional*. New incoming channel post of any kind - text, photo, sticker, etc.
     */
    channel_post?: TelegramMessage;
    /**
     * *Optional*. New version of a channel post that is known to the bot and was edited
     */
    edited_channel_post?: TelegramMessage;
    /**
     * *Optional*. New incoming [inline](https://core.telegram.org/bots/api/#inline-mode) query
     */
    inline_query?: TelegramInlineQuery;
    /**
     * *Optional*. The result of an [inline](https://core.telegram.org/bots/api/#inline-mode) query that was chosen by a user and sent to their chat partner. Please see our documentation on the [feedback collecting](https://core.telegram.org/bots/inline#collecting-feedback) for details on how to enable these updates for your bot.
     */
    chosen_inline_result?: TelegramChosenInlineResult;
    /**
     * *Optional*. New incoming callback query
     */
    callback_query?: TelegramCallbackQuery;
    /**
     * *Optional*. New incoming shipping query. Only for invoices with flexible price
     */
    shipping_query?: TelegramShippingQuery;
    /**
     * *Optional*. New incoming pre-checkout query. Contains full information about checkout
     */
    pre_checkout_query?: TelegramPreCheckoutQuery;
    /**
     * *Optional*. New poll state. Bots receive only updates about stopped polls and polls, which are sent by the bot
     */
    poll?: TelegramPoll;
    /**
     * *Optional*. A user changed their answer in a non-anonymous poll. Bots receive new votes only in polls that were sent by the bot itself.
     */
    poll_answer?: TelegramPollAnswer;
    /**
     * *Optional*. The bot's chat member status was updated in a chat. For private chats, this update is received only when the bot is blocked or unblocked by the user.
     */
    my_chat_member?: TelegramChatMemberUpdated;
    /**
     * *Optional*. A chat member's status was updated in a chat. The bot must be an administrator in the chat and must explicitly specify `"chat_member"` in the list of *allowed\_updates* to receive these updates.
     */
    chat_member?: TelegramChatMemberUpdated;
    /**
     * *Optional*. A request to join the chat has been sent. The bot must have the *can\_invite\_users* administrator right in the chat to receive these updates.
     */
    chat_join_request?: TelegramChatJoinRequest;
}

/**
 * Describes the current status of a webhook.
 *
 * {@link https://core.telegram.org/bots/api/#webhookinfo | [Documentation]}
 */
export interface TelegramWebhookInfo {
    /**
     * Webhook URL, may be empty if webhook is not set up
     */
    url: string;
    /**
     * *True*, if a custom certificate was provided for webhook certificate checks
     */
    has_custom_certificate: boolean;
    /**
     * Number of updates awaiting delivery
     */
    pending_update_count: number;
    /**
     * *Optional*. Currently used webhook IP address
     */
    ip_address?: string;
    /**
     * *Optional*. Unix time for the most recent error that happened when trying to deliver an update via webhook
     */
    last_error_date?: number;
    /**
     * *Optional*. Error message in human-readable format for the most recent error that happened when trying to deliver an update via webhook
     */
    last_error_message?: string;
    /**
     * *Optional*. Unix time of the most recent error that happened when trying to synchronize available updates with Telegram datacenters
     */
    last_synchronization_error_date?: number;
    /**
     * *Optional*. The maximum allowed number of simultaneous HTTPS connections to the webhook for update delivery
     */
    max_connections?: number;
    /**
     * *Optional*. A list of update types the bot is subscribed to. Defaults to all update types except *chat\_member*
     */
    allowed_updates?: string[];
}

/**
 * This object represents a Telegram user or bot.
 *
 * {@link https://core.telegram.org/bots/api/#user | [Documentation]}
 */
export interface TelegramUser {
    /**
     * Unique identifier for this user or bot. This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a 64-bit integer or double-precision float type are safe for storing this identifier.
     */
    id: number;
    /**
     * *True*, if this user is a bot
     */
    is_bot: boolean;
    /**
     * User's or bot's first name
     */
    first_name: string;
    /**
     * *Optional*. User's or bot's last name
     */
    last_name?: string;
    /**
     * *Optional*. User's or bot's username
     */
    username?: string;
    /**
     * *Optional*. [IETF language tag](https://en.wikipedia.org/wiki/IETF_language_tag) of the user's language
     */
    language_code?: string;
    /**
     * *Optional*. *True*, if this user is a Telegram Premium user
     */
    is_premium?: boolean;
    /**
     * *Optional*. *True*, if this user added the bot to the attachment menu
     */
    added_to_attachment_menu?: boolean;
    /**
     * *Optional*. *True*, if the bot can be invited to groups. Returned only in [getMe](https://core.telegram.org/bots/api/#getme).
     */
    can_join_groups?: boolean;
    /**
     * *Optional*. *True*, if [privacy mode](https://core.telegram.org/bots/features#privacy-mode) is disabled for the bot. Returned only in [getMe](https://core.telegram.org/bots/api/#getme).
     */
    can_read_all_group_messages?: boolean;
    /**
     * *Optional*. *True*, if the bot supports inline queries. Returned only in [getMe](https://core.telegram.org/bots/api/#getme).
     */
    supports_inline_queries?: boolean;
}

export type TelegramChatType = "private" | "group" | "supergroup" | "channel";

/**
 * This object represents a chat.
 *
 * {@link https://core.telegram.org/bots/api/#chat | [Documentation]}
 */
export interface TelegramChat {
    /**
     * Unique identifier for this chat. This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a signed 64-bit integer or double-precision float type are safe for storing this identifier.
     */
    id: number;
    /**
     * Type of chat, can be either “private”, “group”, “supergroup” or “channel”
     */
    type: TelegramChatType;
    /**
     * *Optional*. Title, for supergroups, channels and group chats
     */
    title?: string;
    /**
     * *Optional*. Username, for private chats, supergroups and channels if available
     */
    username?: string;
    /**
     * *Optional*. First name of the other party in a private chat
     */
    first_name?: string;
    /**
     * *Optional*. Last name of the other party in a private chat
     */
    last_name?: string;
    /**
     * *Optional*. *True*, if the supergroup chat is a forum (has [topics](https://telegram.org/blog/topics-in-groups-collectible-usernames#topics-in-groups) enabled)
     */
    is_forum?: boolean;
    /**
     * *Optional*. Chat photo. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    photo?: TelegramChatPhoto;
    /**
     * *Optional*. If non-empty, the list of all [active chat usernames](https://telegram.org/blog/topics-in-groups-collectible-usernames#collectible-usernames); for private chats, supergroups and channels. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    active_usernames?: string[];
    /**
     * *Optional*. Custom emoji identifier of emoji status of the other party in a private chat. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    emoji_status_custom_emoji_id?: string;
    /**
     * *Optional*. Expiration date of the emoji status of the other party in a private chat in Unix time, if any. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    emoji_status_expiration_date?: number;
    /**
     * *Optional*. Bio of the other party in a private chat. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    bio?: string;
    /**
     * *Optional*. *True*, if privacy settings of the other party in the private chat allows to use `tg://user?id=<user_id>` links only in chats with the user. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    has_private_forwards?: boolean;
    /**
     * *Optional*. *True*, if the privacy settings of the other party restrict sending voice and video note messages in the private chat. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    has_restricted_voice_and_video_messages?: boolean;
    /**
     * *Optional*. *True*, if users need to join the supergroup before they can send messages. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    join_to_send_messages?: boolean;
    /**
     * *Optional*. *True*, if all users directly joining the supergroup need to be approved by supergroup administrators. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    join_by_request?: boolean;
    /**
     * *Optional*. Description, for groups, supergroups and channel chats. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    description?: string;
    /**
     * *Optional*. Primary invite link, for groups, supergroups and channel chats. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    invite_link?: string;
    /**
     * *Optional*. The most recent pinned message (by sending date). Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    pinned_message?: TelegramMessage;
    /**
     * *Optional*. Default chat member permissions, for groups and supergroups. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    permissions?: TelegramChatPermissions;
    /**
     * *Optional*. For supergroups, the minimum allowed delay between consecutive messages sent by each unpriviledged user; in seconds. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    slow_mode_delay?: number;
    /**
     * *Optional*. The time after which all messages sent to the chat will be automatically deleted; in seconds. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    message_auto_delete_time?: number;
    /**
     * *Optional*. *True*, if aggressive anti-spam checks are enabled in the supergroup. The field is only available to chat administrators. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    has_aggressive_anti_spam_enabled?: boolean;
    /**
     * *Optional*. *True*, if non-administrators can only get the list of bots and administrators in the chat. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    has_hidden_members?: boolean;
    /**
     * *Optional*. *True*, if messages from the chat can't be forwarded to other chats. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    has_protected_content?: boolean;
    /**
     * *Optional*. For supergroups, name of group sticker set. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    sticker_set_name?: string;
    /**
     * *Optional*. *True*, if the bot can change the group sticker set. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    can_set_sticker_set?: boolean;
    /**
     * *Optional*. Unique identifier for the linked chat, i.e. the discussion group identifier for a channel and vice versa; for supergroups and channel chats. This identifier may be greater than 32 bits and some programming languages may have difficulty/silent defects in interpreting it. But it is smaller than 52 bits, so a signed 64 bit integer or double-precision float type are safe for storing this identifier. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    linked_chat_id?: number;
    /**
     * *Optional*. For supergroups, the location to which the supergroup is connected. Returned only in [getChat](https://core.telegram.org/bots/api/#getchat).
     */
    location?: TelegramChatLocation;
}

/**
 * This object represents a message.
 *
 * {@link https://core.telegram.org/bots/api/#message | [Documentation]}
 */
export interface TelegramMessage {
    /**
     * Unique message identifier inside this chat
     */
    message_id: number;
    /**
     * *Optional*. Unique identifier of a message thread to which the message belongs; for supergroups only
     */
    message_thread_id?: number;
    /**
     * *Optional*. Sender of the message; empty for messages sent to channels. For backward compatibility, the field contains a fake sender user in non-channel chats, if the message was sent on behalf of a chat.
     */
    from?: TelegramUser;
    /**
     * *Optional*. Sender of the message, sent on behalf of a chat. For example, the channel itself for channel posts, the supergroup itself for messages from anonymous group administrators, the linked channel for messages automatically forwarded to the discussion group. For backward compatibility, the field *from* contains a fake sender user in non-channel chats, if the message was sent on behalf of a chat.
     */
    sender_chat?: TelegramChat;
    /**
     * Date the message was sent in Unix time
     */
    date: number;
    /**
     * Conversation the message belongs to
     */
    chat: TelegramChat;
    /**
     * *Optional*. For forwarded messages, sender of the original message
     */
    forward_from?: TelegramUser;
    /**
     * *Optional*. For messages forwarded from channels or from anonymous administrators, information about the original sender chat
     */
    forward_from_chat?: TelegramChat;
    /**
     * *Optional*. For messages forwarded from channels, identifier of the original message in the channel
     */
    forward_from_message_id?: number;
    /**
     * *Optional*. For forwarded messages that were originally sent in channels or by an anonymous chat administrator, signature of the message sender if present
     */
    forward_signature?: string;
    /**
     * *Optional*. Sender's name for messages forwarded from users who disallow adding a link to their account in forwarded messages
     */
    forward_sender_name?: string;
    /**
     * *Optional*. For forwarded messages, date the original message was sent in Unix time
     */
    forward_date?: number;
    /**
     * *Optional*. *True*, if the message is sent to a forum topic
     */
    is_topic_message?: boolean;
    /**
     * *Optional*. *True*, if the message is a channel post that was automatically forwarded to the connected discussion group
     */
    is_automatic_forward?: boolean;
    /**
     * *Optional*. For replies, the original message. Note that the Message object in this field will not contain further *reply\_to\_message* fields even if it itself is a reply.
     */
    reply_to_message?: TelegramMessage;
    /**
     * *Optional*. Bot through which the message was sent
     */
    via_bot?: TelegramUser;
    /**
     * *Optional*. Date the message was last edited in Unix time
     */
    edit_date?: number;
    /**
     * *Optional*. *True*, if the message can't be forwarded
     */
    has_protected_content?: boolean;
    /**
     * *Optional*. The unique identifier of a media message group this message belongs to
     */
    media_group_id?: string;
    /**
     * *Optional*. Signature of the post author for messages in channels, or the custom title of an anonymous group administrator
     */
    author_signature?: string;
    /**
     * *Optional*. For text messages, the actual UTF-8 text of the message
     */
    text?: string;
    /**
     * *Optional*. For text messages, special entities like usernames, URLs, bot commands, etc. that appear in the text
     */
    entities?: TelegramMessageEntity[];
    /**
     * *Optional*. Message is an animation, information about the animation. For backward compatibility, when this field is set, the *document* field will also be set
     */
    animation?: TelegramAnimation;
    /**
     * *Optional*. Message is an audio file, information about the file
     */
    audio?: TelegramAudio;
    /**
     * *Optional*. Message is a general file, information about the file
     */
    document?: TelegramDocument;
    /**
     * *Optional*. Message is a photo, available sizes of the photo
     */
    photo?: TelegramPhotoSize[];
    /**
     * *Optional*. Message is a sticker, information about the sticker
     */
    sticker?: TelegramSticker;
    /**
     * *Optional*. Message is a forwarded story
     */
    story?: TelegramStory;
    /**
     * *Optional*. Message is a video, information about the video
     */
    video?: TelegramVideo;
    /**
     * *Optional*. Message is a [video note](https://telegram.org/blog/video-messages-and-telescope), information about the video message
     */
    video_note?: TelegramVideoNote;
    /**
     * *Optional*. Message is a voice message, information about the file
     */
    voice?: TelegramVoice;
    /**
     * *Optional*. Caption for the animation, audio, document, photo, video or voice
     */
    caption?: string;
    /**
     * *Optional*. For messages with a caption, special entities like usernames, URLs, bot commands, etc. that appear in the caption
     */
    caption_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. *True*, if the message media is covered by a spoiler animation
     */
    has_media_spoiler?: boolean;
    /**
     * *Optional*. Message is a shared contact, information about the contact
     */
    contact?: TelegramContact;
    /**
     * *Optional*. Message is a dice with random value
     */
    dice?: TelegramDice;
    /**
     * *Optional*. Message is a game, information about the game. [More about games »](https://core.telegram.org/bots/api/#games)
     */
    game?: TelegramGame;
    /**
     * *Optional*. Message is a native poll, information about the poll
     */
    poll?: TelegramPoll;
    /**
     * *Optional*. Message is a venue, information about the venue. For backward compatibility, when this field is set, the *location* field will also be set
     */
    venue?: TelegramVenue;
    /**
     * *Optional*. Message is a shared location, information about the location
     */
    location?: TelegramLocation;
    /**
     * *Optional*. New members that were added to the group or supergroup and information about them (the bot itself may be one of these members)
     */
    new_chat_members?: TelegramUser[];
    /**
     * *Optional*. A member was removed from the group, information about them (this member may be the bot itself)
     */
    left_chat_member?: TelegramUser;
    /**
     * *Optional*. A chat title was changed to this value
     */
    new_chat_title?: string;
    /**
     * *Optional*. A chat photo was change to this value
     */
    new_chat_photo?: TelegramPhotoSize[];
    /**
     * *Optional*. Service message: the chat photo was deleted
     */
    delete_chat_photo?: boolean;
    /**
     * *Optional*. Service message: the group has been created
     */
    group_chat_created?: boolean;
    /**
     * *Optional*. Service message: the supergroup has been created. This field can't be received in a message coming through updates, because bot can't be a member of a supergroup when it is created. It can only be found in reply\_to\_message if someone replies to a very first message in a directly created supergroup.
     */
    supergroup_chat_created?: boolean;
    /**
     * *Optional*. Service message: the channel has been created. This field can't be received in a message coming through updates, because bot can't be a member of a channel when it is created. It can only be found in reply\_to\_message if someone replies to a very first message in a channel.
     */
    channel_chat_created?: boolean;
    /**
     * *Optional*. Service message: auto-delete timer settings changed in the chat
     */
    message_auto_delete_timer_changed?: TelegramMessageAutoDeleteTimerChanged;
    /**
     * *Optional*. The group has been migrated to a supergroup with the specified identifier. This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a signed 64-bit integer or double-precision float type are safe for storing this identifier.
     */
    migrate_to_chat_id?: number;
    /**
     * *Optional*. The supergroup has been migrated from a group with the specified identifier. This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a signed 64-bit integer or double-precision float type are safe for storing this identifier.
     */
    migrate_from_chat_id?: number;
    /**
     * *Optional*. Specified message was pinned. Note that the Message object in this field will not contain further *reply\_to\_message* fields even if it is itself a reply.
     */
    pinned_message?: TelegramMessage;
    /**
     * *Optional*. Message is an invoice for a [payment](https://core.telegram.org/bots/api/#payments), information about the invoice. [More about payments »](https://core.telegram.org/bots/api/#payments)
     */
    invoice?: TelegramInvoice;
    /**
     * *Optional*. Message is a service message about a successful payment, information about the payment. [More about payments »](https://core.telegram.org/bots/api/#payments)
     */
    successful_payment?: TelegramSuccessfulPayment;
    /**
     * *Optional*. Service message: a user was shared with the bot
     */
    user_shared?: TelegramUserShared;
    /**
     * *Optional*. Service message: a chat was shared with the bot
     */
    chat_shared?: TelegramChatShared;
    /**
     * *Optional*. The domain name of the website on which the user has logged in. [More about Telegram Login »](https://core.telegram.org/widgets/login)
     */
    connected_website?: string;
    /**
     * *Optional*. Service message: the user allowed the bot to write messages after adding it to the attachment or side menu, launching a Web App from a link, or accepting an explicit request from a Web App sent by the method [requestWriteAccess](https://core.telegram.org/bots/webapps#initializing-mini-apps)
     */
    write_access_allowed?: TelegramWriteAccessAllowed;
    /**
     * *Optional*. Telegram Passport data
     */
    passport_data?: TelegramPassportData;
    /**
     * *Optional*. Service message. A user in the chat triggered another user's proximity alert while sharing Live Location.
     */
    proximity_alert_triggered?: TelegramProximityAlertTriggered;
    /**
     * *Optional*. Service message: forum topic created
     */
    forum_topic_created?: TelegramForumTopicCreated;
    /**
     * *Optional*. Service message: forum topic edited
     */
    forum_topic_edited?: TelegramForumTopicEdited;
    /**
     * *Optional*. Service message: forum topic closed
     */
    forum_topic_closed?: TelegramForumTopicClosed;
    /**
     * *Optional*. Service message: forum topic reopened
     */
    forum_topic_reopened?: TelegramForumTopicReopened;
    /**
     * *Optional*. Service message: the 'General' forum topic hidden
     */
    general_forum_topic_hidden?: TelegramGeneralForumTopicHidden;
    /**
     * *Optional*. Service message: the 'General' forum topic unhidden
     */
    general_forum_topic_unhidden?: TelegramGeneralForumTopicUnhidden;
    /**
     * *Optional*. Service message: video chat scheduled
     */
    video_chat_scheduled?: TelegramVideoChatScheduled;
    /**
     * *Optional*. Service message: video chat started
     */
    video_chat_started?: TelegramVideoChatStarted;
    /**
     * *Optional*. Service message: video chat ended
     */
    video_chat_ended?: TelegramVideoChatEnded;
    /**
     * *Optional*. Service message: new participants invited to a video chat
     */
    video_chat_participants_invited?: TelegramVideoChatParticipantsInvited;
    /**
     * *Optional*. Service message: data sent by a Web App
     */
    web_app_data?: TelegramWebAppData;
    /**
     * *Optional*. Inline keyboard attached to the message. `login_url` buttons are represented as ordinary `url` buttons.
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
}

/**
 * This object represents a unique message identifier.
 *
 * {@link https://core.telegram.org/bots/api/#messageid | [Documentation]}
 */
export interface TelegramMessageId {
    /**
     * Unique message identifier
     */
    message_id: number;
}

export type TelegramMessageEntityType =
    | "mention"
    | "hashtag"
    | "cashtag"
    | "bot_command"
    | "url"
    | "email"
    | "phone_number"
    | "bold"
    | "italic"
    | "underline"
    | "strikethrough"
    | "spoiler"
    | "code"
    | "pre"
    | "text_link"
    | "text_mention"
    | "custom_emoji";

/**
 * This object represents one special entity in a text message. For example, hashtags, usernames, URLs, etc.
 *
 * {@link https://core.telegram.org/bots/api/#messageentity | [Documentation]}
 */
export interface TelegramMessageEntity {
    /**
     * Type of the entity. Currently, can be “mention” (`@username`), “hashtag” (`#hashtag`), “cashtag” (`$USD`), “bot\_command” (`/start@jobs_bot`), “url” (`https://telegram.org`), “email” (`do-not-reply@telegram.org`), “phone\_number” (`+1-212-555-0123`), “bold” (**bold text**), “italic” (*italic text*), “underline” (underlined text), “strikethrough” (strikethrough text), “spoiler” (spoiler message), “code” (monowidth string), “pre” (monowidth block), “text\_link” (for clickable text URLs), “text\_mention” (for users [without usernames](https://telegram.org/blog/edit#new-mentions)), “custom\_emoji” (for inline custom emoji stickers)
     */
    type: TelegramMessageEntityType;
    /**
     * Offset in [UTF-16 code units](https://core.telegram.org/api/entities#entity-length) to the start of the entity
     */
    offset: number;
    /**
     * Length of the entity in [UTF-16 code units](https://core.telegram.org/api/entities#entity-length)
     */
    length: number;
    /**
     * *Optional*. For “text\_link” only, URL that will be opened after user taps on the text
     */
    url?: string;
    /**
     * *Optional*. For “text\_mention” only, the mentioned user
     */
    user?: TelegramUser;
    /**
     * *Optional*. For “pre” only, the programming language of the entity text
     */
    language?: string;
    /**
     * *Optional*. For “custom\_emoji” only, unique identifier of the custom emoji. Use [getCustomEmojiStickers](https://core.telegram.org/bots/api/#getcustomemojistickers) to get full information about the sticker
     */
    custom_emoji_id?: string;
}

/**
 * This object represents one size of a photo or a [file](https://core.telegram.org/bots/api/#document) / [sticker](https://core.telegram.org/bots/api/#sticker) thumbnail.
 *
 * {@link https://core.telegram.org/bots/api/#photosize | [Documentation]}
 */
export interface TelegramPhotoSize {
    /**
     * Identifier for this file, which can be used to download or reuse the file
     */
    file_id: string;
    /**
     * Unique identifier for this file, which is supposed to be the same over time and for different bots. Can't be used to download or reuse the file.
     */
    file_unique_id: string;
    /**
     * Photo width
     */
    width: number;
    /**
     * Photo height
     */
    height: number;
    /**
     * *Optional*. File size in bytes
     */
    file_size?: number;
}

/**
 * This object represents an animation file (GIF or H.264/MPEG-4 AVC video without sound).
 *
 * {@link https://core.telegram.org/bots/api/#animation | [Documentation]}
 */
export interface TelegramAnimation {
    /**
     * Identifier for this file, which can be used to download or reuse the file
     */
    file_id: string;
    /**
     * Unique identifier for this file, which is supposed to be the same over time and for different bots. Can't be used to download or reuse the file.
     */
    file_unique_id: string;
    /**
     * Video width as defined by sender
     */
    width: number;
    /**
     * Video height as defined by sender
     */
    height: number;
    /**
     * Duration of the video in seconds as defined by sender
     */
    duration: number;
    /**
     * *Optional*. Animation thumbnail as defined by sender
     */
    thumbnail?: TelegramPhotoSize;
    /**
     * *Optional*. Original animation filename as defined by sender
     */
    file_name?: string;
    /**
     * *Optional*. MIME type of the file as defined by sender
     */
    mime_type?: string;
    /**
     * *Optional*. File size in bytes. It can be bigger than 2^31 and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a signed 64-bit integer or double-precision float type are safe for storing this value.
     */
    file_size?: number;
}

/**
 * This object represents an audio file to be treated as music by the Telegram clients.
 *
 * {@link https://core.telegram.org/bots/api/#audio | [Documentation]}
 */
export interface TelegramAudio {
    /**
     * Identifier for this file, which can be used to download or reuse the file
     */
    file_id: string;
    /**
     * Unique identifier for this file, which is supposed to be the same over time and for different bots. Can't be used to download or reuse the file.
     */
    file_unique_id: string;
    /**
     * Duration of the audio in seconds as defined by sender
     */
    duration: number;
    /**
     * *Optional*. Performer of the audio as defined by sender or by audio tags
     */
    performer?: string;
    /**
     * *Optional*. Title of the audio as defined by sender or by audio tags
     */
    title?: string;
    /**
     * *Optional*. Original filename as defined by sender
     */
    file_name?: string;
    /**
     * *Optional*. MIME type of the file as defined by sender
     */
    mime_type?: string;
    /**
     * *Optional*. File size in bytes. It can be bigger than 2^31 and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a signed 64-bit integer or double-precision float type are safe for storing this value.
     */
    file_size?: number;
    /**
     * *Optional*. Thumbnail of the album cover to which the music file belongs
     */
    thumbnail?: TelegramPhotoSize;
}

/**
 * This object represents a general file (as opposed to [photos](https://core.telegram.org/bots/api/#photosize), [voice messages](https://core.telegram.org/bots/api/#voice) and [audio files](https://core.telegram.org/bots/api/#audio)).
 *
 * {@link https://core.telegram.org/bots/api/#document | [Documentation]}
 */
export interface TelegramDocument {
    /**
     * Identifier for this file, which can be used to download or reuse the file
     */
    file_id: string;
    /**
     * Unique identifier for this file, which is supposed to be the same over time and for different bots. Can't be used to download or reuse the file.
     */
    file_unique_id: string;
    /**
     * *Optional*. Document thumbnail as defined by sender
     */
    thumbnail?: TelegramPhotoSize;
    /**
     * *Optional*. Original filename as defined by sender
     */
    file_name?: string;
    /**
     * *Optional*. MIME type of the file as defined by sender
     */
    mime_type?: string;
    /**
     * *Optional*. File size in bytes. It can be bigger than 2^31 and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a signed 64-bit integer or double-precision float type are safe for storing this value.
     */
    file_size?: number;
}

/**
 * This object represents a message about a forwarded story in the chat. Currently holds no information.
 *
 * {@link https://core.telegram.org/bots/api/#story | [Documentation]}
 */
export interface TelegramStory {}

/**
 * This object represents a video file.
 *
 * {@link https://core.telegram.org/bots/api/#video | [Documentation]}
 */
export interface TelegramVideo {
    /**
     * Identifier for this file, which can be used to download or reuse the file
     */
    file_id: string;
    /**
     * Unique identifier for this file, which is supposed to be the same over time and for different bots. Can't be used to download or reuse the file.
     */
    file_unique_id: string;
    /**
     * Video width as defined by sender
     */
    width: number;
    /**
     * Video height as defined by sender
     */
    height: number;
    /**
     * Duration of the video in seconds as defined by sender
     */
    duration: number;
    /**
     * *Optional*. Video thumbnail
     */
    thumbnail?: TelegramPhotoSize;
    /**
     * *Optional*. Original filename as defined by sender
     */
    file_name?: string;
    /**
     * *Optional*. MIME type of the file as defined by sender
     */
    mime_type?: string;
    /**
     * *Optional*. File size in bytes. It can be bigger than 2^31 and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a signed 64-bit integer or double-precision float type are safe for storing this value.
     */
    file_size?: number;
}

/**
 * This object represents a [video message](https://telegram.org/blog/video-messages-and-telescope) (available in Telegram apps as of [v.4.0](https://telegram.org/blog/video-messages-and-telescope)).
 *
 * {@link https://core.telegram.org/bots/api/#videonote | [Documentation]}
 */
export interface TelegramVideoNote {
    /**
     * Identifier for this file, which can be used to download or reuse the file
     */
    file_id: string;
    /**
     * Unique identifier for this file, which is supposed to be the same over time and for different bots. Can't be used to download or reuse the file.
     */
    file_unique_id: string;
    /**
     * Video width and height (diameter of the video message) as defined by sender
     */
    length: number;
    /**
     * Duration of the video in seconds as defined by sender
     */
    duration: number;
    /**
     * *Optional*. Video thumbnail
     */
    thumbnail?: TelegramPhotoSize;
    /**
     * *Optional*. File size in bytes
     */
    file_size?: number;
}

/**
 * This object represents a voice note.
 *
 * {@link https://core.telegram.org/bots/api/#voice | [Documentation]}
 */
export interface TelegramVoice {
    /**
     * Identifier for this file, which can be used to download or reuse the file
     */
    file_id: string;
    /**
     * Unique identifier for this file, which is supposed to be the same over time and for different bots. Can't be used to download or reuse the file.
     */
    file_unique_id: string;
    /**
     * Duration of the audio in seconds as defined by sender
     */
    duration: number;
    /**
     * *Optional*. MIME type of the file as defined by sender
     */
    mime_type?: string;
    /**
     * *Optional*. File size in bytes. It can be bigger than 2^31 and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a signed 64-bit integer or double-precision float type are safe for storing this value.
     */
    file_size?: number;
}

/**
 * This object represents a phone contact.
 *
 * {@link https://core.telegram.org/bots/api/#contact | [Documentation]}
 */
export interface TelegramContact {
    /**
     * Contact's phone number
     */
    phone_number: string;
    /**
     * Contact's first name
     */
    first_name: string;
    /**
     * *Optional*. Contact's last name
     */
    last_name?: string;
    /**
     * *Optional*. Contact's user identifier in Telegram. This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a 64-bit integer or double-precision float type are safe for storing this identifier.
     */
    user_id?: number;
    /**
     * *Optional*. Additional data about the contact in the form of a [vCard](https://en.wikipedia.org/wiki/VCard)
     */
    vcard?: string;
}

/**
 * This object represents an animated emoji that displays a random value.
 *
 * {@link https://core.telegram.org/bots/api/#dice | [Documentation]}
 */
export interface TelegramDice {
    /**
     * Emoji on which the dice throw animation is based
     */
    emoji: string;
    /**
     * Value of the dice, 1-6 for “🎲”, “🎯” and “🎳” base emoji, 1-5 for “🏀” and “⚽” base emoji, 1-64 for “🎰” base emoji
     */
    value: number;
}

/**
 * This object contains information about one answer option in a poll.
 *
 * {@link https://core.telegram.org/bots/api/#polloption | [Documentation]}
 */
export interface TelegramPollOption {
    /**
     * Option text, 1-100 characters
     */
    text: string;
    /**
     * Number of users that voted for this option
     */
    voter_count: number;
}

/**
 * This object represents an answer of a user in a non-anonymous poll.
 *
 * {@link https://core.telegram.org/bots/api/#pollanswer | [Documentation]}
 */
export interface TelegramPollAnswer {
    /**
     * Unique poll identifier
     */
    poll_id: string;
    /**
     * *Optional*. The chat that changed the answer to the poll, if the voter is anonymous
     */
    voter_chat?: TelegramChat;
    /**
     * *Optional*. The user that changed the answer to the poll, if the voter isn't anonymous
     */
    user?: TelegramUser;
    /**
     * 0-based identifiers of chosen answer options. May be empty if the vote was retracted.
     */
    option_ids: number[];
}

export type TelegramPollType = "regular" | "quiz";

/**
 * This object contains information about a poll.
 *
 * {@link https://core.telegram.org/bots/api/#poll | [Documentation]}
 */
export interface TelegramPoll {
    /**
     * Unique poll identifier
     */
    id: string;
    /**
     * Poll question, 1-300 characters
     */
    question: string;
    /**
     * List of poll options
     */
    options: TelegramPollOption[];
    /**
     * Total number of users that voted in the poll
     */
    total_voter_count: number;
    /**
     * *True*, if the poll is closed
     */
    is_closed: boolean;
    /**
     * *True*, if the poll is anonymous
     */
    is_anonymous: boolean;
    /**
     * Poll type, currently can be “regular” or “quiz”
     */
    type: TelegramPollType;
    /**
     * *True*, if the poll allows multiple answers
     */
    allows_multiple_answers: boolean;
    /**
     * *Optional*. 0-based identifier of the correct answer option. Available only for polls in the quiz mode, which are closed, or was sent (not forwarded) by the bot or to the private chat with the bot.
     */
    correct_option_id?: number;
    /**
     * *Optional*. Text that is shown when a user chooses an incorrect answer or taps on the lamp icon in a quiz-style poll, 0-200 characters
     */
    explanation?: string;
    /**
     * *Optional*. Special entities like usernames, URLs, bot commands, etc. that appear in the *explanation*
     */
    explanation_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. Amount of time in seconds the poll will be active after creation
     */
    open_period?: number;
    /**
     * *Optional*. Point in time (Unix timestamp) when the poll will be automatically closed
     */
    close_date?: number;
}

/**
 * This object represents a point on the map.
 *
 * {@link https://core.telegram.org/bots/api/#location | [Documentation]}
 */
export interface TelegramLocation {
    /**
     * Longitude as defined by sender
     */
    longitude: number;
    /**
     * Latitude as defined by sender
     */
    latitude: number;
    /**
     * *Optional*. The radius of uncertainty for the location, measured in meters; 0-1500
     */
    horizontal_accuracy?: number;
    /**
     * *Optional*. Time relative to the message sending date, during which the location can be updated; in seconds. For active live locations only.
     */
    live_period?: number;
    /**
     * *Optional*. The direction in which user is moving, in degrees; 1-360. For active live locations only.
     */
    heading?: number;
    /**
     * *Optional*. The maximum distance for proximity alerts about approaching another chat member, in meters. For sent live locations only.
     */
    proximity_alert_radius?: number;
}

/**
 * This object represents a venue.
 *
 * {@link https://core.telegram.org/bots/api/#venue | [Documentation]}
 */
export interface TelegramVenue {
    /**
     * Venue location. Can't be a live location
     */
    location: TelegramLocation;
    /**
     * Name of the venue
     */
    title: string;
    /**
     * Address of the venue
     */
    address: string;
    /**
     * *Optional*. Foursquare identifier of the venue
     */
    foursquare_id?: string;
    /**
     * *Optional*. Foursquare type of the venue. (For example, “arts\_entertainment/default”, “arts\_entertainment/aquarium” or “food/icecream”.)
     */
    foursquare_type?: string;
    /**
     * *Optional*. Google Places identifier of the venue
     */
    google_place_id?: string;
    /**
     * *Optional*. Google Places type of the venue. (See [supported types](https://developers.google.com/places/web-service/supported_types).)
     */
    google_place_type?: string;
}

/**
 * Describes data sent from a [Web App](https://core.telegram.org/bots/webapps) to the bot.
 *
 * {@link https://core.telegram.org/bots/api/#webappdata | [Documentation]}
 */
export interface TelegramWebAppData {
    /**
     * The data. Be aware that a bad client can send arbitrary data in this field.
     */
    data: string;
    /**
     * Text of the *web\_app* keyboard button from which the Web App was opened. Be aware that a bad client can send arbitrary data in this field.
     */
    button_text: string;
}

/**
 * This object represents the content of a service message, sent whenever a user in the chat triggers a proximity alert set by another user.
 *
 * {@link https://core.telegram.org/bots/api/#proximityalerttriggered | [Documentation]}
 */
export interface TelegramProximityAlertTriggered {
    /**
     * User that triggered the alert
     */
    traveler: TelegramUser;
    /**
     * User that set the alert
     */
    watcher: TelegramUser;
    /**
     * The distance between the users
     */
    distance: number;
}

/**
 * This object represents a service message about a change in auto-delete timer settings.
 *
 * {@link https://core.telegram.org/bots/api/#messageautodeletetimerchanged | [Documentation]}
 */
export interface TelegramMessageAutoDeleteTimerChanged {
    /**
     * New auto-delete time for messages in the chat; in seconds
     */
    message_auto_delete_time: number;
}

/**
 * This object represents a service message about a new forum topic created in the chat.
 *
 * {@link https://core.telegram.org/bots/api/#forumtopiccreated | [Documentation]}
 */
export interface TelegramForumTopicCreated {
    /**
     * Name of the topic
     */
    name: string;
    /**
     * Color of the topic icon in RGB format
     */
    icon_color: number;
    /**
     * *Optional*. Unique identifier of the custom emoji shown as the topic icon
     */
    icon_custom_emoji_id?: string;
}

/**
 * This object represents a service message about a forum topic closed in the chat. Currently holds no information.
 *
 * {@link https://core.telegram.org/bots/api/#forumtopicclosed | [Documentation]}
 */
export interface TelegramForumTopicClosed {}

/**
 * This object represents a service message about an edited forum topic.
 *
 * {@link https://core.telegram.org/bots/api/#forumtopicedited | [Documentation]}
 */
export interface TelegramForumTopicEdited {
    /**
     * *Optional*. New name of the topic, if it was edited
     */
    name?: string;
    /**
     * *Optional*. New identifier of the custom emoji shown as the topic icon, if it was edited; an empty string if the icon was removed
     */
    icon_custom_emoji_id?: string;
}

/**
 * This object represents a service message about a forum topic reopened in the chat. Currently holds no information.
 *
 * {@link https://core.telegram.org/bots/api/#forumtopicreopened | [Documentation]}
 */
export interface TelegramForumTopicReopened {}

/**
 * This object represents a service message about General forum topic hidden in the chat. Currently holds no information.
 *
 * {@link https://core.telegram.org/bots/api/#generalforumtopichidden | [Documentation]}
 */
export interface TelegramGeneralForumTopicHidden {}

/**
 * This object represents a service message about General forum topic unhidden in the chat. Currently holds no information.
 *
 * {@link https://core.telegram.org/bots/api/#generalforumtopicunhidden | [Documentation]}
 */
export interface TelegramGeneralForumTopicUnhidden {}

/**
 * This object contains information about the user whose identifier was shared with the bot using a [KeyboardButtonRequestUser](https://core.telegram.org/bots/api/#keyboardbuttonrequestuser) button.
 *
 * {@link https://core.telegram.org/bots/api/#usershared | [Documentation]}
 */
export interface TelegramUserShared {
    /**
     * Identifier of the request
     */
    request_id: number;
    /**
     * Identifier of the shared user. This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a 64-bit integer or double-precision float type are safe for storing this identifier. The bot may not have access to the user and could be unable to use this identifier, unless the user is already known to the bot by some other means.
     */
    user_id: number;
}

/**
 * This object contains information about the chat whose identifier was shared with the bot using a [KeyboardButtonRequestChat](https://core.telegram.org/bots/api/#keyboardbuttonrequestchat) button.
 *
 * {@link https://core.telegram.org/bots/api/#chatshared | [Documentation]}
 */
export interface TelegramChatShared {
    /**
     * Identifier of the request
     */
    request_id: number;
    /**
     * Identifier of the shared chat. This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a 64-bit integer or double-precision float type are safe for storing this identifier. The bot may not have access to the chat and could be unable to use this identifier, unless the chat is already known to the bot by some other means.
     */
    chat_id: number;
}

/**
 * This object represents a service message about a user allowing a bot to write messages after adding it to the attachment menu, launching a Web App from a link, or accepting an explicit request from a Web App sent by the method [requestWriteAccess](https://core.telegram.org/bots/webapps#initializing-mini-apps).
 *
 * {@link https://core.telegram.org/bots/api/#writeaccessallowed | [Documentation]}
 */
export interface TelegramWriteAccessAllowed {
    /**
     * *Optional*. True, if the access was granted after the user accepted an explicit request from a Web App sent by the method [requestWriteAccess](https://core.telegram.org/bots/webapps#initializing-mini-apps)
     */
    from_request?: boolean;
    /**
     * *Optional*. Name of the Web App, if the access was granted when the Web App was launched from a link
     */
    web_app_name?: string;
    /**
     * *Optional*. True, if the access was granted when the bot was added to the attachment or side menu
     */
    from_attachment_menu?: boolean;
}

/**
 * This object represents a service message about a video chat scheduled in the chat.
 *
 * {@link https://core.telegram.org/bots/api/#videochatscheduled | [Documentation]}
 */
export interface TelegramVideoChatScheduled {
    /**
     * Point in time (Unix timestamp) when the video chat is supposed to be started by a chat administrator
     */
    start_date: number;
}

/**
 * This object represents a service message about a video chat started in the chat. Currently holds no information.
 *
 * {@link https://core.telegram.org/bots/api/#videochatstarted | [Documentation]}
 */
export interface TelegramVideoChatStarted {}

/**
 * This object represents a service message about a video chat ended in the chat.
 *
 * {@link https://core.telegram.org/bots/api/#videochatended | [Documentation]}
 */
export interface TelegramVideoChatEnded {
    /**
     * Video chat duration in seconds
     */
    duration: number;
}

/**
 * This object represents a service message about new members invited to a video chat.
 *
 * {@link https://core.telegram.org/bots/api/#videochatparticipantsinvited | [Documentation]}
 */
export interface TelegramVideoChatParticipantsInvited {
    /**
     * New members that were invited to the video chat
     */
    users: TelegramUser[];
}

/**
 * This object represent a user's profile pictures.
 *
 * {@link https://core.telegram.org/bots/api/#userprofilephotos | [Documentation]}
 */
export interface TelegramUserProfilePhotos {
    /**
     * Total number of profile pictures the target user has
     */
    total_count: number;
    /**
     * Requested profile pictures (in up to 4 sizes each)
     */
    photos: TelegramPhotoSize[][];
}

/**
 * This object represents a file ready to be downloaded. The file can be downloaded via the link `https://api.telegram.org/file/bot<token>/<file_path>`. It is guaranteed that the link will be valid for at least 1 hour. When the link expires, a new one can be requested by calling [getFile](https://core.telegram.org/bots/api/#getfile).
 *
 * The maximum file size to download is 20 MB
 *
 * {@link https://core.telegram.org/bots/api/#file | [Documentation]}
 */
export interface TelegramFile {
    /**
     * Identifier for this file, which can be used to download or reuse the file
     */
    file_id: string;
    /**
     * Unique identifier for this file, which is supposed to be the same over time and for different bots. Can't be used to download or reuse the file.
     */
    file_unique_id: string;
    /**
     * *Optional*. File size in bytes. It can be bigger than 2^31 and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a signed 64-bit integer or double-precision float type are safe for storing this value.
     */
    file_size?: number;
    /**
     * *Optional*. File path. Use `https://api.telegram.org/file/bot<token>/<file_path>` to get the file.
     */
    file_path?: string;
}

/**
 * Describes a [Web App](https://core.telegram.org/bots/webapps).
 *
 * {@link https://core.telegram.org/bots/api/#webappinfo | [Documentation]}
 */
export interface TelegramWebAppInfo {
    /**
     * An HTTPS URL of a Web App to be opened with additional data as specified in [Initializing Web Apps](https://core.telegram.org/bots/webapps#initializing-mini-apps)
     */
    url: string;
}

/**
 * This object represents a [custom keyboard](https://core.telegram.org/bots/features#keyboards) with reply options (see [Introduction to bots](https://core.telegram.org/bots/features#keyboards) for details and examples).
 *
 * {@link https://core.telegram.org/bots/api/#replykeyboardmarkup | [Documentation]}
 */
export interface TelegramReplyKeyboardMarkup {
    /**
     * Array of button rows, each represented by an Array of [KeyboardButton](https://core.telegram.org/bots/api/#keyboardbutton) objects
     */
    keyboard: TelegramKeyboardButton[][];
    /**
     * *Optional*. Requests clients to always show the keyboard when the regular keyboard is hidden. Defaults to *false*, in which case the custom keyboard can be hidden and opened with a keyboard icon.
     */
    is_persistent?: boolean;
    /**
     * *Optional*. Requests clients to resize the keyboard vertically for optimal fit (e.g., make the keyboard smaller if there are just two rows of buttons). Defaults to *false*, in which case the custom keyboard is always of the same height as the app's standard keyboard.
     */
    resize_keyboard?: boolean;
    /**
     * *Optional*. Requests clients to hide the keyboard as soon as it's been used. The keyboard will still be available, but clients will automatically display the usual letter-keyboard in the chat - the user can press a special button in the input field to see the custom keyboard again. Defaults to *false*.
     */
    one_time_keyboard?: boolean;
    /**
     * *Optional*. The placeholder to be shown in the input field when the keyboard is active; 1-64 characters
     */
    input_field_placeholder?: string;
    /**
     * *Optional*. Use this parameter if you want to show the keyboard to specific users only. Targets: 1) users that are @mentioned in the *text* of the [Message](https://core.telegram.org/bots/api/#message) object; 2) if the bot's message is a reply (has *reply\_to\_message\_id*), sender of the original message.
     *
     * *Example:* A user requests to change the bot's language, bot replies to the request with a keyboard to select the new language. Other users in the group don't see the keyboard.
     */
    selective?: boolean;
}

/**
 * This object represents one button of the reply keyboard. For simple text buttons, *String* can be used instead of this object to specify the button text. The optional fields *web\_app*, *request\_user*, *request\_chat*, *request\_contact*, *request\_location*, and *request\_poll* are mutually exclusive.
 *
 * {@link https://core.telegram.org/bots/api/#keyboardbutton | [Documentation]}
 */
export interface TelegramKeyboardButton {
    /**
     * Text of the button. If none of the optional fields are used, it will be sent as a message when the button is pressed
     */
    text: string;
    /**
     * *Optional.* If specified, pressing the button will open a list of suitable users. Tapping on any user will send their identifier to the bot in a “user\_shared” service message. Available in private chats only.
     */
    request_user?: TelegramKeyboardButtonRequestUser;
    /**
     * *Optional.* If specified, pressing the button will open a list of suitable chats. Tapping on a chat will send its identifier to the bot in a “chat\_shared” service message. Available in private chats only.
     */
    request_chat?: TelegramKeyboardButtonRequestChat;
    /**
     * *Optional*. If *True*, the user's phone number will be sent as a contact when the button is pressed. Available in private chats only.
     */
    request_contact?: boolean;
    /**
     * *Optional*. If *True*, the user's current location will be sent when the button is pressed. Available in private chats only.
     */
    request_location?: boolean;
    /**
     * *Optional*. If specified, the user will be asked to create a poll and send it to the bot when the button is pressed. Available in private chats only.
     */
    request_poll?: TelegramKeyboardButtonPollType;
    /**
     * *Optional*. If specified, the described [Web App](https://core.telegram.org/bots/webapps) will be launched when the button is pressed. The Web App will be able to send a “web\_app\_data” service message. Available in private chats only.
     */
    web_app?: TelegramWebAppInfo;
}

/**
 * This object defines the criteria used to request a suitable user. The identifier of the selected user will be shared with the bot when the corresponding button is pressed. [More about requesting users »](https://core.telegram.org/bots/features#chat-and-user-selection)
 *
 * {@link https://core.telegram.org/bots/api/#keyboardbuttonrequestuser | [Documentation]}
 */
export interface TelegramKeyboardButtonRequestUser {
    /**
     * Signed 32-bit identifier of the request, which will be received back in the [UserShared](https://core.telegram.org/bots/api/#usershared) object. Must be unique within the message
     */
    request_id: number;
    /**
     * *Optional*. Pass *True* to request a bot, pass *False* to request a regular user. If not specified, no additional restrictions are applied.
     */
    user_is_bot?: boolean;
    /**
     * *Optional*. Pass *True* to request a premium user, pass *False* to request a non-premium user. If not specified, no additional restrictions are applied.
     */
    user_is_premium?: boolean;
}

/**
 * This object defines the criteria used to request a suitable chat. The identifier of the selected chat will be shared with the bot when the corresponding button is pressed. [More about requesting chats »](https://core.telegram.org/bots/features#chat-and-user-selection)
 *
 * {@link https://core.telegram.org/bots/api/#keyboardbuttonrequestchat | [Documentation]}
 */
export interface TelegramKeyboardButtonRequestChat {
    /**
     * Signed 32-bit identifier of the request, which will be received back in the [ChatShared](https://core.telegram.org/bots/api/#chatshared) object. Must be unique within the message
     */
    request_id: number;
    /**
     * Pass *True* to request a channel chat, pass *False* to request a group or a supergroup chat.
     */
    chat_is_channel: boolean;
    /**
     * *Optional*. Pass *True* to request a forum supergroup, pass *False* to request a non-forum chat. If not specified, no additional restrictions are applied.
     */
    chat_is_forum?: boolean;
    /**
     * *Optional*. Pass *True* to request a supergroup or a channel with a username, pass *False* to request a chat without a username. If not specified, no additional restrictions are applied.
     */
    chat_has_username?: boolean;
    /**
     * *Optional*. Pass *True* to request a chat owned by the user. Otherwise, no additional restrictions are applied.
     */
    chat_is_created?: boolean;
    /**
     * *Optional*. A JSON-serialized object listing the required administrator rights of the user in the chat. The rights must be a superset of *bot\_administrator\_rights*. If not specified, no additional restrictions are applied.
     */
    user_administrator_rights?: TelegramChatAdministratorRights;
    /**
     * *Optional*. A JSON-serialized object listing the required administrator rights of the bot in the chat. The rights must be a subset of *user\_administrator\_rights*. If not specified, no additional restrictions are applied.
     */
    bot_administrator_rights?: TelegramChatAdministratorRights;
    /**
     * *Optional*. Pass *True* to request a chat with the bot as a member. Otherwise, no additional restrictions are applied.
     */
    bot_is_member?: boolean;
}

/**
 * This object represents type of a poll, which is allowed to be created and sent when the corresponding button is pressed.
 *
 * {@link https://core.telegram.org/bots/api/#keyboardbuttonpolltype | [Documentation]}
 */
export interface TelegramKeyboardButtonPollType {
    /**
     * *Optional*. If *quiz* is passed, the user will be allowed to create only polls in the quiz mode. If *regular* is passed, only regular polls will be allowed. Otherwise, the user will be allowed to create a poll of any type.
     */
    type?: string;
}

/**
 * Upon receiving a message with this object, Telegram clients will remove the current custom keyboard and display the default letter-keyboard. By default, custom keyboards are displayed until a new keyboard is sent by a bot. An exception is made for one-time keyboards that are hidden immediately after the user presses a button (see [ReplyKeyboardMarkup](https://core.telegram.org/bots/api/#replykeyboardmarkup)).
 *
 * {@link https://core.telegram.org/bots/api/#replykeyboardremove | [Documentation]}
 */
export interface TelegramReplyKeyboardRemove {
    /**
     * Requests clients to remove the custom keyboard (user will not be able to summon this keyboard; if you want to hide the keyboard from sight but keep it accessible, use *one\_time\_keyboard* in [ReplyKeyboardMarkup](https://core.telegram.org/bots/api/#replykeyboardmarkup))
     */
    remove_keyboard: boolean;
    /**
     * *Optional*. Use this parameter if you want to remove the keyboard for specific users only. Targets: 1) users that are @mentioned in the *text* of the [Message](https://core.telegram.org/bots/api/#message) object; 2) if the bot's message is a reply (has *reply\_to\_message\_id*), sender of the original message.
     *
     * *Example:* A user votes in a poll, bot returns confirmation message in reply to the vote and removes the keyboard for that user, while still showing the keyboard with poll options to users who haven't voted yet.
     */
    selective?: boolean;
}

/**
 * This object represents an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards) that appears right next to the message it belongs to.
 *
 * {@link https://core.telegram.org/bots/api/#inlinekeyboardmarkup | [Documentation]}
 */
export interface TelegramInlineKeyboardMarkup {
    /**
     * Array of button rows, each represented by an Array of [InlineKeyboardButton](https://core.telegram.org/bots/api/#inlinekeyboardbutton) objects
     */
    inline_keyboard: TelegramInlineKeyboardButton[][];
}

/**
 * This object represents one button of an inline keyboard. You **must** use exactly one of the optional fields.
 *
 * {@link https://core.telegram.org/bots/api/#inlinekeyboardbutton | [Documentation]}
 */
export interface TelegramInlineKeyboardButton {
    /**
     * Label text on the button
     */
    text: string;
    /**
     * *Optional*. HTTP or tg:// URL to be opened when the button is pressed. Links `tg://user?id=<user_id>` can be used to mention a user by their ID without using a username, if this is allowed by their privacy settings.
     */
    url?: string;
    /**
     * *Optional*. Data to be sent in a [callback query](https://core.telegram.org/bots/api/#callbackquery) to the bot when button is pressed, 1-64 bytes
     */
    callback_data?: string;
    /**
     * *Optional*. Description of the [Web App](https://core.telegram.org/bots/webapps) that will be launched when the user presses the button. The Web App will be able to send an arbitrary message on behalf of the user using the method [answerWebAppQuery](https://core.telegram.org/bots/api/#answerwebappquery). Available only in private chats between a user and the bot.
     */
    web_app?: TelegramWebAppInfo;
    /**
     * *Optional*. An HTTPS URL used to automatically authorize the user. Can be used as a replacement for the [Telegram Login Widget](https://core.telegram.org/widgets/login).
     */
    login_url?: TelegramLoginUrl;
    /**
     * *Optional*. If set, pressing the button will prompt the user to select one of their chats, open that chat and insert the bot's username and the specified inline query in the input field. May be empty, in which case just the bot's username will be inserted.
     */
    switch_inline_query?: string;
    /**
     * *Optional*. If set, pressing the button will insert the bot's username and the specified inline query in the current chat's input field. May be empty, in which case only the bot's username will be inserted.
     *
     * This offers a quick way for the user to open your bot in inline mode in the same chat - good for selecting something from multiple options.
     */
    switch_inline_query_current_chat?: string;
    /**
     * *Optional*. If set, pressing the button will prompt the user to select one of their chats of the specified type, open that chat and insert the bot's username and the specified inline query in the input field
     */
    switch_inline_query_chosen_chat?: TelegramSwitchInlineQueryChosenChat;
    /**
     * *Optional*. Description of the game that will be launched when the user presses the button.
     *
     * **NOTE:** This type of button **must** always be the first button in the first row.
     */
    callback_game?: TelegramCallbackGame;
    /**
     * *Optional*. Specify *True*, to send a [Pay button](https://core.telegram.org/bots/api/#payments).
     *
     * **NOTE:** This type of button **must** always be the first button in the first row and can only be used in invoice messages.
     */
    pay?: boolean;
}

/**
 * This object represents a parameter of the inline keyboard button used to automatically authorize a user. Serves as a great replacement for the [Telegram Login Widget](https://core.telegram.org/widgets/login) when the user is coming from Telegram. All the user needs to do is tap/click a button and confirm that they want to log in:
 *
 * Telegram apps support these buttons as of [version 5.7](https://telegram.org/blog/privacy-discussions-web-bots#meet-seamless-web-bots).
 *
 * Sample bot: [@discussbot](https://t.me/discussbot)
 *
 * {@link https://core.telegram.org/bots/api/#loginurl | [Documentation]}
 */
export interface TelegramLoginUrl {
    /**
     * An HTTPS URL to be opened with user authorization data added to the query string when the button is pressed. If the user refuses to provide authorization data, the original URL without information about the user will be opened. The data added is the same as described in [Receiving authorization data](https://core.telegram.org/widgets/login#receiving-authorization-data).
     *
     * **NOTE:** You **must** always check the hash of the received data to verify the authentication and the integrity of the data as described in [Checking authorization](https://core.telegram.org/widgets/login#checking-authorization).
     */
    url: string;
    /**
     * *Optional*. New text of the button in forwarded messages.
     */
    forward_text?: string;
    /**
     * *Optional*. Username of a bot, which will be used for user authorization. See [Setting up a bot](https://core.telegram.org/widgets/login#setting-up-a-bot) for more details. If not specified, the current bot's username will be assumed. The *url*'s domain must be the same as the domain linked with the bot. See [Linking your domain to the bot](https://core.telegram.org/widgets/login#linking-your-domain-to-the-bot) for more details.
     */
    bot_username?: string;
    /**
     * *Optional*. Pass *True* to request the permission for your bot to send messages to the user.
     */
    request_write_access?: boolean;
}

/**
 * This object represents an inline button that switches the current user to inline mode in a chosen chat, with an optional default inline query.
 *
 * {@link https://core.telegram.org/bots/api/#switchinlinequerychosenchat | [Documentation]}
 */
export interface TelegramSwitchInlineQueryChosenChat {
    /**
     * *Optional*. The default inline query to be inserted in the input field. If left empty, only the bot's username will be inserted
     */
    query?: string;
    /**
     * *Optional*. True, if private chats with users can be chosen
     */
    allow_user_chats?: boolean;
    /**
     * *Optional*. True, if private chats with bots can be chosen
     */
    allow_bot_chats?: boolean;
    /**
     * *Optional*. True, if group and supergroup chats can be chosen
     */
    allow_group_chats?: boolean;
    /**
     * *Optional*. True, if channel chats can be chosen
     */
    allow_channel_chats?: boolean;
}

/**
 * This object represents an incoming callback query from a callback button in an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards). If the button that originated the query was attached to a message sent by the bot, the field *message* will be present. If the button was attached to a message sent via the bot (in [inline mode](https://core.telegram.org/bots/api/#inline-mode)), the field *inline\_message\_id* will be present. Exactly one of the fields *data* or *game\_short\_name* will be present.
 *
 * {@link https://core.telegram.org/bots/api/#callbackquery | [Documentation]}
 */
export interface TelegramCallbackQuery {
    /**
     * Unique identifier for this query
     */
    id: string;
    /**
     * Sender
     */
    from: TelegramUser;
    /**
     * *Optional*. Message with the callback button that originated the query. Note that message content and message date will not be available if the message is too old
     */
    message?: TelegramMessage;
    /**
     * *Optional*. Identifier of the message sent via the bot in inline mode, that originated the query.
     */
    inline_message_id?: string;
    /**
     * Global identifier, uniquely corresponding to the chat to which the message with the callback button was sent. Useful for high scores in [games](https://core.telegram.org/bots/api/#games).
     */
    chat_instance: string;
    /**
     * *Optional*. Data associated with the callback button. Be aware that the message originated the query can contain no callback buttons with this data.
     */
    data?: string;
    /**
     * *Optional*. Short name of a [Game](https://core.telegram.org/bots/api/#games) to be returned, serves as the unique identifier for the game
     */
    game_short_name?: string;
}

/**
 * Upon receiving a message with this object, Telegram clients will display a reply interface to the user (act as if the user has selected the bot's message and tapped 'Reply'). This can be extremely useful if you want to create user-friendly step-by-step interfaces without having to sacrifice [privacy mode](https://core.telegram.org/bots/features#privacy-mode).
 *
 * {@link https://core.telegram.org/bots/api/#forcereply | [Documentation]}
 */
export interface TelegramForceReply {
    /**
     * Shows reply interface to the user, as if they manually selected the bot's message and tapped 'Reply'
     */
    force_reply: boolean;
    /**
     * *Optional*. The placeholder to be shown in the input field when the reply is active; 1-64 characters
     */
    input_field_placeholder?: string;
    /**
     * *Optional*. Use this parameter if you want to force reply from specific users only. Targets: 1) users that are @mentioned in the *text* of the [Message](https://core.telegram.org/bots/api/#message) object; 2) if the bot's message is a reply (has *reply\_to\_message\_id*), sender of the original message.
     */
    selective?: boolean;
}

/**
 * This object represents a chat photo.
 *
 * {@link https://core.telegram.org/bots/api/#chatphoto | [Documentation]}
 */
export interface TelegramChatPhoto {
    /**
     * File identifier of small (160x160) chat photo. This file\_id can be used only for photo download and only for as long as the photo is not changed.
     */
    small_file_id: string;
    /**
     * Unique file identifier of small (160x160) chat photo, which is supposed to be the same over time and for different bots. Can't be used to download or reuse the file.
     */
    small_file_unique_id: string;
    /**
     * File identifier of big (640x640) chat photo. This file\_id can be used only for photo download and only for as long as the photo is not changed.
     */
    big_file_id: string;
    /**
     * Unique file identifier of big (640x640) chat photo, which is supposed to be the same over time and for different bots. Can't be used to download or reuse the file.
     */
    big_file_unique_id: string;
}

/**
 * Represents an invite link for a chat.
 *
 * {@link https://core.telegram.org/bots/api/#chatinvitelink | [Documentation]}
 */
export interface TelegramChatInviteLink {
    /**
     * The invite link. If the link was created by another chat administrator, then the second part of the link will be replaced with “…”.
     */
    invite_link: string;
    /**
     * Creator of the link
     */
    creator: TelegramUser;
    /**
     * *True*, if users joining the chat via the link need to be approved by chat administrators
     */
    creates_join_request: boolean;
    /**
     * *True*, if the link is primary
     */
    is_primary: boolean;
    /**
     * *True*, if the link is revoked
     */
    is_revoked: boolean;
    /**
     * *Optional*. Invite link name
     */
    name?: string;
    /**
     * *Optional*. Point in time (Unix timestamp) when the link will expire or has been expired
     */
    expire_date?: number;
    /**
     * *Optional*. The maximum number of users that can be members of the chat simultaneously after joining the chat via this invite link; 1-99999
     */
    member_limit?: number;
    /**
     * *Optional*. Number of pending join requests created using this link
     */
    pending_join_request_count?: number;
}

/**
 * Represents the rights of an administrator in a chat.
 *
 * {@link https://core.telegram.org/bots/api/#chatadministratorrights | [Documentation]}
 */
export interface TelegramChatAdministratorRights {
    /**
     * *True*, if the user's presence in the chat is hidden
     */
    is_anonymous: boolean;
    /**
     * *True*, if the administrator can access the chat event log, boost list in channels, see channel members, report spam messages, see anonymous administrators in supergroups and ignore slow mode. Implied by any other administrator privilege
     */
    can_manage_chat: boolean;
    /**
     * *True*, if the administrator can delete messages of other users
     */
    can_delete_messages: boolean;
    /**
     * *True*, if the administrator can manage video chats
     */
    can_manage_video_chats: boolean;
    /**
     * *True*, if the administrator can restrict, ban or unban chat members, or access supergroup statistics
     */
    can_restrict_members: boolean;
    /**
     * *True*, if the administrator can add new administrators with a subset of their own privileges or demote administrators that they have promoted, directly or indirectly (promoted by administrators that were appointed by the user)
     */
    can_promote_members: boolean;
    /**
     * *True*, if the user is allowed to change the chat title, photo and other settings
     */
    can_change_info: boolean;
    /**
     * *True*, if the user is allowed to invite new users to the chat
     */
    can_invite_users: boolean;
    /**
     * *Optional*. *True*, if the administrator can post messages in the channel, or access channel statistics; channels only
     */
    can_post_messages?: boolean;
    /**
     * *Optional*. *True*, if the administrator can edit messages of other users and can pin messages; channels only
     */
    can_edit_messages?: boolean;
    /**
     * *Optional*. *True*, if the user is allowed to pin messages; groups and supergroups only
     */
    can_pin_messages?: boolean;
    /**
     * *Optional*. *True*, if the administrator can post stories in the channel; channels only
     */
    can_post_stories?: boolean;
    /**
     * *Optional*. *True*, if the administrator can edit stories posted by other users; channels only
     */
    can_edit_stories?: boolean;
    /**
     * *Optional*. *True*, if the administrator can delete stories posted by other users; channels only
     */
    can_delete_stories?: boolean;
    /**
     * *Optional*. *True*, if the user is allowed to create, rename, close, and reopen forum topics; supergroups only
     */
    can_manage_topics?: boolean;
}

/**
 * This object contains information about one member of a chat. Currently, the following 6 types of chat members are supported:
 *
 * * [ChatMemberOwner](https://core.telegram.org/bots/api/#chatmemberowner)
 * * [ChatMemberAdministrator](https://core.telegram.org/bots/api/#chatmemberadministrator)
 * * [ChatMemberMember](https://core.telegram.org/bots/api/#chatmembermember)
 * * [ChatMemberRestricted](https://core.telegram.org/bots/api/#chatmemberrestricted)
 * * [ChatMemberLeft](https://core.telegram.org/bots/api/#chatmemberleft)
 * * [ChatMemberBanned](https://core.telegram.org/bots/api/#chatmemberbanned)
 *
 * {@link https://core.telegram.org/bots/api/#chatmember | [Documentation]}
 */
export interface TelegramChatMember {}

/**
 * Represents a [chat member](https://core.telegram.org/bots/api/#chatmember) that owns the chat and has all administrator privileges.
 *
 * {@link https://core.telegram.org/bots/api/#chatmemberowner | [Documentation]}
 */
export interface TelegramChatMemberOwner {
    /**
     * The member's status in the chat, always “creator”
     */
    status: string;
    /**
     * Information about the user
     */
    user: TelegramUser;
    /**
     * *True*, if the user's presence in the chat is hidden
     */
    is_anonymous: boolean;
    /**
     * *Optional*. Custom title for this user
     */
    custom_title?: string;
}

/**
 * Represents a [chat member](https://core.telegram.org/bots/api/#chatmember) that has some additional privileges.
 *
 * {@link https://core.telegram.org/bots/api/#chatmemberadministrator | [Documentation]}
 */
export interface TelegramChatMemberAdministrator {
    /**
     * The member's status in the chat, always “administrator”
     */
    status: string;
    /**
     * Information about the user
     */
    user: TelegramUser;
    /**
     * *True*, if the bot is allowed to edit administrator privileges of that user
     */
    can_be_edited: boolean;
    /**
     * *True*, if the user's presence in the chat is hidden
     */
    is_anonymous: boolean;
    /**
     * *True*, if the administrator can access the chat event log, boost list in channels, see channel members, report spam messages, see anonymous administrators in supergroups and ignore slow mode. Implied by any other administrator privilege
     */
    can_manage_chat: boolean;
    /**
     * *True*, if the administrator can delete messages of other users
     */
    can_delete_messages: boolean;
    /**
     * *True*, if the administrator can manage video chats
     */
    can_manage_video_chats: boolean;
    /**
     * *True*, if the administrator can restrict, ban or unban chat members, or access supergroup statistics
     */
    can_restrict_members: boolean;
    /**
     * *True*, if the administrator can add new administrators with a subset of their own privileges or demote administrators that they have promoted, directly or indirectly (promoted by administrators that were appointed by the user)
     */
    can_promote_members: boolean;
    /**
     * *True*, if the user is allowed to change the chat title, photo and other settings
     */
    can_change_info: boolean;
    /**
     * *True*, if the user is allowed to invite new users to the chat
     */
    can_invite_users: boolean;
    /**
     * *Optional*. *True*, if the administrator can post messages in the channel, or access channel statistics; channels only
     */
    can_post_messages?: boolean;
    /**
     * *Optional*. *True*, if the administrator can edit messages of other users and can pin messages; channels only
     */
    can_edit_messages?: boolean;
    /**
     * *Optional*. *True*, if the user is allowed to pin messages; groups and supergroups only
     */
    can_pin_messages?: boolean;
    /**
     * *Optional*. *True*, if the administrator can post stories in the channel; channels only
     */
    can_post_stories?: boolean;
    /**
     * *Optional*. *True*, if the administrator can edit stories posted by other users; channels only
     */
    can_edit_stories?: boolean;
    /**
     * *Optional*. *True*, if the administrator can delete stories posted by other users; channels only
     */
    can_delete_stories?: boolean;
    /**
     * *Optional*. *True*, if the user is allowed to create, rename, close, and reopen forum topics; supergroups only
     */
    can_manage_topics?: boolean;
    /**
     * *Optional*. Custom title for this user
     */
    custom_title?: string;
}

/**
 * Represents a [chat member](https://core.telegram.org/bots/api/#chatmember) that has no additional privileges or restrictions.
 *
 * {@link https://core.telegram.org/bots/api/#chatmembermember | [Documentation]}
 */
export interface TelegramChatMemberMember {
    /**
     * The member's status in the chat, always “member”
     */
    status: string;
    /**
     * Information about the user
     */
    user: TelegramUser;
}

/**
 * Represents a [chat member](https://core.telegram.org/bots/api/#chatmember) that is under certain restrictions in the chat. Supergroups only.
 *
 * {@link https://core.telegram.org/bots/api/#chatmemberrestricted | [Documentation]}
 */
export interface TelegramChatMemberRestricted {
    /**
     * The member's status in the chat, always “restricted”
     */
    status: string;
    /**
     * Information about the user
     */
    user: TelegramUser;
    /**
     * *True*, if the user is a member of the chat at the moment of the request
     */
    is_member: boolean;
    /**
     * *True*, if the user is allowed to send text messages, contacts, invoices, locations and venues
     */
    can_send_messages: boolean;
    /**
     * *True*, if the user is allowed to send audios
     */
    can_send_audios: boolean;
    /**
     * *True*, if the user is allowed to send documents
     */
    can_send_documents: boolean;
    /**
     * *True*, if the user is allowed to send photos
     */
    can_send_photos: boolean;
    /**
     * *True*, if the user is allowed to send videos
     */
    can_send_videos: boolean;
    /**
     * *True*, if the user is allowed to send video notes
     */
    can_send_video_notes: boolean;
    /**
     * *True*, if the user is allowed to send voice notes
     */
    can_send_voice_notes: boolean;
    /**
     * *True*, if the user is allowed to send polls
     */
    can_send_polls: boolean;
    /**
     * *True*, if the user is allowed to send animations, games, stickers and use inline bots
     */
    can_send_other_messages: boolean;
    /**
     * *True*, if the user is allowed to add web page previews to their messages
     */
    can_add_web_page_previews: boolean;
    /**
     * *True*, if the user is allowed to change the chat title, photo and other settings
     */
    can_change_info: boolean;
    /**
     * *True*, if the user is allowed to invite new users to the chat
     */
    can_invite_users: boolean;
    /**
     * *True*, if the user is allowed to pin messages
     */
    can_pin_messages: boolean;
    /**
     * *True*, if the user is allowed to create forum topics
     */
    can_manage_topics: boolean;
    /**
     * Date when restrictions will be lifted for this user; Unix time. If 0, then the user is restricted forever
     */
    until_date: number;
}

/**
 * Represents a [chat member](https://core.telegram.org/bots/api/#chatmember) that isn't currently a member of the chat, but may join it themselves.
 *
 * {@link https://core.telegram.org/bots/api/#chatmemberleft | [Documentation]}
 */
export interface TelegramChatMemberLeft {
    /**
     * The member's status in the chat, always “left”
     */
    status: string;
    /**
     * Information about the user
     */
    user: TelegramUser;
}

/**
 * Represents a [chat member](https://core.telegram.org/bots/api/#chatmember) that was banned in the chat and can't return to the chat or view chat messages.
 *
 * {@link https://core.telegram.org/bots/api/#chatmemberbanned | [Documentation]}
 */
export interface TelegramChatMemberBanned {
    /**
     * The member's status in the chat, always “kicked”
     */
    status: string;
    /**
     * Information about the user
     */
    user: TelegramUser;
    /**
     * Date when restrictions will be lifted for this user; Unix time. If 0, then the user is banned forever
     */
    until_date: number;
}

/**
 * This object represents changes in the status of a chat member.
 *
 * {@link https://core.telegram.org/bots/api/#chatmemberupdated | [Documentation]}
 */
export interface TelegramChatMemberUpdated {
    /**
     * Chat the user belongs to
     */
    chat: TelegramChat;
    /**
     * Performer of the action, which resulted in the change
     */
    from: TelegramUser;
    /**
     * Date the change was done in Unix time
     */
    date: number;
    /**
     * Previous information about the chat member
     */
    old_chat_member: TelegramChatMember;
    /**
     * New information about the chat member
     */
    new_chat_member: TelegramChatMember;
    /**
     * *Optional*. Chat invite link, which was used by the user to join the chat; for joining by invite link events only.
     */
    invite_link?: TelegramChatInviteLink;
    /**
     * *Optional*. True, if the user joined the chat via a chat folder invite link
     */
    via_chat_folder_invite_link?: boolean;
}

/**
 * Represents a join request sent to a chat.
 *
 * {@link https://core.telegram.org/bots/api/#chatjoinrequest | [Documentation]}
 */
export interface TelegramChatJoinRequest {
    /**
     * Chat to which the request was sent
     */
    chat: TelegramChat;
    /**
     * User that sent the join request
     */
    from: TelegramUser;
    /**
     * Identifier of a private chat with the user who sent the join request. This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a 64-bit integer or double-precision float type are safe for storing this identifier. The bot can use this identifier for 5 minutes to send messages until the join request is processed, assuming no other administrator contacted the user.
     */
    user_chat_id: number;
    /**
     * Date the request was sent in Unix time
     */
    date: number;
    /**
     * *Optional*. Bio of the user.
     */
    bio?: string;
    /**
     * *Optional*. Chat invite link that was used by the user to send the join request
     */
    invite_link?: TelegramChatInviteLink;
}

/**
 * Describes actions that a non-administrator user is allowed to take in a chat.
 *
 * {@link https://core.telegram.org/bots/api/#chatpermissions | [Documentation]}
 */
export interface TelegramChatPermissions {
    /**
     * *Optional*. *True*, if the user is allowed to send text messages, contacts, invoices, locations and venues
     */
    can_send_messages?: boolean;
    /**
     * *Optional*. *True*, if the user is allowed to send audios
     */
    can_send_audios?: boolean;
    /**
     * *Optional*. *True*, if the user is allowed to send documents
     */
    can_send_documents?: boolean;
    /**
     * *Optional*. *True*, if the user is allowed to send photos
     */
    can_send_photos?: boolean;
    /**
     * *Optional*. *True*, if the user is allowed to send videos
     */
    can_send_videos?: boolean;
    /**
     * *Optional*. *True*, if the user is allowed to send video notes
     */
    can_send_video_notes?: boolean;
    /**
     * *Optional*. *True*, if the user is allowed to send voice notes
     */
    can_send_voice_notes?: boolean;
    /**
     * *Optional*. *True*, if the user is allowed to send polls
     */
    can_send_polls?: boolean;
    /**
     * *Optional*. *True*, if the user is allowed to send animations, games, stickers and use inline bots
     */
    can_send_other_messages?: boolean;
    /**
     * *Optional*. *True*, if the user is allowed to add web page previews to their messages
     */
    can_add_web_page_previews?: boolean;
    /**
     * *Optional*. *True*, if the user is allowed to change the chat title, photo and other settings. Ignored in public supergroups
     */
    can_change_info?: boolean;
    /**
     * *Optional*. *True*, if the user is allowed to invite new users to the chat
     */
    can_invite_users?: boolean;
    /**
     * *Optional*. *True*, if the user is allowed to pin messages. Ignored in public supergroups
     */
    can_pin_messages?: boolean;
    /**
     * *Optional*. *True*, if the user is allowed to create forum topics. If omitted defaults to the value of can\_pin\_messages
     */
    can_manage_topics?: boolean;
}

/**
 * Represents a location to which a chat is connected.
 *
 * {@link https://core.telegram.org/bots/api/#chatlocation | [Documentation]}
 */
export interface TelegramChatLocation {
    /**
     * The location to which the supergroup is connected. Can't be a live location.
     */
    location: TelegramLocation;
    /**
     * Location address; 1-64 characters, as defined by the chat owner
     */
    address: string;
}

/**
 * This object represents a forum topic.
 *
 * {@link https://core.telegram.org/bots/api/#forumtopic | [Documentation]}
 */
export interface TelegramForumTopic {
    /**
     * Unique identifier of the forum topic
     */
    message_thread_id: number;
    /**
     * Name of the topic
     */
    name: string;
    /**
     * Color of the topic icon in RGB format
     */
    icon_color: number;
    /**
     * *Optional*. Unique identifier of the custom emoji shown as the topic icon
     */
    icon_custom_emoji_id?: string;
}

/**
 * This object represents a bot command.
 *
 * {@link https://core.telegram.org/bots/api/#botcommand | [Documentation]}
 */
export interface TelegramBotCommand {
    /**
     * Text of the command; 1-32 characters. Can contain only lowercase English letters, digits and underscores.
     */
    command: string;
    /**
     * Description of the command; 1-256 characters.
     */
    description: string;
}

/**
 * This object represents the scope to which bot commands are applied. Currently, the following 7 scopes are supported:
 *
 * * [BotCommandScopeDefault](https://core.telegram.org/bots/api/#botcommandscopedefault)
 * * [BotCommandScopeAllPrivateChats](https://core.telegram.org/bots/api/#botcommandscopeallprivatechats)
 * * [BotCommandScopeAllGroupChats](https://core.telegram.org/bots/api/#botcommandscopeallgroupchats)
 * * [BotCommandScopeAllChatAdministrators](https://core.telegram.org/bots/api/#botcommandscopeallchatadministrators)
 * * [BotCommandScopeChat](https://core.telegram.org/bots/api/#botcommandscopechat)
 * * [BotCommandScopeChatAdministrators](https://core.telegram.org/bots/api/#botcommandscopechatadministrators)
 * * [BotCommandScopeChatMember](https://core.telegram.org/bots/api/#botcommandscopechatmember)
 *
 * {@link https://core.telegram.org/bots/api/#botcommandscope | [Documentation]}
 */
export interface TelegramBotCommandScope {}

/**
 * Represents the default [scope](https://core.telegram.org/bots/api/#botcommandscope) of bot commands. Default commands are used if no commands with a [narrower scope](https://core.telegram.org/bots/api/#determining-list-of-commands) are specified for the user.
 *
 * {@link https://core.telegram.org/bots/api/#botcommandscopedefault | [Documentation]}
 */
export interface TelegramBotCommandScopeDefault {
    /**
     * Scope type, must be *default*
     */
    type: string;
}

/**
 * Represents the [scope](https://core.telegram.org/bots/api/#botcommandscope) of bot commands, covering all private chats.
 *
 * {@link https://core.telegram.org/bots/api/#botcommandscopeallprivatechats | [Documentation]}
 */
export interface TelegramBotCommandScopeAllPrivateChats {
    /**
     * Scope type, must be *all\_private\_chats*
     */
    type: string;
}

/**
 * Represents the [scope](https://core.telegram.org/bots/api/#botcommandscope) of bot commands, covering all group and supergroup chats.
 *
 * {@link https://core.telegram.org/bots/api/#botcommandscopeallgroupchats | [Documentation]}
 */
export interface TelegramBotCommandScopeAllGroupChats {
    /**
     * Scope type, must be *all\_group\_chats*
     */
    type: string;
}

/**
 * Represents the [scope](https://core.telegram.org/bots/api/#botcommandscope) of bot commands, covering all group and supergroup chat administrators.
 *
 * {@link https://core.telegram.org/bots/api/#botcommandscopeallchatadministrators | [Documentation]}
 */
export interface TelegramBotCommandScopeAllChatAdministrators {
    /**
     * Scope type, must be *all\_chat\_administrators*
     */
    type: string;
}

/**
 * Represents the [scope](https://core.telegram.org/bots/api/#botcommandscope) of bot commands, covering a specific chat.
 *
 * {@link https://core.telegram.org/bots/api/#botcommandscopechat | [Documentation]}
 */
export interface TelegramBotCommandScopeChat {
    /**
     * Scope type, must be *chat*
     */
    type: string;
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
}

/**
 * Represents the [scope](https://core.telegram.org/bots/api/#botcommandscope) of bot commands, covering all administrators of a specific group or supergroup chat.
 *
 * {@link https://core.telegram.org/bots/api/#botcommandscopechatadministrators | [Documentation]}
 */
export interface TelegramBotCommandScopeChatAdministrators {
    /**
     * Scope type, must be *chat\_administrators*
     */
    type: string;
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
}

/**
 * Represents the [scope](https://core.telegram.org/bots/api/#botcommandscope) of bot commands, covering a specific member of a group or supergroup chat.
 *
 * {@link https://core.telegram.org/bots/api/#botcommandscopechatmember | [Documentation]}
 */
export interface TelegramBotCommandScopeChatMember {
    /**
     * Scope type, must be *chat\_member*
     */
    type: string;
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier of the target user
     */
    user_id: number;
}

/**
 * This object represents the bot's name.
 *
 * {@link https://core.telegram.org/bots/api/#botname | [Documentation]}
 */
export interface TelegramBotName {
    /**
     * The bot's name
     */
    name: string;
}

/**
 * This object represents the bot's description.
 *
 * {@link https://core.telegram.org/bots/api/#botdescription | [Documentation]}
 */
export interface TelegramBotDescription {
    /**
     * The bot's description
     */
    description: string;
}

/**
 * This object represents the bot's short description.
 *
 * {@link https://core.telegram.org/bots/api/#botshortdescription | [Documentation]}
 */
export interface TelegramBotShortDescription {
    /**
     * The bot's short description
     */
    short_description: string;
}

/**
 * This object describes the bot's menu button in a private chat. It should be one of
 *
 * * [MenuButtonCommands](https://core.telegram.org/bots/api/#menubuttoncommands)
 * * [MenuButtonWebApp](https://core.telegram.org/bots/api/#menubuttonwebapp)
 * * [MenuButtonDefault](https://core.telegram.org/bots/api/#menubuttondefault)
 *
 * {@link https://core.telegram.org/bots/api/#menubutton | [Documentation]}
 */
export interface TelegramMenuButton {}

/**
 * Represents a menu button, which opens the bot's list of commands.
 *
 * {@link https://core.telegram.org/bots/api/#menubuttoncommands | [Documentation]}
 */
export interface TelegramMenuButtonCommands {
    /**
     * Type of the button, must be *commands*
     */
    type: string;
}

/**
 * Represents a menu button, which launches a [Web App](https://core.telegram.org/bots/webapps).
 *
 * {@link https://core.telegram.org/bots/api/#menubuttonwebapp | [Documentation]}
 */
export interface TelegramMenuButtonWebApp {
    /**
     * Type of the button, must be *web\_app*
     */
    type: string;
    /**
     * Text on the button
     */
    text: string;
    /**
     * Description of the Web App that will be launched when the user presses the button. The Web App will be able to send an arbitrary message on behalf of the user using the method [answerWebAppQuery](https://core.telegram.org/bots/api/#answerwebappquery).
     */
    web_app: TelegramWebAppInfo;
}

/**
 * Describes that no specific value for the menu button was set.
 *
 * {@link https://core.telegram.org/bots/api/#menubuttondefault | [Documentation]}
 */
export interface TelegramMenuButtonDefault {
    /**
     * Type of the button, must be *default*
     */
    type: string;
}

/**
 * Describes why a request was unsuccessful.
 *
 * {@link https://core.telegram.org/bots/api/#responseparameters | [Documentation]}
 */
export interface TelegramResponseParameters {
    /**
     * *Optional*. The group has been migrated to a supergroup with the specified identifier. This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a signed 64-bit integer or double-precision float type are safe for storing this identifier.
     */
    migrate_to_chat_id?: number;
    /**
     * *Optional*. In case of exceeding flood control, the number of seconds left to wait before the request can be repeated
     */
    retry_after?: number;
}

/**
 * This object represents the content of a media message to be sent. It should be one of
 *
 * * [InputMediaAnimation](https://core.telegram.org/bots/api/#inputmediaanimation)
 * * [InputMediaDocument](https://core.telegram.org/bots/api/#inputmediadocument)
 * * [InputMediaAudio](https://core.telegram.org/bots/api/#inputmediaaudio)
 * * [InputMediaPhoto](https://core.telegram.org/bots/api/#inputmediaphoto)
 * * [InputMediaVideo](https://core.telegram.org/bots/api/#inputmediavideo)
 *
 * {@link https://core.telegram.org/bots/api/#inputmedia | [Documentation]}
 */
export interface TelegramInputMedia {}

/**
 * Represents a photo to be sent.
 *
 * {@link https://core.telegram.org/bots/api/#inputmediaphoto | [Documentation]}
 */
export interface TelegramInputMediaPhoto {
    /**
     * Type of the result, must be *photo*
     */
    type: string;
    /**
     * File to send. Pass a file\_id to send a file that exists on the Telegram servers (recommended), pass an HTTP URL for Telegram to get a file from the Internet, or pass “attach://\<file\_attach\_name\>” to upload a new one using multipart/form-data under \<file\_attach\_name\> name. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    media: string;
    /**
     * *Optional*. Caption of the photo to be sent, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * *Optional*. Mode for parsing entities in the photo caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * *Optional*. List of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. Pass *True* if the photo needs to be covered with a spoiler animation
     */
    has_spoiler?: boolean;
}

/**
 * Represents a video to be sent.
 *
 * {@link https://core.telegram.org/bots/api/#inputmediavideo | [Documentation]}
 */
export interface TelegramInputMediaVideo {
    /**
     * Type of the result, must be *video*
     */
    type: string;
    /**
     * File to send. Pass a file\_id to send a file that exists on the Telegram servers (recommended), pass an HTTP URL for Telegram to get a file from the Internet, or pass “attach://\<file\_attach\_name\>” to upload a new one using multipart/form-data under \<file\_attach\_name\> name. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    media: string;
    /**
     * *Optional*. Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side. The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320. Ignored if the file is not uploaded using multipart/form-data. Thumbnails can't be reused and can be only uploaded as a new file, so you can pass “attach://\<file\_attach\_name\>” if the thumbnail was uploaded using multipart/form-data under \<file\_attach\_name\>. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    thumbnail?: TelegramInputFile | string;
    /**
     * *Optional*. Caption of the video to be sent, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * *Optional*. Mode for parsing entities in the video caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * *Optional*. List of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. Video width
     */
    width?: number;
    /**
     * *Optional*. Video height
     */
    height?: number;
    /**
     * *Optional*. Video duration in seconds
     */
    duration?: number;
    /**
     * *Optional*. Pass *True* if the uploaded video is suitable for streaming
     */
    supports_streaming?: boolean;
    /**
     * *Optional*. Pass *True* if the video needs to be covered with a spoiler animation
     */
    has_spoiler?: boolean;
}

/**
 * Represents an animation file (GIF or H.264/MPEG-4 AVC video without sound) to be sent.
 *
 * {@link https://core.telegram.org/bots/api/#inputmediaanimation | [Documentation]}
 */
export interface TelegramInputMediaAnimation {
    /**
     * Type of the result, must be *animation*
     */
    type: string;
    /**
     * File to send. Pass a file\_id to send a file that exists on the Telegram servers (recommended), pass an HTTP URL for Telegram to get a file from the Internet, or pass “attach://\<file\_attach\_name\>” to upload a new one using multipart/form-data under \<file\_attach\_name\> name. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    media: string;
    /**
     * *Optional*. Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side. The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320. Ignored if the file is not uploaded using multipart/form-data. Thumbnails can't be reused and can be only uploaded as a new file, so you can pass “attach://\<file\_attach\_name\>” if the thumbnail was uploaded using multipart/form-data under \<file\_attach\_name\>. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    thumbnail?: TelegramInputFile | string;
    /**
     * *Optional*. Caption of the animation to be sent, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * *Optional*. Mode for parsing entities in the animation caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * *Optional*. List of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. Animation width
     */
    width?: number;
    /**
     * *Optional*. Animation height
     */
    height?: number;
    /**
     * *Optional*. Animation duration in seconds
     */
    duration?: number;
    /**
     * *Optional*. Pass *True* if the animation needs to be covered with a spoiler animation
     */
    has_spoiler?: boolean;
}

/**
 * Represents an audio file to be treated as music to be sent.
 *
 * {@link https://core.telegram.org/bots/api/#inputmediaaudio | [Documentation]}
 */
export interface TelegramInputMediaAudio {
    /**
     * Type of the result, must be *audio*
     */
    type: string;
    /**
     * File to send. Pass a file\_id to send a file that exists on the Telegram servers (recommended), pass an HTTP URL for Telegram to get a file from the Internet, or pass “attach://\<file\_attach\_name\>” to upload a new one using multipart/form-data under \<file\_attach\_name\> name. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    media: string;
    /**
     * *Optional*. Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side. The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320. Ignored if the file is not uploaded using multipart/form-data. Thumbnails can't be reused and can be only uploaded as a new file, so you can pass “attach://\<file\_attach\_name\>” if the thumbnail was uploaded using multipart/form-data under \<file\_attach\_name\>. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    thumbnail?: TelegramInputFile | string;
    /**
     * *Optional*. Caption of the audio to be sent, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * *Optional*. Mode for parsing entities in the audio caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * *Optional*. List of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. Duration of the audio in seconds
     */
    duration?: number;
    /**
     * *Optional*. Performer of the audio
     */
    performer?: string;
    /**
     * *Optional*. Title of the audio
     */
    title?: string;
}

/**
 * Represents a general file to be sent.
 *
 * {@link https://core.telegram.org/bots/api/#inputmediadocument | [Documentation]}
 */
export interface TelegramInputMediaDocument {
    /**
     * Type of the result, must be *document*
     */
    type: string;
    /**
     * File to send. Pass a file\_id to send a file that exists on the Telegram servers (recommended), pass an HTTP URL for Telegram to get a file from the Internet, or pass “attach://\<file\_attach\_name\>” to upload a new one using multipart/form-data under \<file\_attach\_name\> name. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    media: string;
    /**
     * *Optional*. Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side. The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320. Ignored if the file is not uploaded using multipart/form-data. Thumbnails can't be reused and can be only uploaded as a new file, so you can pass “attach://\<file\_attach\_name\>” if the thumbnail was uploaded using multipart/form-data under \<file\_attach\_name\>. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    thumbnail?: TelegramInputFile | string;
    /**
     * *Optional*. Caption of the document to be sent, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * *Optional*. Mode for parsing entities in the document caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * *Optional*. List of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. Disables automatic server-side content type detection for files uploaded using multipart/form-data. Always *True*, if the document is sent as part of an album.
     */
    disable_content_type_detection?: boolean;
}

/**
 * This object represents the contents of a file to be uploaded. Must be posted using multipart/form-data in the usual way that files are uploaded via the browser.
 *
 * {@link https://core.telegram.org/bots/api/#inputfile | [Documentation]}
 */
export interface TelegramInputFile {}

export type TelegramStickerType = "regular" | "mask" | "custom_emoji";

/**
 * This object represents a sticker.
 *
 * {@link https://core.telegram.org/bots/api/#sticker | [Documentation]}
 */
export interface TelegramSticker {
    /**
     * Identifier for this file, which can be used to download or reuse the file
     */
    file_id: string;
    /**
     * Unique identifier for this file, which is supposed to be the same over time and for different bots. Can't be used to download or reuse the file.
     */
    file_unique_id: string;
    /**
     * Type of the sticker, currently one of “regular”, “mask”, “custom\_emoji”. The type of the sticker is independent from its format, which is determined by the fields *is\_animated* and *is\_video*.
     */
    type: TelegramStickerType;
    /**
     * Sticker width
     */
    width: number;
    /**
     * Sticker height
     */
    height: number;
    /**
     * *True*, if the sticker is [animated](https://telegram.org/blog/animated-stickers)
     */
    is_animated: boolean;
    /**
     * *True*, if the sticker is a [video sticker](https://telegram.org/blog/video-stickers-better-reactions)
     */
    is_video: boolean;
    /**
     * *Optional*. Sticker thumbnail in the .WEBP or .JPG format
     */
    thumbnail?: TelegramPhotoSize;
    /**
     * *Optional*. Emoji associated with the sticker
     */
    emoji?: string;
    /**
     * *Optional*. Name of the sticker set to which the sticker belongs
     */
    set_name?: string;
    /**
     * *Optional*. For premium regular stickers, premium animation for the sticker
     */
    premium_animation?: TelegramFile;
    /**
     * *Optional*. For mask stickers, the position where the mask should be placed
     */
    mask_position?: TelegramMaskPosition;
    /**
     * *Optional*. For custom emoji stickers, unique identifier of the custom emoji
     */
    custom_emoji_id?: string;
    /**
     * *Optional*. *True*, if the sticker must be repainted to a text color in messages, the color of the Telegram Premium badge in emoji status, white color on chat photos, or another appropriate color in other places
     */
    needs_repainting?: boolean;
    /**
     * *Optional*. File size in bytes
     */
    file_size?: number;
}

export type TelegramStickerSetStickerType = "regular" | "mask" | "custom_emoji";

/**
 * This object represents a sticker set.
 *
 * {@link https://core.telegram.org/bots/api/#stickerset | [Documentation]}
 */
export interface TelegramStickerSet {
    /**
     * Sticker set name
     */
    name: string;
    /**
     * Sticker set title
     */
    title: string;
    /**
     * Type of stickers in the set, currently one of “regular”, “mask”, “custom\_emoji”
     */
    sticker_type: TelegramStickerSetStickerType;
    /**
     * *True*, if the sticker set contains [animated stickers](https://telegram.org/blog/animated-stickers)
     */
    is_animated: boolean;
    /**
     * *True*, if the sticker set contains [video stickers](https://telegram.org/blog/video-stickers-better-reactions)
     */
    is_video: boolean;
    /**
     * List of all set stickers
     */
    stickers: TelegramSticker[];
    /**
     * *Optional*. Sticker set thumbnail in the .WEBP, .TGS, or .WEBM format
     */
    thumbnail?: TelegramPhotoSize;
}

export type TelegramMaskPositionPoint = "forehead" | "eyes" | "mouth" | "chin";

/**
 * This object describes the position on faces where a mask should be placed by default.
 *
 * {@link https://core.telegram.org/bots/api/#maskposition | [Documentation]}
 */
export interface TelegramMaskPosition {
    /**
     * The part of the face relative to which the mask should be placed. One of “forehead”, “eyes”, “mouth”, or “chin”.
     */
    point: TelegramMaskPositionPoint;
    /**
     * Shift by X-axis measured in widths of the mask scaled to the face size, from left to right. For example, choosing -1.0 will place mask just to the left of the default mask position.
     */
    x_shift: number;
    /**
     * Shift by Y-axis measured in heights of the mask scaled to the face size, from top to bottom. For example, 1.0 will place the mask just below the default mask position.
     */
    y_shift: number;
    /**
     * Mask scaling coefficient. For example, 2.0 means double size.
     */
    scale: number;
}

/**
 * This object describes a sticker to be added to a sticker set.
 *
 * {@link https://core.telegram.org/bots/api/#inputsticker | [Documentation]}
 */
export interface TelegramInputSticker {
    /**
     * The added sticker. Pass a *file\_id* as a String to send a file that already exists on the Telegram servers, pass an HTTP URL as a String for Telegram to get a file from the Internet, upload a new one using multipart/form-data, or pass “attach://\<file\_attach\_name\>” to upload a new one using multipart/form-data under \<file\_attach\_name\> name. Animated and video stickers can't be uploaded via HTTP URL. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    sticker: TelegramInputFile | string;
    /**
     * List of 1-20 emoji associated with the sticker
     */
    emoji_list: string[];
    /**
     * *Optional*. Position where the mask should be placed on faces. For “mask” stickers only.
     */
    mask_position?: TelegramMaskPosition;
    /**
     * *Optional*. List of 0-20 search keywords for the sticker with total length of up to 64 characters. For “regular” and “custom\_emoji” stickers only.
     */
    keywords?: string[];
}

export type TelegramInlineQueryChatType =
    | "sender"
    | "private"
    | "group"
    | "supergroup"
    | "channel";

/**
 * This object represents an incoming inline query. When the user sends an empty query, your bot could return some default or trending results.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequery | [Documentation]}
 */
export interface TelegramInlineQuery {
    /**
     * Unique identifier for this query
     */
    id: string;
    /**
     * Sender
     */
    from: TelegramUser;
    /**
     * Text of the query (up to 256 characters)
     */
    query: string;
    /**
     * Offset of the results to be returned, can be controlled by the bot
     */
    offset: string;
    /**
     * *Optional*. Type of the chat from which the inline query was sent. Can be either “sender” for a private chat with the inline query sender, “private”, “group”, “supergroup”, or “channel”. The chat type should be always known for requests sent from official clients and most third-party clients, unless the request was sent from a secret chat
     */
    chat_type?: TelegramInlineQueryChatType;
    /**
     * *Optional*. Sender location, only for bots that request user location
     */
    location?: TelegramLocation;
}

/**
 * This object represents a button to be shown above inline query results. You **must** use exactly one of the optional fields.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultsbutton | [Documentation]}
 */
export interface TelegramInlineQueryResultsButton {
    /**
     * Label text on the button
     */
    text: string;
    /**
     * *Optional*. Description of the [Web App](https://core.telegram.org/bots/webapps) that will be launched when the user presses the button. The Web App will be able to switch back to the inline mode using the method [switchInlineQuery](https://core.telegram.org/bots/webapps#initializing-mini-apps) inside the Web App.
     */
    web_app?: TelegramWebAppInfo;
    /**
     * *Optional*. [Deep-linking](https://core.telegram.org/bots/features#deep-linking) parameter for the /start message sent to the bot when a user presses the button. 1-64 characters, only `A-Z`, `a-z`, `0-9`, `_` and `-` are allowed.
     *
     * *Example:* An inline bot that sends YouTube videos can ask the user to connect the bot to their YouTube account to adapt search results accordingly. To do this, it displays a 'Connect your YouTube account' button above the results, or even before showing any. The user presses the button, switches to a private chat with the bot and, in doing so, passes a start parameter that instructs the bot to return an OAuth link. Once done, the bot can offer a [*switch\_inline*](https://core.telegram.org/bots/api/#inlinekeyboardmarkup) button so that the user can easily return to the chat where they wanted to use the bot's inline capabilities.
     */
    start_parameter?: string;
}

/**
 * This object represents one result of an inline query. Telegram clients currently support results of the following 20 types:
 *
 * * [InlineQueryResultCachedAudio](https://core.telegram.org/bots/api/#inlinequeryresultcachedaudio)
 * * [InlineQueryResultCachedDocument](https://core.telegram.org/bots/api/#inlinequeryresultcacheddocument)
 * * [InlineQueryResultCachedGif](https://core.telegram.org/bots/api/#inlinequeryresultcachedgif)
 * * [InlineQueryResultCachedMpeg4Gif](https://core.telegram.org/bots/api/#inlinequeryresultcachedmpeg4gif)
 * * [InlineQueryResultCachedPhoto](https://core.telegram.org/bots/api/#inlinequeryresultcachedphoto)
 * * [InlineQueryResultCachedSticker](https://core.telegram.org/bots/api/#inlinequeryresultcachedsticker)
 * * [InlineQueryResultCachedVideo](https://core.telegram.org/bots/api/#inlinequeryresultcachedvideo)
 * * [InlineQueryResultCachedVoice](https://core.telegram.org/bots/api/#inlinequeryresultcachedvoice)
 * * [InlineQueryResultArticle](https://core.telegram.org/bots/api/#inlinequeryresultarticle)
 * * [InlineQueryResultAudio](https://core.telegram.org/bots/api/#inlinequeryresultaudio)
 * * [InlineQueryResultContact](https://core.telegram.org/bots/api/#inlinequeryresultcontact)
 * * [InlineQueryResultGame](https://core.telegram.org/bots/api/#inlinequeryresultgame)
 * * [InlineQueryResultDocument](https://core.telegram.org/bots/api/#inlinequeryresultdocument)
 * * [InlineQueryResultGif](https://core.telegram.org/bots/api/#inlinequeryresultgif)
 * * [InlineQueryResultLocation](https://core.telegram.org/bots/api/#inlinequeryresultlocation)
 * * [InlineQueryResultMpeg4Gif](https://core.telegram.org/bots/api/#inlinequeryresultmpeg4gif)
 * * [InlineQueryResultPhoto](https://core.telegram.org/bots/api/#inlinequeryresultphoto)
 * * [InlineQueryResultVenue](https://core.telegram.org/bots/api/#inlinequeryresultvenue)
 * * [InlineQueryResultVideo](https://core.telegram.org/bots/api/#inlinequeryresultvideo)
 * * [InlineQueryResultVoice](https://core.telegram.org/bots/api/#inlinequeryresultvoice)
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresult | [Documentation]}
 */
export interface TelegramInlineQueryResult {}

/**
 * Represents a link to an article or web page.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultarticle | [Documentation]}
 */
export interface TelegramInlineQueryResultArticle {
    /**
     * Type of the result, must be *article*
     */
    type: string;
    /**
     * Unique identifier for this result, 1-64 Bytes
     */
    id: string;
    /**
     * Title of the result
     */
    title: string;
    /**
     * Content of the message to be sent
     */
    input_message_content: TelegramInputMessageContent;
    /**
     * *Optional*. [Inline keyboard](https://core.telegram.org/bots/features#inline-keyboards) attached to the message
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
    /**
     * *Optional*. URL of the result
     */
    url?: string;
    /**
     * *Optional*. Pass *True* if you don't want the URL to be shown in the message
     */
    hide_url?: boolean;
    /**
     * *Optional*. Short description of the result
     */
    description?: string;
    /**
     * *Optional*. Url of the thumbnail for the result
     */
    thumbnail_url?: string;
    /**
     * *Optional*. Thumbnail width
     */
    thumbnail_width?: number;
    /**
     * *Optional*. Thumbnail height
     */
    thumbnail_height?: number;
}

/**
 * Represents a link to a photo. By default, this photo will be sent by the user with optional caption. Alternatively, you can use *input\_message\_content* to send a message with the specified content instead of the photo.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultphoto | [Documentation]}
 */
export interface TelegramInlineQueryResultPhoto {
    /**
     * Type of the result, must be *photo*
     */
    type: string;
    /**
     * Unique identifier for this result, 1-64 bytes
     */
    id: string;
    /**
     * A valid URL of the photo. Photo must be in **JPEG** format. Photo size must not exceed 5MB
     */
    photo_url: string;
    /**
     * URL of the thumbnail for the photo
     */
    thumbnail_url: string;
    /**
     * *Optional*. Width of the photo
     */
    photo_width?: number;
    /**
     * *Optional*. Height of the photo
     */
    photo_height?: number;
    /**
     * *Optional*. Title for the result
     */
    title?: string;
    /**
     * *Optional*. Short description of the result
     */
    description?: string;
    /**
     * *Optional*. Caption of the photo to be sent, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * *Optional*. Mode for parsing entities in the photo caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * *Optional*. List of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. [Inline keyboard](https://core.telegram.org/bots/features#inline-keyboards) attached to the message
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
    /**
     * *Optional*. Content of the message to be sent instead of the photo
     */
    input_message_content?: TelegramInputMessageContent;
}

export type TelegramInlineQueryResultGifThumbnailMimeType =
    | "image/jpeg"
    | "image/gif"
    | "video/mp4";

/**
 * Represents a link to an animated GIF file. By default, this animated GIF file will be sent by the user with optional caption. Alternatively, you can use *input\_message\_content* to send a message with the specified content instead of the animation.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultgif | [Documentation]}
 */
export interface TelegramInlineQueryResultGif {
    /**
     * Type of the result, must be *gif*
     */
    type: string;
    /**
     * Unique identifier for this result, 1-64 bytes
     */
    id: string;
    /**
     * A valid URL for the GIF file. File size must not exceed 1MB
     */
    gif_url: string;
    /**
     * *Optional*. Width of the GIF
     */
    gif_width?: number;
    /**
     * *Optional*. Height of the GIF
     */
    gif_height?: number;
    /**
     * *Optional*. Duration of the GIF in seconds
     */
    gif_duration?: number;
    /**
     * URL of the static (JPEG or GIF) or animated (MPEG4) thumbnail for the result
     */
    thumbnail_url: string;
    /**
     * *Optional*. MIME type of the thumbnail, must be one of “image/jpeg”, “image/gif”, or “video/mp4”. Defaults to “image/jpeg”
     */
    thumbnail_mime_type?: TelegramInlineQueryResultGifThumbnailMimeType;
    /**
     * *Optional*. Title for the result
     */
    title?: string;
    /**
     * *Optional*. Caption of the GIF file to be sent, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * *Optional*. Mode for parsing entities in the caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * *Optional*. List of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. [Inline keyboard](https://core.telegram.org/bots/features#inline-keyboards) attached to the message
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
    /**
     * *Optional*. Content of the message to be sent instead of the GIF animation
     */
    input_message_content?: TelegramInputMessageContent;
}

export type TelegramInlineQueryResultMpeg4GifThumbnailMimeType =
    | "image/jpeg"
    | "image/gif"
    | "video/mp4";

/**
 * Represents a link to a video animation (H.264/MPEG-4 AVC video without sound). By default, this animated MPEG-4 file will be sent by the user with optional caption. Alternatively, you can use *input\_message\_content* to send a message with the specified content instead of the animation.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultmpeg4gif | [Documentation]}
 */
export interface TelegramInlineQueryResultMpeg4Gif {
    /**
     * Type of the result, must be *mpeg4\_gif*
     */
    type: string;
    /**
     * Unique identifier for this result, 1-64 bytes
     */
    id: string;
    /**
     * A valid URL for the MPEG4 file. File size must not exceed 1MB
     */
    mpeg4_url: string;
    /**
     * *Optional*. Video width
     */
    mpeg4_width?: number;
    /**
     * *Optional*. Video height
     */
    mpeg4_height?: number;
    /**
     * *Optional*. Video duration in seconds
     */
    mpeg4_duration?: number;
    /**
     * URL of the static (JPEG or GIF) or animated (MPEG4) thumbnail for the result
     */
    thumbnail_url: string;
    /**
     * *Optional*. MIME type of the thumbnail, must be one of “image/jpeg”, “image/gif”, or “video/mp4”. Defaults to “image/jpeg”
     */
    thumbnail_mime_type?: TelegramInlineQueryResultMpeg4GifThumbnailMimeType;
    /**
     * *Optional*. Title for the result
     */
    title?: string;
    /**
     * *Optional*. Caption of the MPEG-4 file to be sent, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * *Optional*. Mode for parsing entities in the caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * *Optional*. List of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. [Inline keyboard](https://core.telegram.org/bots/features#inline-keyboards) attached to the message
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
    /**
     * *Optional*. Content of the message to be sent instead of the video animation
     */
    input_message_content?: TelegramInputMessageContent;
}

export type TelegramInlineQueryResultVideoMimeType = "text/html" | "video/mp4";

/**
 * Represents a link to a page containing an embedded video player or a video file. By default, this video file will be sent by the user with an optional caption. Alternatively, you can use *input\_message\_content* to send a message with the specified content instead of the video.
 *
 * If an InlineQueryResultVideo message contains an embedded video (e.g., YouTube), you **must** replace its content using *input\_message\_content*.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultvideo | [Documentation]}
 */
export interface TelegramInlineQueryResultVideo {
    /**
     * Type of the result, must be *video*
     */
    type: string;
    /**
     * Unique identifier for this result, 1-64 bytes
     */
    id: string;
    /**
     * A valid URL for the embedded video player or video file
     */
    video_url: string;
    /**
     * MIME type of the content of the video URL, “text/html” or “video/mp4”
     */
    mime_type: TelegramInlineQueryResultVideoMimeType;
    /**
     * URL of the thumbnail (JPEG only) for the video
     */
    thumbnail_url: string;
    /**
     * Title for the result
     */
    title: string;
    /**
     * *Optional*. Caption of the video to be sent, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * *Optional*. Mode for parsing entities in the video caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * *Optional*. List of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. Video width
     */
    video_width?: number;
    /**
     * *Optional*. Video height
     */
    video_height?: number;
    /**
     * *Optional*. Video duration in seconds
     */
    video_duration?: number;
    /**
     * *Optional*. Short description of the result
     */
    description?: string;
    /**
     * *Optional*. [Inline keyboard](https://core.telegram.org/bots/features#inline-keyboards) attached to the message
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
    /**
     * *Optional*. Content of the message to be sent instead of the video. This field is **required** if InlineQueryResultVideo is used to send an HTML-page as a result (e.g., a YouTube video).
     */
    input_message_content?: TelegramInputMessageContent;
}

/**
 * Represents a link to an MP3 audio file. By default, this audio file will be sent by the user. Alternatively, you can use *input\_message\_content* to send a message with the specified content instead of the audio.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultaudio | [Documentation]}
 */
export interface TelegramInlineQueryResultAudio {
    /**
     * Type of the result, must be *audio*
     */
    type: string;
    /**
     * Unique identifier for this result, 1-64 bytes
     */
    id: string;
    /**
     * A valid URL for the audio file
     */
    audio_url: string;
    /**
     * Title
     */
    title: string;
    /**
     * *Optional*. Caption, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * *Optional*. Mode for parsing entities in the audio caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * *Optional*. List of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. Performer
     */
    performer?: string;
    /**
     * *Optional*. Audio duration in seconds
     */
    audio_duration?: number;
    /**
     * *Optional*. [Inline keyboard](https://core.telegram.org/bots/features#inline-keyboards) attached to the message
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
    /**
     * *Optional*. Content of the message to be sent instead of the audio
     */
    input_message_content?: TelegramInputMessageContent;
}

/**
 * Represents a link to a voice recording in an .OGG container encoded with OPUS. By default, this voice recording will be sent by the user. Alternatively, you can use *input\_message\_content* to send a message with the specified content instead of the the voice message.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultvoice | [Documentation]}
 */
export interface TelegramInlineQueryResultVoice {
    /**
     * Type of the result, must be *voice*
     */
    type: string;
    /**
     * Unique identifier for this result, 1-64 bytes
     */
    id: string;
    /**
     * A valid URL for the voice recording
     */
    voice_url: string;
    /**
     * Recording title
     */
    title: string;
    /**
     * *Optional*. Caption, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * *Optional*. Mode for parsing entities in the voice message caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * *Optional*. List of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. Recording duration in seconds
     */
    voice_duration?: number;
    /**
     * *Optional*. [Inline keyboard](https://core.telegram.org/bots/features#inline-keyboards) attached to the message
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
    /**
     * *Optional*. Content of the message to be sent instead of the voice recording
     */
    input_message_content?: TelegramInputMessageContent;
}

export type TelegramInlineQueryResultDocumentMimeType =
    | "application/pdf"
    | "application/zip";

/**
 * Represents a link to a file. By default, this file will be sent by the user with an optional caption. Alternatively, you can use *input\_message\_content* to send a message with the specified content instead of the file. Currently, only **.PDF** and **.ZIP** files can be sent using this method.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultdocument | [Documentation]}
 */
export interface TelegramInlineQueryResultDocument {
    /**
     * Type of the result, must be *document*
     */
    type: string;
    /**
     * Unique identifier for this result, 1-64 bytes
     */
    id: string;
    /**
     * Title for the result
     */
    title: string;
    /**
     * *Optional*. Caption of the document to be sent, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * *Optional*. Mode for parsing entities in the document caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * *Optional*. List of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: TelegramMessageEntity[];
    /**
     * A valid URL for the file
     */
    document_url: string;
    /**
     * MIME type of the content of the file, either “application/pdf” or “application/zip”
     */
    mime_type: TelegramInlineQueryResultDocumentMimeType;
    /**
     * *Optional*. Short description of the result
     */
    description?: string;
    /**
     * *Optional*. Inline keyboard attached to the message
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
    /**
     * *Optional*. Content of the message to be sent instead of the file
     */
    input_message_content?: TelegramInputMessageContent;
    /**
     * *Optional*. URL of the thumbnail (JPEG only) for the file
     */
    thumbnail_url?: string;
    /**
     * *Optional*. Thumbnail width
     */
    thumbnail_width?: number;
    /**
     * *Optional*. Thumbnail height
     */
    thumbnail_height?: number;
}

/**
 * Represents a location on a map. By default, the location will be sent by the user. Alternatively, you can use *input\_message\_content* to send a message with the specified content instead of the location.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultlocation | [Documentation]}
 */
export interface TelegramInlineQueryResultLocation {
    /**
     * Type of the result, must be *location*
     */
    type: string;
    /**
     * Unique identifier for this result, 1-64 Bytes
     */
    id: string;
    /**
     * Location latitude in degrees
     */
    latitude: number;
    /**
     * Location longitude in degrees
     */
    longitude: number;
    /**
     * Location title
     */
    title: string;
    /**
     * *Optional*. The radius of uncertainty for the location, measured in meters; 0-1500
     */
    horizontal_accuracy?: number;
    /**
     * *Optional*. Period in seconds for which the location can be updated, should be between 60 and 86400.
     */
    live_period?: number;
    /**
     * *Optional*. For live locations, a direction in which the user is moving, in degrees. Must be between 1 and 360 if specified.
     */
    heading?: number;
    /**
     * *Optional*. For live locations, a maximum distance for proximity alerts about approaching another chat member, in meters. Must be between 1 and 100000 if specified.
     */
    proximity_alert_radius?: number;
    /**
     * *Optional*. [Inline keyboard](https://core.telegram.org/bots/features#inline-keyboards) attached to the message
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
    /**
     * *Optional*. Content of the message to be sent instead of the location
     */
    input_message_content?: TelegramInputMessageContent;
    /**
     * *Optional*. Url of the thumbnail for the result
     */
    thumbnail_url?: string;
    /**
     * *Optional*. Thumbnail width
     */
    thumbnail_width?: number;
    /**
     * *Optional*. Thumbnail height
     */
    thumbnail_height?: number;
}

/**
 * Represents a venue. By default, the venue will be sent by the user. Alternatively, you can use *input\_message\_content* to send a message with the specified content instead of the venue.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultvenue | [Documentation]}
 */
export interface TelegramInlineQueryResultVenue {
    /**
     * Type of the result, must be *venue*
     */
    type: string;
    /**
     * Unique identifier for this result, 1-64 Bytes
     */
    id: string;
    /**
     * Latitude of the venue location in degrees
     */
    latitude: number;
    /**
     * Longitude of the venue location in degrees
     */
    longitude: number;
    /**
     * Title of the venue
     */
    title: string;
    /**
     * Address of the venue
     */
    address: string;
    /**
     * *Optional*. Foursquare identifier of the venue if known
     */
    foursquare_id?: string;
    /**
     * *Optional*. Foursquare type of the venue, if known. (For example, “arts\_entertainment/default”, “arts\_entertainment/aquarium” or “food/icecream”.)
     */
    foursquare_type?: string;
    /**
     * *Optional*. Google Places identifier of the venue
     */
    google_place_id?: string;
    /**
     * *Optional*. Google Places type of the venue. (See [supported types](https://developers.google.com/places/web-service/supported_types).)
     */
    google_place_type?: string;
    /**
     * *Optional*. [Inline keyboard](https://core.telegram.org/bots/features#inline-keyboards) attached to the message
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
    /**
     * *Optional*. Content of the message to be sent instead of the venue
     */
    input_message_content?: TelegramInputMessageContent;
    /**
     * *Optional*. Url of the thumbnail for the result
     */
    thumbnail_url?: string;
    /**
     * *Optional*. Thumbnail width
     */
    thumbnail_width?: number;
    /**
     * *Optional*. Thumbnail height
     */
    thumbnail_height?: number;
}

/**
 * Represents a contact with a phone number. By default, this contact will be sent by the user. Alternatively, you can use *input\_message\_content* to send a message with the specified content instead of the contact.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultcontact | [Documentation]}
 */
export interface TelegramInlineQueryResultContact {
    /**
     * Type of the result, must be *contact*
     */
    type: string;
    /**
     * Unique identifier for this result, 1-64 Bytes
     */
    id: string;
    /**
     * Contact's phone number
     */
    phone_number: string;
    /**
     * Contact's first name
     */
    first_name: string;
    /**
     * *Optional*. Contact's last name
     */
    last_name?: string;
    /**
     * *Optional*. Additional data about the contact in the form of a [vCard](https://en.wikipedia.org/wiki/VCard), 0-2048 bytes
     */
    vcard?: string;
    /**
     * *Optional*. [Inline keyboard](https://core.telegram.org/bots/features#inline-keyboards) attached to the message
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
    /**
     * *Optional*. Content of the message to be sent instead of the contact
     */
    input_message_content?: TelegramInputMessageContent;
    /**
     * *Optional*. Url of the thumbnail for the result
     */
    thumbnail_url?: string;
    /**
     * *Optional*. Thumbnail width
     */
    thumbnail_width?: number;
    /**
     * *Optional*. Thumbnail height
     */
    thumbnail_height?: number;
}

/**
 * Represents a [Game](https://core.telegram.org/bots/api/#games).
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultgame | [Documentation]}
 */
export interface TelegramInlineQueryResultGame {
    /**
     * Type of the result, must be *game*
     */
    type: string;
    /**
     * Unique identifier for this result, 1-64 bytes
     */
    id: string;
    /**
     * Short name of the game
     */
    game_short_name: string;
    /**
     * *Optional*. [Inline keyboard](https://core.telegram.org/bots/features#inline-keyboards) attached to the message
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
}

/**
 * Represents a link to a photo stored on the Telegram servers. By default, this photo will be sent by the user with an optional caption. Alternatively, you can use *input\_message\_content* to send a message with the specified content instead of the photo.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultcachedphoto | [Documentation]}
 */
export interface TelegramInlineQueryResultCachedPhoto {
    /**
     * Type of the result, must be *photo*
     */
    type: string;
    /**
     * Unique identifier for this result, 1-64 bytes
     */
    id: string;
    /**
     * A valid file identifier of the photo
     */
    photo_file_id: string;
    /**
     * *Optional*. Title for the result
     */
    title?: string;
    /**
     * *Optional*. Short description of the result
     */
    description?: string;
    /**
     * *Optional*. Caption of the photo to be sent, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * *Optional*. Mode for parsing entities in the photo caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * *Optional*. List of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. [Inline keyboard](https://core.telegram.org/bots/features#inline-keyboards) attached to the message
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
    /**
     * *Optional*. Content of the message to be sent instead of the photo
     */
    input_message_content?: TelegramInputMessageContent;
}

/**
 * Represents a link to an animated GIF file stored on the Telegram servers. By default, this animated GIF file will be sent by the user with an optional caption. Alternatively, you can use *input\_message\_content* to send a message with specified content instead of the animation.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultcachedgif | [Documentation]}
 */
export interface TelegramInlineQueryResultCachedGif {
    /**
     * Type of the result, must be *gif*
     */
    type: string;
    /**
     * Unique identifier for this result, 1-64 bytes
     */
    id: string;
    /**
     * A valid file identifier for the GIF file
     */
    gif_file_id: string;
    /**
     * *Optional*. Title for the result
     */
    title?: string;
    /**
     * *Optional*. Caption of the GIF file to be sent, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * *Optional*. Mode for parsing entities in the caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * *Optional*. List of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. [Inline keyboard](https://core.telegram.org/bots/features#inline-keyboards) attached to the message
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
    /**
     * *Optional*. Content of the message to be sent instead of the GIF animation
     */
    input_message_content?: TelegramInputMessageContent;
}

/**
 * Represents a link to a video animation (H.264/MPEG-4 AVC video without sound) stored on the Telegram servers. By default, this animated MPEG-4 file will be sent by the user with an optional caption. Alternatively, you can use *input\_message\_content* to send a message with the specified content instead of the animation.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultcachedmpeg4gif | [Documentation]}
 */
export interface TelegramInlineQueryResultCachedMpeg4Gif {
    /**
     * Type of the result, must be *mpeg4\_gif*
     */
    type: string;
    /**
     * Unique identifier for this result, 1-64 bytes
     */
    id: string;
    /**
     * A valid file identifier for the MPEG4 file
     */
    mpeg4_file_id: string;
    /**
     * *Optional*. Title for the result
     */
    title?: string;
    /**
     * *Optional*. Caption of the MPEG-4 file to be sent, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * *Optional*. Mode for parsing entities in the caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * *Optional*. List of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. [Inline keyboard](https://core.telegram.org/bots/features#inline-keyboards) attached to the message
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
    /**
     * *Optional*. Content of the message to be sent instead of the video animation
     */
    input_message_content?: TelegramInputMessageContent;
}

/**
 * Represents a link to a sticker stored on the Telegram servers. By default, this sticker will be sent by the user. Alternatively, you can use *input\_message\_content* to send a message with the specified content instead of the sticker.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultcachedsticker | [Documentation]}
 */
export interface TelegramInlineQueryResultCachedSticker {
    /**
     * Type of the result, must be *sticker*
     */
    type: string;
    /**
     * Unique identifier for this result, 1-64 bytes
     */
    id: string;
    /**
     * A valid file identifier of the sticker
     */
    sticker_file_id: string;
    /**
     * *Optional*. [Inline keyboard](https://core.telegram.org/bots/features#inline-keyboards) attached to the message
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
    /**
     * *Optional*. Content of the message to be sent instead of the sticker
     */
    input_message_content?: TelegramInputMessageContent;
}

/**
 * Represents a link to a file stored on the Telegram servers. By default, this file will be sent by the user with an optional caption. Alternatively, you can use *input\_message\_content* to send a message with the specified content instead of the file.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultcacheddocument | [Documentation]}
 */
export interface TelegramInlineQueryResultCachedDocument {
    /**
     * Type of the result, must be *document*
     */
    type: string;
    /**
     * Unique identifier for this result, 1-64 bytes
     */
    id: string;
    /**
     * Title for the result
     */
    title: string;
    /**
     * A valid file identifier for the file
     */
    document_file_id: string;
    /**
     * *Optional*. Short description of the result
     */
    description?: string;
    /**
     * *Optional*. Caption of the document to be sent, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * *Optional*. Mode for parsing entities in the document caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * *Optional*. List of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. [Inline keyboard](https://core.telegram.org/bots/features#inline-keyboards) attached to the message
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
    /**
     * *Optional*. Content of the message to be sent instead of the file
     */
    input_message_content?: TelegramInputMessageContent;
}

/**
 * Represents a link to a video file stored on the Telegram servers. By default, this video file will be sent by the user with an optional caption. Alternatively, you can use *input\_message\_content* to send a message with the specified content instead of the video.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultcachedvideo | [Documentation]}
 */
export interface TelegramInlineQueryResultCachedVideo {
    /**
     * Type of the result, must be *video*
     */
    type: string;
    /**
     * Unique identifier for this result, 1-64 bytes
     */
    id: string;
    /**
     * A valid file identifier for the video file
     */
    video_file_id: string;
    /**
     * Title for the result
     */
    title: string;
    /**
     * *Optional*. Short description of the result
     */
    description?: string;
    /**
     * *Optional*. Caption of the video to be sent, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * *Optional*. Mode for parsing entities in the video caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * *Optional*. List of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. [Inline keyboard](https://core.telegram.org/bots/features#inline-keyboards) attached to the message
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
    /**
     * *Optional*. Content of the message to be sent instead of the video
     */
    input_message_content?: TelegramInputMessageContent;
}

/**
 * Represents a link to a voice message stored on the Telegram servers. By default, this voice message will be sent by the user. Alternatively, you can use *input\_message\_content* to send a message with the specified content instead of the voice message.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultcachedvoice | [Documentation]}
 */
export interface TelegramInlineQueryResultCachedVoice {
    /**
     * Type of the result, must be *voice*
     */
    type: string;
    /**
     * Unique identifier for this result, 1-64 bytes
     */
    id: string;
    /**
     * A valid file identifier for the voice message
     */
    voice_file_id: string;
    /**
     * Voice message title
     */
    title: string;
    /**
     * *Optional*. Caption, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * *Optional*. Mode for parsing entities in the voice message caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * *Optional*. List of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. [Inline keyboard](https://core.telegram.org/bots/features#inline-keyboards) attached to the message
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
    /**
     * *Optional*. Content of the message to be sent instead of the voice message
     */
    input_message_content?: TelegramInputMessageContent;
}

/**
 * Represents a link to an MP3 audio file stored on the Telegram servers. By default, this audio file will be sent by the user. Alternatively, you can use *input\_message\_content* to send a message with the specified content instead of the audio.
 *
 * {@link https://core.telegram.org/bots/api/#inlinequeryresultcachedaudio | [Documentation]}
 */
export interface TelegramInlineQueryResultCachedAudio {
    /**
     * Type of the result, must be *audio*
     */
    type: string;
    /**
     * Unique identifier for this result, 1-64 bytes
     */
    id: string;
    /**
     * A valid file identifier for the audio file
     */
    audio_file_id: string;
    /**
     * *Optional*. Caption, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * *Optional*. Mode for parsing entities in the audio caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * *Optional*. List of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. [Inline keyboard](https://core.telegram.org/bots/features#inline-keyboards) attached to the message
     */
    reply_markup?: TelegramInlineKeyboardMarkup;
    /**
     * *Optional*. Content of the message to be sent instead of the audio
     */
    input_message_content?: TelegramInputMessageContent;
}

/**
 * This object represents the content of a message to be sent as a result of an inline query. Telegram clients currently support the following 5 types:
 *
 * * [InputTextMessageContent](https://core.telegram.org/bots/api/#inputtextmessagecontent)
 * * [InputLocationMessageContent](https://core.telegram.org/bots/api/#inputlocationmessagecontent)
 * * [InputVenueMessageContent](https://core.telegram.org/bots/api/#inputvenuemessagecontent)
 * * [InputContactMessageContent](https://core.telegram.org/bots/api/#inputcontactmessagecontent)
 * * [InputInvoiceMessageContent](https://core.telegram.org/bots/api/#inputinvoicemessagecontent)
 *
 * {@link https://core.telegram.org/bots/api/#inputmessagecontent | [Documentation]}
 */
export interface TelegramInputMessageContent {}

/**
 * Represents the [content](https://core.telegram.org/bots/api/#inputmessagecontent) of a text message to be sent as the result of an inline query.
 *
 * {@link https://core.telegram.org/bots/api/#inputtextmessagecontent | [Documentation]}
 */
export interface TelegramInputTextMessageContent {
    /**
     * Text of the message to be sent, 1-4096 characters
     */
    message_text: string;
    /**
     * *Optional*. Mode for parsing entities in the message text. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * *Optional*. List of special entities that appear in message text, which can be specified instead of *parse\_mode*
     */
    entities?: TelegramMessageEntity[];
    /**
     * *Optional*. Disables link previews for links in the sent message
     */
    disable_web_page_preview?: boolean;
}

/**
 * Represents the [content](https://core.telegram.org/bots/api/#inputmessagecontent) of a location message to be sent as the result of an inline query.
 *
 * {@link https://core.telegram.org/bots/api/#inputlocationmessagecontent | [Documentation]}
 */
export interface TelegramInputLocationMessageContent {
    /**
     * Latitude of the location in degrees
     */
    latitude: number;
    /**
     * Longitude of the location in degrees
     */
    longitude: number;
    /**
     * *Optional*. The radius of uncertainty for the location, measured in meters; 0-1500
     */
    horizontal_accuracy?: number;
    /**
     * *Optional*. Period in seconds for which the location can be updated, should be between 60 and 86400.
     */
    live_period?: number;
    /**
     * *Optional*. For live locations, a direction in which the user is moving, in degrees. Must be between 1 and 360 if specified.
     */
    heading?: number;
    /**
     * *Optional*. For live locations, a maximum distance for proximity alerts about approaching another chat member, in meters. Must be between 1 and 100000 if specified.
     */
    proximity_alert_radius?: number;
}

/**
 * Represents the [content](https://core.telegram.org/bots/api/#inputmessagecontent) of a venue message to be sent as the result of an inline query.
 *
 * {@link https://core.telegram.org/bots/api/#inputvenuemessagecontent | [Documentation]}
 */
export interface TelegramInputVenueMessageContent {
    /**
     * Latitude of the venue in degrees
     */
    latitude: number;
    /**
     * Longitude of the venue in degrees
     */
    longitude: number;
    /**
     * Name of the venue
     */
    title: string;
    /**
     * Address of the venue
     */
    address: string;
    /**
     * *Optional*. Foursquare identifier of the venue, if known
     */
    foursquare_id?: string;
    /**
     * *Optional*. Foursquare type of the venue, if known. (For example, “arts\_entertainment/default”, “arts\_entertainment/aquarium” or “food/icecream”.)
     */
    foursquare_type?: string;
    /**
     * *Optional*. Google Places identifier of the venue
     */
    google_place_id?: string;
    /**
     * *Optional*. Google Places type of the venue. (See [supported types](https://developers.google.com/places/web-service/supported_types).)
     */
    google_place_type?: string;
}

/**
 * Represents the [content](https://core.telegram.org/bots/api/#inputmessagecontent) of a contact message to be sent as the result of an inline query.
 *
 * {@link https://core.telegram.org/bots/api/#inputcontactmessagecontent | [Documentation]}
 */
export interface TelegramInputContactMessageContent {
    /**
     * Contact's phone number
     */
    phone_number: string;
    /**
     * Contact's first name
     */
    first_name: string;
    /**
     * *Optional*. Contact's last name
     */
    last_name?: string;
    /**
     * *Optional*. Additional data about the contact in the form of a [vCard](https://en.wikipedia.org/wiki/VCard), 0-2048 bytes
     */
    vcard?: string;
}

/**
 * Represents the [content](https://core.telegram.org/bots/api/#inputmessagecontent) of an invoice message to be sent as the result of an inline query.
 *
 * {@link https://core.telegram.org/bots/api/#inputinvoicemessagecontent | [Documentation]}
 */
export interface TelegramInputInvoiceMessageContent {
    /**
     * Product name, 1-32 characters
     */
    title: string;
    /**
     * Product description, 1-255 characters
     */
    description: string;
    /**
     * Bot-defined invoice payload, 1-128 bytes. This will not be displayed to the user, use for your internal processes.
     */
    payload: string;
    /**
     * Payment provider token, obtained via [@BotFather](https://t.me/botfather)
     */
    provider_token: string;
    /**
     * Three-letter ISO 4217 currency code, see [more on currencies](https://core.telegram.org/bots/payments#supported-currencies)
     */
    currency: string;
    /**
     * Price breakdown, a JSON-serialized list of components (e.g. product price, tax, discount, delivery cost, delivery tax, bonus, etc.)
     */
    prices: TelegramLabeledPrice[];
    /**
     * *Optional*. The maximum accepted amount for tips in the *smallest units* of the currency (integer, **not** float/double). For example, for a maximum tip of `US$ 1.45` pass `max_tip_amount = 145`. See the *exp* parameter in [currencies.json](https://core.telegram.org/bots/payments/currencies.json), it shows the number of digits past the decimal point for each currency (2 for the majority of currencies). Defaults to 0
     */
    max_tip_amount?: number;
    /**
     * *Optional*. A JSON-serialized array of suggested amounts of tip in the *smallest units* of the currency (integer, **not** float/double). At most 4 suggested tip amounts can be specified. The suggested tip amounts must be positive, passed in a strictly increased order and must not exceed *max\_tip\_amount*.
     */
    suggested_tip_amounts?: number[];
    /**
     * *Optional*. A JSON-serialized object for data about the invoice, which will be shared with the payment provider. A detailed description of the required fields should be provided by the payment provider.
     */
    provider_data?: string;
    /**
     * *Optional*. URL of the product photo for the invoice. Can be a photo of the goods or a marketing image for a service.
     */
    photo_url?: string;
    /**
     * *Optional*. Photo size in bytes
     */
    photo_size?: number;
    /**
     * *Optional*. Photo width
     */
    photo_width?: number;
    /**
     * *Optional*. Photo height
     */
    photo_height?: number;
    /**
     * *Optional*. Pass *True* if you require the user's full name to complete the order
     */
    need_name?: boolean;
    /**
     * *Optional*. Pass *True* if you require the user's phone number to complete the order
     */
    need_phone_number?: boolean;
    /**
     * *Optional*. Pass *True* if you require the user's email address to complete the order
     */
    need_email?: boolean;
    /**
     * *Optional*. Pass *True* if you require the user's shipping address to complete the order
     */
    need_shipping_address?: boolean;
    /**
     * *Optional*. Pass *True* if the user's phone number should be sent to provider
     */
    send_phone_number_to_provider?: boolean;
    /**
     * *Optional*. Pass *True* if the user's email address should be sent to provider
     */
    send_email_to_provider?: boolean;
    /**
     * *Optional*. Pass *True* if the final price depends on the shipping method
     */
    is_flexible?: boolean;
}

/**
 * Represents a [result](https://core.telegram.org/bots/api/#inlinequeryresult) of an inline query that was chosen by the user and sent to their chat partner.
 *
 * {@link https://core.telegram.org/bots/api/#choseninlineresult | [Documentation]}
 */
export interface TelegramChosenInlineResult {
    /**
     * The unique identifier for the result that was chosen
     */
    result_id: string;
    /**
     * The user that chose the result
     */
    from: TelegramUser;
    /**
     * *Optional*. Sender location, only for bots that require user location
     */
    location?: TelegramLocation;
    /**
     * *Optional*. Identifier of the sent inline message. Available only if there is an [inline keyboard](https://core.telegram.org/bots/api/#inlinekeyboardmarkup) attached to the message. Will be also received in [callback queries](https://core.telegram.org/bots/api/#callbackquery) and can be used to [edit](https://core.telegram.org/bots/api/#updating-messages) the message.
     */
    inline_message_id?: string;
    /**
     * The query that was used to obtain the result
     */
    query: string;
}

/**
 * Describes an inline message sent by a [Web App](https://core.telegram.org/bots/webapps) on behalf of a user.
 *
 * {@link https://core.telegram.org/bots/api/#sentwebappmessage | [Documentation]}
 */
export interface TelegramSentWebAppMessage {
    /**
     * *Optional*. Identifier of the sent inline message. Available only if there is an [inline keyboard](https://core.telegram.org/bots/api/#inlinekeyboardmarkup) attached to the message.
     */
    inline_message_id?: string;
}

/**
 * This object represents a portion of the price for goods or services.
 *
 * {@link https://core.telegram.org/bots/api/#labeledprice | [Documentation]}
 */
export interface TelegramLabeledPrice {
    /**
     * Portion label
     */
    label: string;
    /**
     * Price of the product in the *smallest units* of the [currency](https://core.telegram.org/bots/payments#supported-currencies) (integer, **not** float/double). For example, for a price of `US$ 1.45` pass `amount = 145`. See the *exp* parameter in [currencies.json](https://core.telegram.org/bots/payments/currencies.json), it shows the number of digits past the decimal point for each currency (2 for the majority of currencies).
     */
    amount: number;
}

/**
 * This object contains basic information about an invoice.
 *
 * {@link https://core.telegram.org/bots/api/#invoice | [Documentation]}
 */
export interface TelegramInvoice {
    /**
     * Product name
     */
    title: string;
    /**
     * Product description
     */
    description: string;
    /**
     * Unique bot deep-linking parameter that can be used to generate this invoice
     */
    start_parameter: string;
    /**
     * Three-letter ISO 4217 [currency](https://core.telegram.org/bots/payments#supported-currencies) code
     */
    currency: string;
    /**
     * Total price in the *smallest units* of the currency (integer, **not** float/double). For example, for a price of `US$ 1.45` pass `amount = 145`. See the *exp* parameter in [currencies.json](https://core.telegram.org/bots/payments/currencies.json), it shows the number of digits past the decimal point for each currency (2 for the majority of currencies).
     */
    total_amount: number;
}

/**
 * This object represents a shipping address.
 *
 * {@link https://core.telegram.org/bots/api/#shippingaddress | [Documentation]}
 */
export interface TelegramShippingAddress {
    /**
     * Two-letter ISO 3166-1 alpha-2 country code
     */
    country_code: string;
    /**
     * State, if applicable
     */
    state: string;
    /**
     * City
     */
    city: string;
    /**
     * First line for the address
     */
    street_line1: string;
    /**
     * Second line for the address
     */
    street_line2: string;
    /**
     * Address post code
     */
    post_code: string;
}

/**
 * This object represents information about an order.
 *
 * {@link https://core.telegram.org/bots/api/#orderinfo | [Documentation]}
 */
export interface TelegramOrderInfo {
    /**
     * *Optional*. User name
     */
    name?: string;
    /**
     * *Optional*. User's phone number
     */
    phone_number?: string;
    /**
     * *Optional*. User email
     */
    email?: string;
    /**
     * *Optional*. User shipping address
     */
    shipping_address?: TelegramShippingAddress;
}

/**
 * This object represents one shipping option.
 *
 * {@link https://core.telegram.org/bots/api/#shippingoption | [Documentation]}
 */
export interface TelegramShippingOption {
    /**
     * Shipping option identifier
     */
    id: string;
    /**
     * Option title
     */
    title: string;
    /**
     * List of price portions
     */
    prices: TelegramLabeledPrice[];
}

/**
 * This object contains basic information about a successful payment.
 *
 * {@link https://core.telegram.org/bots/api/#successfulpayment | [Documentation]}
 */
export interface TelegramSuccessfulPayment {
    /**
     * Three-letter ISO 4217 [currency](https://core.telegram.org/bots/payments#supported-currencies) code
     */
    currency: string;
    /**
     * Total price in the *smallest units* of the currency (integer, **not** float/double). For example, for a price of `US$ 1.45` pass `amount = 145`. See the *exp* parameter in [currencies.json](https://core.telegram.org/bots/payments/currencies.json), it shows the number of digits past the decimal point for each currency (2 for the majority of currencies).
     */
    total_amount: number;
    /**
     * Bot specified invoice payload
     */
    invoice_payload: string;
    /**
     * *Optional*. Identifier of the shipping option chosen by the user
     */
    shipping_option_id?: string;
    /**
     * *Optional*. Order information provided by the user
     */
    order_info?: TelegramOrderInfo;
    /**
     * Telegram payment identifier
     */
    telegram_payment_charge_id: string;
    /**
     * Provider payment identifier
     */
    provider_payment_charge_id: string;
}

/**
 * This object contains information about an incoming shipping query.
 *
 * {@link https://core.telegram.org/bots/api/#shippingquery | [Documentation]}
 */
export interface TelegramShippingQuery {
    /**
     * Unique query identifier
     */
    id: string;
    /**
     * User who sent the query
     */
    from: TelegramUser;
    /**
     * Bot specified invoice payload
     */
    invoice_payload: string;
    /**
     * User specified shipping address
     */
    shipping_address: TelegramShippingAddress;
}

/**
 * This object contains information about an incoming pre-checkout query.
 *
 * {@link https://core.telegram.org/bots/api/#precheckoutquery | [Documentation]}
 */
export interface TelegramPreCheckoutQuery {
    /**
     * Unique query identifier
     */
    id: string;
    /**
     * User who sent the query
     */
    from: TelegramUser;
    /**
     * Three-letter ISO 4217 [currency](https://core.telegram.org/bots/payments#supported-currencies) code
     */
    currency: string;
    /**
     * Total price in the *smallest units* of the currency (integer, **not** float/double). For example, for a price of `US$ 1.45` pass `amount = 145`. See the *exp* parameter in [currencies.json](https://core.telegram.org/bots/payments/currencies.json), it shows the number of digits past the decimal point for each currency (2 for the majority of currencies).
     */
    total_amount: number;
    /**
     * Bot specified invoice payload
     */
    invoice_payload: string;
    /**
     * *Optional*. Identifier of the shipping option chosen by the user
     */
    shipping_option_id?: string;
    /**
     * *Optional*. Order information provided by the user
     */
    order_info?: TelegramOrderInfo;
}

/**
 * Describes Telegram Passport data shared with the bot by the user.
 *
 * {@link https://core.telegram.org/bots/api/#passportdata | [Documentation]}
 */
export interface TelegramPassportData {
    /**
     * Array with information about documents and other Telegram Passport elements that was shared with the bot
     */
    data: TelegramEncryptedPassportElement[];
    /**
     * Encrypted credentials required to decrypt the data
     */
    credentials: TelegramEncryptedCredentials;
}

/**
 * This object represents a file uploaded to Telegram Passport. Currently all Telegram Passport files are in JPEG format when decrypted and don't exceed 10MB.
 *
 * {@link https://core.telegram.org/bots/api/#passportfile | [Documentation]}
 */
export interface TelegramPassportFile {
    /**
     * Identifier for this file, which can be used to download or reuse the file
     */
    file_id: string;
    /**
     * Unique identifier for this file, which is supposed to be the same over time and for different bots. Can't be used to download or reuse the file.
     */
    file_unique_id: string;
    /**
     * File size in bytes
     */
    file_size: number;
    /**
     * Unix time when the file was uploaded
     */
    file_date: number;
}

export type TelegramEncryptedPassportElementType =
    | "personal_details"
    | "passport"
    | "driver_license"
    | "identity_card"
    | "internal_passport"
    | "address"
    | "utility_bill"
    | "bank_statement"
    | "rental_agreement"
    | "passport_registration"
    | "temporary_registration"
    | "phone_number"
    | "email";

/**
 * Describes documents or other Telegram Passport elements shared with the bot by the user.
 *
 * {@link https://core.telegram.org/bots/api/#encryptedpassportelement | [Documentation]}
 */
export interface TelegramEncryptedPassportElement {
    /**
     * Element type. One of “personal\_details”, “passport”, “driver\_license”, “identity\_card”, “internal\_passport”, “address”, “utility\_bill”, “bank\_statement”, “rental\_agreement”, “passport\_registration”, “temporary\_registration”, “phone\_number”, “email”.
     */
    type: TelegramEncryptedPassportElementType;
    /**
     * *Optional*. Base64-encoded encrypted Telegram Passport element data provided by the user, available for “personal\_details”, “passport”, “driver\_license”, “identity\_card”, “internal\_passport” and “address” types. Can be decrypted and verified using the accompanying [EncryptedCredentials](https://core.telegram.org/bots/api/#encryptedcredentials).
     */
    data?: string;
    /**
     * *Optional*. User's verified phone number, available only for “phone\_number” type
     */
    phone_number?: string;
    /**
     * *Optional*. User's verified email address, available only for “email” type
     */
    email?: string;
    /**
     * *Optional*. Array of encrypted files with documents provided by the user, available for “utility\_bill”, “bank\_statement”, “rental\_agreement”, “passport\_registration” and “temporary\_registration” types. Files can be decrypted and verified using the accompanying [EncryptedCredentials](https://core.telegram.org/bots/api/#encryptedcredentials).
     */
    files?: TelegramPassportFile[];
    /**
     * *Optional*. Encrypted file with the front side of the document, provided by the user. Available for “passport”, “driver\_license”, “identity\_card” and “internal\_passport”. The file can be decrypted and verified using the accompanying [EncryptedCredentials](https://core.telegram.org/bots/api/#encryptedcredentials).
     */
    front_side?: TelegramPassportFile;
    /**
     * *Optional*. Encrypted file with the reverse side of the document, provided by the user. Available for “driver\_license” and “identity\_card”. The file can be decrypted and verified using the accompanying [EncryptedCredentials](https://core.telegram.org/bots/api/#encryptedcredentials).
     */
    reverse_side?: TelegramPassportFile;
    /**
     * *Optional*. Encrypted file with the selfie of the user holding a document, provided by the user; available for “passport”, “driver\_license”, “identity\_card” and “internal\_passport”. The file can be decrypted and verified using the accompanying [EncryptedCredentials](https://core.telegram.org/bots/api/#encryptedcredentials).
     */
    selfie?: TelegramPassportFile;
    /**
     * *Optional*. Array of encrypted files with translated versions of documents provided by the user. Available if requested for “passport”, “driver\_license”, “identity\_card”, “internal\_passport”, “utility\_bill”, “bank\_statement”, “rental\_agreement”, “passport\_registration” and “temporary\_registration” types. Files can be decrypted and verified using the accompanying [EncryptedCredentials](https://core.telegram.org/bots/api/#encryptedcredentials).
     */
    translation?: TelegramPassportFile[];
    /**
     * Base64-encoded element hash for using in [PassportElementErrorUnspecified](https://core.telegram.org/bots/api/#passportelementerrorunspecified)
     */
    hash: string;
}

/**
 * Describes data required for decrypting and authenticating [EncryptedPassportElement](https://core.telegram.org/bots/api/#encryptedpassportelement). See the [Telegram Passport Documentation](https://core.telegram.org/passport#receiving-information) for a complete description of the data decryption and authentication processes.
 *
 * {@link https://core.telegram.org/bots/api/#encryptedcredentials | [Documentation]}
 */
export interface TelegramEncryptedCredentials {
    /**
     * Base64-encoded encrypted JSON-serialized data with unique user's payload, data hashes and secrets required for [EncryptedPassportElement](https://core.telegram.org/bots/api/#encryptedpassportelement) decryption and authentication
     */
    data: string;
    /**
     * Base64-encoded data hash for data authentication
     */
    hash: string;
    /**
     * Base64-encoded secret, encrypted with the bot's public RSA key, required for data decryption
     */
    secret: string;
}

/**
 * This object represents an error in the Telegram Passport element which was submitted that should be resolved by the user. It should be one of:
 *
 * * [PassportElementErrorDataField](https://core.telegram.org/bots/api/#passportelementerrordatafield)
 * * [PassportElementErrorFrontSide](https://core.telegram.org/bots/api/#passportelementerrorfrontside)
 * * [PassportElementErrorReverseSide](https://core.telegram.org/bots/api/#passportelementerrorreverseside)
 * * [PassportElementErrorSelfie](https://core.telegram.org/bots/api/#passportelementerrorselfie)
 * * [PassportElementErrorFile](https://core.telegram.org/bots/api/#passportelementerrorfile)
 * * [PassportElementErrorFiles](https://core.telegram.org/bots/api/#passportelementerrorfiles)
 * * [PassportElementErrorTranslationFile](https://core.telegram.org/bots/api/#passportelementerrortranslationfile)
 * * [PassportElementErrorTranslationFiles](https://core.telegram.org/bots/api/#passportelementerrortranslationfiles)
 * * [PassportElementErrorUnspecified](https://core.telegram.org/bots/api/#passportelementerrorunspecified)
 *
 * {@link https://core.telegram.org/bots/api/#passportelementerror | [Documentation]}
 */
export interface TelegramPassportElementError {}

export type TelegramPassportElementErrorDataFieldType =
    | "personal_details"
    | "passport"
    | "driver_license"
    | "identity_card"
    | "internal_passport"
    | "address";

/**
 * Represents an issue in one of the data fields that was provided by the user. The error is considered resolved when the field's value changes.
 *
 * {@link https://core.telegram.org/bots/api/#passportelementerrordatafield | [Documentation]}
 */
export interface TelegramPassportElementErrorDataField {
    /**
     * Error source, must be *data*
     */
    source: string;
    /**
     * The section of the user's Telegram Passport which has the error, one of “personal\_details”, “passport”, “driver\_license”, “identity\_card”, “internal\_passport”, “address”
     */
    type: TelegramPassportElementErrorDataFieldType;
    /**
     * Name of the data field which has the error
     */
    field_name: string;
    /**
     * Base64-encoded data hash
     */
    data_hash: string;
    /**
     * Error message
     */
    message: string;
}

export type TelegramPassportElementErrorFrontSideType =
    | "passport"
    | "driver_license"
    | "identity_card"
    | "internal_passport";

/**
 * Represents an issue with the front side of a document. The error is considered resolved when the file with the front side of the document changes.
 *
 * {@link https://core.telegram.org/bots/api/#passportelementerrorfrontside | [Documentation]}
 */
export interface TelegramPassportElementErrorFrontSide {
    /**
     * Error source, must be *front\_side*
     */
    source: string;
    /**
     * The section of the user's Telegram Passport which has the issue, one of “passport”, “driver\_license”, “identity\_card”, “internal\_passport”
     */
    type: TelegramPassportElementErrorFrontSideType;
    /**
     * Base64-encoded hash of the file with the front side of the document
     */
    file_hash: string;
    /**
     * Error message
     */
    message: string;
}

export type TelegramPassportElementErrorReverseSideType =
    | "driver_license"
    | "identity_card";

/**
 * Represents an issue with the reverse side of a document. The error is considered resolved when the file with reverse side of the document changes.
 *
 * {@link https://core.telegram.org/bots/api/#passportelementerrorreverseside | [Documentation]}
 */
export interface TelegramPassportElementErrorReverseSide {
    /**
     * Error source, must be *reverse\_side*
     */
    source: string;
    /**
     * The section of the user's Telegram Passport which has the issue, one of “driver\_license”, “identity\_card”
     */
    type: TelegramPassportElementErrorReverseSideType;
    /**
     * Base64-encoded hash of the file with the reverse side of the document
     */
    file_hash: string;
    /**
     * Error message
     */
    message: string;
}

export type TelegramPassportElementErrorSelfieType =
    | "passport"
    | "driver_license"
    | "identity_card"
    | "internal_passport";

/**
 * Represents an issue with the selfie with a document. The error is considered resolved when the file with the selfie changes.
 *
 * {@link https://core.telegram.org/bots/api/#passportelementerrorselfie | [Documentation]}
 */
export interface TelegramPassportElementErrorSelfie {
    /**
     * Error source, must be *selfie*
     */
    source: string;
    /**
     * The section of the user's Telegram Passport which has the issue, one of “passport”, “driver\_license”, “identity\_card”, “internal\_passport”
     */
    type: TelegramPassportElementErrorSelfieType;
    /**
     * Base64-encoded hash of the file with the selfie
     */
    file_hash: string;
    /**
     * Error message
     */
    message: string;
}

export type TelegramPassportElementErrorFileType =
    | "utility_bill"
    | "bank_statement"
    | "rental_agreement"
    | "passport_registration"
    | "temporary_registration";

/**
 * Represents an issue with a document scan. The error is considered resolved when the file with the document scan changes.
 *
 * {@link https://core.telegram.org/bots/api/#passportelementerrorfile | [Documentation]}
 */
export interface TelegramPassportElementErrorFile {
    /**
     * Error source, must be *file*
     */
    source: string;
    /**
     * The section of the user's Telegram Passport which has the issue, one of “utility\_bill”, “bank\_statement”, “rental\_agreement”, “passport\_registration”, “temporary\_registration”
     */
    type: TelegramPassportElementErrorFileType;
    /**
     * Base64-encoded file hash
     */
    file_hash: string;
    /**
     * Error message
     */
    message: string;
}

export type TelegramPassportElementErrorFilesType =
    | "utility_bill"
    | "bank_statement"
    | "rental_agreement"
    | "passport_registration"
    | "temporary_registration";

/**
 * Represents an issue with a list of scans. The error is considered resolved when the list of files containing the scans changes.
 *
 * {@link https://core.telegram.org/bots/api/#passportelementerrorfiles | [Documentation]}
 */
export interface TelegramPassportElementErrorFiles {
    /**
     * Error source, must be *files*
     */
    source: string;
    /**
     * The section of the user's Telegram Passport which has the issue, one of “utility\_bill”, “bank\_statement”, “rental\_agreement”, “passport\_registration”, “temporary\_registration”
     */
    type: TelegramPassportElementErrorFilesType;
    /**
     * List of base64-encoded file hashes
     */
    file_hashes: string[];
    /**
     * Error message
     */
    message: string;
}

export type TelegramPassportElementErrorTranslationFileType =
    | "passport"
    | "driver_license"
    | "identity_card"
    | "internal_passport"
    | "utility_bill"
    | "bank_statement"
    | "rental_agreement"
    | "passport_registration"
    | "temporary_registration";

/**
 * Represents an issue with one of the files that constitute the translation of a document. The error is considered resolved when the file changes.
 *
 * {@link https://core.telegram.org/bots/api/#passportelementerrortranslationfile | [Documentation]}
 */
export interface TelegramPassportElementErrorTranslationFile {
    /**
     * Error source, must be *translation\_file*
     */
    source: string;
    /**
     * Type of element of the user's Telegram Passport which has the issue, one of “passport”, “driver\_license”, “identity\_card”, “internal\_passport”, “utility\_bill”, “bank\_statement”, “rental\_agreement”, “passport\_registration”, “temporary\_registration”
     */
    type: TelegramPassportElementErrorTranslationFileType;
    /**
     * Base64-encoded file hash
     */
    file_hash: string;
    /**
     * Error message
     */
    message: string;
}

export type TelegramPassportElementErrorTranslationFilesType =
    | "passport"
    | "driver_license"
    | "identity_card"
    | "internal_passport"
    | "utility_bill"
    | "bank_statement"
    | "rental_agreement"
    | "passport_registration"
    | "temporary_registration";

/**
 * Represents an issue with the translated version of a document. The error is considered resolved when a file with the document translation change.
 *
 * {@link https://core.telegram.org/bots/api/#passportelementerrortranslationfiles | [Documentation]}
 */
export interface TelegramPassportElementErrorTranslationFiles {
    /**
     * Error source, must be *translation\_files*
     */
    source: string;
    /**
     * Type of element of the user's Telegram Passport which has the issue, one of “passport”, “driver\_license”, “identity\_card”, “internal\_passport”, “utility\_bill”, “bank\_statement”, “rental\_agreement”, “passport\_registration”, “temporary\_registration”
     */
    type: TelegramPassportElementErrorTranslationFilesType;
    /**
     * List of base64-encoded file hashes
     */
    file_hashes: string[];
    /**
     * Error message
     */
    message: string;
}

/**
 * Represents an issue in an unspecified place. The error is considered resolved when new data is added.
 *
 * {@link https://core.telegram.org/bots/api/#passportelementerrorunspecified | [Documentation]}
 */
export interface TelegramPassportElementErrorUnspecified {
    /**
     * Error source, must be *unspecified*
     */
    source: string;
    /**
     * Type of element of the user's Telegram Passport which has the issue
     */
    type: string;
    /**
     * Base64-encoded element hash
     */
    element_hash: string;
    /**
     * Error message
     */
    message: string;
}

/**
 * This object represents a game. Use BotFather to create and edit games, their short names will act as unique identifiers.
 *
 * {@link https://core.telegram.org/bots/api/#game | [Documentation]}
 */
export interface TelegramGame {
    /**
     * Title of the game
     */
    title: string;
    /**
     * Description of the game
     */
    description: string;
    /**
     * Photo that will be displayed in the game message in chats.
     */
    photo: TelegramPhotoSize[];
    /**
     * *Optional*. Brief description of the game or high scores included in the game message. Can be automatically edited to include current high scores for the game when the bot calls [setGameScore](https://core.telegram.org/bots/api/#setgamescore), or manually edited using [editMessageText](https://core.telegram.org/bots/api/#editmessagetext). 0-4096 characters.
     */
    text?: string;
    /**
     * *Optional*. Special entities that appear in *text*, such as usernames, URLs, bot commands, etc.
     */
    text_entities?: TelegramMessageEntity[];
    /**
     * *Optional*. Animation that will be displayed in the game message in chats. Upload via [BotFather](https://t.me/botfather)
     */
    animation?: TelegramAnimation;
}

/**
 * A placeholder, currently holds no information. Use [BotFather](https://t.me/botfather) to set up your game.
 *
 * {@link https://core.telegram.org/bots/api/#callbackgame | [Documentation]}
 */
export interface TelegramCallbackGame {}

/**
 * This object represents one row of the high scores table for a game.
 *
 * {@link https://core.telegram.org/bots/api/#gamehighscore | [Documentation]}
 */
export interface TelegramGameHighScore {
    /**
     * Position in high score table for the game
     */
    position: number;
    /**
     * User
     */
    user: TelegramUser;
    /**
     * Score
     */
    score: number;
}
