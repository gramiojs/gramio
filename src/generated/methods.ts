// Based on Bot Api v6.9.0
import * as Objects from "./objects";

export interface GetUpdatesParams {
    /**
     * Identifier of the first update to be returned. Must be greater by one than the highest among the identifiers of previously received updates. By default, updates starting with the earliest unconfirmed update are returned. An update is considered confirmed as soon as [getUpdates](https://core.telegram.org/bots/api/#getupdates) is called with an *offset* higher than its *update\_id*. The negative offset can be specified to retrieve updates starting from *-offset* update from the end of the updates queue. All previous updates will be forgotten.
     */
    offset?: number;
    /**
     * Limits the number of updates to be retrieved. Values between 1-100 are accepted. Defaults to 100.
     */
    limit?: number;
    /**
     * Timeout in seconds for long polling. Defaults to 0, i.e. usual short polling. Should be positive, short polling should be used for testing purposes only.
     */
    timeout?: number;
    /**
     * A JSON-serialized list of the update types you want your bot to receive. For example, specify `["message", "edited_channel_post", "callback_query"]` to only receive updates of these types. See [Update](https://core.telegram.org/bots/api/#update) for a complete list of available update types. Specify an empty list to receive all update types except *chat\_member* (default). If not specified, the previous setting will be used.
     *
     * Please note that this parameter doesn't affect updates created before the call to the getUpdates, so unwanted updates may be received for a short period of time.
     */
    allowed_updates?: string[];
}

/**
 * Use this method to receive incoming updates using long polling ([wiki](https://en.wikipedia.org/wiki/Push_technology#Long_polling)). Returns an Array of [Update](https://core.telegram.org/bots/api/#update) objects.
 *
 * {@link https://core.telegram.org/bots/api/#getupdates | [Documentation]}
 */
export type GetUpdates = (
    params: GetUpdatesParams,
) => Promise<Objects.TelegramUpdate[]>;

export interface SetWebhookParams {
    /**
     * HTTPS URL to send updates to. Use an empty string to remove webhook integration
     */
    url: string;
    /**
     * Upload your public key certificate so that the root certificate in use can be checked. See our [self-signed guide](https://core.telegram.org/bots/self-signed) for details.
     */
    certificate?: Objects.TelegramInputFile;
    /**
     * The fixed IP address which will be used to send webhook requests instead of the IP address resolved through DNS
     */
    ip_address?: string;
    /**
     * The maximum allowed number of simultaneous HTTPS connections to the webhook for update delivery, 1-100. Defaults to *40*. Use lower values to limit the load on your bot's server, and higher values to increase your bot's throughput.
     */
    max_connections?: number;
    /**
     * A JSON-serialized list of the update types you want your bot to receive. For example, specify `["message", "edited_channel_post", "callback_query"]` to only receive updates of these types. See [Update](https://core.telegram.org/bots/api/#update) for a complete list of available update types. Specify an empty list to receive all update types except *chat\_member* (default). If not specified, the previous setting will be used.
     * Please note that this parameter doesn't affect updates created before the call to the setWebhook, so unwanted updates may be received for a short period of time.
     */
    allowed_updates?: string[];
    /**
     * Pass *True* to drop all pending updates
     */
    drop_pending_updates?: boolean;
    /**
     * A secret token to be sent in a header “X-Telegram-Bot-Api-Secret-Token” in every webhook request, 1-256 characters. Only characters `A-Z`, `a-z`, `0-9`, `_` and `-` are allowed. The header is useful to ensure that the request comes from a webhook set by you.
     */
    secret_token?: string;
}

/**
 * Use this method to specify a URL and receive incoming updates via an outgoing webhook. Whenever there is an update for the bot, we will send an HTTPS POST request to the specified URL, containing a JSON-serialized [Update](https://core.telegram.org/bots/api/#update). In case of an unsuccessful request, we will give up after a reasonable amount of attempts. Returns *True* on success.
 *
 * If you'd like to make sure that the webhook was set by you, you can specify secret data in the parameter *secret\_token*. If specified, the request will contain a header “X-Telegram-Bot-Api-Secret-Token” with the secret token as content.
 *
 * {@link https://core.telegram.org/bots/api/#setwebhook | [Documentation]}
 */
export type SetWebhook = (params: SetWebhookParams) => Promise<boolean>;

export interface DeleteWebhookParams {
    /**
     * Pass *True* to drop all pending updates
     */
    drop_pending_updates?: boolean;
}

/**
 * Use this method to remove webhook integration if you decide to switch back to [getUpdates](https://core.telegram.org/bots/api/#getupdates). Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#deletewebhook | [Documentation]}
 */
export type DeleteWebhook = (params: DeleteWebhookParams) => Promise<boolean>;

export type GetWebhookInfo = () => Promise<Objects.TelegramWebhookInfo>;
export type GetMe = () => Promise<Objects.TelegramUser>;
export type LogOut = () => Promise<boolean>;
export type Close = () => Promise<boolean>;

export interface SendMessageParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     */
    message_thread_id?: number;
    /**
     * Text of the message to be sent, 1-4096 characters after entities parsing
     */
    text: string;
    /**
     * Mode for parsing entities in the message text. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * A JSON-serialized list of special entities that appear in message text, which can be specified instead of *parse\_mode*
     */
    entities?: Objects.TelegramMessageEntity[];
    /**
     * Disables link previews for links in this message
     */
    disable_web_page_preview?: boolean;
    /**
     * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages). Users will receive a notification with no sound.
     */
    disable_notification?: boolean;
    /**
     * Protects the contents of the sent message from forwarding and saving
     */
    protect_content?: boolean;
    /**
     * If the message is a reply, ID of the original message
     */
    reply_to_message_id?: number;
    /**
     * Pass *True* if the message should be sent even if the specified replied-to message is not found
     */
    allow_sending_without_reply?: boolean;
    /**
     * Additional interface options. A JSON-serialized object for an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards), [custom reply keyboard](https://core.telegram.org/bots/features#keyboards), instructions to remove reply keyboard or to force a reply from the user.
     */
    reply_markup?:
        | Objects.TelegramInlineKeyboardMarkup
        | Objects.TelegramReplyKeyboardMarkup
        | Objects.TelegramReplyKeyboardRemove
        | Objects.TelegramForceReply;
}

/**
 * Use this method to send text messages. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
 *
 * {@link https://core.telegram.org/bots/api/#sendmessage | [Documentation]}
 */
export type SendMessage = (
    params: SendMessageParams,
) => Promise<Objects.TelegramMessage>;

export interface ForwardMessageParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     */
    message_thread_id?: number;
    /**
     * Unique identifier for the chat where the original message was sent (or channel username in the format `@channelusername`)
     */
    from_chat_id: number | string;
    /**
     * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages). Users will receive a notification with no sound.
     */
    disable_notification?: boolean;
    /**
     * Protects the contents of the forwarded message from forwarding and saving
     */
    protect_content?: boolean;
    /**
     * Message identifier in the chat specified in *from\_chat\_id*
     */
    message_id: number;
}

/**
 * Use this method to forward messages of any kind. Service messages can't be forwarded. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
 *
 * {@link https://core.telegram.org/bots/api/#forwardmessage | [Documentation]}
 */
export type ForwardMessage = (
    params: ForwardMessageParams,
) => Promise<Objects.TelegramMessage>;

export interface CopyMessageParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     */
    message_thread_id?: number;
    /**
     * Unique identifier for the chat where the original message was sent (or channel username in the format `@channelusername`)
     */
    from_chat_id: number | string;
    /**
     * Message identifier in the chat specified in *from\_chat\_id*
     */
    message_id: number;
    /**
     * New caption for media, 0-1024 characters after entities parsing. If not specified, the original caption is kept
     */
    caption?: string;
    /**
     * Mode for parsing entities in the new caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * A JSON-serialized list of special entities that appear in the new caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: Objects.TelegramMessageEntity[];
    /**
     * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages). Users will receive a notification with no sound.
     */
    disable_notification?: boolean;
    /**
     * Protects the contents of the sent message from forwarding and saving
     */
    protect_content?: boolean;
    /**
     * If the message is a reply, ID of the original message
     */
    reply_to_message_id?: number;
    /**
     * Pass *True* if the message should be sent even if the specified replied-to message is not found
     */
    allow_sending_without_reply?: boolean;
    /**
     * Additional interface options. A JSON-serialized object for an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards), [custom reply keyboard](https://core.telegram.org/bots/features#keyboards), instructions to remove reply keyboard or to force a reply from the user.
     */
    reply_markup?:
        | Objects.TelegramInlineKeyboardMarkup
        | Objects.TelegramReplyKeyboardMarkup
        | Objects.TelegramReplyKeyboardRemove
        | Objects.TelegramForceReply;
}

/**
 * Use this method to copy messages of any kind. Service messages and invoice messages can't be copied. A quiz [poll](https://core.telegram.org/bots/api/#poll) can be copied only if the value of the field *correct\_option\_id* is known to the bot. The method is analogous to the method [forwardMessage](https://core.telegram.org/bots/api/#forwardmessage), but the copied message doesn't have a link to the original message. Returns the [MessageId](https://core.telegram.org/bots/api/#messageid) of the sent message on success.
 *
 * {@link https://core.telegram.org/bots/api/#copymessage | [Documentation]}
 */
export type CopyMessage = (
    params: CopyMessageParams,
) => Promise<Objects.TelegramMessageId>;

export interface SendPhotoParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     */
    message_thread_id?: number;
    /**
     * Photo to send. Pass a file\_id as String to send a photo that exists on the Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get a photo from the Internet, or upload a new photo using multipart/form-data. The photo must be at most 10 MB in size. The photo's width and height must not exceed 10000 in total. Width and height ratio must be at most 20. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    photo: Objects.TelegramInputFile | string;
    /**
     * Photo caption (may also be used when resending photos by *file\_id*), 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * Mode for parsing entities in the photo caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * A JSON-serialized list of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: Objects.TelegramMessageEntity[];
    /**
     * Pass *True* if the photo needs to be covered with a spoiler animation
     */
    has_spoiler?: boolean;
    /**
     * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages). Users will receive a notification with no sound.
     */
    disable_notification?: boolean;
    /**
     * Protects the contents of the sent message from forwarding and saving
     */
    protect_content?: boolean;
    /**
     * If the message is a reply, ID of the original message
     */
    reply_to_message_id?: number;
    /**
     * Pass *True* if the message should be sent even if the specified replied-to message is not found
     */
    allow_sending_without_reply?: boolean;
    /**
     * Additional interface options. A JSON-serialized object for an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards), [custom reply keyboard](https://core.telegram.org/bots/features#keyboards), instructions to remove reply keyboard or to force a reply from the user.
     */
    reply_markup?:
        | Objects.TelegramInlineKeyboardMarkup
        | Objects.TelegramReplyKeyboardMarkup
        | Objects.TelegramReplyKeyboardRemove
        | Objects.TelegramForceReply;
}

/**
 * Use this method to send photos. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
 *
 * {@link https://core.telegram.org/bots/api/#sendphoto | [Documentation]}
 */
export type SendPhoto = (
    params: SendPhotoParams,
) => Promise<Objects.TelegramMessage>;

export interface SendAudioParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     */
    message_thread_id?: number;
    /**
     * Audio file to send. Pass a file\_id as String to send an audio file that exists on the Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get an audio file from the Internet, or upload a new one using multipart/form-data. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    audio: Objects.TelegramInputFile | string;
    /**
     * Audio caption, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * Mode for parsing entities in the audio caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * A JSON-serialized list of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: Objects.TelegramMessageEntity[];
    /**
     * Duration of the audio in seconds
     */
    duration?: number;
    /**
     * Performer
     */
    performer?: string;
    /**
     * Track name
     */
    title?: string;
    /**
     * Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side. The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320. Ignored if the file is not uploaded using multipart/form-data. Thumbnails can't be reused and can be only uploaded as a new file, so you can pass “attach://\<file\_attach\_name\>” if the thumbnail was uploaded using multipart/form-data under \<file\_attach\_name\>. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    thumbnail?: Objects.TelegramInputFile | string;
    /**
     * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages). Users will receive a notification with no sound.
     */
    disable_notification?: boolean;
    /**
     * Protects the contents of the sent message from forwarding and saving
     */
    protect_content?: boolean;
    /**
     * If the message is a reply, ID of the original message
     */
    reply_to_message_id?: number;
    /**
     * Pass *True* if the message should be sent even if the specified replied-to message is not found
     */
    allow_sending_without_reply?: boolean;
    /**
     * Additional interface options. A JSON-serialized object for an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards), [custom reply keyboard](https://core.telegram.org/bots/features#keyboards), instructions to remove reply keyboard or to force a reply from the user.
     */
    reply_markup?:
        | Objects.TelegramInlineKeyboardMarkup
        | Objects.TelegramReplyKeyboardMarkup
        | Objects.TelegramReplyKeyboardRemove
        | Objects.TelegramForceReply;
}

/**
 * Use this method to send audio files, if you want Telegram clients to display them in the music player. Your audio must be in the .MP3 or .M4A format. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned. Bots can currently send audio files of up to 50 MB in size, this limit may be changed in the future.
 *
 * For sending voice messages, use the [sendVoice](https://core.telegram.org/bots/api/#sendvoice) method instead.
 *
 * {@link https://core.telegram.org/bots/api/#sendaudio | [Documentation]}
 */
export type SendAudio = (
    params: SendAudioParams,
) => Promise<Objects.TelegramMessage>;

