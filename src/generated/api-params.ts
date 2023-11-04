/**
 * Based on Bot Api v6.9.0 (22.9.2023)
 * Generated at 04.11.2023, 16:23:24 using {@link https://ark0f.github.io/tg-bot-api | [this repository]}
 */
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

export interface DeleteWebhookParams {
    /**
     * Pass *True* to drop all pending updates
     */
    drop_pending_updates?: boolean;
}

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

export interface GetFileParams {
    /**
     * File identifier to get information about
     */
    file_id: string;
}

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

export interface ExportChatInviteLinkParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
}

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

export interface DeleteChatPhotoParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
}

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

export interface UnpinAllChatMessagesParams {
    /**
     * Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     */
    chat_id: number | string;
}

export interface LeaveChatParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup or channel (in the format `@channelusername`)
     */
    chat_id: number | string;
}

export interface GetChatParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup or channel (in the format `@channelusername`)
     */
    chat_id: number | string;
}

export interface GetChatAdministratorsParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup or channel (in the format `@channelusername`)
     */
    chat_id: number | string;
}

export interface GetChatMemberCountParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup or channel (in the format `@channelusername`)
     */
    chat_id: number | string;
}

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

export interface DeleteChatStickerSetParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
}

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

export interface CloseGeneralForumTopicParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
}

export interface ReopenGeneralForumTopicParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
}

export interface HideGeneralForumTopicParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
}

export interface UnhideGeneralForumTopicParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
}

export interface UnpinAllGeneralForumTopicMessagesParams {
    /**
     * Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     */
    chat_id: number | string;
}

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

export interface GetMyNameParams {
    /**
     * A two-letter ISO 639-1 language code or an empty string
     */
    language_code?: string;
}

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

export interface GetMyDescriptionParams {
    /**
     * A two-letter ISO 639-1 language code or an empty string
     */
    language_code?: string;
}

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

export interface GetMyShortDescriptionParams {
    /**
     * A two-letter ISO 639-1 language code or an empty string
     */
    language_code?: string;
}

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

export interface GetChatMenuButtonParams {
    /**
     * Unique identifier for the target private chat. If not specified, default bot's menu button will be returned
     */
    chat_id?: number;
}

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

export interface GetMyDefaultAdministratorRightsParams {
    /**
     * Pass *True* to get default administrator rights of the bot in channels. Otherwise, default administrator rights of the bot for groups and supergroups will be returned.
     */
    for_channels?: boolean;
}

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

export interface GetStickerSetParams {
    /**
     * Name of the sticker set
     */
    name: string;
}

export interface GetCustomEmojiStickersParams {
    /**
     * List of custom emoji identifiers. At most 200 custom emoji identifiers can be specified.
     */
    custom_emoji_ids: string[];
}

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

export interface DeleteStickerFromSetParams {
    /**
     * File identifier of the sticker
     */
    sticker: string;
}

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

export interface DeleteStickerSetParams {
    /**
     * Sticker set name
     */
    name: string;
}

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
