import { describe, expect, expectTypeOf, mock, test } from "bun:test";
import type {
	AttachmentsMapping,
	Chat,
	Dice,
	ExternalReplyInfo,
	Game,
	LinkPreviewOptions,
	MessageContext,
	MessageEntity,
	MessageOriginChannel,
	MessageOriginChat,
	MessageOriginHiddenUser,
	MessageOriginUser,
	PaidMediaInfo,
	PhotoAttachment,
	TextQuote,
	User,
	Venue,
} from "@gramio/contexts";
import { TelegramTestEnvironment } from "@gramio/test";
import type { TelegramMessage } from "@gramio/types";
import { Bot } from "../src/bot.ts";
import { type Filter, filters } from "../src/filters.ts";

const expectString = (x: string) => expect(typeof x).toBe("string");

const TOKEN = "test-token";

function photoMessage(
	user: { id: number; first_name: string; is_bot: boolean },
	chatId: number,
): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "private" },
		from: user,
		photo: [
			{
				file_id: "photo-id",
				file_unique_id: "photo-unique",
				width: 100,
				height: 100,
			},
		],
	};
}

function textMessage(
	text: string,
	user: { id: number; first_name: string; is_bot: boolean },
	chatId: number,
	chatType: "private" | "group" | "supergroup" | "channel" = "private",
): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: chatType },
		from: user,
		text,
	};
}

function captionPhotoMessage(
	caption: string,
	user: { id: number; first_name: string; is_bot: boolean },
	chatId: number,
): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "private" },
		from: user,
		caption,
		photo: [
			{
				file_id: "photo-id",
				file_unique_id: "photo-unique",
				width: 100,
				height: 100,
			},
		],
	};
}