export interface SendDocumentParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     */
    message_thread_id?: number;
    /**
     * File to send. Pass a file\_id as String to send a file that exists on the Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get a file from the Internet, or upload a new one using multipart/form-data. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    document: Objects.TelegramInputFile | string;
    /**
     * Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side. The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320. Ignored if the file is not uploaded using multipart/form-data. Thumbnails can't be reused and can be only uploaded as a new file, so you can pass “attach://\<file\_attach\_name\>” if the thumbnail was uploaded using multipart/form-data under \<file\_attach\_name\>. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    thumbnail?: Objects.TelegramInputFile | string;
    /**
     * Document caption (may also be used when resending documents by *file\_id*), 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * Mode for parsing entities in the document caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * A JSON-serialized list of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: Objects.TelegramMessageEntity[];
    /**
     * Disables automatic server-side content type detection for files uploaded using multipart/form-data
     */
    disable_content_type_detection?: boolean;
    /**
     * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages). Users will receive a notification with no sound.
     */
    disable_notification?: boolean;
    /**
     * Protects the contents of the sent message from forwarding and saving
     */
    protect_content?: boolean;
    /**
     * If the message is a reply, ID of the original message
     */
    reply_to_message_id?: number;
    /**
     * Pass *True* if the message should be sent even if the specified replied-to message is not found
     */
    allow_sending_without_reply?: boolean;
    /**
     * Additional interface options. A JSON-serialized object for an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards), [custom reply keyboard](https://core.telegram.org/bots/features#keyboards), instructions to remove reply keyboard or to force a reply from the user.
     */
    reply_markup?:
        | Objects.TelegramInlineKeyboardMarkup
        | Objects.TelegramReplyKeyboardMarkup
        | Objects.TelegramReplyKeyboardRemove
        | Objects.TelegramForceReply;
}

/**
 * Use this method to send general files. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned. Bots can currently send files of any type of up to 50 MB in size, this limit may be changed in the future.
 *
 * {@link https://core.telegram.org/bots/api/#senddocument | [Documentation]}
 */
export type SendDocument = (
    params: SendDocumentParams,
) => Promise<Objects.TelegramMessage>;

export interface SendVideoParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     */
    message_thread_id?: number;
    /**
     * Video to send. Pass a file\_id as String to send a video that exists on the Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get a video from the Internet, or upload a new video using multipart/form-data. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    video: Objects.TelegramInputFile | string;
    /**
     * Duration of sent video in seconds
     */
    duration?: number;
    /**
     * Video width
     */
    width?: number;
    /**
     * Video height
     */
    height?: number;
    /**
     * Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side. The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320. Ignored if the file is not uploaded using multipart/form-data. Thumbnails can't be reused and can be only uploaded as a new file, so you can pass “attach://\<file\_attach\_name\>” if the thumbnail was uploaded using multipart/form-data under \<file\_attach\_name\>. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    thumbnail?: Objects.TelegramInputFile | string;
    /**
     * Video caption (may also be used when resending videos by *file\_id*), 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * Mode for parsing entities in the video caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * A JSON-serialized list of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: Objects.TelegramMessageEntity[];
    /**
     * Pass *True* if the video needs to be covered with a spoiler animation
     */
    has_spoiler?: boolean;
    /**
     * Pass *True* if the uploaded video is suitable for streaming
     */
    supports_streaming?: boolean;
    /**
     * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages). Users will receive a notification with no sound.
     */
    disable_notification?: boolean;
    /**
     * Protects the contents of the sent message from forwarding and saving
     */
    protect_content?: boolean;
    /**
     * If the message is a reply, ID of the original message
     */
    reply_to_message_id?: number;
    /**
     * Pass *True* if the message should be sent even if the specified replied-to message is not found
     */
    allow_sending_without_reply?: boolean;
    /**
     * Additional interface options. A JSON-serialized object for an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards), [custom reply keyboard](https://core.telegram.org/bots/features#keyboards), instructions to remove reply keyboard or to force a reply from the user.
     */
    reply_markup?:
        | Objects.TelegramInlineKeyboardMarkup
        | Objects.TelegramReplyKeyboardMarkup
        | Objects.TelegramReplyKeyboardRemove
        | Objects.TelegramForceReply;
}

/**
 * Use this method to send video files, Telegram clients support MPEG4 videos (other formats may be sent as [Document](https://core.telegram.org/bots/api/#document)). On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned. Bots can currently send video files of up to 50 MB in size, this limit may be changed in the future.
 *
 * {@link https://core.telegram.org/bots/api/#sendvideo | [Documentation]}
 */
export type SendVideo = (
    params: SendVideoParams,
) => Promise<Objects.TelegramMessage>;

export interface SendAnimationParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     */
    message_thread_id?: number;
    /**
     * Animation to send. Pass a file\_id as String to send an animation that exists on the Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get an animation from the Internet, or upload a new animation using multipart/form-data. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    animation: Objects.TelegramInputFile | string;
    /**
     * Duration of sent animation in seconds
     */
    duration?: number;
    /**
     * Animation width
     */
    width?: number;
    /**
     * Animation height
     */
    height?: number;
    /**
     * Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side. The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320. Ignored if the file is not uploaded using multipart/form-data. Thumbnails can't be reused and can be only uploaded as a new file, so you can pass “attach://\<file\_attach\_name\>” if the thumbnail was uploaded using multipart/form-data under \<file\_attach\_name\>. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    thumbnail?: Objects.TelegramInputFile | string;
    /**
     * Animation caption (may also be used when resending animation by *file\_id*), 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * Mode for parsing entities in the animation caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * A JSON-serialized list of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: Objects.TelegramMessageEntity[];
    /**
     * Pass *True* if the animation needs to be covered with a spoiler animation
     */
    has_spoiler?: boolean;
    /**
     * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages). Users will receive a notification with no sound.
     */
    disable_notification?: boolean;
    /**
     * Protects the contents of the sent message from forwarding and saving
     */
    protect_content?: boolean;
    /**
     * If the message is a reply, ID of the original message
     */
    reply_to_message_id?: number;
    /**
     * Pass *True* if the message should be sent even if the specified replied-to message is not found
     */
    allow_sending_without_reply?: boolean;
    /**
     * Additional interface options. A JSON-serialized object for an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards), [custom reply keyboard](https://core.telegram.org/bots/features#keyboards), instructions to remove reply keyboard or to force a reply from the user.
     */
    reply_markup?:
        | Objects.TelegramInlineKeyboardMarkup
        | Objects.TelegramReplyKeyboardMarkup
        | Objects.TelegramReplyKeyboardRemove
        | Objects.TelegramForceReply;
}

/**
 * Use this method to send animation files (GIF or H.264/MPEG-4 AVC video without sound). On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned. Bots can currently send animation files of up to 50 MB in size, this limit may be changed in the future.
 *
 * {@link https://core.telegram.org/bots/api/#sendanimation | [Documentation]}
 */
export type SendAnimation = (
    params: SendAnimationParams,
) => Promise<Objects.TelegramMessage>;

export interface SendVoiceParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     */
    message_thread_id?: number;
    /**
     * Audio file to send. Pass a file\_id as String to send a file that exists on the Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get a file from the Internet, or upload a new one using multipart/form-data. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    voice: Objects.TelegramInputFile | string;
    /**
     * Voice message caption, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * Mode for parsing entities in the voice message caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * A JSON-serialized list of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: Objects.TelegramMessageEntity[];
    /**
     * Duration of the voice message in seconds
     */
    duration?: number;
    /**
     * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages). Users will receive a notification with no sound.
     */
    disable_notification?: boolean;
    /**
     * Protects the contents of the sent message from forwarding and saving
     */
    protect_content?: boolean;
    /**
     * If the message is a reply, ID of the original message
     */
    reply_to_message_id?: number;
    /**
     * Pass *True* if the message should be sent even if the specified replied-to message is not found
     */
    allow_sending_without_reply?: boolean;
    /**
     * Additional interface options. A JSON-serialized object for an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards), [custom reply keyboard](https://core.telegram.org/bots/features#keyboards), instructions to remove reply keyboard or to force a reply from the user.
     */
    reply_markup?:
        | Objects.TelegramInlineKeyboardMarkup
        | Objects.TelegramReplyKeyboardMarkup
        | Objects.TelegramReplyKeyboardRemove
        | Objects.TelegramForceReply;
}

/**
 * Use this method to send audio files, if you want Telegram clients to display the file as a playable voice message. For this to work, your audio must be in an .OGG file encoded with OPUS (other formats may be sent as [Audio](https://core.telegram.org/bots/api/#audio) or [Document](https://core.telegram.org/bots/api/#document)). On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned. Bots can currently send voice messages of up to 50 MB in size, this limit may be changed in the future.
 *
 * {@link https://core.telegram.org/bots/api/#sendvoice | [Documentation]}
 */
export type SendVoice = (
    params: SendVoiceParams,
) => Promise<Objects.TelegramMessage>;

export interface SendVideoNoteParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     */
    message_thread_id?: number;
    /**
     * Video note to send. Pass a file\_id as String to send a video note that exists on the Telegram servers (recommended) or upload a new video using multipart/form-data. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files). Sending video notes by a URL is currently unsupported
     */
    video_note: Objects.TelegramInputFile | string;
    /**
     * Duration of sent video in seconds
     */
    duration?: number;
    /**
     * Video width and height, i.e. diameter of the video message
     */
    length?: number;
    /**
     * Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side. The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320. Ignored if the file is not uploaded using multipart/form-data. Thumbnails can't be reused and can be only uploaded as a new file, so you can pass “attach://\<file\_attach\_name\>” if the thumbnail was uploaded using multipart/form-data under \<file\_attach\_name\>. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    thumbnail?: Objects.TelegramInputFile | string;
    /**
     * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages). Users will receive a notification with no sound.
     */
    disable_notification?: boolean;
    /**
     * Protects the contents of the sent message from forwarding and saving
     */
    protect_content?: boolean;
    /**
     * If the message is a reply, ID of the original message
     */
    reply_to_message_id?: number;
    /**
     * Pass *True* if the message should be sent even if the specified replied-to message is not found
     */
    allow_sending_without_reply?: boolean;
    /**
     * Additional interface options. A JSON-serialized object for an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards), [custom reply keyboard](https://core.telegram.org/bots/features#keyboards), instructions to remove reply keyboard or to force a reply from the user.
     */
    reply_markup?:
        | Objects.TelegramInlineKeyboardMarkup
        | Objects.TelegramReplyKeyboardMarkup
        | Objects.TelegramReplyKeyboardRemove
        | Objects.TelegramForceReply;
}

/**
 * As of [v.4.0](https://telegram.org/blog/video-messages-and-telescope), Telegram clients support rounded square MPEG4 videos of up to 1 minute long. Use this method to send video messages. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
 *
 * {@link https://core.telegram.org/bots/api/#sendvideonote | [Documentation]}
 */
export type SendVideoNote = (
    params: SendVideoNoteParams,
) => Promise<Objects.TelegramMessage>;

export interface SendMediaGroupParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     */
    message_thread_id?: number;
    /**
     * A JSON-serialized array describing messages to be sent, must include 2-10 items
     */
    media:
        | Objects.TelegramInputMediaAudio
        | Objects.TelegramInputMediaDocument
        | Objects.TelegramInputMediaPhoto
        | Objects.TelegramInputMediaVideo[];
    /**
     * Sends messages [silently](https://telegram.org/blog/channels-2-0#silent-messages). Users will receive a notification with no sound.
     */
    disable_notification?: boolean;
    /**
     * Protects the contents of the sent messages from forwarding and saving
     */
    protect_content?: boolean;
    /**
     * If the messages are a reply, ID of the original message
     */
    reply_to_message_id?: number;
    /**
     * Pass *True* if the message should be sent even if the specified replied-to message is not found
     */
    allow_sending_without_reply?: boolean;
}

/**
 * Use this method to send a group of photos, videos, documents or audios as an album. Documents and audio files can be only grouped in an album with messages of the same type. On success, an array of [Messages](https://core.telegram.org/bots/api/#message) that were sent is returned.
 *
 * {@link https://core.telegram.org/bots/api/#sendmediagroup | [Documentation]}
 */
export type SendMediaGroup = (
    params: SendMediaGroupParams,
) => Promise<Objects.TelegramMessage[]>;

export interface SendLocationParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     */
    message_thread_id?: number;
    /**
     * Latitude of the location
     */
    latitude: number;
    /**
     * Longitude of the location
     */
    longitude: number;
    /**
     * The radius of uncertainty for the location, measured in meters; 0-1500
     */
    horizontal_accuracy?: number;
    /**
     * Period in seconds for which the location will be updated (see [Live Locations](https://telegram.org/blog/live-locations), should be between 60 and 86400.
     */
    live_period?: number;
    /**
     * For live locations, a direction in which the user is moving, in degrees. Must be between 1 and 360 if specified.
     */
    heading?: number;
    /**
     * For live locations, a maximum distance for proximity alerts about approaching another chat member, in meters. Must be between 1 and 100000 if specified.
     */
    proximity_alert_radius?: number;
    /**
     * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages). Users will receive a notification with no sound.
     */
    disable_notification?: boolean;
    /**
     * Protects the contents of the sent message from forwarding and saving
     */
    protect_content?: boolean;
    /**
     * If the message is a reply, ID of the original message
     */
    reply_to_message_id?: number;
    /**
     * Pass *True* if the message should be sent even if the specified replied-to message is not found
     */
    allow_sending_without_reply?: boolean;
    /**
     * Additional interface options. A JSON-serialized object for an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards), [custom reply keyboard](https://core.telegram.org/bots/features#keyboards), instructions to remove reply keyboard or to force a reply from the user.
     */
    reply_markup?:
        | Objects.TelegramInlineKeyboardMarkup
        | Objects.TelegramReplyKeyboardMarkup
        | Objects.TelegramReplyKeyboardRemove
        | Objects.TelegramForceReply;
}

