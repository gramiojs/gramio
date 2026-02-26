import type {
	AttachmentsMapping,
	AttachmentType,
	Chat,
	Dice,
	ExternalReplyInfo,
	Game,
	Giveaway,
	LinkPreviewOptions,
	Message,
	MessageContext,
	MessageEntity,
	MessageOriginChannel,
	MessageOriginChat,
	MessageOriginHiddenUser,
	MessageOriginUser,
	PaidMediaInfo,
	StoryAttachment,
	TextQuote,
	User,
	Venue,
} from "@gramio/contexts";
import type { TelegramMessageEntity } from "@gramio/types";

/**
 * A type guard predicate that narrows `In` to `Out`.
 * Built-in filters use `any` as `In` so they work with any bot's context type.
 * The actual narrowing happens via intersection in the `.on()` handler type.
 */
export type Filter<In = any, Out extends In = In> = (
	context: In,
) => context is Out;

type ExtractNarrow<F> = F extends Filter<any, infer N> ? N : never;

/** Maps forward origin type strings to their concrete classes */
type ForwardOriginMapping = {
	user: MessageOriginUser;
	chat: MessageOriginChat;
	channel: MessageOriginChannel;
	hidden_user: MessageOriginHiddenUser;
};
type AnyForwardOrigin = ForwardOriginMapping[keyof ForwardOriginMapping];

interface ForwardOriginFilter {
	/** Matches any forwarded message, narrowing `forwardOrigin` to the full origin union */
	(): Filter<any, { forwardOrigin: AnyForwardOrigin }>;
	/**
	 * Matches forwarded messages of a specific origin type.
	 *
	 * @example
	 * filters.forwardOrigin("user")      // forwarded from a real user
	 * filters.forwardOrigin("channel")   // forwarded from a channel
	 */
	<T extends keyof ForwardOriginMapping>(
		type: T,
	): Filter<any, { forwardOrigin: ForwardOriginMapping[T] }>;
}

const forwardOriginFilter: ForwardOriginFilter = (<
	T extends keyof ForwardOriginMapping,
>(
	type?: T,
) => {
	if (type === undefined) {
		return ((ctx: any) => ctx.hasForwardOrigin()) as Filter<
			any,
			{ forwardOrigin: AnyForwardOrigin }
		>;
	}
	return ((ctx: any) =>
		ctx.hasForwardOrigin() && ctx.forwardOrigin?.type === type) as Filter<
		any,
		{ forwardOrigin: ForwardOriginMapping[T] }
	>;
}) as ForwardOriginFilter;

type ChatTypeUnion = "private" | "group" | "supergroup" | "channel";

interface SenderChatFilter {
	/** Matches messages sent on behalf of a chat, narrowing `senderChat` to `Chat` */
	(): Filter<any, { senderChat: Chat }>;
	/**
	 * Matches messages sent on behalf of a chat of a specific type.
	 *
	 * @example
	 * filters.senderChat("channel")    // anonymous channel post
	 * filters.senderChat("supergroup") // anonymous supergroup admin
	 */
	<T extends ChatTypeUnion>(
		type: T,
	): Filter<any, { senderChat: Chat & { type: T } }>;
}

const senderChatFilter: SenderChatFilter = (<T extends ChatTypeUnion>(
	type?: T,
) => {
	if (type === undefined) {
		return ((ctx: any) => ctx.hasSenderChat()) as Filter<
			any,
			{ senderChat: Chat }
		>;
	}
	return ((ctx: any) =>
		ctx.hasSenderChat() && ctx.senderChat?.type === type) as Filter<
		any,
		{ senderChat: Chat & { type: T } }
	>;
}) as SenderChatFilter;

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
	x: infer I,
) => void
	? I
	: never;

/** Union of all attachment types (shorthand for `AttachmentsMapping[keyof AttachmentsMapping]`) */
type AnyAttachment = AttachmentsMapping[keyof AttachmentsMapping];

