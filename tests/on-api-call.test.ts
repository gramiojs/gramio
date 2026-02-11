import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { Bot } from "../src/bot.ts";
import { Plugin } from "../src/plugin.ts";

const TOKEN = "test-token";

const originalFetch = globalThis.fetch;

function mockFetch(result: unknown = true) {
	const fn = mock(() =>
		Promise.resolve(
			new Response(JSON.stringify({ ok: true, result }), {
				headers: { "Content-Type": "application/json" },
			}),
		),
	);
	globalThis.fetch = fn as any;
	return fn;
}

function mockFetchError(description = "Bad Request", error_code = 400) {
	const fn = mock(() =>
		Promise.resolve(
			new Response(
				JSON.stringify({ ok: false, description, error_code }),
				{
					headers: { "Content-Type": "application/json" },
				},
			),
		),
	);
	globalThis.fetch = fn as any;
	return fn;
}

describe("onApiCall hook", () => {
	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	test("is called with correct method and params", async () => {
		mockFetch({ message_id: 1 });
		const calls: { method: string; params: unknown }[] = [];

		const bot = new Bot(TOKEN).onApiCall(async (context, next) => {
			calls.push({ method: context.method, params: context.params });
			return next();
		});

		await bot.api.sendMessage({
			chat_id: 123,
			text: "hello",
		});

		expect(calls).toHaveLength(1);
		expect(calls[0].method).toBe("sendMessage");
		expect(calls[0].params).toMatchObject({
			chat_id: 123,
			text: "hello",
		});
	});

	test("passes through the return value from next()", async () => {
		mockFetch({ message_id: 42 });

		const bot = new Bot(TOKEN).onApiCall(async (_context, next) => {
			return next();
		});

		const result = await bot.api.sendMessage({
			chat_id: 123,
			text: "hello",
		});

		expect(result).toMatchObject({ message_id: 42 });
	});

	test("method filtering only runs hook for matching methods", async () => {
		mockFetch(true);
		const calls: string[] = [];

		const bot = new Bot(TOKEN).onApiCall(
			"sendMessage",
			async (context, next) => {
				calls.push(context.method);
				return next();
			},
		);

		await bot.api.sendMessage({ chat_id: 1, text: "hi" });
		await bot.api.getMe();

		expect(calls).toEqual(["sendMessage"]);
	});

	test("method filtering with array of methods", async () => {
		mockFetch(true);
		const calls: string[] = [];

		const bot = new Bot(TOKEN).onApiCall(
			["sendMessage", "sendPhoto"],
			async (context, next) => {
				calls.push(context.method);
				return next();
			},
		);

		await bot.api.sendMessage({ chat_id: 1, text: "hi" });
		await bot.api.getMe();

		expect(calls).toEqual(["sendMessage"]);
	});

	test("error from next() propagates through the hook", async () => {
		mockFetchError("Not Found", 404);

		const hookCalled = { before: false, after: false, caught: false };

		const bot = new Bot(TOKEN).onApiCall(async (_context, next) => {
			hookCalled.before = true;
			try {
				const result = await next();
				hookCalled.after = true;
				return result;
			} catch (err) {
				hookCalled.caught = true;
				throw err;
			}
		});

		await expect(
			bot.api.sendMessage({ chat_id: 1, text: "hi" }),
		).rejects.toThrow();

		expect(hookCalled.before).toBe(true);
		expect(hookCalled.after).toBe(false);
		expect(hookCalled.caught).toBe(true);
	});

	test("multiple hooks compose in correct order (first registered = outermost)", async () => {
		mockFetch(true);
		const order: string[] = [];

		const bot = new Bot(TOKEN)
			.onApiCall(async (_ctx, next) => {
				order.push("A:before");
				const result = await next();
				order.push("A:after");
				return result;
			})
			.onApiCall(async (_ctx, next) => {
				order.push("B:before");
				const result = await next();
				order.push("B:after");
				return result;
			});

		await bot.api.getMe();

		expect(order).toEqual(["A:before", "B:before", "B:after", "A:after"]);
	});

	test("zero overhead when no hooks registered", async () => {
		const fetchMock = mockFetch({ id: 1 });

		const bot = new Bot(TOKEN);
		const result = await bot.api.getMe();

		expect(result).toMatchObject({ id: 1 });
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	test("plugin onApiCall hooks are registered via extend", async () => {
		mockFetch(true);
		const calls: string[] = [];

		const plugin = new Plugin("test-plugin").onApiCall(
			async (context, next) => {
				calls.push(context.method);
				return next();
			},
		);

		const bot = new Bot(TOKEN).extend(plugin);

		await bot.api.getMe();

		expect(calls).toEqual(["getMe"]);
	});

	test("plugin onApiCall with method filter is registered via extend", async () => {
		mockFetch(true);
		const calls: string[] = [];

		const plugin = new Plugin("test-plugin").onApiCall(
			"sendMessage",
			async (context, next) => {
				calls.push(context.method);
				return next();
			},
		);

		const bot = new Bot(TOKEN).extend(plugin);

		await bot.api.sendMessage({ chat_id: 1, text: "hi" });
		await bot.api.getMe();

		expect(calls).toEqual(["sendMessage"]);
	});

	test("hook can modify or replace the return value", async () => {
		mockFetch({ message_id: 1 });

		const bot = new Bot(TOKEN).onApiCall(async (_ctx, next) => {
			await next();
			return { message_id: 999 };
		});

		const result = await bot.api.sendMessage({
			chat_id: 1,
			text: "hi",
		});

		expect(result).toMatchObject({ message_id: 999 });
	});

	test("works with suppress: true (error returned, not thrown)", async () => {
		mockFetchError("Bad Request", 400);
		const hookCalled = { before: false, after: false };

		const bot = new Bot(TOKEN).onApiCall(async (_ctx, next) => {
			hookCalled.before = true;
			const result = await next();
			hookCalled.after = true;
			return result;
		});

		const result = await bot.api.sendMessage({
			chat_id: 1,
			text: "hi",
			suppress: true,
		});

		expect(hookCalled.before).toBe(true);
		expect(hookCalled.after).toBe(true);
		expect(result).toBeInstanceOf(Error);
	});
});