/**
 * Use this method to send point on the map. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
 *
 * {@link https://core.telegram.org/bots/api/#sendlocation | [Documentation]}
 */
export type SendLocation = (
    params: SendLocationParams,
) => Promise<Objects.TelegramMessage>;

export interface SendVenueParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     */
    message_thread_id?: number;
    /**
     * Latitude of the venue
     */
    latitude: number;
    /**
     * Longitude of the venue
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
     * Foursquare identifier of the venue
     */
    foursquare_id?: string;
    /**
     * Foursquare type of the venue, if known. (For example, “arts\_entertainment/default”, “arts\_entertainment/aquarium” or “food/icecream”.)
     */
    foursquare_type?: string;
    /**
     * Google Places identifier of the venue
     */
    google_place_id?: string;
    /**
     * Google Places type of the venue. (See [supported types](https://developers.google.com/places/web-service/supported_types).)
     */
    google_place_type?: string;
    /**
     * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages). Users will receive a notification with no sound.
     */
    disable_notification?: boolean;
    /**
     * Protects the contents of the sent message from forwarding and saving
     */
    protect_content?: boolean;
    /**
     * If the message is a reply, ID of the original message
     */
    reply_to_message_id?: number;
    /**
     * Pass *True* if the message should be sent even if the specified replied-to message is not found
     */
    allow_sending_without_reply?: boolean;
    /**
     * Additional interface options. A JSON-serialized object for an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards), [custom reply keyboard](https://core.telegram.org/bots/features#keyboards), instructions to remove reply keyboard or to force a reply from the user.
     */
    reply_markup?:
        | Objects.TelegramInlineKeyboardMarkup
        | Objects.TelegramReplyKeyboardMarkup
        | Objects.TelegramReplyKeyboardRemove
        | Objects.TelegramForceReply;
}

/**
 * Use this method to send information about a venue. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
 *
 * {@link https://core.telegram.org/bots/api/#sendvenue | [Documentation]}
 */
export type SendVenue = (
    params: SendVenueParams,
) => Promise<Objects.TelegramMessage>;

export interface SendContactParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     */
    message_thread_id?: number;
    /**
     * Contact's phone number
     */
    phone_number: string;
    /**
     * Contact's first name
     */
    first_name: string;
    /**
     * Contact's last name
     */
    last_name?: string;
    /**
     * Additional data about the contact in the form of a [vCard](https://en.wikipedia.org/wiki/VCard), 0-2048 bytes
     */
    vcard?: string;
    /**
     * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages). Users will receive a notification with no sound.
     */
    disable_notification?: boolean;
    /**
     * Protects the contents of the sent message from forwarding and saving
     */
    protect_content?: boolean;
    /**
     * If the message is a reply, ID of the original message
     */
    reply_to_message_id?: number;
    /**
     * Pass *True* if the message should be sent even if the specified replied-to message is not found
     */
    allow_sending_without_reply?: boolean;
    /**
     * Additional interface options. A JSON-serialized object for an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards), [custom reply keyboard](https://core.telegram.org/bots/features#keyboards), instructions to remove reply keyboard or to force a reply from the user.
     */
    reply_markup?:
        | Objects.TelegramInlineKeyboardMarkup
        | Objects.TelegramReplyKeyboardMarkup
        | Objects.TelegramReplyKeyboardRemove
        | Objects.TelegramForceReply;
}

/**
 * Use this method to send phone contacts. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
 *
 * {@link https://core.telegram.org/bots/api/#sendcontact | [Documentation]}
 */
export type SendContact = (
    params: SendContactParams,
) => Promise<Objects.TelegramMessage>;

export type SendPollType = "quiz" | "regular";

export interface SendPollParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     */
    message_thread_id?: number;
    /**
     * Poll question, 1-300 characters
     */
    question: string;
    /**
     * A JSON-serialized list of answer options, 2-10 strings 1-100 characters each
     */
    options: string[];
    /**
     * *True*, if the poll needs to be anonymous, defaults to *True*
     */
    is_anonymous?: boolean;
    /**
     * Poll type, “quiz” or “regular”, defaults to “regular”
     */
    type?: SendPollType;
    /**
     * *True*, if the poll allows multiple answers, ignored for polls in quiz mode, defaults to *False*
     */
    allows_multiple_answers?: boolean;
    /**
     * 0-based identifier of the correct answer option, required for polls in quiz mode
     */
    correct_option_id?: number;
    /**
     * Text that is shown when a user chooses an incorrect answer or taps on the lamp icon in a quiz-style poll, 0-200 characters with at most 2 line feeds after entities parsing
     */
    explanation?: string;
    /**
     * Mode for parsing entities in the explanation. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    explanation_parse_mode?: string;
    /**
     * A JSON-serialized list of special entities that appear in the poll explanation, which can be specified instead of *parse\_mode*
     */
    explanation_entities?: Objects.TelegramMessageEntity[];
    /**
     * Amount of time in seconds the poll will be active after creation, 5-600. Can't be used together with *close\_date*.
     */
    open_period?: number;
    /**
     * Point in time (Unix timestamp) when the poll will be automatically closed. Must be at least 5 and no more than 600 seconds in the future. Can't be used together with *open\_period*.
     */
    close_date?: number;
    /**
     * Pass *True* if the poll needs to be immediately closed. This can be useful for poll preview.
     */
    is_closed?: boolean;
    /**
     * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages). Users will receive a notification with no sound.
     */
    disable_notification?: boolean;
    /**
     * Protects the contents of the sent message from forwarding and saving
     */
    protect_content?: boolean;
    /**
     * If the message is a reply, ID of the original message
     */
    reply_to_message_id?: number;
    /**
     * Pass *True* if the message should be sent even if the specified replied-to message is not found
     */
    allow_sending_without_reply?: boolean;
    /**
     * Additional interface options. A JSON-serialized object for an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards), [custom reply keyboard](https://core.telegram.org/bots/features#keyboards), instructions to remove reply keyboard or to force a reply from the user.
     */
    reply_markup?:
        | Objects.TelegramInlineKeyboardMarkup
        | Objects.TelegramReplyKeyboardMarkup
        | Objects.TelegramReplyKeyboardRemove
        | Objects.TelegramForceReply;
}

/**
 * Use this method to send a native poll. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
 *
 * {@link https://core.telegram.org/bots/api/#sendpoll | [Documentation]}
 */
export type SendPoll = (
    params: SendPollParams,
) => Promise<Objects.TelegramMessage>;

export type SendDiceEmoji = "🎲" | "🎯" | "🏀" | "⚽" | "🎳" | "🎰";

export interface SendDiceParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     */
    message_thread_id?: number;
    /**
     * Emoji on which the dice throw animation is based. Currently, must be one of “🎲”, “🎯”, “🏀”, “⚽”, “🎳”, or “🎰”. Dice can have values 1-6 for “🎲”, “🎯” and “🎳”, values 1-5 for “🏀” and “⚽”, and values 1-64 for “🎰”. Defaults to “🎲”
     */
    emoji?: SendDiceEmoji;
    /**
     * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages). Users will receive a notification with no sound.
     */
    disable_notification?: boolean;
    /**
     * Protects the contents of the sent message from forwarding
     */
    protect_content?: boolean;
    /**
     * If the message is a reply, ID of the original message
     */
    reply_to_message_id?: number;
    /**
     * Pass *True* if the message should be sent even if the specified replied-to message is not found
     */
    allow_sending_without_reply?: boolean;
    /**
     * Additional interface options. A JSON-serialized object for an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards), [custom reply keyboard](https://core.telegram.org/bots/features#keyboards), instructions to remove reply keyboard or to force a reply from the user.
     */
    reply_markup?:
        | Objects.TelegramInlineKeyboardMarkup
        | Objects.TelegramReplyKeyboardMarkup
        | Objects.TelegramReplyKeyboardRemove
        | Objects.TelegramForceReply;
}

/**
 * Use this method to send an animated emoji that will display a random value. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
 *
 * {@link https://core.telegram.org/bots/api/#senddice | [Documentation]}
 */
export type SendDice = (
    params: SendDiceParams,
) => Promise<Objects.TelegramMessage>;

export type SendChatActionAction =
    | "typing"
    | "upload_photo"
    | "record_video"
    | "upload_video"
    | "record_voice"
    | "upload_voice"
    | "upload_document"
    | "choose_sticker"
    | "find_location"
    | "record_video_note"
    | "upload_video_note";

export interface SendChatActionParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread; supergroups only
     */
    message_thread_id?: number;
    /**
     * Type of action to broadcast. Choose one, depending on what the user is about to receive: *typing* for [text messages](https://core.telegram.org/bots/api/#sendmessage), *upload\_photo* for [photos](https://core.telegram.org/bots/api/#sendphoto), *record\_video* or *upload\_video* for [videos](https://core.telegram.org/bots/api/#sendvideo), *record\_voice* or *upload\_voice* for [voice notes](https://core.telegram.org/bots/api/#sendvoice), *upload\_document* for [general files](https://core.telegram.org/bots/api/#senddocument), *choose\_sticker* for [stickers](https://core.telegram.org/bots/api/#sendsticker), *find\_location* for [location data](https://core.telegram.org/bots/api/#sendlocation), *record\_video\_note* or *upload\_video\_note* for [video notes](https://core.telegram.org/bots/api/#sendvideonote).
     */
    action: SendChatActionAction;
}

/**
 * Use this method when you need to tell the user that something is happening on the bot's side. The status is set for 5 seconds or less (when a message arrives from your bot, Telegram clients clear its typing status). Returns *True* on success.
 *
 * Example: The [ImageBot](https://t.me/imagebot) needs some time to process a request and upload the image. Instead of sending a text message along the lines of “Retrieving image, please wait…”, the bot may use [sendChatAction](https://core.telegram.org/bots/api/#sendchataction) with *action* = *upload\_photo*. The user will see a “sending photo” status for the bot.
 *
 * We only recommend using this method when a response from the bot will take a **noticeable** amount of time to arrive.
 *
 * {@link https://core.telegram.org/bots/api/#sendchataction | [Documentation]}
 */
export type SendChatAction = (params: SendChatActionParams) => Promise<boolean>;

export interface GetUserProfilePhotosParams {
    /**
     * Unique identifier of the target user
     */
    user_id: number;
    /**
     * Sequential number of the first photo to be returned. By default, all photos are returned.
     */
    offset?: number;
    /**
     * Limits the number of photos to be retrieved. Values between 1-100 are accepted. Defaults to 100.
     */
    limit?: number;
}

/**
 * Use this method to get a list of profile pictures for a user. Returns a [UserProfilePhotos](https://core.telegram.org/bots/api/#userprofilephotos) object.
 *
 * {@link https://core.telegram.org/bots/api/#getuserprofilephotos | [Documentation]}
 */
export type GetUserProfilePhotos = (
    params: GetUserProfilePhotosParams,
) => Promise<Objects.TelegramUserProfilePhotos>;

export interface GetFileParams {
    /**
     * File identifier to get information about
     */
    file_id: string;
}

/**
 * Use this method to get basic information about a file and prepare it for downloading. For the moment, bots can download files of up to 20MB in size. On success, a [File](https://core.telegram.org/bots/api/#file) object is returned. The file can then be downloaded via the link `https://api.telegram.org/file/bot<token>/<file_path>`, where `<file_path>` is taken from the response. It is guaranteed that the link will be valid for at least 1 hour. When the link expires, a new one can be requested by calling [getFile](https://core.telegram.org/bots/api/#getfile) again.
 *
 * {@link https://core.telegram.org/bots/api/#getfile | [Documentation]}
 */
export type GetFile = (params: GetFileParams) => Promise<Objects.TelegramFile>;

export interface BanChatMemberParams {
    /**
     * Unique identifier for the target group or username of the target supergroup or channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier of the target user
     */
    user_id: number;
    /**
     * Date when the user will be unbanned; Unix time. If user is banned for more than 366 days or less than 30 seconds from the current time they are considered to be banned forever. Applied for supergroups and channels only.
     */
    until_date?: number;
    /**
     * Pass *True* to delete all messages from the chat for the user that is being removed. If *False*, the user will be able to see messages in the group that were sent before the user was removed. Always *True* for supergroups and channels.
     */
    revoke_messages?: boolean;
}

/**
 * Use this method to ban a user in a group, a supergroup or a channel. In the case of supergroups and channels, the user will not be able to return to the chat on their own using invite links, etc., unless [unbanned](https://core.telegram.org/bots/api/#unbanchatmember) first. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#banchatmember | [Documentation]}
 */
export type BanChatMember = (params: BanChatMemberParams) => Promise<boolean>;

export interface UnbanChatMemberParams {
    /**
     * Unique identifier for the target group or username of the target supergroup or channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier of the target user
     */
    user_id: number;
    /**
     * Do nothing if the user is not banned
     */
    only_if_banned?: boolean;
}

/**
 * Use this method to unban a previously banned user in a supergroup or channel. The user will **not** return to the group or channel automatically, but will be able to join via link, etc. The bot must be an administrator for this to work. By default, this method guarantees that after the call the user is not a member of the chat, but will be able to join it. So if the user is a member of the chat they will also be **removed** from the chat. If you don't want this, use the parameter *only\_if\_banned*. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#unbanchatmember | [Documentation]}
 */