function createAttachmentFilter<T extends AttachmentType>(
	type: T,
): Filter<any, { attachment: AttachmentsMapping[T] }> {
	return ((ctx: any) => ctx.hasAttachmentType(type)) as Filter<
		any,
		{ attachment: AttachmentsMapping[T] }
	>;
}

export const filters = {
	// ── Attachment filters ──────────────────────────────────────────────
	photo: createAttachmentFilter("photo"),
	video: createAttachmentFilter("video"),
	document: createAttachmentFilter("document"),
	audio: createAttachmentFilter("audio"),
	sticker: createAttachmentFilter("sticker"),
	voice: createAttachmentFilter("voice"),
	videoNote: createAttachmentFilter("video_note"),
	animation: createAttachmentFilter("animation"),
	contact: createAttachmentFilter("contact"),
	location: createAttachmentFilter("location"),
	poll: createAttachmentFilter("poll"),

	/** Matches any message that has an attachment */
	media: ((ctx: any) => ctx.hasAttachment()) as Filter<
		any,
		{ attachment: AnyAttachment }
	>,

	// ── Text & caption ──────────────────────────────────────────────────
	/** Matches messages that have text */
	text: ((ctx: any) => ctx.hasText()) as Filter<any, { text: string }>,

	/** Matches messages that have a caption */
	caption: ((ctx: any) => ctx.hasCaption()) as Filter<any, { caption: string }>,

	// ── Message content & structure ─────────────────────────────────────
	/** Matches messages that contain a dice */
	dice: ((ctx: any) => ctx.hasDice()) as Filter<any, { dice: Dice }>,

	/** Matches forwarded messages. Call without args for any origin, or pass a type to narrow precisely. */
	forwardOrigin: forwardOriginFilter,

	/** Matches messages that are replies */
	reply: ((ctx: any) => ctx.hasReplyMessage()) as Filter<
		any,
		{ replyMessage: Message }
	>,

	/** Matches messages that have text entities */
	entities: ((ctx: any) => ctx.hasEntities()) as Filter<
		any,
		{ entities: MessageEntity[] }
	>,

	/** Matches messages that have caption entities */
	captionEntities: ((ctx: any) => ctx.hasCaptionEntities()) as Filter<
		any,
		{ captionEntities: MessageEntity[] }
	>,

	/** Matches messages that have a quote */
	quote: ((ctx: any) => ctx.hasQuote()) as Filter<any, { quote: TextQuote }>,

	/** Matches messages sent via a bot */
	viaBot: ((ctx: any) => ctx.hasViaBot()) as Filter<any, { viaBot: User }>,

	/** Matches messages that have link preview options */
	linkPreview: ((ctx: any) => ctx.hasLinkPreviewOptions()) as Filter<
		any,
		{ linkPreviewOptions: LinkPreviewOptions }
	>,

	/** Matches messages with a /start payload */
	startPayload: ((ctx: any) => ctx.hasStartPayload()) as Filter<
		any,
		{ startPayload: string }
	>,

	/** Matches messages with a raw /start payload string */
	rawStartPayload: ((ctx: any) => ctx.rawStartPayload !== undefined) as Filter<
		any,
		{ rawStartPayload: string }
	>,

	/** Matches messages with an author signature */
	authorSignature: ((ctx: any) => ctx.hasAuthorSignature()) as Filter<
		any,
		{ authorSignature: string }
	>,

	/** Matches messages with external reply info */
	replyInfo: ((ctx: any) => ctx.hasReplyInfo()) as Filter<
		any,
		{ externalReply: ExternalReplyInfo }
	>,

	/** Matches contexts that have a sender (from user) */
	hasFrom: ((ctx: any) => ctx.hasFrom()) as Filter<
		any,
		{ from: User; senderId: number }
	>,

	/** Matches messages sent on behalf of a chat. Pass a type to also narrow `senderChat.type`. */
	senderChat: senderChatFilter,

	/** Matches giveaway messages */
	giveaway: ((ctx: any) => ctx.isGiveaway()) as Filter<
		any,
		{ giveaway: Giveaway }
	>,

	/** Matches messages with paid media */
	paidMedia: ((ctx: any) => ctx.paidMedia !== undefined) as Filter<
		any,
		{ paidMedia: PaidMediaInfo }
	>,

	// ── Raw property narrowing ──────────────────────────────────────────
	/** Matches messages with a game */
	game: ((ctx: any) => ctx.game !== undefined) as Filter<any, { game: Game }>,

	/** Matches messages with a story */
	story: ((ctx: any) => ctx.story !== undefined) as Filter<
		any,
		{ story: StoryAttachment }
	>,

	/** Matches messages with an effect ID */
	effectId: ((ctx: any) => ctx.effectId !== undefined) as Filter<
		any,
		{ effectId: string }
	>,

	/** Matches messages that belong to a media group */
	mediaGroup: ((ctx: any) => ctx.mediaGroupId !== undefined) as Filter<
		any,
		{ mediaGroupId: string }
	>,

	/** Matches messages with a venue */
	venue: ((ctx: any) => ctx.venue !== undefined) as Filter<
		any,
		{ venue: Venue }
	>,

	// ── Sender/chat property filters (boolean, no narrowing) ────────────
	/** Matches messages from bot accounts */
	isBot: (ctx: any) => ctx.from?.isBot() === true,

	/** Matches messages from premium users */
	isPremium: (ctx: any) => ctx.from?.isPremium() === true,

	/** Matches messages in forum (topic) chats */
	isForum: (ctx: any) => ctx.isForum === true,

	// ── Message state filters ───────────────────────────────────────────
	/** Matches service messages */
	service: (ctx: any) => ctx.isServiceMessage?.() ?? false,

	/** Matches messages in topics */
	topicMessage: (ctx: any) => ctx.isTopicMessage?.() ?? false,

	/** Matches media with spoiler. Narrows `attachment` to confirm media is present. */
	mediaSpoiler: ((ctx: any) =>
		ctx.hasAttachment() && ctx.hasMediaSpoiler?.() === true) as Filter<
		any,
		{ attachment: AnyAttachment }
	>,

	/** Matches messages with protected content. No type narrowing. */
	protectedContent: (ctx: any) => ctx.hasProtectedContent?.() === true,

	/** Matches messages sent while user was offline. No type narrowing. */
	fromOffline: (ctx: any) => ctx.isFromOffline?.() === true,

	// ── Callback query specific filters ─────────────────────────────────
	/** Matches callback queries that have an associated message */
	hasMessage: ((ctx: any) => ctx.hasMessage?.()) as Filter<
		any,
		{ message: MessageContext<any> }
	>,

	/** Matches callback queries that have data */
	hasData: ((ctx: any) => ctx.hasData?.()) as Filter<any, { data: string }>,

	/** Matches callback queries with an inline message ID */
	hasInlineMessageId: ((ctx: any) => ctx.hasInlineMessageId?.()) as Filter<
		any,
		{ inlineMessageId: string }
	>,

	/** Matches callback queries with a game short name */
	hasGameShortName: ((ctx: any) => ctx.hasGameShortName?.()) as Filter<
		any,
		{ gameShortName: string }
	>,

	// ── Parameterized entity filters ────────────────────────────────────
	/** Matches messages with a specific text entity type */
	entity(
		type: TelegramMessageEntity["type"],
	): Filter<any, { entities: MessageEntity[] }> {
		return ((ctx: any) => ctx.hasEntities(type)) as Filter<
			any,
			{ entities: MessageEntity[] }
		>;
	},

	/** Matches messages with a specific caption entity type */
	captionEntity(
		type: TelegramMessageEntity["type"],
	): Filter<any, { captionEntities: MessageEntity[] }> {
		return ((ctx: any) => ctx.hasCaptionEntities(type)) as Filter<
			any,
			{ captionEntities: MessageEntity[] }
		>;
	},

	// ── Chat type shortcuts ─────────────────────────────────────────────
	/** Matches messages from a specific chat type. Narrows both `chatType` and `chat.type`. */
	chat<T extends "private" | "group" | "supergroup" | "channel">(
		type: T,
	): Filter<any, { chatType: T; chat: { type: T } }> {
		return ((ctx: any) => ctx.chatType === type) as Filter<
			any,
			{ chatType: T; chat: { type: T } }
		>;
	},

	/** Matches private (DM) chats. Narrows both `chatType` and `chat.type`. */
	pm: ((ctx: any) => ctx.chatType === "private") as Filter<
		any,
		{ chatType: "private"; chat: { type: "private" } }
	>,

	/** Matches group chats. Narrows both `chatType` and `chat.type`. */
	group: ((ctx: any) => ctx.chatType === "group") as Filter<
		any,
		{ chatType: "group"; chat: { type: "group" } }
	>,

	/** Matches supergroup chats. Narrows both `chatType` and `chat.type`. */
	supergroup: ((ctx: any) => ctx.chatType === "supergroup") as Filter<
		any,
		{ chatType: "supergroup"; chat: { type: "supergroup" } }
	>,

	/** Matches channel chats. Narrows both `chatType` and `chat.type`. */
	channel: ((ctx: any) => ctx.chatType === "channel") as Filter<
		any,
		{ chatType: "channel"; chat: { type: "channel" } }
	>,

	// ── Parameterized filters ───────────────────────────────────────────
	/** Matches messages from specific user(s). No type narrowing. */
	from(userId: number | number[]): (ctx: any) => boolean {
		const ids = Array.isArray(userId) ? userId : [userId];
		return (ctx: any) =>
			ctx.senderId !== undefined && ids.includes(ctx.senderId);
	},

	/** Matches messages in specific chat(s). No type narrowing. */
	chatId(chatId: number | number[]): (ctx: any) => boolean {
		const ids = Array.isArray(chatId) ? chatId : [chatId];
		return (ctx: any) => ids.includes(ctx.chatId);
	},

	/** Matches messages whose text/caption matches the regex, sets `ctx.match` */
	regex(pattern: RegExp): Filter<any, { match: RegExpMatchArray }> {
		return ((ctx: any) => {
			const value = ctx.text ?? ctx.caption;
			if (!value) return false;
			const result = value.match(pattern);
			if (!result) return false;
			ctx.match = result;
			return true;
		}) as Filter<any, { match: RegExpMatchArray }>;
	},

	// ── Composition ─────────────────────────────────────────────────────
	/** Intersection: both filters must match */
	and<N1, N2>(f1: Filter<any, N1>, f2: Filter<any, N2>): Filter<any, N1 & N2> {
		return ((ctx: any) => f1(ctx) && f2(ctx)) as Filter<any, N1 & N2>;
	},

	/** Union: either filter must match */
	or<N1, N2>(f1: Filter<any, N1>, f2: Filter<any, N2>): Filter<any, N1 | N2> {
		return ((ctx: any) => f1(ctx) || f2(ctx)) as Filter<any, N1 | N2>;
	},

	/** Negation: inverts the filter (no type narrowing) */
	not(f: (ctx: any) => boolean): (ctx: any) => boolean {
		return (ctx: any) => !f(ctx);
	},

	/** Variadic intersection: all filters must match */
	every<Filters extends Filter<any, any>[]>(
		...filters: Filters
	): Filter<any, UnionToIntersection<ExtractNarrow<Filters[number]>>> {
		return ((ctx: any) => filters.every((f) => f(ctx))) as Filter<
			any,
			UnionToIntersection<ExtractNarrow<Filters[number]>>
		>;
	},

	/** Variadic union: any filter must match */
	some<Filters extends Filter<any, any>[]>(
		...filters: Filters
	): Filter<any, ExtractNarrow<Filters[number]>> {
		return ((ctx: any) => filters.some((f) => f(ctx))) as Filter<
			any,
			ExtractNarrow<Filters[number]>
		>;
	},
};