describe("filters — attachment filters", () => {
	test("photo filter matches photo messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.photo, () => {
			handler();
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: photoMessage(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("photo filter does not match text messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.photo, () => {
			handler();
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — text filter", () => {
	test("text filter matches text messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.text, () => {
			handler();
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("text filter does not match photo-only messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.text, () => {
			handler();
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: photoMessage(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — chat filter", () => {
	test("chat('private') matches private chats", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.chat("private"),
			() => {
				handler();
			},
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage(
				"hello",
				user.payload,
				user.payload.id,
				"private",
			),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("chat('private') does not match group chats", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.chat("private"),
			() => {
				handler();
			},
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, -100, "group"),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — from filter", () => {
	test("from(userId) matches the correct user", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.from(42), () => {
			handler();
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);

		await env.emitUpdate({
			update_id: 0,
			message: textMessage(
				"hello",
				{ id: 42, first_name: "Bob", is_bot: false },
				42,
			),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("from(userId) does not match a different user", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.from(42), () => {
			handler();
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);

		await env.emitUpdate({
			update_id: 0,
			message: textMessage(
				"hello",
				{ id: 99, first_name: "Eve", is_bot: false },
				99,
			),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});

	test("from([ids]) matches any listed user", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.from([10, 20, 30]),
			() => {
				handler();
			},
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);

		await env.emitUpdate({
			update_id: 0,
			message: textMessage(
				"hello",
				{ id: 20, first_name: "Mid", is_bot: false },
				20,
			),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});
});

describe("filters — regex filter", () => {
	test("regex matches text and populates ctx.match", async () => {
		let capturedMatch: RegExpMatchArray | null = null;
		const bot = new Bot(TOKEN).on(
			"message",
			filters.regex(/hello (\w+)/),
			(ctx) => {
				capturedMatch = ctx.match;
			},
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage(
				"hello world",
				user.payload,
				user.payload.id,
			),
		});

		expect(capturedMatch).not.toBeNull();
		expect(capturedMatch![0]).toBe("hello world");
		expect(capturedMatch![1]).toBe("world");
	});

	test("regex does not match non-matching text", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.regex(/hello (\w+)/),
			() => {
				handler();
			},
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("goodbye", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});

	test("regex matches caption text", async () => {
		let capturedMatch: RegExpMatchArray | null = null;
		const bot = new Bot(TOKEN).on(
			"message",
			filters.regex(/nice (\w+)/),
			(ctx) => {
				capturedMatch = ctx.match;
			},
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: captionPhotoMessage(
				"nice photo",
				user.payload,
				user.payload.id,
			),
		});

		expect(capturedMatch).not.toBeNull();
		expect(capturedMatch![0]).toBe("nice photo");
		expect(capturedMatch![1]).toBe("photo");
	});
});

describe("filters — and composition", () => {
	test("and(f1, f2) matches when both conditions met", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.and(filters.text, filters.chat("private")),
			() => {
				handler();
			},
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage(
				"hello",
				user.payload,
				user.payload.id,
				"private",
			),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("and(f1, f2) does not match when only one condition met", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.and(filters.text, filters.chat("private")),
			() => {
				handler();
			},
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		// text in group — text matches, chat doesn't
		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, -100, "group"),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — or composition", () => {
	test("or(f1, f2) matches when either condition met", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.or(filters.photo, filters.text),
			() => {
				handler();
			},
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		// text message
		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		// photo message
		await env.emitUpdate({
			update_id: 1,
			message: photoMessage(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(2);
	});

	test("or(f1, f2) does not match when neither condition met", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.or(filters.photo, filters.dice),
			() => {
				handler();
			},
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		// text-only message — neither photo nor dice
		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — not composition", () => {
	test("not(f) inverts the filter", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.not(filters.text),
			() => {
				handler();
			},
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		// text message — not(text) should NOT match
		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});
		expect(handler).toHaveBeenCalledTimes(0);

		// photo message (no text) — not(text) should match
		await env.emitUpdate({
			update_id: 1,
			message: photoMessage(user.payload, user.payload.id),
		});
		expect(handler).toHaveBeenCalledTimes(1);
	});
});

describe("filters — middleware chain", () => {
	test("next() is called when filter does not match", async () => {
		const fallback = mock(() => {});
		const filtered = mock(() => {});
		const bot = new Bot(TOKEN)
			.on("message", filters.photo, () => {
				filtered();
			})
			.on("message", () => {
				fallback();
			});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		// text message — photo filter won't match, should fall through to fallback
		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(filtered).toHaveBeenCalledTimes(0);
		expect(fallback).toHaveBeenCalledTimes(1);
	});
});

describe("filters — filter object types", () => {
	test("filters.photo has correct Filter type", () => {
		expectTypeOf(filters.photo).toEqualTypeOf<
			Filter<any, { attachment: AttachmentsMapping["photo"] }>
		>();
	});

	test("filters.text has correct Filter type", () => {
		expectTypeOf(filters.text).toEqualTypeOf<
			Filter<any, { text: string }>
		>();
	});

	test("filters.regex has correct Filter type", () => {
		expectTypeOf(filters.regex(/test/)).toEqualTypeOf<
			Filter<any, { match: RegExpMatchArray }>
		>();
	});

	test("filters.chat has correct Filter type", () => {
		expectTypeOf(filters.chat("private")).toEqualTypeOf<
			Filter<any, { chatType: "private"; chat: { type: "private" } }>
		>();
	});
});

describe("filters — ctx preserves MessageContext methods + narrows properties", () => {
	test("photo: ctx.reply exists (NodeMixin, unique to message), attachment is PhotoAttachment", () => {
		new Bot(TOKEN).on("message", filters.photo, (ctx) => {
			// reply() is from NodeMixin — only MessageContext has it
			expectTypeOf(ctx.reply).toBeFunction();
			// send() from SendMixin
			expectTypeOf(ctx.send).toBeFunction();
			// attachment narrowed to PhotoAttachment specifically
			expectTypeOf(ctx.attachment).toEqualTypeOf<PhotoAttachment>();
			// PhotoAttachment-specific: .sizes is PhotoSize[]
			expectTypeOf(ctx.attachment.sizes).toBeArray();
			expectTypeOf(ctx.attachment.bigSize).toBeObject();
		});
	});

	test("video: attachment has VideoAttachment props (duration/width/height)", () => {
		new Bot(TOKEN).on("message", filters.video, (ctx) => {
			expectTypeOf(ctx.reply).toBeFunction();
			// VideoAttachment-specific properties are accessible without optional chaining
			expectTypeOf(ctx.attachment.duration).toBeNumber();
			expectTypeOf(ctx.attachment.width).toBeNumber();
			expectTypeOf(ctx.attachment.height).toBeNumber();
		});
	});

	test("text: ctx.text is string (not string|undefined), reply still works", () => {
		new Bot(TOKEN).on("message", filters.text, (ctx) => {
			expectTypeOf(ctx.text).toBeString();
			expectTypeOf(ctx.reply).toBeFunction();
			// unrelated nullable props remain nullable
			expectTypeOf(ctx.caption).toEqualTypeOf<string | undefined>();
		});
	});

	test("caption: ctx.caption is string, text remains nullable", () => {
		new Bot(TOKEN).on("message", filters.caption, (ctx) => {
			expectTypeOf(ctx.caption).toBeString();
			expectTypeOf(ctx.reply).toBeFunction();
			expectTypeOf(ctx.text).toEqualTypeOf<string | undefined>();
		});
	});

	test("chat('private'): chatType narrowed to literal, reply works", () => {
		new Bot(TOKEN).on("message", filters.chat("private"), (ctx) => {
			expectTypeOf(ctx.chatType).toEqualTypeOf<"private">();
			expectTypeOf(ctx.reply).toBeFunction();
			expectTypeOf(ctx.send).toBeFunction();
		});
	});

	test("chat('group'): chatType narrowed to 'group'", () => {
		new Bot(TOKEN).on("message", filters.chat("group"), (ctx) => {
			expectTypeOf(ctx.chatType).toEqualTypeOf<"group">();
		});
	});

	test("regex: match is RegExpMatchArray, reply works", () => {
		new Bot(TOKEN).on("message", filters.regex(/test/), (ctx) => {
			expectTypeOf(ctx.match).toEqualTypeOf<RegExpMatchArray>();
			expectTypeOf(ctx.reply).toBeFunction();
		});
	});
});

describe("filters — and/or narrowing in handler ctx", () => {
	test("and(photo, caption): both narrowings present, reply works", () => {
		new Bot(TOKEN).on(
			"message",
			filters.and(filters.photo, filters.caption),
			(ctx) => {
				expectTypeOf(ctx.attachment).toEqualTypeOf<PhotoAttachment>();
				expectTypeOf(ctx.caption).toBeString();
				expectTypeOf(ctx.reply).toBeFunction();
				// text NOT narrowed — only caption was
				expectTypeOf(ctx.text).toEqualTypeOf<string | undefined>();
			},
		);
	});

	test("and(text, chat('private')): text is string + chatType is 'private'", () => {
		new Bot(TOKEN).on(
			"message",
			filters.and(filters.text, filters.chat("private")),
			(ctx) => {
				expectTypeOf(ctx.text).toBeString();
				expectTypeOf(ctx.chatType).toEqualTypeOf<"private">();
				expectTypeOf(ctx.reply).toBeFunction();
			},
		);
	});

	test("and(regex, photo): match + attachment narrowing together", () => {
		new Bot(TOKEN).on(
			"message",
			filters.and(filters.regex(/img_(\d+)/), filters.photo),
			(ctx) => {
				expectTypeOf(ctx.match).toEqualTypeOf<RegExpMatchArray>();
				expectTypeOf(ctx.attachment).toEqualTypeOf<PhotoAttachment>();
				expectTypeOf(ctx.reply).toBeFunction();
			},
		);
	});
});

describe("filters — boolean filters preserve full context (no narrowing)", () => {
	test("from(): ctx has all message methods, text stays nullable", () => {
		new Bot(TOKEN).on("message", filters.from(42), (ctx) => {
			expectTypeOf(ctx.reply).toBeFunction();
			expectTypeOf(ctx.send).toBeFunction();
			expectTypeOf(ctx.text).toEqualTypeOf<string | undefined>();
			expectTypeOf(ctx.caption).toEqualTypeOf<string | undefined>();
		});
	});

	test("chatId(): ctx has all message methods", () => {
		new Bot(TOKEN).on("message", filters.chatId(123), (ctx) => {
			expectTypeOf(ctx.reply).toBeFunction();
			expectTypeOf(ctx.text).toEqualTypeOf<string | undefined>();
		});
	});

	test("not(): ctx has all message methods, nothing narrowed", () => {
		new Bot(TOKEN).on("message", filters.not(filters.photo), (ctx) => {
			expectTypeOf(ctx.reply).toBeFunction();
			expectTypeOf(ctx.send).toBeFunction();
			expectTypeOf(ctx.text).toEqualTypeOf<string | undefined>();
		});
	});
});

describe("filters — works with callback_query update", () => {
	test("chat('private') on callback_query: ctx has answer(), no reply()", () => {
		new Bot(TOKEN).on(
			"callback_query",
			filters.chat("private"),
			(ctx) => {
				// CallbackQueryContext has answer()
				expectTypeOf(ctx.answer).toBeFunction();
				// CallbackQueryContext has send() (from SendMixin)
				expectTypeOf(ctx.send).toBeFunction();
				expectTypeOf(ctx.chatType).toEqualTypeOf<"private">();

				// @ts-expect-error reply() does NOT exist on callback_query context
				ctx.reply;
			},
		);
	});
});

describe("filters — array of update names", () => {
	test("on(['message'], filter.text, ...) ctx has reply()", () => {
		new Bot(TOKEN).on(["message"], filters.text, (ctx) => {
			expectTypeOf(ctx.text).toBeString();
			expectTypeOf(ctx.reply).toBeFunction();
		});
	});
});

describe("filters — derives are preserved through filters", () => {
	test("derived properties accessible in filtered handler", () => {
		new Bot(TOKEN)
			.derive(() => ({ myProp: 42 as const }))
			.on("message", filters.photo, (ctx) => {
				// derive prop preserved
				expectTypeOf(ctx.myProp).toEqualTypeOf<42>();
				// filter narrowing works
				expectTypeOf(ctx.attachment).toEqualTypeOf<PhotoAttachment>();
				// message context methods work
				expectTypeOf(ctx.reply).toBeFunction();
			});
	});

	test("multiple derives + filter all compose", () => {
		new Bot(TOKEN)
			.derive(() => ({ a: "hello" as const }))
			.derive(() => ({ b: 123 as const }))
			.on("message", filters.text, (ctx) => {
				expectTypeOf(ctx.a).toEqualTypeOf<"hello">();
				expectTypeOf(ctx.b).toEqualTypeOf<123>();
				expectTypeOf(ctx.text).toBeString();
				expectTypeOf(ctx.reply).toBeFunction();
			});
	});
});

describe("filters — 2-arg .on() still works unchanged", () => {
	test("on('message', handler) without filter: ctx is normal message context", () => {
		new Bot(TOKEN).on("message", (ctx) => {
			expectTypeOf(ctx.reply).toBeFunction();
			expectTypeOf(ctx.send).toBeFunction();
			expectTypeOf(ctx.text).toEqualTypeOf<string | undefined>();
		});
	});

	test("on('callback_query', handler) without filter: ctx has answer()", () => {
		new Bot(TOKEN).on("callback_query", (ctx) => {
			expectTypeOf(ctx.answer).toBeFunction();
			// @ts-expect-error reply() does NOT exist on callback_query
			ctx.reply;
		});
	});
});

// ── New filter tests ────────────────────────────────────────────────────────

function replyMessage(
	user: { id: number; first_name: string; is_bot: boolean },
	chatId: number,
): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "private" },
		from: user,
		text: "reply text",
		reply_to_message: {
			message_id: 1,
			date: Math.floor(Date.now() / 1000),
			chat: { id: chatId, type: "private" },
		},
	};
}

function entityMessage(
	text: string,
	entityType: string,
	user: { id: number; first_name: string; is_bot: boolean },
	chatId: number,
): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "private" },
		from: user,
		text,
		entities: [
			{
				type: entityType as "url",
				offset: 0,
				length: text.length,
			},
		],
	};
}

function botUserMessage(
	text: string,
	chatId: number,
): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "private" },
		from: { id: 100, first_name: "TestBot", is_bot: true },
		text,
	};
}

function spoilerPhotoMessage(
	user: { id: number; first_name: string; is_bot: boolean },
	chatId: number,
): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "private" },
		from: user,
		photo: [
			{
				file_id: "photo-id",
				file_unique_id: "photo-unique",
				width: 100,
				height: 100,
			},
		],
		has_media_spoiler: true,
	};
}