export type UnbanChatMember = (
    params: UnbanChatMemberParams,
) => Promise<boolean>;

export interface RestrictChatMemberParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier of the target user
     */
    user_id: number;
    /**
     * A JSON-serialized object for new user permissions
     */
    permissions: Objects.TelegramChatPermissions;
    /**
     * Pass *True* if chat permissions are set independently. Otherwise, the *can\_send\_other\_messages* and *can\_add\_web\_page\_previews* permissions will imply the *can\_send\_messages*, *can\_send\_audios*, *can\_send\_documents*, *can\_send\_photos*, *can\_send\_videos*, *can\_send\_video\_notes*, and *can\_send\_voice\_notes* permissions; the *can\_send\_polls* permission will imply the *can\_send\_messages* permission.
     */
    use_independent_chat_permissions?: boolean;
    /**
     * Date when restrictions will be lifted for the user; Unix time. If user is restricted for more than 366 days or less than 30 seconds from the current time, they are considered to be restricted forever
     */
    until_date?: number;
}

/**
 * Use this method to restrict a user in a supergroup. The bot must be an administrator in the supergroup for this to work and must have the appropriate administrator rights. Pass *True* for all permissions to lift restrictions from a user. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#restrictchatmember | [Documentation]}
 */
export type RestrictChatMember = (
    params: RestrictChatMemberParams,
) => Promise<boolean>;

export interface PromoteChatMemberParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier of the target user
     */
    user_id: number;
    /**
     * Pass *True* if the administrator's presence in the chat is hidden
     */
    is_anonymous?: boolean;
    /**
     * Pass *True* if the administrator can access the chat event log, boost list in channels, see channel members, report spam messages, see anonymous administrators in supergroups and ignore slow mode. Implied by any other administrator privilege
     */
    can_manage_chat?: boolean;
    /**
     * Pass *True* if the administrator can delete messages of other users
     */
    can_delete_messages?: boolean;
    /**
     * Pass *True* if the administrator can manage video chats
     */
    can_manage_video_chats?: boolean;
    /**
     * Pass *True* if the administrator can restrict, ban or unban chat members, or access supergroup statistics
     */
    can_restrict_members?: boolean;
    /**
     * Pass *True* if the administrator can add new administrators with a subset of their own privileges or demote administrators that they have promoted, directly or indirectly (promoted by administrators that were appointed by him)
     */
    can_promote_members?: boolean;
    /**
     * Pass *True* if the administrator can change chat title, photo and other settings
     */
    can_change_info?: boolean;
    /**
     * Pass *True* if the administrator can invite new users to the chat
     */
    can_invite_users?: boolean;
    /**
     * Pass *True* if the administrator can post messages in the channel, or access channel statistics; channels only
     */
    can_post_messages?: boolean;
    /**
     * Pass *True* if the administrator can edit messages of other users and can pin messages; channels only
     */
    can_edit_messages?: boolean;
    /**
     * Pass *True* if the administrator can pin messages, supergroups only
     */
    can_pin_messages?: boolean;
    /**
     * Pass *True* if the administrator can post stories in the channel; channels only
     */
    can_post_stories?: boolean;
    /**
     * Pass *True* if the administrator can edit stories posted by other users; channels only
     */
    can_edit_stories?: boolean;
    /**
     * Pass *True* if the administrator can delete stories posted by other users; channels only
     */
    can_delete_stories?: boolean;
    /**
     * Pass *True* if the user is allowed to create, rename, close, and reopen forum topics, supergroups only
     */
    can_manage_topics?: boolean;
}

/**
 * Use this method to promote or demote a user in a supergroup or a channel. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Pass *False* for all boolean parameters to demote a user. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#promotechatmember | [Documentation]}
 */
export type PromoteChatMember = (
    params: PromoteChatMemberParams,
) => Promise<boolean>;

export interface SetChatAdministratorCustomTitleParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier of the target user
     */
    user_id: number;
    /**
     * New custom title for the administrator; 0-16 characters, emoji are not allowed
     */
    custom_title: string;
}

/**
 * Use this method to set a custom title for an administrator in a supergroup promoted by the bot. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#setchatadministratorcustomtitle | [Documentation]}
 */
export type SetChatAdministratorCustomTitle = (
    params: SetChatAdministratorCustomTitleParams,
) => Promise<boolean>;

export interface BanChatSenderChatParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier of the target sender chat
     */
    sender_chat_id: number;
}

/**
 * Use this method to ban a channel chat in a supergroup or a channel. Until the chat is [unbanned](https://core.telegram.org/bots/api/#unbanchatsenderchat), the owner of the banned chat won't be able to send messages on behalf of **any of their channels**. The bot must be an administrator in the supergroup or channel for this to work and must have the appropriate administrator rights. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#banchatsenderchat | [Documentation]}
 */
export type BanChatSenderChat = (
    params: BanChatSenderChatParams,
) => Promise<boolean>;

export interface UnbanChatSenderChatParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier of the target sender chat
     */
    sender_chat_id: number;
}

/**
 * Use this method to unban a previously banned channel chat in a supergroup or channel. The bot must be an administrator for this to work and must have the appropriate administrator rights. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#unbanchatsenderchat | [Documentation]}
 */
export type UnbanChatSenderChat = (
    params: UnbanChatSenderChatParams,
) => Promise<boolean>;

export interface SetChatPermissionsParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
    /**
     * A JSON-serialized object for new default chat permissions
     */
    permissions: Objects.TelegramChatPermissions;
    /**
     * Pass *True* if chat permissions are set independently. Otherwise, the *can\_send\_other\_messages* and *can\_add\_web\_page\_previews* permissions will imply the *can\_send\_messages*, *can\_send\_audios*, *can\_send\_documents*, *can\_send\_photos*, *can\_send\_videos*, *can\_send\_video\_notes*, and *can\_send\_voice\_notes* permissions; the *can\_send\_polls* permission will imply the *can\_send\_messages* permission.
     */
    use_independent_chat_permissions?: boolean;
}

/**
 * Use this method to set default chat permissions for all members. The bot must be an administrator in the group or a supergroup for this to work and must have the *can\_restrict\_members* administrator rights. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#setchatpermissions | [Documentation]}
 */
export type SetChatPermissions = (
    params: SetChatPermissionsParams,
) => Promise<boolean>;

export interface ExportChatInviteLinkParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
}

/**
 * Use this method to generate a new primary invite link for a chat; any previously generated primary link is revoked. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns the new invite link as *String* on success.
 *
 * {@link https://core.telegram.org/bots/api/#exportchatinvitelink | [Documentation]}
 */
export type ExportChatInviteLink = (
    params: ExportChatInviteLinkParams,
) => Promise<string>;

export interface CreateChatInviteLinkParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Invite link name; 0-32 characters
     */
    name?: string;
    /**
     * Point in time (Unix timestamp) when the link will expire
     */
    expire_date?: number;
    /**
     * The maximum number of users that can be members of the chat simultaneously after joining the chat via this invite link; 1-99999
     */
    member_limit?: number;
    /**
     * *True*, if users joining the chat via the link need to be approved by chat administrators. If *True*, *member\_limit* can't be specified
     */
    creates_join_request?: boolean;
}

/**
 * Use this method to create an additional invite link for a chat. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. The link can be revoked using the method [revokeChatInviteLink](https://core.telegram.org/bots/api/#revokechatinvitelink). Returns the new invite link as [ChatInviteLink](https://core.telegram.org/bots/api/#chatinvitelink) object.
 *
 * {@link https://core.telegram.org/bots/api/#createchatinvitelink | [Documentation]}
 */
export type CreateChatInviteLink = (
    params: CreateChatInviteLinkParams,
) => Promise<Objects.TelegramChatInviteLink>;

export interface EditChatInviteLinkParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * The invite link to edit
     */
    invite_link: string;
    /**
     * Invite link name; 0-32 characters
     */
    name?: string;
    /**
     * Point in time (Unix timestamp) when the link will expire
     */
    expire_date?: number;
    /**
     * The maximum number of users that can be members of the chat simultaneously after joining the chat via this invite link; 1-99999
     */
    member_limit?: number;
    /**
     * *True*, if users joining the chat via the link need to be approved by chat administrators. If *True*, *member\_limit* can't be specified
     */
    creates_join_request?: boolean;
}

/**
 * Use this method to edit a non-primary invite link created by the bot. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns the edited invite link as a [ChatInviteLink](https://core.telegram.org/bots/api/#chatinvitelink) object.
 *
 * {@link https://core.telegram.org/bots/api/#editchatinvitelink | [Documentation]}
 */
export type EditChatInviteLink = (
    params: EditChatInviteLinkParams,
) => Promise<Objects.TelegramChatInviteLink>;

export interface RevokeChatInviteLinkParams {
    /**
     * Unique identifier of the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * The invite link to revoke
     */
    invite_link: string;
}

/**
 * Use this method to revoke an invite link created by the bot. If the primary link is revoked, a new link is automatically generated. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns the revoked invite link as [ChatInviteLink](https://core.telegram.org/bots/api/#chatinvitelink) object.
 *
 * {@link https://core.telegram.org/bots/api/#revokechatinvitelink | [Documentation]}
 */
export type RevokeChatInviteLink = (
    params: RevokeChatInviteLinkParams,
) => Promise<Objects.TelegramChatInviteLink>;

export interface ApproveChatJoinRequestParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier of the target user
     */
    user_id: number;
}

/**
 * Use this method to approve a chat join request. The bot must be an administrator in the chat for this to work and must have the *can\_invite\_users* administrator right. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#approvechatjoinrequest | [Documentation]}
 */
export type ApproveChatJoinRequest = (
    params: ApproveChatJoinRequestParams,
) => Promise<boolean>;

export interface DeclineChatJoinRequestParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier of the target user
     */
    user_id: number;
}

/**
 * Use this method to decline a chat join request. The bot must be an administrator in the chat for this to work and must have the *can\_invite\_users* administrator right. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#declinechatjoinrequest | [Documentation]}
 */
export type DeclineChatJoinRequest = (
    params: DeclineChatJoinRequestParams,
) => Promise<boolean>;

export interface SetChatPhotoParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * New chat photo, uploaded using multipart/form-data
     */
    photo: Objects.TelegramInputFile;
}

/**
 * Use this method to set a new profile photo for the chat. Photos can't be changed for private chats. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#setchatphoto | [Documentation]}
 */
export type SetChatPhoto = (params: SetChatPhotoParams) => Promise<boolean>;

export interface DeleteChatPhotoParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
}

/**
 * Use this method to delete a chat photo. Photos can't be changed for private chats. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#deletechatphoto | [Documentation]}
 */
export type DeleteChatPhoto = (
    params: DeleteChatPhotoParams,
) => Promise<boolean>;

export interface SetChatTitleParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * New chat title, 1-128 characters
     */
    title: string;
}

/**
 * Use this method to change the title of a chat. Titles can't be changed for private chats. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#setchattitle | [Documentation]}
 */
export type SetChatTitle = (params: SetChatTitleParams) => Promise<boolean>;

export interface SetChatDescriptionParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * New chat description, 0-255 characters
     */
    description?: string;
}

/**
 * Use this method to change the description of a group, a supergroup or a channel. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#setchatdescription | [Documentation]}
 */
export type SetChatDescription = (
    params: SetChatDescriptionParams,
) => Promise<boolean>;

export interface PinChatMessageParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Identifier of a message to pin
     */
    message_id: number;
    /**
     * Pass *True* if it is not necessary to send a notification to all chat members about the new pinned message. Notifications are always disabled in channels and private chats.
     */
    disable_notification?: boolean;
}

/**
 * Use this method to add a message to the list of pinned messages in a chat. If the chat is not a private chat, the bot must be an administrator in the chat for this to work and must have the 'can\_pin\_messages' administrator right in a supergroup or 'can\_edit\_messages' administrator right in a channel. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#pinchatmessage | [Documentation]}
 */
export type PinChatMessage = (params: PinChatMessageParams) => Promise<boolean>;

export interface UnpinChatMessageParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Identifier of a message to unpin. If not specified, the most recent pinned message (by sending date) will be unpinned.
     */
    message_id?: number;
}

/**
 * Use this method to remove a message from the list of pinned messages in a chat. If the chat is not a private chat, the bot must be an administrator in the chat for this to work and must have the 'can\_pin\_messages' administrator right in a supergroup or 'can\_edit\_messages' administrator right in a channel. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#unpinchatmessage | [Documentation]}
 */
export type UnpinChatMessage = (
    params: UnpinChatMessageParams,
) => Promise<boolean>;

export interface UnpinAllChatMessagesParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
}

/**
 * Use this method to clear the list of pinned messages in a chat. If the chat is not a private chat, the bot must be an administrator in the chat for this to work and must have the 'can\_pin\_messages' administrator right in a supergroup or 'can\_edit\_messages' administrator right in a channel. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#unpinallchatmessages | [Documentation]}
 */
export type UnpinAllChatMessages = (
    params: UnpinAllChatMessagesParams,
) => Promise<boolean>;

export interface LeaveChatParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup or channel (in the format `@channelusername`)
     */
    chat_id: number | string;
}

/**
 * Use this method for your bot to leave a group, supergroup or channel. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#leavechat | [Documentation]}
 */
export type LeaveChat = (params: LeaveChatParams) => Promise<boolean>;

