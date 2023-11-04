/**
 * Based on Bot Api v6.9.0 (22.9.2023)
 * Generated at 04.11.2023, 16:23:24 using {@link https://ark0f.github.io/tg-bot-api | [this repository]}
 */
import * as Params from "./api-params";
import * as Objects from "./objects";

type TCallApi<T, R> = (params: T) => Promise<R>;
type TCallApiWithoutParams<R> = () => Promise<R>;
type TCallApiWithOptionalParams<T, R> = (params?: T) => Promise<R>;

export interface ApiMethods {
    /**
     * Use this method to receive incoming updates using long polling ([wiki](https://en.wikipedia.org/wiki/Push_technology#Long_polling)). Returns an Array of [Update](https://core.telegram.org/bots/api/#update) objects.
     *
     * {@link https://core.telegram.org/bots/api/#getupdates | [Documentation]}
     */
    getUpdates: TCallApiWithOptionalParams<
        Params.GetUpdatesParams,
        Objects.TelegramUpdate[]
    >;
    /**
     * Use this method to specify a URL and receive incoming updates via an outgoing webhook. Whenever there is an update for the bot, we will send an HTTPS POST request to the specified URL, containing a JSON-serialized [Update](https://core.telegram.org/bots/api/#update). In case of an unsuccessful request, we will give up after a reasonable amount of attempts. Returns *True* on success.
     *
     * If you'd like to make sure that the webhook was set by you, you can specify secret data in the parameter *secret\_token*. If specified, the request will contain a header “X-Telegram-Bot-Api-Secret-Token” with the secret token as content.
     *
     * {@link https://core.telegram.org/bots/api/#setwebhook | [Documentation]}
     */
    setWebhook: TCallApiWithOptionalParams<Params.SetWebhookParams, boolean>;
    /**
     * Use this method to remove webhook integration if you decide to switch back to [getUpdates](https://core.telegram.org/bots/api/#getupdates). Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#deletewebhook | [Documentation]}
     */
    deleteWebhook: TCallApiWithOptionalParams<
        Params.DeleteWebhookParams,
        boolean
    >;
    /**
     * Use this method to get current webhook status. Requires no parameters. On success, returns a [WebhookInfo](https://core.telegram.org/bots/api/#webhookinfo) object. If the bot is using [getUpdates](https://core.telegram.org/bots/api/#getupdates), will return an object with the *url* field empty.
     *
     * {@link https://core.telegram.org/bots/api/#getwebhookinfo | [Documentation]}
     */
    getWebhookInfo: TCallApiWithoutParams<Objects.TelegramWebhookInfo>;
    /**
     * A simple method for testing your bot's authentication token. Requires no parameters. Returns basic information about the bot in form of a [User](https://core.telegram.org/bots/api/#user) object.
     *
     * {@link https://core.telegram.org/bots/api/#getme | [Documentation]}
     */
    getMe: TCallApiWithoutParams<Objects.TelegramUser>;
    /**
     * Use this method to log out from the cloud Bot API server before launching the bot locally. You **must** log out the bot before running it locally, otherwise there is no guarantee that the bot will receive updates. After a successful call, you can immediately log in on a local server, but will not be able to log in back to the cloud Bot API server for 10 minutes. Returns *True* on success. Requires no parameters.
     *
     * {@link https://core.telegram.org/bots/api/#logout | [Documentation]}
     */
    logOut: TCallApiWithoutParams<boolean>;
    /**
     * Use this method to close the bot instance before moving it from one local server to another. You need to delete the webhook before calling this method to ensure that the bot isn't launched again after server restart. The method will return error 429 in the first 10 minutes after the bot is launched. Returns *True* on success. Requires no parameters.
     *
     * {@link https://core.telegram.org/bots/api/#close | [Documentation]}
     */
    close: TCallApiWithoutParams<boolean>;
    /**
     * Use this method to send text messages. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
     *
     * {@link https://core.telegram.org/bots/api/#sendmessage | [Documentation]}
     */
    sendMessage: TCallApiWithOptionalParams<
        Params.SendMessageParams,
        Objects.TelegramMessage
    >;
    /**
     * Use this method to forward messages of any kind. Service messages can't be forwarded. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
     *
     * {@link https://core.telegram.org/bots/api/#forwardmessage | [Documentation]}
     */
    forwardMessage: TCallApiWithOptionalParams<
        Params.ForwardMessageParams,
        Objects.TelegramMessage
    >;
    /**
     * Use this method to copy messages of any kind. Service messages and invoice messages can't be copied. A quiz [poll](https://core.telegram.org/bots/api/#poll) can be copied only if the value of the field *correct\_option\_id* is known to the bot. The method is analogous to the method [forwardMessage](https://core.telegram.org/bots/api/#forwardmessage), but the copied message doesn't have a link to the original message. Returns the [MessageId](https://core.telegram.org/bots/api/#messageid) of the sent message on success.
     *
     * {@link https://core.telegram.org/bots/api/#copymessage | [Documentation]}
     */
    copyMessage: TCallApiWithOptionalParams<
        Params.CopyMessageParams,
        Objects.TelegramMessageId
    >;
    /**
     * Use this method to send photos. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
     *
     * {@link https://core.telegram.org/bots/api/#sendphoto | [Documentation]}
     */
    sendPhoto: TCallApiWithOptionalParams<
        Params.SendPhotoParams,
        Objects.TelegramMessage
    >;
    /**
     * Use this method to send audio files, if you want Telegram clients to display them in the music player. Your audio must be in the .MP3 or .M4A format. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned. Bots can currently send audio files of up to 50 MB in size, this limit may be changed in the future.
     *
     * For sending voice messages, use the [sendVoice](https://core.telegram.org/bots/api/#sendvoice) method instead.
     *
     * {@link https://core.telegram.org/bots/api/#sendaudio | [Documentation]}
     */
    sendAudio: TCallApiWithOptionalParams<
        Params.SendAudioParams,
        Objects.TelegramMessage
    >;
    /**
     * Use this method to send general files. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned. Bots can currently send files of any type of up to 50 MB in size, this limit may be changed in the future.
     *
     * {@link https://core.telegram.org/bots/api/#senddocument | [Documentation]}
     */
    sendDocument: TCallApiWithOptionalParams<
        Params.SendDocumentParams,
        Objects.TelegramMessage
    >;
    /**
     * Use this method to send video files, Telegram clients support MPEG4 videos (other formats may be sent as [Document](https://core.telegram.org/bots/api/#document)). On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned. Bots can currently send video files of up to 50 MB in size, this limit may be changed in the future.
     *
     * {@link https://core.telegram.org/bots/api/#sendvideo | [Documentation]}
     */
    sendVideo: TCallApiWithOptionalParams<
        Params.SendVideoParams,
        Objects.TelegramMessage
    >;
    /**
     * Use this method to send animation files (GIF or H.264/MPEG-4 AVC video without sound). On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned. Bots can currently send animation files of up to 50 MB in size, this limit may be changed in the future.
     *
     * {@link https://core.telegram.org/bots/api/#sendanimation | [Documentation]}
     */
    sendAnimation: TCallApiWithOptionalParams<
        Params.SendAnimationParams,
        Objects.TelegramMessage
    >;
    /**
     * Use this method to send audio files, if you want Telegram clients to display the file as a playable voice message. For this to work, your audio must be in an .OGG file encoded with OPUS (other formats may be sent as [Audio](https://core.telegram.org/bots/api/#audio) or [Document](https://core.telegram.org/bots/api/#document)). On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned. Bots can currently send voice messages of up to 50 MB in size, this limit may be changed in the future.
     *
     * {@link https://core.telegram.org/bots/api/#sendvoice | [Documentation]}
     */
    sendVoice: TCallApiWithOptionalParams<
        Params.SendVoiceParams,
        Objects.TelegramMessage
    >;
    /**
     * As of [v.4.0](https://telegram.org/blog/video-messages-and-telescope), Telegram clients support rounded square MPEG4 videos of up to 1 minute long. Use this method to send video messages. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
     *
     * {@link https://core.telegram.org/bots/api/#sendvideonote | [Documentation]}
     */
    sendVideoNote: TCallApiWithOptionalParams<
        Params.SendVideoNoteParams,
        Objects.TelegramMessage
    >;
    /**
     * Use this method to send a group of photos, videos, documents or audios as an album. Documents and audio files can be only grouped in an album with messages of the same type. On success, an array of [Messages](https://core.telegram.org/bots/api/#message) that were sent is returned.
     *
     * {@link https://core.telegram.org/bots/api/#sendmediagroup | [Documentation]}
     */
    sendMediaGroup: TCallApiWithOptionalParams<
        Params.SendMediaGroupParams,
        Objects.TelegramMessage[]
    >;
    /**
     * Use this method to send point on the map. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
     *
     * {@link https://core.telegram.org/bots/api/#sendlocation | [Documentation]}
     */
    sendLocation: TCallApiWithOptionalParams<
        Params.SendLocationParams,
        Objects.TelegramMessage
    >;
    /**
     * Use this method to send information about a venue. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
     *
     * {@link https://core.telegram.org/bots/api/#sendvenue | [Documentation]}
     */
    sendVenue: TCallApiWithOptionalParams<
        Params.SendVenueParams,
        Objects.TelegramMessage
    >;
    /**
     * Use this method to send phone contacts. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
     *
     * {@link https://core.telegram.org/bots/api/#sendcontact | [Documentation]}
     */
    sendContact: TCallApiWithOptionalParams<
        Params.SendContactParams,
        Objects.TelegramMessage
    >;
    /**
     * Use this method to send a native poll. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
     *
     * {@link https://core.telegram.org/bots/api/#sendpoll | [Documentation]}
     */
    sendPoll: TCallApiWithOptionalParams<
        Params.SendPollParams,
        Objects.TelegramMessage
    >;
    /**
     * Use this method to send an animated emoji that will display a random value. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
     *
     * {@link https://core.telegram.org/bots/api/#senddice | [Documentation]}
     */
    sendDice: TCallApiWithOptionalParams<
        Params.SendDiceParams,
        Objects.TelegramMessage
    >;
    /**
     * Use this method when you need to tell the user that something is happening on the bot's side. The status is set for 5 seconds or less (when a message arrives from your bot, Telegram clients clear its typing status). Returns *True* on success.
     *
     * Example: The [ImageBot](https://t.me/imagebot) needs some time to process a request and upload the image. Instead of sending a text message along the lines of “Retrieving image, please wait…”, the bot may use [sendChatAction](https://core.telegram.org/bots/api/#sendchataction) with *action* = *upload\_photo*. The user will see a “sending photo” status for the bot.
     *
     * We only recommend using this method when a response from the bot will take a **noticeable** amount of time to arrive.
     *
     * {@link https://core.telegram.org/bots/api/#sendchataction | [Documentation]}
     */
    sendChatAction: TCallApiWithOptionalParams<
        Params.SendChatActionParams,
        boolean
    >;
    /**
     * Use this method to get a list of profile pictures for a user. Returns a [UserProfilePhotos](https://core.telegram.org/bots/api/#userprofilephotos) object.
     *
     * {@link https://core.telegram.org/bots/api/#getuserprofilephotos | [Documentation]}
     */
    getUserProfilePhotos: TCallApiWithOptionalParams<
        Params.GetUserProfilePhotosParams,
        Objects.TelegramUserProfilePhotos
    >;
    /**
     * Use this method to get basic information about a file and prepare it for downloading. For the moment, bots can download files of up to 20MB in size. On success, a [File](https://core.telegram.org/bots/api/#file) object is returned. The file can then be downloaded via the link `https://api.telegram.org/file/bot<token>/<file_path>`, where `<file_path>` is taken from the response. It is guaranteed that the link will be valid for at least 1 hour. When the link expires, a new one can be requested by calling [getFile](https://core.telegram.org/bots/api/#getfile) again.
     *
     * {@link https://core.telegram.org/bots/api/#getfile | [Documentation]}
     */
    getFile: TCallApi<Params.GetFileParams, Objects.TelegramFile>;
    /**
     * Use this method to ban a user in a group, a supergroup or a channel. In the case of supergroups and channels, the user will not be able to return to the chat on their own using invite links, etc., unless [unbanned](https://core.telegram.org/bots/api/#unbanchatmember) first. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#banchatmember | [Documentation]}
     */
    banChatMember: TCallApiWithOptionalParams<
        Params.BanChatMemberParams,
        boolean
    >;
    /**
     * Use this method to unban a previously banned user in a supergroup or channel. The user will **not** return to the group or channel automatically, but will be able to join via link, etc. The bot must be an administrator for this to work. By default, this method guarantees that after the call the user is not a member of the chat, but will be able to join it. So if the user is a member of the chat they will also be **removed** from the chat. If you don't want this, use the parameter *only\_if\_banned*. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#unbanchatmember | [Documentation]}
     */
    unbanChatMember: TCallApiWithOptionalParams<
        Params.UnbanChatMemberParams,
        boolean
    >;
    /**
     * Use this method to restrict a user in a supergroup. The bot must be an administrator in the supergroup for this to work and must have the appropriate administrator rights. Pass *True* for all permissions to lift restrictions from a user. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#restrictchatmember | [Documentation]}
     */
    restrictChatMember: TCallApiWithOptionalParams<
        Params.RestrictChatMemberParams,
        boolean
    >;
    /**
     * Use this method to promote or demote a user in a supergroup or a channel. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Pass *False* for all boolean parameters to demote a user. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#promotechatmember | [Documentation]}
     */
    promoteChatMember: TCallApiWithOptionalParams<
        Params.PromoteChatMemberParams,
        boolean
    >;
    /**
     * Use this method to set a custom title for an administrator in a supergroup promoted by the bot. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#setchatadministratorcustomtitle | [Documentation]}
     */
    setChatAdministratorCustomTitle: TCallApi<
        Params.SetChatAdministratorCustomTitleParams,
        boolean
    >;
    /**
     * Use this method to ban a channel chat in a supergroup or a channel. Until the chat is [unbanned](https://core.telegram.org/bots/api/#unbanchatsenderchat), the owner of the banned chat won't be able to send messages on behalf of **any of their channels**. The bot must be an administrator in the supergroup or channel for this to work and must have the appropriate administrator rights. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#banchatsenderchat | [Documentation]}
     */
    banChatSenderChat: TCallApi<Params.BanChatSenderChatParams, boolean>;
    /**
     * Use this method to unban a previously banned channel chat in a supergroup or channel. The bot must be an administrator for this to work and must have the appropriate administrator rights. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#unbanchatsenderchat | [Documentation]}
     */
    unbanChatSenderChat: TCallApi<Params.UnbanChatSenderChatParams, boolean>;
    /**
     * Use this method to set default chat permissions for all members. The bot must be an administrator in the group or a supergroup for this to work and must have the *can\_restrict\_members* administrator rights. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#setchatpermissions | [Documentation]}
     */
    setChatPermissions: TCallApiWithOptionalParams<
        Params.SetChatPermissionsParams,
        boolean
    >;
    /**
     * Use this method to generate a new primary invite link for a chat; any previously generated primary link is revoked. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns the new invite link as *String* on success.
     *
     * {@link https://core.telegram.org/bots/api/#exportchatinvitelink | [Documentation]}
     */
    exportChatInviteLink: TCallApi<Params.ExportChatInviteLinkParams, string>;
    /**
     * Use this method to create an additional invite link for a chat. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. The link can be revoked using the method [revokeChatInviteLink](https://core.telegram.org/bots/api/#revokechatinvitelink). Returns the new invite link as [ChatInviteLink](https://core.telegram.org/bots/api/#chatinvitelink) object.
     *
     * {@link https://core.telegram.org/bots/api/#createchatinvitelink | [Documentation]}
     */
    createChatInviteLink: TCallApiWithOptionalParams<
        Params.CreateChatInviteLinkParams,
        Objects.TelegramChatInviteLink
    >;
    /**
     * Use this method to edit a non-primary invite link created by the bot. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns the edited invite link as a [ChatInviteLink](https://core.telegram.org/bots/api/#chatinvitelink) object.
     *
     * {@link https://core.telegram.org/bots/api/#editchatinvitelink | [Documentation]}
     */
    editChatInviteLink: TCallApiWithOptionalParams<
        Params.EditChatInviteLinkParams,
        Objects.TelegramChatInviteLink
    >;
    /**
     * Use this method to revoke an invite link created by the bot. If the primary link is revoked, a new link is automatically generated. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns the revoked invite link as [ChatInviteLink](https://core.telegram.org/bots/api/#chatinvitelink) object.
     *
     * {@link https://core.telegram.org/bots/api/#revokechatinvitelink | [Documentation]}
     */
    revokeChatInviteLink: TCallApi<
        Params.RevokeChatInviteLinkParams,
        Objects.TelegramChatInviteLink
    >;
    /**
     * Use this method to approve a chat join request. The bot must be an administrator in the chat for this to work and must have the *can\_invite\_users* administrator right. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#approvechatjoinrequest | [Documentation]}
     */
    approveChatJoinRequest: TCallApi<
        Params.ApproveChatJoinRequestParams,
        boolean
    >;
    /**
     * Use this method to decline a chat join request. The bot must be an administrator in the chat for this to work and must have the *can\_invite\_users* administrator right. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#declinechatjoinrequest | [Documentation]}
     */
    declineChatJoinRequest: TCallApi<
        Params.DeclineChatJoinRequestParams,
        boolean
    >;
    /**
     * Use this method to set a new profile photo for the chat. Photos can't be changed for private chats. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#setchatphoto | [Documentation]}
     */
    setChatPhoto: TCallApi<Params.SetChatPhotoParams, boolean>;
    /**
     * Use this method to delete a chat photo. Photos can't be changed for private chats. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#deletechatphoto | [Documentation]}
     */
    deleteChatPhoto: TCallApi<Params.DeleteChatPhotoParams, boolean>;
    /**
     * Use this method to change the title of a chat. Titles can't be changed for private chats. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#setchattitle | [Documentation]}
     */
    setChatTitle: TCallApi<Params.SetChatTitleParams, boolean>;
    /**
     * Use this method to change the description of a group, a supergroup or a channel. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#setchatdescription | [Documentation]}
     */
    setChatDescription: TCallApiWithOptionalParams<
        Params.SetChatDescriptionParams,
        boolean
    >;
    /**
     * Use this method to add a message to the list of pinned messages in a chat. If the chat is not a private chat, the bot must be an administrator in the chat for this to work and must have the 'can\_pin\_messages' administrator right in a supergroup or 'can\_edit\_messages' administrator right in a channel. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#pinchatmessage | [Documentation]}
     */
    pinChatMessage: TCallApiWithOptionalParams<
        Params.PinChatMessageParams,
        boolean
    >;
    /**
     * Use this method to remove a message from the list of pinned messages in a chat. If the chat is not a private chat, the bot must be an administrator in the chat for this to work and must have the 'can\_pin\_messages' administrator right in a supergroup or 'can\_edit\_messages' administrator right in a channel. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#unpinchatmessage | [Documentation]}
     */
    unpinChatMessage: TCallApiWithOptionalParams<
        Params.UnpinChatMessageParams,
        boolean
    >;
    /**
     * Use this method to clear the list of pinned messages in a chat. If the chat is not a private chat, the bot must be an administrator in the chat for this to work and must have the 'can\_pin\_messages' administrator right in a supergroup or 'can\_edit\_messages' administrator right in a channel. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#unpinallchatmessages | [Documentation]}
     */
    unpinAllChatMessages: TCallApi<Params.UnpinAllChatMessagesParams, boolean>;
    /**
     * Use this method for your bot to leave a group, supergroup or channel. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#leavechat | [Documentation]}
     */
    leaveChat: TCallApi<Params.LeaveChatParams, boolean>;
    /**
     * Use this method to get up to date information about the chat (current name of the user for one-on-one conversations, current username of a user, group or channel, etc.). Returns a [Chat](https://core.telegram.org/bots/api/#chat) object on success.
     *
     * {@link https://core.telegram.org/bots/api/#getchat | [Documentation]}
     */
    getChat: TCallApi<Params.GetChatParams, Objects.TelegramChat>;
    /**
     * Use this method to get a list of administrators in a chat, which aren't bots. Returns an Array of [ChatMember](https://core.telegram.org/bots/api/#chatmember) objects.
     *
     * {@link https://core.telegram.org/bots/api/#getchatadministrators | [Documentation]}
     */
    getChatAdministrators: TCallApi<
        Params.GetChatAdministratorsParams,
        Objects.TelegramChatMember[]
    >;
    /**
     * Use this method to get the number of members in a chat. Returns *Int* on success.
     *
     * {@link https://core.telegram.org/bots/api/#getchatmembercount | [Documentation]}
     */
    getChatMemberCount: TCallApi<Params.GetChatMemberCountParams, number>;
    /**
     * Use this method to get information about a member of a chat. The method is only guaranteed to work for other users if the bot is an administrator in the chat. Returns a [ChatMember](https://core.telegram.org/bots/api/#chatmember) object on success.
     *
     * {@link https://core.telegram.org/bots/api/#getchatmember | [Documentation]}
     */
    getChatMember: TCallApi<
        Params.GetChatMemberParams,
        Objects.TelegramChatMember
    >;
    /**
     * Use this method to set a new group sticker set for a supergroup. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Use the field *can\_set\_sticker\_set* optionally returned in [getChat](https://core.telegram.org/bots/api/#getchat) requests to check if the bot can use this method. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#setchatstickerset | [Documentation]}
     */
    setChatStickerSet: TCallApi<Params.SetChatStickerSetParams, boolean>;
    /**
     * Use this method to delete a group sticker set from a supergroup. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Use the field *can\_set\_sticker\_set* optionally returned in [getChat](https://core.telegram.org/bots/api/#getchat) requests to check if the bot can use this method. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#deletechatstickerset | [Documentation]}
     */
    deleteChatStickerSet: TCallApi<Params.DeleteChatStickerSetParams, boolean>;
    /**
     * Use this method to get custom emoji stickers, which can be used as a forum topic icon by any user. Requires no parameters. Returns an Array of [Sticker](https://core.telegram.org/bots/api/#sticker) objects.
     *
     * {@link https://core.telegram.org/bots/api/#getforumtopiciconstickers | [Documentation]}
     */
    getForumTopicIconStickers: TCallApiWithoutParams<Objects.TelegramSticker[]>;
    /**
     * Use this method to create a topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the *can\_manage\_topics* administrator rights. Returns information about the created topic as a [ForumTopic](https://core.telegram.org/bots/api/#forumtopic) object.
     *
     * {@link https://core.telegram.org/bots/api/#createforumtopic | [Documentation]}
     */
    createForumTopic: TCallApiWithOptionalParams<
        Params.CreateForumTopicParams,
        Objects.TelegramForumTopic
    >;
    /**
     * Use this method to edit name and icon of a topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have *can\_manage\_topics* administrator rights, unless it is the creator of the topic. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#editforumtopic | [Documentation]}
     */
    editForumTopic: TCallApiWithOptionalParams<
        Params.EditForumTopicParams,
        boolean
    >;
    /**
     * Use this method to close an open topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the *can\_manage\_topics* administrator rights, unless it is the creator of the topic. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#closeforumtopic | [Documentation]}
     */
    closeForumTopic: TCallApi<Params.CloseForumTopicParams, boolean>;
    /**
     * Use this method to reopen a closed topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the *can\_manage\_topics* administrator rights, unless it is the creator of the topic. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#reopenforumtopic | [Documentation]}
     */
    reopenForumTopic: TCallApi<Params.ReopenForumTopicParams, boolean>;
    /**
     * Use this method to delete a forum topic along with all its messages in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the *can\_delete\_messages* administrator rights. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#deleteforumtopic | [Documentation]}
     */
    deleteForumTopic: TCallApi<Params.DeleteForumTopicParams, boolean>;
    /**
     * Use this method to clear the list of pinned messages in a forum topic. The bot must be an administrator in the chat for this to work and must have the *can\_pin\_messages* administrator right in the supergroup. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#unpinallforumtopicmessages | [Documentation]}
     */
    unpinAllForumTopicMessages: TCallApi<
        Params.UnpinAllForumTopicMessagesParams,
        boolean
    >;
    /**
     * Use this method to edit the name of the 'General' topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have *can\_manage\_topics* administrator rights. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#editgeneralforumtopic | [Documentation]}
     */
    editGeneralForumTopic: TCallApi<
        Params.EditGeneralForumTopicParams,
        boolean
    >;
    /**
     * Use this method to close an open 'General' topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the *can\_manage\_topics* administrator rights. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#closegeneralforumtopic | [Documentation]}
     */
    closeGeneralForumTopic: TCallApi<
        Params.CloseGeneralForumTopicParams,
        boolean
    >;
    /**
     * Use this method to reopen a closed 'General' topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the *can\_manage\_topics* administrator rights. The topic will be automatically unhidden if it was hidden. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#reopengeneralforumtopic | [Documentation]}
     */
    reopenGeneralForumTopic: TCallApi<
        Params.ReopenGeneralForumTopicParams,
        boolean
    >;
    /**
     * Use this method to hide the 'General' topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the *can\_manage\_topics* administrator rights. The topic will be automatically closed if it was open. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#hidegeneralforumtopic | [Documentation]}
     */
    hideGeneralForumTopic: TCallApi<
        Params.HideGeneralForumTopicParams,
        boolean
    >;
    /**
     * Use this method to unhide the 'General' topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the *can\_manage\_topics* administrator rights. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#unhidegeneralforumtopic | [Documentation]}
     */
    unhideGeneralForumTopic: TCallApi<
        Params.UnhideGeneralForumTopicParams,
        boolean
    >;
    /**
     * Use this method to clear the list of pinned messages in a General forum topic. The bot must be an administrator in the chat for this to work and must have the *can\_pin\_messages* administrator right in the supergroup. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#unpinallgeneralforumtopicmessages | [Documentation]}
     */
    unpinAllGeneralForumTopicMessages: TCallApi<
        Params.UnpinAllGeneralForumTopicMessagesParams,
        boolean
    >;
    /**
     * Use this method to send answers to callback queries sent from [inline keyboards](https://core.telegram.org/bots/features#inline-keyboards). The answer will be displayed to the user as a notification at the top of the chat screen or as an alert. On success, *True* is returned.
     *
     * Alternatively, the user can be redirected to the specified Game URL. For this option to work, you must first create a game for your bot via [@BotFather](https://t.me/botfather) and accept the terms. Otherwise, you may use links like `t.me/your_bot?start=XXXX` that open your bot with a parameter.
     *
     * {@link https://core.telegram.org/bots/api/#answercallbackquery | [Documentation]}
     */
    answerCallbackQuery: TCallApiWithOptionalParams<
        Params.AnswerCallbackQueryParams,
        boolean
    >;
    /**
     * Use this method to change the list of the bot's commands. See [this manual](https://core.telegram.org/bots/features#commands) for more details about bot commands. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#setmycommands | [Documentation]}
     */
    setMyCommands: TCallApiWithOptionalParams<
        Params.SetMyCommandsParams,
        boolean
    >;
    /**
     * Use this method to delete the list of the bot's commands for the given scope and user language. After deletion, [higher level commands](https://core.telegram.org/bots/api/#determining-list-of-commands) will be shown to affected users. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#deletemycommands | [Documentation]}
     */
    deleteMyCommands: TCallApiWithOptionalParams<
        Params.DeleteMyCommandsParams,
        boolean
    >;
    /**
     * Use this method to get the current list of the bot's commands for the given scope and user language. Returns an Array of [BotCommand](https://core.telegram.org/bots/api/#botcommand) objects. If commands aren't set, an empty list is returned.
     *
     * {@link https://core.telegram.org/bots/api/#getmycommands | [Documentation]}
     */
    getMyCommands: TCallApiWithOptionalParams<
        Params.GetMyCommandsParams,
        Objects.TelegramBotCommand[]
    >;
    /**
     * Use this method to change the bot's name. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#setmyname | [Documentation]}
     */
    setMyName: TCallApiWithOptionalParams<Params.SetMyNameParams, boolean>;
    /**
     * Use this method to get the current bot name for the given user language. Returns [BotName](https://core.telegram.org/bots/api/#botname) on success.
     *
     * {@link https://core.telegram.org/bots/api/#getmyname | [Documentation]}
     */
    getMyName: TCallApiWithOptionalParams<
        Params.GetMyNameParams,
        Objects.TelegramBotName
    >;
    /**
     * Use this method to change the bot's description, which is shown in the chat with the bot if the chat is empty. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#setmydescription | [Documentation]}
     */
    setMyDescription: TCallApiWithOptionalParams<
        Params.SetMyDescriptionParams,
        boolean
    >;
    /**
     * Use this method to get the current bot description for the given user language. Returns [BotDescription](https://core.telegram.org/bots/api/#botdescription) on success.
     *
     * {@link https://core.telegram.org/bots/api/#getmydescription | [Documentation]}
     */
    getMyDescription: TCallApiWithOptionalParams<
        Params.GetMyDescriptionParams,
        Objects.TelegramBotDescription
    >;
    /**
     * Use this method to change the bot's short description, which is shown on the bot's profile page and is sent together with the link when users share the bot. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#setmyshortdescription | [Documentation]}
     */
    setMyShortDescription: TCallApiWithOptionalParams<
        Params.SetMyShortDescriptionParams,
        boolean
    >;
    /**
     * Use this method to get the current bot short description for the given user language. Returns [BotShortDescription](https://core.telegram.org/bots/api/#botshortdescription) on success.
     *
     * {@link https://core.telegram.org/bots/api/#getmyshortdescription | [Documentation]}
     */
    getMyShortDescription: TCallApiWithOptionalParams<
        Params.GetMyShortDescriptionParams,
        Objects.TelegramBotShortDescription
    >;
    /**
     * Use this method to change the bot's menu button in a private chat, or the default menu button. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#setchatmenubutton | [Documentation]}
     */
    setChatMenuButton: TCallApiWithOptionalParams<
        Params.SetChatMenuButtonParams,
        boolean
    >;
    /**
     * Use this method to get the current value of the bot's menu button in a private chat, or the default menu button. Returns [MenuButton](https://core.telegram.org/bots/api/#menubutton) on success.
     *
     * {@link https://core.telegram.org/bots/api/#getchatmenubutton | [Documentation]}
     */
    getChatMenuButton: TCallApiWithOptionalParams<
        Params.GetChatMenuButtonParams,
        Objects.TelegramMenuButton
    >;
    /**
     * Use this method to change the default administrator rights requested by the bot when it's added as an administrator to groups or channels. These rights will be suggested to users, but they are free to modify the list before adding the bot. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#setmydefaultadministratorrights | [Documentation]}
     */
    setMyDefaultAdministratorRights: TCallApiWithOptionalParams<
        Params.SetMyDefaultAdministratorRightsParams,
        boolean
    >;
    /**
     * Use this method to get the current default administrator rights of the bot. Returns [ChatAdministratorRights](https://core.telegram.org/bots/api/#chatadministratorrights) on success.
     *
     * {@link https://core.telegram.org/bots/api/#getmydefaultadministratorrights | [Documentation]}
     */
    getMyDefaultAdministratorRights: TCallApiWithOptionalParams<
        Params.GetMyDefaultAdministratorRightsParams,
        Objects.TelegramChatAdministratorRights
    >;
    /**
     * Use this method to edit text and [game](https://core.telegram.org/bots/api/#games) messages. On success, if the edited message is not an inline message, the edited [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned.
     *
     * {@link https://core.telegram.org/bots/api/#editmessagetext | [Documentation]}
     */
    editMessageText: TCallApiWithOptionalParams<
        Params.EditMessageTextParams,
        Objects.TelegramMessage | boolean
    >;
    /**
     * Use this method to edit captions of messages. On success, if the edited message is not an inline message, the edited [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned.
     *
     * {@link https://core.telegram.org/bots/api/#editmessagecaption | [Documentation]}
     */
    editMessageCaption: TCallApiWithOptionalParams<
        Params.EditMessageCaptionParams,
        Objects.TelegramMessage | boolean
    >;
    /**
     * Use this method to edit animation, audio, document, photo, or video messages. If a message is part of a message album, then it can be edited only to an audio for audio albums, only to a document for document albums and to a photo or a video otherwise. When an inline message is edited, a new file can't be uploaded; use a previously uploaded file via its file\_id or specify a URL. On success, if the edited message is not an inline message, the edited [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned.
     *
     * {@link https://core.telegram.org/bots/api/#editmessagemedia | [Documentation]}
     */
    editMessageMedia: TCallApiWithOptionalParams<
        Params.EditMessageMediaParams,
        Objects.TelegramMessage | boolean
    >;
    /**
     * Use this method to edit live location messages. A location can be edited until its *live\_period* expires or editing is explicitly disabled by a call to [stopMessageLiveLocation](https://core.telegram.org/bots/api/#stopmessagelivelocation). On success, if the edited message is not an inline message, the edited [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned.
     *
     * {@link https://core.telegram.org/bots/api/#editmessagelivelocation | [Documentation]}
     */
    editMessageLiveLocation: TCallApiWithOptionalParams<
        Params.EditMessageLiveLocationParams,
        Objects.TelegramMessage | boolean
    >;
    /**
     * Use this method to stop updating a live location message before *live\_period* expires. On success, if the message is not an inline message, the edited [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned.
     *
     * {@link https://core.telegram.org/bots/api/#stopmessagelivelocation | [Documentation]}
     */
    stopMessageLiveLocation: TCallApiWithOptionalParams<
        Params.StopMessageLiveLocationParams,
        Objects.TelegramMessage | boolean
    >;
    /**
     * Use this method to edit only the reply markup of messages. On success, if the edited message is not an inline message, the edited [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned.
     *
     * {@link https://core.telegram.org/bots/api/#editmessagereplymarkup | [Documentation]}
     */
    editMessageReplyMarkup: TCallApiWithOptionalParams<
        Params.EditMessageReplyMarkupParams,
        Objects.TelegramMessage | boolean
    >;
    /**
     * Use this method to stop a poll which was sent by the bot. On success, the stopped [Poll](https://core.telegram.org/bots/api/#poll) is returned.
     *
     * {@link https://core.telegram.org/bots/api/#stoppoll | [Documentation]}
     */
    stopPoll: TCallApiWithOptionalParams<
        Params.StopPollParams,
        Objects.TelegramPoll
    >;
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
    deleteMessage: TCallApi<Params.DeleteMessageParams, boolean>;
    /**
     * Use this method to send static .WEBP, [animated](https://telegram.org/blog/animated-stickers) .TGS, or [video](https://telegram.org/blog/video-stickers-better-reactions) .WEBM stickers. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
     *
     * {@link https://core.telegram.org/bots/api/#sendsticker | [Documentation]}
     */
    sendSticker: TCallApiWithOptionalParams<
        Params.SendStickerParams,
        Objects.TelegramMessage
    >;
    /**
     * Use this method to get a sticker set. On success, a [StickerSet](https://core.telegram.org/bots/api/#stickerset) object is returned.
     *
     * {@link https://core.telegram.org/bots/api/#getstickerset | [Documentation]}
     */
    getStickerSet: TCallApi<
        Params.GetStickerSetParams,
        Objects.TelegramStickerSet
    >;
    /**
     * Use this method to get information about custom emoji stickers by their identifiers. Returns an Array of [Sticker](https://core.telegram.org/bots/api/#sticker) objects.
     *
     * {@link https://core.telegram.org/bots/api/#getcustomemojistickers | [Documentation]}
     */
    getCustomEmojiStickers: TCallApi<
        Params.GetCustomEmojiStickersParams,
        Objects.TelegramSticker[]
    >;
    /**
     * Use this method to upload a file with a sticker for later use in the [createNewStickerSet](https://core.telegram.org/bots/api/#createnewstickerset) and [addStickerToSet](https://core.telegram.org/bots/api/#addstickertoset) methods (the file can be used multiple times). Returns the uploaded [File](https://core.telegram.org/bots/api/#file) on success.
     *
     * {@link https://core.telegram.org/bots/api/#uploadstickerfile | [Documentation]}
     */
    uploadStickerFile: TCallApi<
        Params.UploadStickerFileParams,
        Objects.TelegramFile
    >;
    /**
     * Use this method to create a new sticker set owned by a user. The bot will be able to edit the sticker set thus created. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#createnewstickerset | [Documentation]}
     */
    createNewStickerSet: TCallApiWithOptionalParams<
        Params.CreateNewStickerSetParams,
        boolean
    >;
    /**
     * Use this method to add a new sticker to a set created by the bot. The format of the added sticker must match the format of the other stickers in the set. Emoji sticker sets can have up to 200 stickers. Animated and video sticker sets can have up to 50 stickers. Static sticker sets can have up to 120 stickers. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#addstickertoset | [Documentation]}
     */
    addStickerToSet: TCallApi<Params.AddStickerToSetParams, boolean>;
    /**
     * Use this method to move a sticker in a set created by the bot to a specific position. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#setstickerpositioninset | [Documentation]}
     */
    setStickerPositionInSet: TCallApi<
        Params.SetStickerPositionInSetParams,
        boolean
    >;
    /**
     * Use this method to delete a sticker from a set created by the bot. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#deletestickerfromset | [Documentation]}
     */
    deleteStickerFromSet: TCallApi<Params.DeleteStickerFromSetParams, boolean>;
    /**
     * Use this method to change the list of emoji assigned to a regular or custom emoji sticker. The sticker must belong to a sticker set created by the bot. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#setstickeremojilist | [Documentation]}
     */
    setStickerEmojiList: TCallApi<Params.SetStickerEmojiListParams, boolean>;
    /**
     * Use this method to change search keywords assigned to a regular or custom emoji sticker. The sticker must belong to a sticker set created by the bot. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#setstickerkeywords | [Documentation]}
     */
    setStickerKeywords: TCallApiWithOptionalParams<
        Params.SetStickerKeywordsParams,
        boolean
    >;
    /**
     * Use this method to change the [mask position](https://core.telegram.org/bots/api/#maskposition) of a mask sticker. The sticker must belong to a sticker set that was created by the bot. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#setstickermaskposition | [Documentation]}
     */
    setStickerMaskPosition: TCallApiWithOptionalParams<
        Params.SetStickerMaskPositionParams,
        boolean
    >;
    /**
     * Use this method to set the title of a created sticker set. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#setstickersettitle | [Documentation]}
     */
    setStickerSetTitle: TCallApi<Params.SetStickerSetTitleParams, boolean>;
    /**
     * Use this method to set the thumbnail of a regular or mask sticker set. The format of the thumbnail file must match the format of the stickers in the set. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#setstickersetthumbnail | [Documentation]}
     */
    setStickerSetThumbnail: TCallApiWithOptionalParams<
        Params.SetStickerSetThumbnailParams,
        boolean
    >;
    /**
     * Use this method to set the thumbnail of a custom emoji sticker set. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#setcustomemojistickersetthumbnail | [Documentation]}
     */
    setCustomEmojiStickerSetThumbnail: TCallApiWithOptionalParams<
        Params.SetCustomEmojiStickerSetThumbnailParams,
        boolean
    >;
    /**
     * Use this method to delete a sticker set that was created by the bot. Returns *True* on success.
     *
     * {@link https://core.telegram.org/bots/api/#deletestickerset | [Documentation]}
     */
    deleteStickerSet: TCallApi<Params.DeleteStickerSetParams, boolean>;
    /**
     * Use this method to send answers to an inline query. On success, *True* is returned.
     * No more than **50** results per query are allowed.
     *
     * {@link https://core.telegram.org/bots/api/#answerinlinequery | [Documentation]}
     */
    answerInlineQuery: TCallApiWithOptionalParams<
        Params.AnswerInlineQueryParams,
        boolean
    >;
    /**
     * Use this method to set the result of an interaction with a [Web App](https://core.telegram.org/bots/webapps) and send a corresponding message on behalf of the user to the chat from which the query originated. On success, a [SentWebAppMessage](https://core.telegram.org/bots/api/#sentwebappmessage) object is returned.
     *
     * {@link https://core.telegram.org/bots/api/#answerwebappquery | [Documentation]}
     */
    answerWebAppQuery: TCallApi<
        Params.AnswerWebAppQueryParams,
        Objects.TelegramSentWebAppMessage
    >;
    /**
     * Use this method to send invoices. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
     *
     * {@link https://core.telegram.org/bots/api/#sendinvoice | [Documentation]}
     */
    sendInvoice: TCallApiWithOptionalParams<
        Params.SendInvoiceParams,
        Objects.TelegramMessage
    >;
    /**
     * Use this method to create a link for an invoice. Returns the created invoice link as *String* on success.
     *
     * {@link https://core.telegram.org/bots/api/#createinvoicelink | [Documentation]}
     */
    createInvoiceLink: TCallApiWithOptionalParams<
        Params.CreateInvoiceLinkParams,
        string
    >;
    /**
     * If you sent an invoice requesting a shipping address and the parameter *is\_flexible* was specified, the Bot API will send an [Update](https://core.telegram.org/bots/api/#update) with a *shipping\_query* field to the bot. Use this method to reply to shipping queries. On success, *True* is returned.
     *
     * {@link https://core.telegram.org/bots/api/#answershippingquery | [Documentation]}
     */
    answerShippingQuery: TCallApiWithOptionalParams<
        Params.AnswerShippingQueryParams,
        boolean
    >;
    /**
     * Once the user has confirmed their payment and shipping details, the Bot API sends the final confirmation in the form of an [Update](https://core.telegram.org/bots/api/#update) with the field *pre\_checkout\_query*. Use this method to respond to such pre-checkout queries. On success, *True* is returned. **Note:** The Bot API must receive an answer within 10 seconds after the pre-checkout query was sent.
     *
     * {@link https://core.telegram.org/bots/api/#answerprecheckoutquery | [Documentation]}
     */
    answerPreCheckoutQuery: TCallApiWithOptionalParams<
        Params.AnswerPreCheckoutQueryParams,
        boolean
    >;
    /**
     * Informs a user that some of the Telegram Passport elements they provided contains errors. The user will not be able to re-submit their Passport to you until the errors are fixed (the contents of the field for which you returned the error must change). Returns *True* on success.
     *
     * Use this if the data submitted by the user doesn't satisfy the standards your service requires for any reason. For example, if a birthday date seems invalid, a submitted document is blurry, a scan shows evidence of tampering, etc. Supply some details in the error message to make sure the user knows how to correct the issues.
     *
     * {@link https://core.telegram.org/bots/api/#setpassportdataerrors | [Documentation]}
     */
    setPassportDataErrors: TCallApi<
        Params.SetPassportDataErrorsParams,
        boolean
    >;
    /**
     * Use this method to send a game. On success, the sent [Message](https://core.telegram.org/bots/api/#message) is returned.
     *
     * {@link https://core.telegram.org/bots/api/#sendgame | [Documentation]}
     */
    sendGame: TCallApiWithOptionalParams<
        Params.SendGameParams,
        Objects.TelegramMessage
    >;
    /**
     * Use this method to set the score of the specified user in a game message. On success, if the message is not an inline message, the [Message](https://core.telegram.org/bots/api/#message) is returned, otherwise *True* is returned. Returns an error, if the new score is not greater than the user's current score in the chat and *force* is *False*.
     *
     * {@link https://core.telegram.org/bots/api/#setgamescore | [Documentation]}
     */
    setGameScore: TCallApiWithOptionalParams<
        Params.SetGameScoreParams,
        Objects.TelegramMessage | boolean
    >;
    /**
     * Use this method to get data for high score tables. Will return the score of the specified user and several of their neighbors in a game. Returns an Array of [GameHighScore](https://core.telegram.org/bots/api/#gamehighscore) objects.
     *
     * This method will currently return scores for the target user, plus two of their closest neighbors on each side. Will also return the top three users if the user and their neighbors are not among them. Please note that this behavior is subject to change.
     *
     * {@link https://core.telegram.org/bots/api/#getgamehighscores | [Documentation]}
     */
    getGameHighScores: TCallApiWithOptionalParams<
        Params.GetGameHighScoresParams,
        Objects.TelegramGameHighScore[]
    >;
}
