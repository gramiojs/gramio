import { describe, expect, test } from "bun:test";
import {
	AllowedUpdatesFilter,
	buildAllowedUpdates,
	detectOptInUpdates,
	mapEventToAllowedUpdates,
	OPT_IN_TYPES,
} from "../src/allowed-updates.ts";
import { Bot } from "../src/bot.ts";

const TOKEN = "test-token";

// ─── mapEventToAllowedUpdates ─────────────────────────────────────────────────

describe("mapEventToAllowedUpdates()", () => {
	test("top-level update name maps to itself", () => {
		expect(mapEventToAllowedUpdates("message")).toEqual(["message"]);
		expect(mapEventToAllowedUpdates("callback_query")).toEqual([
			"callback_query",
		]);
		expect(mapEventToAllowedUpdates("inline_query")).toEqual(["inline_query"]);
		expect(mapEventToAllowedUpdates("message_reaction")).toEqual([
			"message_reaction",
		]);
		expect(mapEventToAllowedUpdates("chat_member")).toEqual(["chat_member"]);
	});

	test("sub-message event maps to all 5 message parent types", () => {
		const result = mapEventToAllowedUpdates("new_chat_members");
		expect(result).not.toBeUndefined();
		expect(result).toHaveLength(5);
		expect(result).toContain("message");
		expect(result).toContain("edited_message");
		expect(result).toContain("channel_post");
		expect(result).toContain("edited_channel_post");
		expect(result).toContain("business_message");
	});

	test("invoice (sub-message event) maps to all 5 message parent types", () => {
		const result = mapEventToAllowedUpdates("invoice");
		expect(result).not.toBeUndefined();
		expect(result).toHaveLength(5);
	});

	test("unknown name (filter name) returns undefined", () => {
		expect(mapEventToAllowedUpdates("filter")).toBeUndefined();
		expect(mapEventToAllowedUpdates("text")).toBeUndefined();
		expect(mapEventToAllowedUpdates("isAuthenticated")).toBeUndefined();
	});
});

// ─── detectOptInUpdates ───────────────────────────────────────────────────────

describe("detectOptInUpdates()", () => {
	test("returns empty array when no opt-in types registered", () => {
		const events = new Set(["message", "callback_query"]);
		expect(detectOptInUpdates(events)).toEqual([]);
	});

	test("detects message_reaction when registered", () => {
		const events = new Set(["message", "message_reaction"]);
		expect(detectOptInUpdates(events)).toContain("message_reaction");
	});

	test("detects chat_member when registered", () => {
		const events = new Set(["message", "chat_member"]);
		expect(detectOptInUpdates(events)).toContain("chat_member");
	});

	test("detects message_reaction_count when registered", () => {
		const events = new Set(["message_reaction_count"]);
		expect(detectOptInUpdates(events)).toContain("message_reaction_count");
	});

	test("detects all 3 opt-in types when all registered", () => {
		const events = new Set([
			"chat_member",
			"message_reaction",
			"message_reaction_count",
		]);
		const result = detectOptInUpdates(events);
		expect(result).toHaveLength(3);
		expect(result).toContain("chat_member");
		expect(result).toContain("message_reaction");
		expect(result).toContain("message_reaction_count");
	});

	test("OPT_IN_TYPES contains exactly the 3 opt-in update types", () => {
		expect(OPT_IN_TYPES).toContain("chat_member");
		expect(OPT_IN_TYPES).toContain("message_reaction");
		expect(OPT_IN_TYPES).toContain("message_reaction_count");
		expect(OPT_IN_TYPES).toHaveLength(3);
	});
});

// ─── buildAllowedUpdates ──────────────────────────────────────────────────────

describe("buildAllowedUpdates()", () => {
	test("returns AllowedUpdatesFilter (instanceof Array)", () => {
		const bot = new Bot(TOKEN);
		const result = buildAllowedUpdates(bot);
		expect(result).toBeInstanceOf(AllowedUpdatesFilter);
		expect(Array.isArray(result)).toBe(true);
	});

	test("returns empty filter when no handlers registered", () => {
		const bot = new Bot(TOKEN);
		const result = buildAllowedUpdates(bot);
		expect(result).toHaveLength(0);
	});

	test(".command() registers message + business_message", () => {
		const bot = new Bot(TOKEN).command("start", () => {});
		const result = buildAllowedUpdates(bot);
		const set = new Set(result);
		expect(set.has("message")).toBe(true);
		expect(set.has("business_message")).toBe(true);
		// command only registers those two message-carrying events
		expect(set.has("callback_query")).toBe(false);
	});

	test(".callbackQuery() registers callback_query", () => {
		const bot = new Bot(TOKEN).callbackQuery("data", () => {});
		const result = buildAllowedUpdates(bot);
		expect(new Set(result).has("callback_query")).toBe(true);
	});

	test(".reaction() registers message_reaction", () => {
		const bot = new Bot(TOKEN).reaction("👍", () => {});
		const result = buildAllowedUpdates(bot);
		expect(new Set(result).has("message_reaction")).toBe(true);
	});

	test(".inlineQuery() registers inline_query", () => {
		const bot = new Bot(TOKEN).inlineQuery("query", () => {});
		const result = buildAllowedUpdates(bot);
		expect(new Set(result).has("inline_query")).toBe(true);
	});

	test(".on('new_chat_members') registers all 5 message-parent types", () => {
		const bot = new Bot(TOKEN).on("new_chat_members", () => {});
		const result = buildAllowedUpdates(bot);
		const set = new Set(result);
		expect(set.has("message")).toBe(true);
		expect(set.has("edited_message")).toBe(true);
		expect(set.has("channel_post")).toBe(true);
		expect(set.has("edited_channel_post")).toBe(true);
		expect(set.has("business_message")).toBe(true);
	});

	test("combined: command + callbackQuery + reaction", () => {
		const bot = new Bot(TOKEN)
			.command("start", () => {})
			.callbackQuery("data", () => {})
			.reaction("👍", () => {});
		const result = buildAllowedUpdates(bot);
		const set = new Set(result);
		expect(set.has("message")).toBe(true);
		expect(set.has("business_message")).toBe(true);
		expect(set.has("callback_query")).toBe(true);
		expect(set.has("message_reaction")).toBe(true);
	});

	test("result supports .add() for further customization", () => {
		const bot = new Bot(TOKEN).command("start", () => {});
		const result = buildAllowedUpdates(bot).add("poll");
		expect(new Set(result).has("poll")).toBe(true);
	});
});

// ─── registeredEvents() on Bot's composer ────────────────────────────────────

describe("bot.updates.composer.registeredEvents()", () => {
	test("empty bot has no registered events", () => {
		const bot = new Bot(TOKEN);
		expect(bot.updates.composer.registeredEvents()).toEqual(new Set());
	});

	test(".command() registers message|business_message event", () => {
		const bot = new Bot(TOKEN).command("start", () => {});
		const events = bot.updates.composer.registeredEvents();
		expect(events.has("message")).toBe(true);
		expect(events.has("business_message")).toBe(true);
	});

	test(".on('chat_member') registers chat_member event", () => {
		const bot = new Bot(TOKEN).on("chat_member", () => {});
		const events = bot.updates.composer.registeredEvents();
		expect(events.has("chat_member")).toBe(true);
	});

	test(".reaction() registers message_reaction event", () => {
		const bot = new Bot(TOKEN).reaction("👍", () => {});
		const events = bot.updates.composer.registeredEvents();
		expect(events.has("message_reaction")).toBe(true);
	});
});