export interface GetChatParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup or channel (in the format `@channelusername`)
     */
    chat_id: number | string;
}

/**
 * Use this method to get up to date information about the chat (current name of the user for one-on-one conversations, current username of a user, group or channel, etc.). Returns a [Chat](https://core.telegram.org/bots/api/#chat) object on success.
 *
 * {@link https://core.telegram.org/bots/api/#getchat | [Documentation]}
 */
export type GetChat = (params: GetChatParams) => Promise<Objects.TelegramChat>;

export interface GetChatAdministratorsParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup or channel (in the format `@channelusername`)
     */
    chat_id: number | string;
}

/**
 * Use this method to get a list of administrators in a chat, which aren't bots. Returns an Array of [ChatMember](https://core.telegram.org/bots/api/#chatmember) objects.
 *
 * {@link https://core.telegram.org/bots/api/#getchatadministrators | [Documentation]}
 */
export type GetChatAdministrators = (
    params: GetChatAdministratorsParams,
) => Promise<Objects.TelegramChatMember[]>;

export interface GetChatMemberCountParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup or channel (in the format `@channelusername`)
     */
    chat_id: number | string;
}

/**
 * Use this method to get the number of members in a chat. Returns *Int* on success.
 *
 * {@link https://core.telegram.org/bots/api/#getchatmembercount | [Documentation]}
 */
export type GetChatMemberCount = (
    params: GetChatMemberCountParams,
) => Promise<number>;

export interface GetChatMemberParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup or channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier of the target user
     */
    user_id: number;
}

/**
 * Use this method to get information about a member of a chat. The method is only guaranteed to work for other users if the bot is an administrator in the chat. Returns a [ChatMember](https://core.telegram.org/bots/api/#chatmember) object on success.
 *
 * {@link https://core.telegram.org/bots/api/#getchatmember | [Documentation]}
 */
export type GetChatMember = (
    params: GetChatMemberParams,
) => Promise<Objects.TelegramChatMember>;

export interface SetChatStickerSetParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
    /**
     * Name of the sticker set to be set as the group sticker set
     */
    sticker_set_name: string;
}

/**
 * Use this method to set a new group sticker set for a supergroup. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Use the field *can\_set\_sticker\_set* optionally returned in [getChat](https://core.telegram.org/bots/api/#getchat) requests to check if the bot can use this method. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#setchatstickerset | [Documentation]}
 */
export type SetChatStickerSet = (
    params: SetChatStickerSetParams,
) => Promise<boolean>;

export interface DeleteChatStickerSetParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
}

/**
 * Use this method to delete a group sticker set from a supergroup. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Use the field *can\_set\_sticker\_set* optionally returned in [getChat](https://core.telegram.org/bots/api/#getchat) requests to check if the bot can use this method. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#deletechatstickerset | [Documentation]}
 */
export type DeleteChatStickerSet = (
    params: DeleteChatStickerSetParams,
) => Promise<boolean>;

export type GetForumTopicIconStickers = () => Promise<
    Objects.TelegramSticker[]
>;

export interface CreateForumTopicParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
    /**
     * Topic name, 1-128 characters
     */
    name: string;
    /**
     * Color of the topic icon in RGB format. Currently, must be one of 7322096 (0x6FB9F0), 16766590 (0xFFD67E), 13338331 (0xCB86DB), 9367192 (0x8EEE98), 16749490 (0xFF93B2), or 16478047 (0xFB6F5F)
     */
    icon_color?: number;
    /**
     * Unique identifier of the custom emoji shown as the topic icon. Use [getForumTopicIconStickers](https://core.telegram.org/bots/api/#getforumtopiciconstickers) to get all allowed custom emoji identifiers.
     */
    icon_custom_emoji_id?: string;
}

/**
 * Use this method to create a topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the *can\_manage\_topics* administrator rights. Returns information about the created topic as a [ForumTopic](https://core.telegram.org/bots/api/#forumtopic) object.
 *
 * {@link https://core.telegram.org/bots/api/#createforumtopic | [Documentation]}
 */
export type CreateForumTopic = (
    params: CreateForumTopicParams,
) => Promise<Objects.TelegramForumTopic>;

export interface EditForumTopicParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread of the forum topic
     */
    message_thread_id: number;
    /**
     * New topic name, 0-128 characters. If not specified or empty, the current name of the topic will be kept
     */
    name?: string;
    /**
     * New unique identifier of the custom emoji shown as the topic icon. Use [getForumTopicIconStickers](https://core.telegram.org/bots/api/#getforumtopiciconstickers) to get all allowed custom emoji identifiers. Pass an empty string to remove the icon. If not specified, the current icon will be kept
     */
    icon_custom_emoji_id?: string;
}

/**
 * Use this method to edit name and icon of a topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have *can\_manage\_topics* administrator rights, unless it is the creator of the topic. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#editforumtopic | [Documentation]}
 */
export type EditForumTopic = (params: EditForumTopicParams) => Promise<boolean>;

export interface CloseForumTopicParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread of the forum topic
     */
    message_thread_id: number;
}

/**
 * Use this method to close an open topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the *can\_manage\_topics* administrator rights, unless it is the creator of the topic. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#closeforumtopic | [Documentation]}
 */
export type CloseForumTopic = (
    params: CloseForumTopicParams,
) => Promise<boolean>;

export interface ReopenForumTopicParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread of the forum topic
     */
    message_thread_id: number;
}

/**
 * Use this method to reopen a closed topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the *can\_manage\_topics* administrator rights, unless it is the creator of the topic. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#reopenforumtopic | [Documentation]}
 */
export type ReopenForumTopic = (
    params: ReopenForumTopicParams,
) => Promise<boolean>;

export interface DeleteForumTopicParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread of the forum topic
     */
    message_thread_id: number;
}

/**
 * Use this method to delete a forum topic along with all its messages in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the *can\_delete\_messages* administrator rights. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#deleteforumtopic | [Documentation]}
 */
export type DeleteForumTopic = (
    params: DeleteForumTopicParams,
) => Promise<boolean>;

export interface UnpinAllForumTopicMessagesParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread of the forum topic
     */
    message_thread_id: number;
}

/**
 * Use this method to clear the list of pinned messages in a forum topic. The bot must be an administrator in the chat for this to work and must have the *can\_pin\_messages* administrator right in the supergroup. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#unpinallforumtopicmessages | [Documentation]}
 */
export type UnpinAllForumTopicMessages = (
    params: UnpinAllForumTopicMessagesParams,
) => Promise<boolean>;

export interface EditGeneralForumTopicParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
    /**
     * New topic name, 1-128 characters
     */
    name: string;
}

/**
 * Use this method to edit the name of the 'General' topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have *can\_manage\_topics* administrator rights. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#editgeneralforumtopic | [Documentation]}
 */
export type EditGeneralForumTopic = (
    params: EditGeneralForumTopicParams,
) => Promise<boolean>;

export interface CloseGeneralForumTopicParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
}

/**
 * Use this method to close an open 'General' topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the *can\_manage\_topics* administrator rights. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#closegeneralforumtopic | [Documentation]}
 */
export type CloseGeneralForumTopic = (
    params: CloseGeneralForumTopicParams,
) => Promise<boolean>;

export interface ReopenGeneralForumTopicParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
}

/**
 * Use this method to reopen a closed 'General' topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the *can\_manage\_topics* administrator rights. The topic will be automatically unhidden if it was hidden. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#reopengeneralforumtopic | [Documentation]}
 */
export type ReopenGeneralForumTopic = (
    params: ReopenGeneralForumTopicParams,
) => Promise<boolean>;

export interface HideGeneralForumTopicParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
}

/**
 * Use this method to hide the 'General' topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the *can\_manage\_topics* administrator rights. The topic will be automatically closed if it was open. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#hidegeneralforumtopic | [Documentation]}
 */
export type HideGeneralForumTopic = (
    params: HideGeneralForumTopicParams,
) => Promise<boolean>;

export interface UnhideGeneralForumTopicParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
}

/**
 * Use this method to unhide the 'General' topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the *can\_manage\_topics* administrator rights. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#unhidegeneralforumtopic | [Documentation]}
 */
export type UnhideGeneralForumTopic = (
    params: UnhideGeneralForumTopicParams,
) => Promise<boolean>;

export interface UnpinAllGeneralForumTopicMessagesParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
}

/**
 * Use this method to clear the list of pinned messages in a General forum topic. The bot must be an administrator in the chat for this to work and must have the *can\_pin\_messages* administrator right in the supergroup. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#unpinallgeneralforumtopicmessages | [Documentation]}
 */
export type UnpinAllGeneralForumTopicMessages = (
    params: UnpinAllGeneralForumTopicMessagesParams,
) => Promise<boolean>;

export interface AnswerCallbackQueryParams {
    /**
     * Unique identifier for the query to be answered
     */
    callback_query_id: string;
    /**
     * Text of the notification. If not specified, nothing will be shown to the user, 0-200 characters
     */
    text?: string;
    /**
     * If *True*, an alert will be shown by the client instead of a notification at the top of the chat screen. Defaults to *false*.
     */
    show_alert?: boolean;
    /**
     * URL that will be opened by the user's client. If you have created a [Game](https://core.telegram.org/bots/api/#game) and accepted the conditions via [@BotFather](https://t.me/botfather), specify the URL that opens your game - note that this will only work if the query comes from a [*callback\_game*](https://core.telegram.org/bots/api/#inlinekeyboardbutton) button.
     *
     * Otherwise, you may use links like `t.me/your_bot?start=XXXX` that open your bot with a parameter.
     */
    url?: string;
    /**
     * The maximum amount of time in seconds that the result of the callback query may be cached client-side. Telegram apps will support caching starting in version 3.14. Defaults to 0.
     */
    cache_time?: number;
}

/**
 * Use this method to send answers to callback queries sent from [inline keyboards](https://core.telegram.org/bots/features#inline-keyboards). The answer will be displayed to the user as a notification at the top of the chat screen or as an alert. On success, *True* is returned.
 *
 * Alternatively, the user can be redirected to the specified Game URL. For this option to work, you must first create a game for your bot via [@BotFather](https://t.me/botfather) and accept the terms. Otherwise, you may use links like `t.me/your_bot?start=XXXX` that open your bot with a parameter.
 *
 * {@link https://core.telegram.org/bots/api/#answercallbackquery | [Documentation]}
 */
export type AnswerCallbackQuery = (
    params: AnswerCallbackQueryParams,
) => Promise<boolean>;

export interface SetMyCommandsParams {
    /**
     * A JSON-serialized list of bot commands to be set as the list of the bot's commands. At most 100 commands can be specified.
     */
    commands: Objects.TelegramBotCommand[];
    /**
     * A JSON-serialized object, describing scope of users for which the commands are relevant. Defaults to [BotCommandScopeDefault](https://core.telegram.org/bots/api/#botcommandscopedefault).
     */
    scope?: Objects.TelegramBotCommandScope;
    /**
     * A two-letter ISO 639-1 language code. If empty, commands will be applied to all users from the given scope, for whose language there are no dedicated commands
     */
    language_code?: string;
}

/**
 * Use this method to change the list of the bot's commands. See [this manual](https://core.telegram.org/bots/features#commands) for more details about bot commands. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#setmycommands | [Documentation]}
 */
export type SetMyCommands = (params: SetMyCommandsParams) => Promise<boolean>;

export interface DeleteMyCommandsParams {
    /**
     * A JSON-serialized object, describing scope of users for which the commands are relevant. Defaults to [BotCommandScopeDefault](https://core.telegram.org/bots/api/#botcommandscopedefault).
     */
    scope?: Objects.TelegramBotCommandScope;
    /**
     * A two-letter ISO 639-1 language code. If empty, commands will be applied to all users from the given scope, for whose language there are no dedicated commands
     */
    language_code?: string;
}

/**
 * Use this method to delete the list of the bot's commands for the given scope and user language. After deletion, [higher level commands](https://core.telegram.org/bots/api/#determining-list-of-commands) will be shown to affected users. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#deletemycommands | [Documentation]}
 */
export type DeleteMyCommands = (
    params: DeleteMyCommandsParams,
) => Promise<boolean>;

export interface GetMyCommandsParams {
    /**
     * A JSON-serialized object, describing scope of users. Defaults to [BotCommandScopeDefault](https://core.telegram.org/bots/api/#botcommandscopedefault).
     */
    scope?: Objects.TelegramBotCommandScope;
    /**
     * A two-letter ISO 639-1 language code or an empty string
     */
    language_code?: string;
}

/**
 * Use this method to get the current list of the bot's commands for the given scope and user language. Returns an Array of [BotCommand](https://core.telegram.org/bots/api/#botcommand) objects. If commands aren't set, an empty list is returned.
 *
 * {@link https://core.telegram.org/bots/api/#getmycommands | [Documentation]}
 */
export type GetMyCommands = (
    params: GetMyCommandsParams,
) => Promise<Objects.TelegramBotCommand[]>;

export interface SetMyNameParams {
    /**
     * New bot name; 0-64 characters. Pass an empty string to remove the dedicated name for the given language.
     */
    name?: string;
    /**
     * A two-letter ISO 639-1 language code. If empty, the name will be shown to all users for whose language there is no dedicated name.
     */
    language_code?: string;
}

/**
 * Use this method to change the bot's name. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#setmyname | [Documentation]}
 */
export type SetMyName = (params: SetMyNameParams) => Promise<boolean>;

export interface GetMyNameParams {
    /**
     * A two-letter ISO 639-1 language code or an empty string
     */
    language_code?: string;
}

