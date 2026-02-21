import { describe, expect, expectTypeOf, mock, test } from "bun:test";
import type { AttachmentsMapping, PhotoAttachment } from "@gramio/contexts";
import { TelegramTestEnvironment } from "@gramio/test";
import type { TelegramMessage } from "@gramio/types";
import { Bot } from "../src/bot.ts";
import { type Filter, filters } from "../src/filters.ts";

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
			Filter<any, { chatType: "private" }>
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