describe("filters — reply filter", () => {
	test("reply filter matches messages with reply", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.reply, () => {
			handler();
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: replyMessage(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("reply filter does not match non-reply messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.reply, () => {
			handler();
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — entity filter", () => {
	test("entity('url') matches messages with URL entity", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.entity("url"),
			() => {
				handler();
			},
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: entityMessage(
				"https://example.com",
				"url",
				user.payload,
				user.payload.id,
			),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("entity('url') does not match messages without URL entity", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.entity("url"),
			() => {
				handler();
			},
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});

	test("entity('url') does not match messages with different entity type", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.entity("url"),
			() => {
				handler();
			},
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: entityMessage(
				"@mention",
				"mention",
				user.payload,
				user.payload.id,
			),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — chat type shortcuts", () => {
	test("pm matches private chats", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.pm, () => {
			handler();
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage(
				"hello",
				user.payload,
				user.payload.id,
				"private",
			),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("pm does not match group chats", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.pm, () => {
			handler();
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, -100, "group"),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — isBot filter", () => {
	test("isBot matches bot senders", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.isBot, () => {
			handler();
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);

		await env.emitUpdate({
			update_id: 0,
			message: botUserMessage("hello", 100),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("isBot does not match non-bot senders", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.isBot, () => {
			handler();
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — mediaSpoiler filter", () => {
	test("mediaSpoiler matches media with spoiler", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.mediaSpoiler, () => {
			handler();
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: spoilerPhotoMessage(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("mediaSpoiler does not match media without spoiler", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.mediaSpoiler, () => {
			handler();
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: photoMessage(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — hasData filter (callback_query)", () => {
	test("hasData matches callback queries with data", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"callback_query",
			filters.hasData,
			() => {
				handler();
			},
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			callback_query: {
				id: "1",
				from: user.payload,
				chat_instance: "test",
				data: "some_data",
			},
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("hasData does not match callback queries without data", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"callback_query",
			filters.hasData,
			() => {
				handler();
			},
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			callback_query: {
				id: "1",
				from: user.payload,
				chat_instance: "test",
				game_short_name: "game",
			},
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — every (variadic and)", () => {
	test("every(text, entity('url')) matches when both conditions met", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.every(filters.text, filters.entity("url")),
			() => {
				handler();
			},
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: entityMessage(
				"https://example.com",
				"url",
				user.payload,
				user.payload.id,
			),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("every(text, entity('url')) does not match when only text present", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.every(filters.text, filters.entity("url")),
			() => {
				handler();
			},
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — some (variadic or)", () => {
	test("some(photo, text) matches when either condition met", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.some(filters.photo, filters.text),
			() => {
				handler();
			},
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		await env.emitUpdate({
			update_id: 1,
			message: photoMessage(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(2);
	});
});

// ── Type tests for new filters ──────────────────────────────────────────────

describe("filters — new filter type narrowing in handler ctx", () => {
	test("reply: replyMessage is narrowed to non-undefined", () => {
		new Bot(TOKEN).on("message", filters.reply, (ctx) => {
			expectTypeOf(ctx.replyMessage).toBeObject();
			expectTypeOf(ctx.reply).toBeFunction();
		});
	});

	test("entities: entities is narrowed to non-undefined", () => {
		new Bot(TOKEN).on("message", filters.entities, (ctx) => {
			expectTypeOf(ctx.entities).toBeObject();
			expectTypeOf(ctx.reply).toBeFunction();
		});
	});

	test("startPayload: startPayload is narrowed to string", () => {
		new Bot(TOKEN).on("message", filters.startPayload, (ctx) => {
			expectTypeOf(ctx.startPayload).toBeString();
			expectTypeOf(ctx.reply).toBeFunction();
		});
	});

	test("effectId: effectId is narrowed to string", () => {
		new Bot(TOKEN).on("message", filters.effectId, (ctx) => {
			expectTypeOf(ctx.effectId).toBeString();
			expectTypeOf(ctx.reply).toBeFunction();
		});
	});

	test("mediaSpoiler: narrows attachment to confirm media is present", () => {
		new Bot(TOKEN).on("message", filters.mediaSpoiler, (ctx) => {
			expectTypeOf(ctx.attachment).toBeObject();
			expectTypeOf(ctx.reply).toBeFunction();
		});
	});

	test("pm: equivalent to chat('private') narrowing", () => {
		new Bot(TOKEN).on("message", filters.pm, (ctx) => {
			expectTypeOf(ctx.chatType).toEqualTypeOf<"private">();
			expectTypeOf(ctx.reply).toBeFunction();
		});
	});

	test("group: chatType narrowed to 'group'", () => {
		new Bot(TOKEN).on("message", filters.group, (ctx) => {
			expectTypeOf(ctx.chatType).toEqualTypeOf<"group">();
		});
	});

	test("supergroup: chatType narrowed to 'supergroup'", () => {
		new Bot(TOKEN).on("message", filters.supergroup, (ctx) => {
			expectTypeOf(ctx.chatType).toEqualTypeOf<"supergroup">();
		});
	});

	test("channel: chatType narrowed to 'channel'", () => {
		new Bot(TOKEN).on("message", filters.channel, (ctx) => {
			expectTypeOf(ctx.chatType).toEqualTypeOf<"channel">();
		});
	});

	test("hasData: data narrowed to string on callback_query", () => {
		new Bot(TOKEN).on("callback_query", filters.hasData, (ctx) => {
			expectTypeOf(ctx.data).toBeString();
			expectTypeOf(ctx.answer).toBeFunction();
		});
	});

	test("hasMessage: message narrowed on callback_query", () => {
		new Bot(TOKEN).on("callback_query", filters.hasMessage, (ctx) => {
			expectTypeOf(ctx.message).toBeObject();
			expectTypeOf(ctx.answer).toBeFunction();
		});
	});

	test("hasInlineMessageId: inlineMessageId narrowed to string on callback_query", () => {
		new Bot(TOKEN).on(
			"callback_query",
			filters.hasInlineMessageId,
			(ctx) => {
				expectTypeOf(ctx.inlineMessageId).toBeString();
			},
		);
	});

	test("entity('url'): entities is narrowed", () => {
		new Bot(TOKEN).on("message", filters.entity("url"), (ctx) => {
			expectTypeOf(ctx.entities).toBeObject();
			expectTypeOf(ctx.reply).toBeFunction();
		});
	});

	test("mediaGroup: mediaGroupId narrowed to string", () => {
		new Bot(TOKEN).on("message", filters.mediaGroup, (ctx) => {
			expectTypeOf(ctx.mediaGroupId).toBeString();
		});
	});

	test("hasFrom: from and senderId narrowed", () => {
		new Bot(TOKEN).on("message", filters.hasFrom, (ctx) => {
			expectTypeOf(ctx.from).toBeObject();
			expectTypeOf(ctx.senderId).toBeNumber();
		});
	});

	test("authorSignature: authorSignature narrowed to string", () => {
		new Bot(TOKEN).on("message", filters.authorSignature, (ctx) => {
			expectTypeOf(ctx.authorSignature).toBeString();
		});
	});
});

describe("filters — every/some type narrowing", () => {
	test("every(photo, caption): intersects both narrowings", () => {
		new Bot(TOKEN).on(
			"message",
			filters.every(filters.photo, filters.caption),
			(ctx) => {
				expectTypeOf(ctx.attachment).toEqualTypeOf<PhotoAttachment>();
				expectTypeOf(ctx.caption).toBeString();
				expectTypeOf(ctx.reply).toBeFunction();
			},
		);
	});

	test("every(text, pm): text is string + chatType is 'private'", () => {
		new Bot(TOKEN).on(
			"message",
			filters.every(filters.text, filters.pm),
			(ctx) => {
				expectTypeOf(ctx.text).toBeString();
				expectTypeOf(ctx.chatType).toEqualTypeOf<"private">();
			},
		);
	});

	test("some(photo, text): union narrowing", () => {
		new Bot(TOKEN).on(
			"message",
			filters.some(filters.photo, filters.text),
			(ctx) => {
				expectTypeOf(ctx.reply).toBeFunction();
			},
		);
	});
});

describe("filters — boolean filters (no narrowing) preserve full context", () => {
	test("isBot: ctx has all message methods, no narrowing", () => {
		new Bot(TOKEN).on("message", filters.isBot, (ctx) => {
			expectTypeOf(ctx.reply).toBeFunction();
			expectTypeOf(ctx.send).toBeFunction();
			expectTypeOf(ctx.text).toEqualTypeOf<string | undefined>();
		});
	});

	test("isPremium: ctx has all message methods", () => {
		new Bot(TOKEN).on("message", filters.isPremium, (ctx) => {
			expectTypeOf(ctx.reply).toBeFunction();
			expectTypeOf(ctx.text).toEqualTypeOf<string | undefined>();
		});
	});

	test("isForum: ctx has all message methods", () => {
		new Bot(TOKEN).on("message", filters.isForum, (ctx) => {
			expectTypeOf(ctx.reply).toBeFunction();
			expectTypeOf(ctx.text).toEqualTypeOf<string | undefined>();
		});
	});

	test("service: ctx has all message methods", () => {
		new Bot(TOKEN).on("message", filters.service, (ctx) => {
			expectTypeOf(ctx.reply).toBeFunction();
		});
	});

	test("topicMessage: ctx has all message methods", () => {
		new Bot(TOKEN).on("message", filters.topicMessage, (ctx) => {
			expectTypeOf(ctx.reply).toBeFunction();
		});
	});
});

describe("filters — guard() narrows types for downstream handlers", () => {
	test("guard(filters.video).on('message', ctx) narrows attachment to VideoAttachment", () => {
		const bot = new Bot(TOKEN);
		bot.updates.composer
			.guard(filters.video)
			.on("message", (ctx) => {
				// VideoAttachment-specific properties accessible
				expectTypeOf(ctx.attachment.duration).toBeNumber();
				expectTypeOf(ctx.attachment.width).toBeNumber();
				expectTypeOf(ctx.attachment.height).toBeNumber();
				expectTypeOf(ctx.reply).toBeFunction();
			});
	});

	test("guard(filters.text).on('message', ctx) narrows text to string", () => {
		const bot = new Bot(TOKEN);
		bot.updates.composer.guard(filters.text).on("message", (ctx) => {
			expectTypeOf(ctx.text).toBeString();
			expectTypeOf(ctx.reply).toBeFunction();
		});
	});

	test("guard(filters.pm).on('message', ctx) narrows chatType to 'private'", () => {
		const bot = new Bot(TOKEN);
		bot.updates.composer.guard(filters.pm).on("message", (ctx) => {
			expectTypeOf(ctx.chatType).toEqualTypeOf<"private">();
		});
	});
});

// ── Filter-only .on(filter, handler) — no event name ────────────────────────

describe("filter-only .on() — runtime behavior", () => {
	test("bot.on(filters.text, handler) matches text messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(filters.text, () => {
			handler();
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("bot.on(filters.text, handler) does not match photo-only messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(filters.text, () => {
			handler();
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: photoMessage(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});

	test("bot.on(filters.photo, handler) matches photo messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(filters.photo, () => {
			handler();
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: photoMessage(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("bot.on(filters.from(42), handler) matches the correct user", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(filters.from(42), () => {
			handler();
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);

		await env.emitUpdate({
			update_id: 0,
			message: textMessage(
				"hello",
				{ id: 42, first_name: "Bob", is_bot: false },
				42,
			),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("bot.on(filters.from(42), handler) does not match a different user", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(filters.from(42), () => {
			handler();
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);

		await env.emitUpdate({
			update_id: 0,
			message: textMessage(
				"hello",
				{ id: 99, first_name: "Eve", is_bot: false },
				99,
			),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});

	test("filter-only falls through to next middleware when filter rejects", async () => {
		const fallback = mock(() => {});
		const filtered = mock(() => {});
		const bot = new Bot(TOKEN)
			.on(filters.photo, () => {
				filtered();
			})
			.on("message", () => {
				fallback();
			});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		// text message — photo filter won't match, should fall through to fallback
		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(filtered).toHaveBeenCalledTimes(0);
		expect(fallback).toHaveBeenCalledTimes(1);
	});
});

describe("filter-only .on() — type narrowing", () => {
	test("bot.on(filters.text, ctx => ...): ctx.text is string, ctx.send works", () => {
		new Bot(TOKEN).on(filters.text, (ctx) => {
			expectTypeOf(ctx.text).toBeString();
			// send() comes from the compatible event context union (message-like events)
			expectTypeOf(ctx.send).toBeFunction();
		});
	});

	test("bot.on(filters.photo, ctx => ...): ctx.attachment is PhotoAttachment, ctx.send works", () => {
		new Bot(TOKEN).on(filters.photo, (ctx) => {
			expectTypeOf(ctx.attachment).toEqualTypeOf<PhotoAttachment>();
			expectTypeOf(ctx.send).toBeFunction();
		});
	});

	test("bot.on(filters.pm, ctx => ...): chatType narrowed to 'private', ctx.send works", () => {
		new Bot(TOKEN).on(filters.pm, (ctx) => {
			expectTypeOf(ctx.chatType).toEqualTypeOf<"private">();
			expectTypeOf(ctx.send).toBeFunction();
		});
	});

	test("bot.on(filters.from(42), ctx => ...): boolean filter, ctx.send works", () => {
		// boolean filter → Context<Bot> & Derives["global"] (no CompatibleUpdates, no narrowing)
		new Bot(TOKEN).on(filters.from(42), (ctx) => {
			// base Context, no send — but that's intentional for boolean filters
			expectTypeOf(ctx.updateId).toEqualTypeOf<number | undefined>();
		});
	});

	test("derives preserved through filter-only .on()", () => {
		new Bot(TOKEN)
			.derive(() => ({ myProp: 42 as const }))
			.on(filters.text, (ctx) => {
				expectTypeOf(ctx.myProp).toEqualTypeOf<42>();
				expectTypeOf(ctx.text).toBeString();
				expectTypeOf(ctx.send).toBeFunction();
			});
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Message shape helpers for new filter tests
// ─────────────────────────────────────────────────────────────────────────────

type SimpleUser = { id: number; first_name: string; is_bot: boolean };

function diceMsg(user: SimpleUser, chatId: number): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "private" },
		from: user,
		dice: { emoji: "🎲", value: 3 },
	};
}

function venueMsg(user: SimpleUser, chatId: number): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "private" },
		from: user,
		venue: {
			location: { latitude: 55.75, longitude: 37.61 },
			title: "Red Square",
			address: "Moscow",
		},
	};
}

function gameMsg(user: SimpleUser, chatId: number): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "private" },
		from: user,
		game: { title: "Snake", description: "Classic snake game", photo: [] },
	};
}

function viaBotMsg(user: SimpleUser, chatId: number): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "private" },
		from: user,
		text: "sent via inline bot",
		via_bot: {
			id: 999,
			first_name: "InlineBot",
			is_bot: true,
			username: "inline_bot",
		},
	};
}

function senderChatMsg(user: SimpleUser, chatId: number): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "supergroup" },
		from: user,
		text: "anonymous admin post",
		sender_chat: { id: chatId, type: "supergroup" },
	};
}

function quoteMsg(user: SimpleUser, chatId: number): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "private" },
		from: user,
		text: "reply with quote",
		reply_to_message: {
			message_id: 1,
			date: Math.floor(Date.now() / 1000),
			chat: { id: chatId, type: "private" },
		},
		quote: { text: "original text", position: 0 },
	};
}

function linkPreviewMsg(user: SimpleUser, chatId: number): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "private" },
		from: user,
		text: "https://example.com",
		link_preview_options: { is_disabled: false },
	};
}

function externalReplyMsg(user: SimpleUser, chatId: number): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "private" },
		from: user,
		text: "message with external reply info",
		external_reply: {
			origin: {
				type: "user",
				date: Math.floor(Date.now() / 1000),
				sender_user: { id: 77, first_name: "ExternalUser", is_bot: false },
			},
		},
	};
}

function captionEntityMsg(
	caption: string,
	entityType: string,
	user: SimpleUser,
	chatId: number,
): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "private" },
		from: user,
		caption,
		caption_entities: [
			{ type: entityType as "url", offset: 0, length: caption.length },
		],
		photo: [
			{
				file_id: "photo-id",
				file_unique_id: "photo-unique",
				width: 100,
				height: 100,
			},
		],
	};
}

function forwardedUserMsg(user: SimpleUser, chatId: number): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "private" },
		from: user,
		text: "forwarded from user",
		forward_origin: {
			type: "user",
			date: Math.floor(Date.now() / 1000),
			sender_user: { id: 55, first_name: "OriginalUser", is_bot: false },
		},
	};
}

function forwardedChatMsg(user: SimpleUser, chatId: number): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "private" },
		from: user,
		text: "forwarded from chat",
		forward_origin: {
			type: "chat",
			date: Math.floor(Date.now() / 1000),
			sender_chat: { id: -100, type: "supergroup" },
		},
	};
}

function forwardedChannelMsg(
	user: SimpleUser,
	chatId: number,
): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "private" },
		from: user,
		text: "forwarded from channel",
		forward_origin: {
			type: "channel",
			date: Math.floor(Date.now() / 1000),
			chat: { id: -200, type: "channel" },
			message_id: 42,
		},
	};
}

function forwardedHiddenUserMsg(
	user: SimpleUser,
	chatId: number,
): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "private" },
		from: user,
		text: "forwarded from anonymous",
		forward_origin: {
			type: "hidden_user",
			date: Math.floor(Date.now() / 1000),
			sender_user_name: "Anonymous",
		},
	};
}