/**
 * Use this method to get the current bot name for the given user language. Returns [BotName](https://core.telegram.org/bots/api/#botname) on success.
 *
 * {@link https://core.telegram.org/bots/api/#getmyname | [Documentation]}
 */
export type GetMyName = (
    params: GetMyNameParams,
) => Promise<Objects.TelegramBotName>;

export interface SetMyDescriptionParams {
    /**
     * New bot description; 0-512 characters. Pass an empty string to remove the dedicated description for the given language.
     */
    description?: string;
    /**
     * A two-letter ISO 639-1 language code. If empty, the description will be applied to all users for whose language there is no dedicated description.
     */
    language_code?: string;
}

/**
 * Use this method to change the bot's description, which is shown in the chat with the bot if the chat is empty. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#setmydescription | [Documentation]}
 */
export type SetMyDescription = (
    params: SetMyDescriptionParams,
) => Promise<boolean>;

export interface GetMyDescriptionParams {
    /**
     * A two-letter ISO 639-1 language code or an empty string
     */
    language_code?: string;
}

/**
 * Use this method to get the current bot description for the given user language. Returns [BotDescription](https://core.telegram.org/bots/api/#botdescription) on success.
 *
 * {@link https://core.telegram.org/bots/api/#getmydescription | [Documentation]}
 */
export type GetMyDescription = (
    params: GetMyDescriptionParams,
) => Promise<Objects.TelegramBotDescription>;

export interface SetMyShortDescriptionParams {
    /**
     * New short description for the bot; 0-120 characters. Pass an empty string to remove the dedicated short description for the given language.
     */
    short_description?: string;
    /**
     * A two-letter ISO 639-1 language code. If empty, the short description will be applied to all users for whose language there is no dedicated short description.
     */
    language_code?: string;
}

/**
 * Use this method to change the bot's short description, which is shown on the bot's profile page and is sent together with the link when users share the bot. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#setmyshortdescription | [Documentation]}
 */
export type SetMyShortDescription = (
    params: SetMyShortDescriptionParams,
) => Promise<boolean>;

export interface GetMyShortDescriptionParams {
    /**
     * A two-letter ISO 639-1 language code or an empty string
     */
    language_code?: string;
}

/**
 * Use this method to get the current bot short description for the given user language. Returns [BotShortDescription](https://core.telegram.org/bots/api/#botshortdescription) on success.
 *
 * {@link https://core.telegram.org/bots/api/#getmyshortdescription | [Documentation]}
 */
export type GetMyShortDescription = (
    params: GetMyShortDescriptionParams,
) => Promise<Objects.TelegramBotShortDescription>;

export interface SetChatMenuButtonParams {
    /**
     * Unique identifier for the target private chat. If not specified, default bot's menu button will be changed
     */
    chat_id?: number;
    /**
     * A JSON-serialized object for the bot's new menu button. Defaults to [MenuButtonDefault](https://core.telegram.org/bots/api/#menubuttondefault)
     */
    menu_button?: Objects.TelegramMenuButton;
}

/**
 * Use this method to change the bot's menu button in a private chat, or the default menu button. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#setchatmenubutton | [Documentation]}
 */
export type SetChatMenuButton = (
    params: SetChatMenuButtonParams,
) => Promise<boolean>;

export interface GetChatMenuButtonParams {
    /**
     * Unique identifier for the target private chat. If not specified, default bot's menu button will be returned
     */
    chat_id?: number;
}

/**
 * Use this method to get the current value of the bot's menu button in a private chat, or the default menu button. Returns [MenuButton](https://core.telegram.org/bots/api/#menubutton) on success.
 *
 * {@link https://core.telegram.org/bots/api/#getchatmenubutton | [Documentation]}
 */
export type GetChatMenuButton = (
    params: GetChatMenuButtonParams,
) => Promise<Objects.TelegramMenuButton>;

export interface SetMyDefaultAdministratorRightsParams {
    /**
     * A JSON-serialized object describing new default administrator rights. If not specified, the default administrator rights will be cleared.
     */
    rights?: Objects.TelegramChatAdministratorRights;
    /**
     * Pass *True* to change the default administrator rights of the bot in channels. Otherwise, the default administrator rights of the bot for groups and supergroups will be changed.
     */
    for_channels?: boolean;
}

/**
 * Use this method to change the default administrator rights requested by the bot when it's added as an administrator to groups or channels. These rights will be suggested to users, but they are free to modify the list before adding the bot. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#setmydefaultadministratorrights | [Documentation]}
 */
export type SetMyDefaultAdministratorRights = (
    params: SetMyDefaultAdministratorRightsParams,
) => Promise<boolean>;

export interface GetMyDefaultAdministratorRightsParams {
    /**
     * Pass *True* to get default administrator rights of the bot in channels. Otherwise, default administrator rights of the bot for groups and supergroups will be returned.
     */
    for_channels?: boolean;
}

/**
 * Use this method to get the current default administrator rights of the bot. Returns [ChatAdministratorRights](https://core.telegram.org/bots/api/#chatadministratorrights) on success.
 *
 * {@link https://core.telegram.org/bots/api/#getmydefaultadministratorrights | [Documentation]}
 */
export type GetMyDefaultAdministratorRights = (
    params: GetMyDefaultAdministratorRightsParams,
) => Promise<Objects.TelegramChatAdministratorRights>;

export interface EditMessageTextParams {
    /**
     * Required if *inline\_message\_id* is not specified. Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id?: number | string;
    /**
     * Required if *inline\_message\_id* is not specified. Identifier of the message to edit
     */
    message_id?: number;
    /**
     * Required if *chat\_id* and *message\_id* are not specified. Identifier of the inline message
     */
    inline_message_id?: string;
    /**
     * New text of the message, 1-4096 characters after entities parsing
     */
    text: string;
    /**
     * Mode for parsing entities in the message text. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * A JSON-serialized list of special entities that appear in message text, which can be specified instead of *parse\_mode*
     */
    entities?: Objects.TelegramMessageEntity[];
    /**
     * Disables link previews for links in this message
     */
    disable_web_page_preview?: boolean;
    /**
     * A JSON-serialized object for an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards).
     */
    reply_markup?: Objects.TelegramInlineKeyboardMarkup;
}

/**
 * Use this method to edit text and [game](https://core.telegram.org/bots/api/#games) messages. On success, if the edited message is not an inline message, the edited [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned.
 *
 * {@link https://core.telegram.org/bots/api/#editmessagetext | [Documentation]}
 */
export type EditMessageText = (
    params: EditMessageTextParams,
) => Promise<Objects.TelegramMessage | boolean>;

export interface EditMessageCaptionParams {
    /**
     * Required if *inline\_message\_id* is not specified. Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id?: number | string;
    /**
     * Required if *inline\_message\_id* is not specified. Identifier of the message to edit
     */
    message_id?: number;
    /**
     * Required if *chat\_id* and *message\_id* are not specified. Identifier of the inline message
     */
    inline_message_id?: string;
    /**
     * New caption of the message, 0-1024 characters after entities parsing
     */
    caption?: string;
    /**
     * Mode for parsing entities in the message caption. See [formatting options](https://core.telegram.org/bots/api/#formatting-options) for more details.
     */
    parse_mode?: string;
    /**
     * A JSON-serialized list of special entities that appear in the caption, which can be specified instead of *parse\_mode*
     */
    caption_entities?: Objects.TelegramMessageEntity[];
    /**
     * A JSON-serialized object for an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards).
     */
    reply_markup?: Objects.TelegramInlineKeyboardMarkup;
}

/**
 * Use this method to edit captions of messages. On success, if the edited message is not an inline message, the edited [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned.
 *
 * {@link https://core.telegram.org/bots/api/#editmessagecaption | [Documentation]}
 */
export type EditMessageCaption = (
    params: EditMessageCaptionParams,
) => Promise<Objects.TelegramMessage | boolean>;

export interface EditMessageMediaParams {
    /**
     * Required if *inline\_message\_id* is not specified. Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id?: number | string;
    /**
     * Required if *inline\_message\_id* is not specified. Identifier of the message to edit
     */
    message_id?: number;
    /**
     * Required if *chat\_id* and *message\_id* are not specified. Identifier of the inline message
     */
    inline_message_id?: string;
    /**
     * A JSON-serialized object for a new media content of the message
     */
    media: Objects.TelegramInputMedia;
    /**
     * A JSON-serialized object for a new [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards).
     */
    reply_markup?: Objects.TelegramInlineKeyboardMarkup;
}

/**
 * Use this method to edit animation, audio, document, photo, or video messages. If a message is part of a message album, then it can be edited only to an audio for audio albums, only to a document for document albums and to a photo or a video otherwise. When an inline message is edited, a new file can't be uploaded; use a previously uploaded file via its file\_id or specify a URL. On success, if the edited message is not an inline message, the edited [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned.
 *
 * {@link https://core.telegram.org/bots/api/#editmessagemedia | [Documentation]}
 */
export type EditMessageMedia = (
    params: EditMessageMediaParams,
) => Promise<Objects.TelegramMessage | boolean>;

export interface EditMessageLiveLocationParams {
    /**
     * Required if *inline\_message\_id* is not specified. Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id?: number | string;
    /**
     * Required if *inline\_message\_id* is not specified. Identifier of the message to edit
     */
    message_id?: number;
    /**
     * Required if *chat\_id* and *message\_id* are not specified. Identifier of the inline message
     */
    inline_message_id?: string;
    /**
     * Latitude of new location
     */
    latitude: number;
    /**
     * Longitude of new location
     */
    longitude: number;
    /**
     * The radius of uncertainty for the location, measured in meters; 0-1500
     */
    horizontal_accuracy?: number;
    /**
     * Direction in which the user is moving, in degrees. Must be between 1 and 360 if specified.
     */
    heading?: number;
    /**
     * The maximum distance for proximity alerts about approaching another chat member, in meters. Must be between 1 and 100000 if specified.
     */
    proximity_alert_radius?: number;
    /**
     * A JSON-serialized object for a new [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards).
     */
    reply_markup?: Objects.TelegramInlineKeyboardMarkup;
}

/**
 * Use this method to edit live location messages. A location can be edited until its *live\_period* expires or editing is explicitly disabled by a call to [stopMessageLiveLocation](https://core.telegram.org/bots/api/#stopmessagelivelocation). On success, if the edited message is not an inline message, the edited [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned.
 *
 * {@link https://core.telegram.org/bots/api/#editmessagelivelocation | [Documentation]}
 */
export type EditMessageLiveLocation = (
    params: EditMessageLiveLocationParams,
) => Promise<Objects.TelegramMessage | boolean>;

export interface StopMessageLiveLocationParams {
    /**
     * Required if *inline\_message\_id* is not specified. Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id?: number | string;
    /**
     * Required if *inline\_message\_id* is not specified. Identifier of the message with live location to stop
     */
    message_id?: number;
    /**
     * Required if *chat\_id* and *message\_id* are not specified. Identifier of the inline message
     */
    inline_message_id?: string;
    /**
     * A JSON-serialized object for a new [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards).
     */
    reply_markup?: Objects.TelegramInlineKeyboardMarkup;
}

/**
 * Use this method to stop updating a live location message before *live\_period* expires. On success, if the message is not an inline message, the edited [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned.
 *
 * {@link https://core.telegram.org/bots/api/#stopmessagelivelocation | [Documentation]}
 */
export type StopMessageLiveLocation = (
    params: StopMessageLiveLocationParams,
) => Promise<Objects.TelegramMessage | boolean>;

export interface EditMessageReplyMarkupParams {
    /**
     * Required if *inline\_message\_id* is not specified. Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id?: number | string;
    /**
     * Required if *inline\_message\_id* is not specified. Identifier of the message to edit
     */
    message_id?: number;
    /**
     * Required if *chat\_id* and *message\_id* are not specified. Identifier of the inline message
     */
    inline_message_id?: string;
    /**
     * A JSON-serialized object for an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards).
     */
    reply_markup?: Objects.TelegramInlineKeyboardMarkup;
}

/**
 * Use this method to edit only the reply markup of messages. On success, if the edited message is not an inline message, the edited [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned.
 *
 * {@link https://core.telegram.org/bots/api/#editmessagereplymarkup | [Documentation]}
 */
export type EditMessageReplyMarkup = (
    params: EditMessageReplyMarkupParams,
) => Promise<Objects.TelegramMessage | boolean>;

export interface StopPollParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Identifier of the original message with the poll
     */
    message_id: number;
    /**
     * A JSON-serialized object for a new message [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards).
     */
    reply_markup?: Objects.TelegramInlineKeyboardMarkup;
}

/**
 * Use this method to stop a poll which was sent by the bot. On success, the stopped [Poll](https://core.telegram.org/bots/api/#poll) is returned.
 *
 * {@link https://core.telegram.org/bots/api/#stoppoll | [Documentation]}
 */
export type StopPoll = (
    params: StopPollParams,
) => Promise<Objects.TelegramPoll>;

export interface DeleteMessageParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Identifier of the message to delete
     */
    message_id: number;
}

/**
 * Use this method to delete a message, including service messages, with the following limitations:
 * \- A message can only be deleted if it was sent less than 48 hours ago.
 * \- Service messages about a supergroup, channel, or forum topic creation can't be deleted.
 * \- A dice message in a private chat can only be deleted if it was sent more than 24 hours ago.
 * \- Bots can delete outgoing messages in private chats, groups, and supergroups.
 * \- Bots can delete incoming messages in private chats.
 * \- Bots granted *can\_post\_messages* permissions can delete outgoing messages in channels.
 * \- If the bot is an administrator of a group, it can delete any message there.
 * \- If the bot has *can\_delete\_messages* permission in a supergroup or a channel, it can delete any message there.
 * Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#deletemessage | [Documentation]}
 */
