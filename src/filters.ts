import type { AttachmentsMapping, AttachmentType } from "@gramio/contexts";

/**
 * A type guard predicate that narrows `In` to `Out`.
 * Built-in filters use `any` as `In` so they work with any bot's context type.
 * The actual narrowing happens via intersection in the `.on()` handler type.
 */
export type Filter<In = any, Out extends In = In> = (
	context: In,
) => context is Out;

function createAttachmentFilter<T extends AttachmentType>(
	type: T,
): Filter<any, { attachment: AttachmentsMapping[T] }> {
	return ((ctx: any) => ctx.hasAttachmentType(type)) as Filter<
		any,
		{ attachment: AttachmentsMapping[T] }
	>;
}

export const filters = {
	// Attachment filters
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
	media: ((ctx: any) => ctx.hasAttachment()) as Filter<any, { attachment: {} }>,

	/** Matches messages that have text */
	text: ((ctx: any) => ctx.hasText()) as Filter<any, { text: string }>,

	/** Matches messages that have a caption */
	caption: ((ctx: any) => ctx.hasCaption()) as Filter<any, { caption: string }>,

	/** Matches messages that contain a dice */
	dice: ((ctx: any) => ctx.hasDice()) as Filter<any, { dice: {} }>,

	/** Matches messages that are forwarded */
	forwardOrigin: ((ctx: any) => ctx.hasForwardOrigin()) as Filter<
		any,
		{ forwardOrigin: {} }
	>,

	/** Matches messages from a specific chat type */
	chat<T extends "private" | "group" | "supergroup" | "channel">(
		type: T,
	): Filter<any, { chatType: T }> {
		return ((ctx: any) => ctx.chatType === type) as Filter<
			any,
			{ chatType: T }
		>;
	},

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
};