function startPayloadMsg(
	payload: string,
	user: SimpleUser,
	chatId: number,
): TelegramMessage {
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "private" },
		from: user,
		text: `/start ${payload}`,
		entities: [{ type: "bot_command", offset: 0, length: 6 }],
	};
}

// ─────────────────────────────────────────────────────────────────────────────
// Runtime tests — content filters
// ─────────────────────────────────────────────────────────────────────────────

describe("filters — dice filter", () => {
	test("dice filter matches dice messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.dice, () => handler());

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: diceMsg(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("dice filter does not match text messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.dice, () => handler());

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — venue filter", () => {
	test("venue filter matches venue messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.venue, () => handler());

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: venueMsg(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("venue filter does not match text messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.venue, () => handler());

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — game filter", () => {
	test("game filter matches game messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.game, () => handler());

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: gameMsg(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("game filter does not match text messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.game, () => handler());

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — viaBot filter", () => {
	test("viaBot filter matches messages sent via inline bot", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.viaBot, () => handler());

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: viaBotMsg(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("viaBot filter does not match regular messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.viaBot, () => handler());

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — senderChat filter", () => {
	test("senderChat filter matches messages sent on behalf of a chat", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.senderChat(),
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: senderChatMsg(user.payload, -100),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("senderChat filter does not match regular messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.senderChat(),
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — quote filter", () => {
	test("quote filter matches messages with a quote", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.quote, () => handler());

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: quoteMsg(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("quote filter does not match plain messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.quote, () => handler());

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — linkPreview filter", () => {
	test("linkPreview filter matches messages with link_preview_options", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.linkPreview,
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: linkPreviewMsg(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("linkPreview filter does not match messages without link preview options", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.linkPreview,
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — replyInfo filter", () => {
	test("replyInfo filter matches messages with external_reply", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.replyInfo,
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: externalReplyMsg(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("replyInfo filter does not match regular messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.replyInfo,
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — captionEntities filter", () => {
	test("captionEntities matches messages with caption entities", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.captionEntities,
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: captionEntityMsg(
				"https://example.com",
				"url",
				user.payload,
				user.payload.id,
			),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("captionEntities does not match photo without caption entities", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.captionEntities,
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: photoMessage(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — captionEntity(type) filter", () => {
	test("captionEntity('url') matches messages with URL caption entity", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.captionEntity("url"),
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: captionEntityMsg(
				"https://example.com",
				"url",
				user.payload,
				user.payload.id,
			),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("captionEntity('url') does not match messages with different entity type", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.captionEntity("url"),
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: captionEntityMsg(
				"@mention",
				"mention",
				user.payload,
				user.payload.id,
			),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — media filter", () => {
	test("media filter matches photo messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.media, () => handler());

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: photoMessage(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("media filter does not match text-only messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.media, () => handler());

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — forwardOrigin filter", () => {
	test("forwardOrigin matches messages with any forward_origin", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.forwardOrigin(),
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: forwardedUserMsg(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("forwardOrigin does not match non-forwarded messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.forwardOrigin(),
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — forwardOrigin('user') filter", () => {
	test("originUser matches forwarded-from-user messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.forwardOrigin("user"),
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: forwardedUserMsg(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("originUser does not match forwarded-from-chat messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.forwardOrigin("user"),
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: forwardedChatMsg(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — forwardOrigin('chat') filter", () => {
	test("originChat matches forwarded-from-chat messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.forwardOrigin("chat"),
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: forwardedChatMsg(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("originChat does not match forwarded-from-user messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.forwardOrigin("chat"),
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: forwardedUserMsg(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — forwardOrigin('channel') filter", () => {
	test("originChannel matches forwarded-from-channel messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.forwardOrigin("channel"),
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: forwardedChannelMsg(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("originChannel does not match forwarded-from-user messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.forwardOrigin("channel"),
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: forwardedUserMsg(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — forwardOrigin('hidden_user') filter", () => {
	test("originHiddenUser matches forwarded-from-anonymous messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.forwardOrigin("hidden_user"),
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: forwardedHiddenUserMsg(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("originHiddenUser does not match forwarded-from-channel messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.forwardOrigin("hidden_user"),
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: forwardedChannelMsg(user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — rawStartPayload filter", () => {
	test("rawStartPayload matches /start messages with a payload", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.rawStartPayload,
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: startPayloadMsg("mytoken123", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("rawStartPayload does not match bare /start messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.rawStartPayload,
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("/start", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});

	test("rawStartPayload does not match regular text messages", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.rawStartPayload,
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello world", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — hasGameShortName filter (callback_query)", () => {
	test("hasGameShortName matches callback queries with game_short_name", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"callback_query",
			filters.hasGameShortName,
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			callback_query: {
				id: "1",
				from: user.payload,
				chat_instance: "test",
				game_short_name: "snake",
			},
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("hasGameShortName does not match callback queries with data", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"callback_query",
			filters.hasGameShortName,
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			callback_query: {
				id: "1",
				from: user.payload,
				chat_instance: "test",
				data: "button_click",
			},
		});

		expect(handler).toHaveBeenCalledTimes(0);
	});
});

describe("filters — hasFrom filter", () => {
	test("hasFrom matches messages that have a from field", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.hasFrom,
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id),
		});

		expect(handler).toHaveBeenCalledTimes(1);
	});
});

describe("filters — group / supergroup / channel shortcuts", () => {
	test("group matches group chats", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.group, () => handler());

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, -100, "group"),
		});
		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("group does not match private chats", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on("message", filters.group, () => handler());

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, user.payload.id, "private"),
		});
		expect(handler).toHaveBeenCalledTimes(0);
	});

	test("supergroup matches supergroup chats", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"message",
			filters.supergroup,
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: textMessage("hello", user.payload, -100, "supergroup"),
		});
		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("channel matches channel posts", async () => {
		const handler = mock(() => {});
		const bot = new Bot(TOKEN).on(
			"channel_post",
			filters.channel,
			() => handler(),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);

		await env.emitUpdate({
			update_id: 0,
			channel_post: textMessage(
				"channel post",
				{ id: 0, first_name: "", is_bot: false },
				-300,
				"channel",
			),
		});
		expect(handler).toHaveBeenCalledTimes(1);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Type tests — improved narrowings (real types instead of {})
// ─────────────────────────────────────────────────────────────────────────────

describe("filters — improved type narrowings (real types, not {})", () => {
	test("viaBot: viaBot narrowed to User", () => {
		new Bot(TOKEN).on("message", filters.viaBot, (ctx) => {
			expectTypeOf(ctx.viaBot).toEqualTypeOf<User>();
		});
	});

	test("senderChat(): senderChat narrowed to Chat", () => {
		new Bot(TOKEN).on("message", filters.senderChat(), (ctx) => {
			expectTypeOf(ctx.senderChat).toEqualTypeOf<Chat>();
		});
	});

	test("senderChat('channel'): senderChat.type narrowed to 'channel'", () => {
		new Bot(TOKEN).on("message", filters.senderChat("channel"), (ctx) => {
			expectTypeOf(ctx.senderChat).toEqualTypeOf<Chat & { type: "channel" }>();
		});
	});

	test("senderChat('supergroup'): senderChat.type narrowed to 'supergroup'", () => {
		new Bot(TOKEN).on("message", filters.senderChat("supergroup"), (ctx) => {
			expectTypeOf(ctx.senderChat).toEqualTypeOf<
				Chat & { type: "supergroup" }
			>();
		});
	});

	test("forwardOrigin: forwardOrigin narrowed to union of origin types", () => {
		new Bot(TOKEN).on("message", filters.forwardOrigin(), (ctx) => {
			expectTypeOf(ctx.forwardOrigin).toEqualTypeOf<
				| MessageOriginUser
				| MessageOriginChat
				| MessageOriginChannel
				| MessageOriginHiddenUser
			>();
		});
	});

	test("originUser: forwardOrigin narrowed to MessageOriginUser", () => {
		new Bot(TOKEN).on("message", filters.forwardOrigin("user"), (ctx) => {
			expectTypeOf(ctx.forwardOrigin).toEqualTypeOf<MessageOriginUser>();
		});
	});

	test("originChat: forwardOrigin narrowed to MessageOriginChat", () => {
		new Bot(TOKEN).on("message", filters.forwardOrigin("chat"), (ctx) => {
			expectTypeOf(ctx.forwardOrigin).toEqualTypeOf<MessageOriginChat>();
		});
	});

	test("originChannel: forwardOrigin narrowed to MessageOriginChannel", () => {
		new Bot(TOKEN).on("message", filters.forwardOrigin("channel"), (ctx) => {
			expectTypeOf(ctx.forwardOrigin).toEqualTypeOf<MessageOriginChannel>();
		});
	});

	test("originHiddenUser: forwardOrigin narrowed to MessageOriginHiddenUser", () => {
		new Bot(TOKEN).on("message", filters.forwardOrigin("hidden_user"), (ctx) => {
			expectTypeOf(ctx.forwardOrigin).toEqualTypeOf<MessageOriginHiddenUser>();
		});
	});

	test("dice: dice narrowed to Dice", () => {
		new Bot(TOKEN).on("message", filters.dice, (ctx) => {
			expectTypeOf(ctx.dice).toEqualTypeOf<Dice>();
		});
	});

	test("venue: venue narrowed to Venue", () => {
		new Bot(TOKEN).on("message", filters.venue, (ctx) => {
			expectTypeOf(ctx.venue).toEqualTypeOf<Venue>();
		});
	});

	test("game: game narrowed to Game", () => {
		new Bot(TOKEN).on("message", filters.game, (ctx) => {
			expectTypeOf(ctx.game).toEqualTypeOf<Game>();
		});
	});

	test("quote: quote narrowed to TextQuote", () => {
		new Bot(TOKEN).on("message", filters.quote, (ctx) => {
			expectTypeOf(ctx.quote).toEqualTypeOf<TextQuote>();
		});
	});

	test("entities: entities narrowed to MessageEntity[]", () => {
		new Bot(TOKEN).on("message", filters.entities, (ctx) => {
			expectTypeOf(ctx.entities).toEqualTypeOf<MessageEntity[]>();
		});
	});

	test("captionEntities: captionEntities narrowed to MessageEntity[]", () => {
		new Bot(TOKEN).on("message", filters.captionEntities, (ctx) => {
			expectTypeOf(ctx.captionEntities).toEqualTypeOf<MessageEntity[]>();
		});
	});

	test("entity(type): entities narrowed to MessageEntity[]", () => {
		new Bot(TOKEN).on("message", filters.entity("url"), (ctx) => {
			expectTypeOf(ctx.entities).toEqualTypeOf<MessageEntity[]>();
		});
	});

	test("captionEntity(type): captionEntities narrowed to MessageEntity[]", () => {
		new Bot(TOKEN).on("message", filters.captionEntity("url"), (ctx) => {
			expectTypeOf(ctx.captionEntities).toEqualTypeOf<MessageEntity[]>();
		});
	});

	test("linkPreview: linkPreviewOptions narrowed to LinkPreviewOptions", () => {
		new Bot(TOKEN).on("message", filters.linkPreview, (ctx) => {
			expectTypeOf(ctx.linkPreviewOptions).toEqualTypeOf<LinkPreviewOptions>();
		});
	});

	test("replyInfo: externalReply narrowed to ExternalReplyInfo", () => {
		new Bot(TOKEN).on("message", filters.replyInfo, (ctx) => {
			expectTypeOf(ctx.externalReply).toEqualTypeOf<ExternalReplyInfo>();
		});
	});

	test("paidMedia: paidMedia narrowed to PaidMediaInfo", () => {
		new Bot(TOKEN).on("message", filters.paidMedia, (ctx) => {
			expectTypeOf(ctx.paidMedia).toEqualTypeOf<PaidMediaInfo>();
		});
	});

	test("hasFrom: from narrowed to User, senderId to number", () => {
		new Bot(TOKEN).on("message", filters.hasFrom, (ctx) => {
			expectTypeOf(ctx.from).toEqualTypeOf<User>();
			expectTypeOf(ctx.senderId).toBeNumber();
		});
	});

	test("rawStartPayload: rawStartPayload narrowed to string", () => {
		new Bot(TOKEN).on("message", filters.rawStartPayload, (ctx) => {
			expectTypeOf(ctx.rawStartPayload).toBeString();
		});
	});

	test("hasGameShortName: gameShortName narrowed to string on callback_query", () => {
		new Bot(TOKEN).on("callback_query", filters.hasGameShortName, (ctx) => {
			expectTypeOf(ctx.gameShortName).toBeString();
		});
	});

	test("hasMessage: message narrowed (non-nullable) on callback_query", () => {
		new Bot(TOKEN).on("callback_query", filters.hasMessage, (ctx) => {
			// message is non-nullable (undefined removed), has MessageContext methods
			expectTypeOf(ctx.message.chatId).toBeNumber();
			expectTypeOf(ctx.message.send).toBeFunction();
		});
	});
});

describe("filters — chat.type narrowed alongside chatType", () => {
	test("pm: ctx.chat.type narrowed to 'private'", () => {
		new Bot(TOKEN).on("message", filters.pm, (ctx) => {
			expectTypeOf(ctx.chatType).toEqualTypeOf<"private">();
			expectTypeOf(ctx.chat.type).toEqualTypeOf<"private">();
		});
	});

	test("group: ctx.chat.type narrowed to 'group'", () => {
		new Bot(TOKEN).on("message", filters.group, (ctx) => {
			expectTypeOf(ctx.chatType).toEqualTypeOf<"group">();
			expectTypeOf(ctx.chat.type).toEqualTypeOf<"group">();
		});
	});

	test("supergroup: ctx.chat.type narrowed to 'supergroup'", () => {
		new Bot(TOKEN).on("message", filters.supergroup, (ctx) => {
			expectTypeOf(ctx.chatType).toEqualTypeOf<"supergroup">();
			expectTypeOf(ctx.chat.type).toEqualTypeOf<"supergroup">();
		});
	});

	test("channel: ctx.chat.type narrowed to 'channel'", () => {
		new Bot(TOKEN).on("message", filters.channel, (ctx) => {
			expectTypeOf(ctx.chatType).toEqualTypeOf<"channel">();
			expectTypeOf(ctx.chat.type).toEqualTypeOf<"channel">();
		});
	});

	test("chat('supergroup'): both chatType and chat.type narrowed to 'supergroup'", () => {
		new Bot(TOKEN).on("message", filters.chat("supergroup"), (ctx) => {
			expectTypeOf(ctx.chatType).toEqualTypeOf<"supergroup">();
			expectTypeOf(ctx.chat.type).toEqualTypeOf<"supergroup">();
		});
	});
});