export type DeleteMessage = (params: DeleteMessageParams) => Promise<boolean>;

export interface SendStickerParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     */
    message_thread_id?: number;
    /**
     * Sticker to send. Pass a file\_id as String to send a file that exists on the Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get a .WEBP sticker from the Internet, or upload a new .WEBP or .TGS sticker using multipart/form-data. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files). Video stickers can only be sent by a file\_id. Animated stickers can't be sent via an HTTP URL.
     */
    sticker: Objects.TelegramInputFile | string;
    /**
     * Emoji associated with the sticker; only for just uploaded stickers
     */
    emoji?: string;
    /**
     * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages). Users will receive a notification with no sound.
     */
    disable_notification?: boolean;
    /**
     * Protects the contents of the sent message from forwarding and saving
     */
    protect_content?: boolean;
    /**
     * If the message is a reply, ID of the original message
     */
    reply_to_message_id?: number;
    /**
     * Pass *True* if the message should be sent even if the specified replied-to message is not found
     */
    allow_sending_without_reply?: boolean;
    /**
     * Additional interface options. A JSON-serialized object for an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards), [custom reply keyboard](https://core.telegram.org/bots/features#keyboards), instructions to remove reply keyboard or to force a reply from the user.
     */
    reply_markup?:
        | Objects.TelegramInlineKeyboardMarkup
        | Objects.TelegramReplyKeyboardMarkup
        | Objects.TelegramReplyKeyboardRemove
        | Objects.TelegramForceReply;
}

/**
 * Use this method to send static .WEBP, [animated](https://telegram.org/blog/animated-stickers) .TGS, or [video](https://telegram.org/blog/video-stickers-better-reactions) .WEBM stickers. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
 *
 * {@link https://core.telegram.org/bots/api/#sendsticker | [Documentation]}
 */
export type SendSticker = (
    params: SendStickerParams,
) => Promise<Objects.TelegramMessage>;

export interface GetStickerSetParams {
    /**
     * Name of the sticker set
     */
    name: string;
}

/**
 * Use this method to get a sticker set. On success, a [StickerSet](https://core.telegram.org/bots/api/#stickerset) object is returned.
 *
 * {@link https://core.telegram.org/bots/api/#getstickerset | [Documentation]}
 */
export type GetStickerSet = (
    params: GetStickerSetParams,
) => Promise<Objects.TelegramStickerSet>;

export interface GetCustomEmojiStickersParams {
    /**
     * List of custom emoji identifiers. At most 200 custom emoji identifiers can be specified.
     */
    custom_emoji_ids: string[];
}

/**
 * Use this method to get information about custom emoji stickers by their identifiers. Returns an Array of [Sticker](https://core.telegram.org/bots/api/#sticker) objects.
 *
 * {@link https://core.telegram.org/bots/api/#getcustomemojistickers | [Documentation]}
 */
export type GetCustomEmojiStickers = (
    params: GetCustomEmojiStickersParams,
) => Promise<Objects.TelegramSticker[]>;

export type UploadStickerFileStickerFormat = "static" | "animated" | "video";

export interface UploadStickerFileParams {
    /**
     * User identifier of sticker file owner
     */
    user_id: number;
    /**
     * A file with the sticker in .WEBP, .PNG, .TGS, or .WEBM format. See [https://core.telegram.org/stickers](https://core.telegram.org/stickers) for technical requirements. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files)
     */
    sticker: Objects.TelegramInputFile;
    /**
     * Format of the sticker, must be one of “static”, “animated”, “video”
     */
    sticker_format: UploadStickerFileStickerFormat;
}

/**
 * Use this method to upload a file with a sticker for later use in the [createNewStickerSet](https://core.telegram.org/bots/api/#createnewstickerset) and [addStickerToSet](https://core.telegram.org/bots/api/#addstickertoset) methods (the file can be used multiple times). Returns the uploaded [File](https://core.telegram.org/bots/api/#file) on success.
 *
 * {@link https://core.telegram.org/bots/api/#uploadstickerfile | [Documentation]}
 */
export type UploadStickerFile = (
    params: UploadStickerFileParams,
) => Promise<Objects.TelegramFile>;

export type CreateNewStickerSetStickerFormat = "static" | "animated" | "video";
export type CreateNewStickerSetStickerType = "mask" | "custom_emoji";

export interface CreateNewStickerSetParams {
    /**
     * User identifier of created sticker set owner
     */
    user_id: number;
    /**
     * Short name of sticker set, to be used in `t.me/addstickers/` URLs (e.g., *animals*). Can contain only English letters, digits and underscores. Must begin with a letter, can't contain consecutive underscores and must end in `"_by_<bot_username>"`. `<bot_username>` is case insensitive. 1-64 characters.
     */
    name: string;
    /**
     * Sticker set title, 1-64 characters
     */
    title: string;
    /**
     * A JSON-serialized list of 1-50 initial stickers to be added to the sticker set
     */
    stickers: Objects.TelegramInputSticker[];
    /**
     * Format of stickers in the set, must be one of “static”, “animated”, “video”
     */
    sticker_format: CreateNewStickerSetStickerFormat;
    /**
     * Type of stickers in the set, pass “regular”, “mask”, or “custom\_emoji”. By default, a regular sticker set is created.
     */
    sticker_type?: CreateNewStickerSetStickerType;
    /**
     * Pass *True* if stickers in the sticker set must be repainted to the color of text when used in messages, the accent color if used as emoji status, white on chat photos, or another appropriate color based on context; for custom emoji sticker sets only
     */
    needs_repainting?: boolean;
}

/**
 * Use this method to create a new sticker set owned by a user. The bot will be able to edit the sticker set thus created. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#createnewstickerset | [Documentation]}
 */
export type CreateNewStickerSet = (
    params: CreateNewStickerSetParams,
) => Promise<boolean>;

export interface AddStickerToSetParams {
    /**
     * User identifier of sticker set owner
     */
    user_id: number;
    /**
     * Sticker set name
     */
    name: string;
    /**
     * A JSON-serialized object with information about the added sticker. If exactly the same sticker had already been added to the set, then the set isn't changed.
     */
    sticker: Objects.TelegramInputSticker;
}

/**
 * Use this method to add a new sticker to a set created by the bot. The format of the added sticker must match the format of the other stickers in the set. Emoji sticker sets can have up to 200 stickers. Animated and video sticker sets can have up to 50 stickers. Static sticker sets can have up to 120 stickers. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#addstickertoset | [Documentation]}
 */
export type AddStickerToSet = (
    params: AddStickerToSetParams,
) => Promise<boolean>;

export interface SetStickerPositionInSetParams {
    /**
     * File identifier of the sticker
     */
    sticker: string;
    /**
     * New sticker position in the set, zero-based
     */
    position: number;
}

/**
 * Use this method to move a sticker in a set created by the bot to a specific position. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#setstickerpositioninset | [Documentation]}
 */
export type SetStickerPositionInSet = (
    params: SetStickerPositionInSetParams,
) => Promise<boolean>;

export interface DeleteStickerFromSetParams {
    /**
     * File identifier of the sticker
     */
    sticker: string;
}

/**
 * Use this method to delete a sticker from a set created by the bot. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#deletestickerfromset | [Documentation]}
 */
export type DeleteStickerFromSet = (
    params: DeleteStickerFromSetParams,
) => Promise<boolean>;

export interface SetStickerEmojiListParams {
    /**
     * File identifier of the sticker
     */
    sticker: string;
    /**
     * A JSON-serialized list of 1-20 emoji associated with the sticker
     */
    emoji_list: string[];
}

/**
 * Use this method to change the list of emoji assigned to a regular or custom emoji sticker. The sticker must belong to a sticker set created by the bot. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#setstickeremojilist | [Documentation]}
 */
export type SetStickerEmojiList = (
    params: SetStickerEmojiListParams,
) => Promise<boolean>;

export interface SetStickerKeywordsParams {
    /**
     * File identifier of the sticker
     */
    sticker: string;
    /**
     * A JSON-serialized list of 0-20 search keywords for the sticker with total length of up to 64 characters
     */
    keywords?: string[];
}

/**
 * Use this method to change search keywords assigned to a regular or custom emoji sticker. The sticker must belong to a sticker set created by the bot. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#setstickerkeywords | [Documentation]}
 */
export type SetStickerKeywords = (
    params: SetStickerKeywordsParams,
) => Promise<boolean>;

export interface SetStickerMaskPositionParams {
    /**
     * File identifier of the sticker
     */
    sticker: string;
    /**
     * A JSON-serialized object with the position where the mask should be placed on faces. Omit the parameter to remove the mask position.
     */
    mask_position?: Objects.TelegramMaskPosition;
}

/**
 * Use this method to change the [mask position](https://core.telegram.org/bots/api/#maskposition) of a mask sticker. The sticker must belong to a sticker set that was created by the bot. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#setstickermaskposition | [Documentation]}
 */
export type SetStickerMaskPosition = (
    params: SetStickerMaskPositionParams,
) => Promise<boolean>;

export interface SetStickerSetTitleParams {
    /**
     * Sticker set name
     */
    name: string;
    /**
     * Sticker set title, 1-64 characters
     */
    title: string;
}

/**
 * Use this method to set the title of a created sticker set. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#setstickersettitle | [Documentation]}
 */
export type SetStickerSetTitle = (
    params: SetStickerSetTitleParams,
) => Promise<boolean>;

export interface SetStickerSetThumbnailParams {
    /**
     * Sticker set name
     */
    name: string;
    /**
     * User identifier of the sticker set owner
     */
    user_id: number;
    /**
     * A **.WEBP** or **.PNG** image with the thumbnail, must be up to 128 kilobytes in size and have a width and height of exactly 100px, or a **.TGS** animation with a thumbnail up to 32 kilobytes in size (see [https://core.telegram.org/stickers#animated-sticker-requirements](https://core.telegram.org/stickers#animated-sticker-requirements) for animated sticker technical requirements), or a **WEBM** video with the thumbnail up to 32 kilobytes in size; see [https://core.telegram.org/stickers#video-sticker-requirements](https://core.telegram.org/stickers#video-sticker-requirements) for video sticker technical requirements. Pass a *file\_id* as a String to send a file that already exists on the Telegram servers, pass an HTTP URL as a String for Telegram to get a file from the Internet, or upload a new one using multipart/form-data. [More information on Sending Files »](https://core.telegram.org/bots/api/#sending-files). Animated and video sticker set thumbnails can't be uploaded via HTTP URL. If omitted, then the thumbnail is dropped and the first sticker is used as the thumbnail.
     */
    thumbnail?: Objects.TelegramInputFile | string;
}

/**
 * Use this method to set the thumbnail of a regular or mask sticker set. The format of the thumbnail file must match the format of the stickers in the set. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#setstickersetthumbnail | [Documentation]}
 */
export type SetStickerSetThumbnail = (
    params: SetStickerSetThumbnailParams,
) => Promise<boolean>;

export interface SetCustomEmojiStickerSetThumbnailParams {
    /**
     * Sticker set name
     */
    name: string;
    /**
     * Custom emoji identifier of a sticker from the sticker set; pass an empty string to drop the thumbnail and use the first sticker as the thumbnail.
     */
    custom_emoji_id?: string;
}

/**
 * Use this method to set the thumbnail of a custom emoji sticker set. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#setcustomemojistickersetthumbnail | [Documentation]}
 */
export type SetCustomEmojiStickerSetThumbnail = (
    params: SetCustomEmojiStickerSetThumbnailParams,
) => Promise<boolean>;

export interface DeleteStickerSetParams {
    /**
     * Sticker set name
     */
    name: string;
}

/**
 * Use this method to delete a sticker set that was created by the bot. Returns *True* on success.
 *
 * {@link https://core.telegram.org/bots/api/#deletestickerset | [Documentation]}
 */
export type DeleteStickerSet = (
    params: DeleteStickerSetParams,
) => Promise<boolean>;

export interface AnswerInlineQueryParams {
    /**
     * Unique identifier for the answered query
     */
    inline_query_id: string;
    /**
     * A JSON-serialized array of results for the inline query
     */
    results: Objects.TelegramInlineQueryResult[];
    /**
     * The maximum amount of time in seconds that the result of the inline query may be cached on the server. Defaults to 300.
     */
    cache_time?: number;
    /**
     * Pass *True* if results may be cached on the server side only for the user that sent the query. By default, results may be returned to any user who sends the same query.
     */
    is_personal?: boolean;
    /**
     * Pass the offset that a client should send in the next query with the same text to receive more results. Pass an empty string if there are no more results or if you don't support pagination. Offset length can't exceed 64 bytes.
     */
    next_offset?: string;
    /**
     * A JSON-serialized object describing a button to be shown above inline query results
     */
    button?: Objects.TelegramInlineQueryResultsButton;
}

/**
 * Use this method to send answers to an inline query. On success, *True* is returned.
 * No more than **50** results per query are allowed.
 *
 * {@link https://core.telegram.org/bots/api/#answerinlinequery | [Documentation]}
 */
export type AnswerInlineQuery = (
    params: AnswerInlineQueryParams,
) => Promise<boolean>;

export interface AnswerWebAppQueryParams {
    /**
     * Unique identifier for the query to be answered
     */
    web_app_query_id: string;
    /**
     * A JSON-serialized object describing the message to be sent
     */
    result: Objects.TelegramInlineQueryResult;
}

/**
 * Use this method to set the result of an interaction with a [Web App](https://core.telegram.org/bots/webapps) and send a corresponding message on behalf of the user to the chat from which the query originated. On success, a [SentWebAppMessage](https://core.telegram.org/bots/api/#sentwebappmessage) object is returned.
 *
 * {@link https://core.telegram.org/bots/api/#answerwebappquery | [Documentation]}
 */
export type AnswerWebAppQuery = (
    params: AnswerWebAppQueryParams,
) => Promise<Objects.TelegramSentWebAppMessage>;

export interface SendInvoiceParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
    /**
     * Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     */
    message_thread_id?: number;
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
    prices: Objects.TelegramLabeledPrice[];
    /**
     * The maximum accepted amount for tips in the *smallest units* of the currency (integer, **not** float/double). For example, for a maximum tip of `US$ 1.45` pass `max_tip_amount = 145`. See the *exp* parameter in [currencies.json](https://core.telegram.org/bots/payments/currencies.json), it shows the number of digits past the decimal point for each currency (2 for the majority of currencies). Defaults to 0
     */
    max_tip_amount?: number;
    /**
     * A JSON-serialized array of suggested amounts of tips in the *smallest units* of the currency (integer, **not** float/double). At most 4 suggested tip amounts can be specified. The suggested tip amounts must be positive, passed in a strictly increased order and must not exceed *max\_tip\_amount*.
     */
    suggested_tip_amounts?: number[];
    /**
     * Unique deep-linking parameter. If left empty, **forwarded copies** of the sent message will have a *Pay* button, allowing multiple users to pay directly from the forwarded message, using the same invoice. If non-empty, forwarded copies of the sent message will have a *URL* button with a deep link to the bot (instead of a *Pay* button), with the value used as the start parameter
     */
    start_parameter?: string;
    /**
     * JSON-serialized data about the invoice, which will be shared with the payment provider. A detailed description of required fields should be provided by the payment provider.
     */
    provider_data?: string;
    /**
     * URL of the product photo for the invoice. Can be a photo of the goods or a marketing image for a service. People like it better when they see what they are paying for.
     */
    photo_url?: string;
    /**
     * Photo size in bytes
     */
    photo_size?: number;
    /**
     * Photo width
     */
    photo_width?: number;
    /**
     * Photo height
     */
    photo_height?: number;
    /**
     * Pass *True* if you require the user's full name to complete the order
     */
    need_name?: boolean;
    /**
     * Pass *True* if you require the user's phone number to complete the order
     */
    need_phone_number?: boolean;
    /**
     * Pass *True* if you require the user's email address to complete the order
     */
    need_email?: boolean;
    /**
     * Pass *True* if you require the user's shipping address to complete the order
     */
    need_shipping_address?: boolean;
    /**
     * Pass *True* if the user's phone number should be sent to provider
     */
    send_phone_number_to_provider?: boolean;
    /**
     * Pass *True* if the user's email address should be sent to provider
     */
    send_email_to_provider?: boolean;
    /**
     * Pass *True* if the final price depends on the shipping method
     */
    is_flexible?: boolean;
    /**
     * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages). Users will receive a notification with no sound.
     */
    disable_notification?: boolean;
    /**
     * Protects the contents of the sent message from forwarding and saving
     */
    protect_content?: boolean;
    /**
     * If the message is a reply, ID of the original message
     */
    reply_to_message_id?: number;
    /**
     * Pass *True* if the message should be sent even if the specified replied-to message is not found
     */
    allow_sending_without_reply?: boolean;
    /**
     * A JSON-serialized object for an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards). If empty, one 'Pay `total price`' button will be shown. If not empty, the first button must be a Pay button.
     */
    reply_markup?: Objects.TelegramInlineKeyboardMarkup;
}

/**
 * Use this method to send invoices. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
 *
 * {@link https://core.telegram.org/bots/api/#sendinvoice | [Documentation]}
 */
export type SendInvoice = (
    params: SendInvoiceParams,
) => Promise<Objects.TelegramMessage>;

export interface CreateInvoiceLinkParams {
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
     * Payment provider token, obtained via [BotFather](https://t.me/botfather)
     */
    provider_token: string;
    /**
     * Three-letter ISO 4217 currency code, see [more on currencies](https://core.telegram.org/bots/payments#supported-currencies)
     */
    currency: string;
    /**
     * Price breakdown, a JSON-serialized list of components (e.g. product price, tax, discount, delivery cost, delivery tax, bonus, etc.)
     */
    prices: Objects.TelegramLabeledPrice[];
    /**
     * The maximum accepted amount for tips in the *smallest units* of the currency (integer, **not** float/double). For example, for a maximum tip of `US$ 1.45` pass `max_tip_amount = 145`. See the *exp* parameter in [currencies.json](https://core.telegram.org/bots/payments/currencies.json), it shows the number of digits past the decimal point for each currency (2 for the majority of currencies). Defaults to 0
     */
    max_tip_amount?: number;
    /**
     * A JSON-serialized array of suggested amounts of tips in the *smallest units* of the currency (integer, **not** float/double). At most 4 suggested tip amounts can be specified. The suggested tip amounts must be positive, passed in a strictly increased order and must not exceed *max\_tip\_amount*.
     */
    suggested_tip_amounts?: number[];
    /**
     * JSON-serialized data about the invoice, which will be shared with the payment provider. A detailed description of required fields should be provided by the payment provider.
     */
    provider_data?: string;
    /**
     * URL of the product photo for the invoice. Can be a photo of the goods or a marketing image for a service.
     */
    photo_url?: string;
    /**
     * Photo size in bytes
     */
    photo_size?: number;
    /**
     * Photo width
     */
    photo_width?: number;
    /**
     * Photo height
     */
    photo_height?: number;
    /**
     * Pass *True* if you require the user's full name to complete the order
     */
    need_name?: boolean;
    /**
     * Pass *True* if you require the user's phone number to complete the order
     */
    need_phone_number?: boolean;
    /**
     * Pass *True* if you require the user's email address to complete the order
     */
    need_email?: boolean;
    /**
     * Pass *True* if you require the user's shipping address to complete the order
     */
    need_shipping_address?: boolean;
    /**
     * Pass *True* if the user's phone number should be sent to the provider
     */
    send_phone_number_to_provider?: boolean;
    /**
     * Pass *True* if the user's email address should be sent to the provider
     */
    send_email_to_provider?: boolean;
    /**
     * Pass *True* if the final price depends on the shipping method
     */
    is_flexible?: boolean;
}

/**
 * Use this method to create a link for an invoice. Returns the created invoice link as *String* on success.
 *
 * {@link https://core.telegram.org/bots/api/#createinvoicelink | [Documentation]}
 */
export type CreateInvoiceLink = (
    params: CreateInvoiceLinkParams,
) => Promise<string>;

export interface AnswerShippingQueryParams {
    /**
     * Unique identifier for the query to be answered
     */
    shipping_query_id: string;
    /**
     * Pass *True* if delivery to the specified address is possible and *False* if there are any problems (for example, if delivery to the specified address is not possible)
     */
    ok: boolean;
    /**
     * Required if *ok* is *True*. A JSON-serialized array of available shipping options.
     */
    shipping_options?: Objects.TelegramShippingOption[];
    /**
     * Required if *ok* is *False*. Error message in human readable form that explains why it is impossible to complete the order (e.g. "Sorry, delivery to your desired address is unavailable'). Telegram will display this message to the user.
     */
    error_message?: string;
}

/**
 * If you sent an invoice requesting a shipping address and the parameter *is\_flexible* was specified, the Bot API will send an [Update](https://core.telegram.org/bots/api/#update) with a *shipping\_query* field to the bot. Use this method to reply to shipping queries. On success, *True* is returned.
 *
 * {@link https://core.telegram.org/bots/api/#answershippingquery | [Documentation]}
 */
export type AnswerShippingQuery = (
    params: AnswerShippingQueryParams,
) => Promise<boolean>;

export interface AnswerPreCheckoutQueryParams {
    /**
     * Unique identifier for the query to be answered
     */
    pre_checkout_query_id: string;
    /**
     * Specify *True* if everything is alright (goods are available, etc.) and the bot is ready to proceed with the order. Use *False* if there are any problems.
     */
    ok: boolean;
    /**
     * Required if *ok* is *False*. Error message in human readable form that explains the reason for failure to proceed with the checkout (e.g. "Sorry, somebody just bought the last of our amazing black T-shirts while you were busy filling out your payment details. Please choose a different color or garment!"). Telegram will display this message to the user.
     */
    error_message?: string;
}

/**
 * Once the user has confirmed their payment and shipping details, the Bot API sends the final confirmation in the form of an [Update](https://core.telegram.org/bots/api/#update) with the field *pre\_checkout\_query*. Use this method to respond to such pre-checkout queries. On success, *True* is returned. **Note:** The Bot API must receive an answer within 10 seconds after the pre-checkout query was sent.
 *
 * {@link https://core.telegram.org/bots/api/#answerprecheckoutquery | [Documentation]}
 */
export type AnswerPreCheckoutQuery = (
    params: AnswerPreCheckoutQueryParams,
) => Promise<boolean>;

export interface SetPassportDataErrorsParams {
    /**
     * User identifier
     */
    user_id: number;
    /**
     * A JSON-serialized array describing the errors
     */
    errors: Objects.TelegramPassportElementError[];
}

/**
 * Informs a user that some of the Telegram Passport elements they provided contains errors. The user will not be able to re-submit their Passport to you until the errors are fixed (the contents of the field for which you returned the error must change). Returns *True* on success.
 *
 * Use this if the data submitted by the user doesn't satisfy the standards your service requires for any reason. For example, if a birthday date seems invalid, a submitted document is blurry, a scan shows evidence of tampering, etc. Supply some details in the error message to make sure the user knows how to correct the issues.
 *
 * {@link https://core.telegram.org/bots/api/#setpassportdataerrors | [Documentation]}
 */
export type SetPassportDataErrors = (
    params: SetPassportDataErrorsParams,
) => Promise<boolean>;

export interface SendGameParams {
    /**
     * Unique identifier for the target chat
     */
    chat_id: number;
    /**
     * Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     */
    message_thread_id?: number;
    /**
     * Short name of the game, serves as the unique identifier for the game. Set up your games via [@BotFather](https://t.me/botfather).
     */
    game_short_name: string;
    /**
     * Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages). Users will receive a notification with no sound.
     */
    disable_notification?: boolean;
    /**
     * Protects the contents of the sent message from forwarding and saving
     */
    protect_content?: boolean;
    /**
     * If the message is a reply, ID of the original message
     */
    reply_to_message_id?: number;
    /**
     * Pass *True* if the message should be sent even if the specified replied-to message is not found
     */
    allow_sending_without_reply?: boolean;
    /**
     * A JSON-serialized object for an [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards). If empty, one 'Play game\_title' button will be shown. If not empty, the first button must launch the game.
     */
    reply_markup?: Objects.TelegramInlineKeyboardMarkup;
}

/**
 * Use this method to send a game. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
 *
 * {@link https://core.telegram.org/bots/api/#sendgame | [Documentation]}
 */
export type SendGame = (
    params: SendGameParams,
) => Promise<Objects.TelegramMessage>;

export interface SetGameScoreParams {
    /**
     * User identifier
     */
    user_id: number;
    /**
     * New score, must be non-negative
     */
    score: number;
    /**
     * Pass *True* if the high score is allowed to decrease. This can be useful when fixing mistakes or banning cheaters
     */
    force?: boolean;
    /**
     * Pass *True* if the game message should not be automatically edited to include the current scoreboard
     */
    disable_edit_message?: boolean;
    /**
     * Required if *inline\_message\_id* is not specified. Unique identifier for the target chat
     */
    chat_id?: number;
    /**
     * Required if *inline\_message\_id* is not specified. Identifier of the sent message
     */
    message_id?: number;
    /**
     * Required if *chat\_id* and *message\_id* are not specified. Identifier of the inline message
     */
    inline_message_id?: string;
}

/**
 * Use this method to set the score of the specified user in a game message. On success, if the message is not an inline message, the [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned. Returns an error, if the new score is not greater than the user's current score in the chat and *force* is *False*.
 *
 * {@link https://core.telegram.org/bots/api/#setgamescore | [Documentation]}
 */
export type SetGameScore = (
    params: SetGameScoreParams,
) => Promise<Objects.TelegramMessage | boolean>;

export interface GetGameHighScoresParams {
    /**
     * Target user id
     */
    user_id: number;
    /**
     * Required if *inline\_message\_id* is not specified. Unique identifier for the target chat
     */
    chat_id?: number;
    /**
     * Required if *inline\_message\_id* is not specified. Identifier of the sent message
     */
    message_id?: number;
    /**
     * Required if *chat\_id* and *message\_id* are not specified. Identifier of the inline message
     */
    inline_message_id?: string;
}

/**
 * Use this method to get data for high score tables. Will return the score of the specified user and several of their neighbors in a game. Returns an Array of [GameHighScore](https://core.telegram.org/bots/api/#gamehighscore) objects.
 *
 * This method will currently return scores for the target user, plus two of their closest neighbors on each side. Will also return the top three users if the user and their neighbors are not among them. Please note that this behavior is subject to change.
 *
 * {@link https://core.telegram.org/bots/api/#getgamehighscores | [Documentation]}
 */
export type GetGameHighScores = (
    params: GetGameHighScoresParams,
) => Promise<Objects.TelegramGameHighScore[]>;
