import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { createServer, type RequestListener } from "node:http";
import { setTimeout as sleep } from "node:timers/promises";
import type { TelegramUpdate } from "@gramio/types";
import { Bot } from "../src/bot.ts";
import { withRetries } from "../src/utils.ts";

const servers: ReturnType<typeof createServer>[] = [];

async function serve(handler: RequestListener) {
	const server = createServer(handler);
	servers.push(server);
	await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
	const address = server.address();
	if (!address || typeof address === "string")
		throw new Error("No TCP address");
	return `http://127.0.0.1:${address.port}/bot`;
}

async function waitUntil(predicate: () => boolean) {
	const deadline = Date.now() + 2000;
	while (!predicate()) {
		if (Date.now() >= deadline)
			throw new Error("Condition did not become true");
		await sleep(5);
	}
}

afterEach(async () => {
	for (const server of servers.splice(0)) {
		server.closeAllConnections();
		await new Promise<void>((resolve, reject) =>
			server.close((error) => (error ? reject(error) : resolve())),
		);
	}
});

describe("getUpdates HTTP deadlines", () => {
	for (const mode of ["headers", "body"] as const) {
		test(`recovers from stalled ${mode} without skipping updates`, async () => {
			const offsets: unknown[] = [];
			let delivered = false;
			const baseURL = await serve(async (req, res) => {
				let body = "";
				for await (const chunk of req) body += chunk;
				const params: unknown = JSON.parse(body);
				offsets.push(
					params && typeof params === "object" && "offset" in params
						? params.offset
						: undefined,
				);
				if (offsets.length === 1) {
					if (mode === "body") {
						res.writeHead(200, { "Content-Type": "application/json" });
						res.write('{"ok":true,"result":[');
					}
					return;
				}
				const result: TelegramUpdate[] =
					offsets.length === 2
						? [
								{
									update_id: 42,
									message: {
										message_id: 1,
										date: 1,
										chat: { id: 77, type: "private", first_name: "Test" },
										text: "recovered",
									},
								},
							]
						: [];
				if (offsets.length > 2) await sleep(10);
				res.end(JSON.stringify({ ok: true, result }));
			});
			const bot = new Bot("test-token", {
				api: {
					baseURL,
					getUpdatesTimeoutAllowance: 100,
					retryGetUpdatesWait: 5,
				},
			}).on("message", () => {
				delivered = true;
			});
			const errors = spyOn(console, "error").mockImplementation(() => {});
			bot.updates.isStarted = true;
			const loop = bot.updates.startFetchLoop({ timeout: 0 });
			try {
				await waitUntil(() => delivered && offsets.length >= 3);
				expect(offsets.slice(0, 3)).toEqual([0, 0, 43]);
				expect(errors).toHaveBeenCalledTimes(1);
			} finally {
				await bot.updates.stopPolling();
				await loop;
				errors.mockRestore();
			}
			expect(bot.updates.isRequestActive).toBe(false);
		});
	}

	test("creates fresh deadlines and clears successful request timers", async () => {
		const baseURL = await serve((_req, res) =>
			res.end('{"ok":true,"result":[]}'),
		);
		const bot = new Bot("test-token", {
			api: { baseURL, getUpdatesTimeoutAllowance: 100 },
		});
		const timers = spyOn(globalThis, "setTimeout");
		const signals: AbortSignal[] = [];
		const fetchSpy = spyOn(globalThis, "fetch");
		try {
			for (let i = 0; i < 2; i++) {
				await bot.api.getUpdates({ timeout: 0 });
				const signal = fetchSpy.mock.calls.at(-1)?.[1]?.signal;
				if (!signal) throw new Error("Missing signal");
				signals.push(signal);
			}
			expect(signals[0]).not.toBe(signals[1]);
			expect(timers.mock.calls.map((call) => call[1])).toContain(100);
			await sleep(150);
			expect(signals.every((signal) => !signal.aborted)).toBe(true);
		} finally {
			timers.mockRestore();
			fetchSpy.mockRestore();
		}
	});

	test("uses the default allowance and the timeout after preRequest hooks", async () => {
		const baseURL = await serve((_req, res) =>
			res.end('{"ok":true,"result":[]}'),
		);
		const bot = new Bot("test-token", { api: { baseURL } }).preRequest(
			"getUpdates",
			(context) => {
				context.params = { ...context.params, timeout: 2 };
				return context;
			},
		);
		const timers = spyOn(globalThis, "setTimeout");
		try {
			await bot.api.getUpdates({ timeout: 1 });
			expect(timers.mock.calls.map((call) => call[1])).toContain(17_000);
		} finally {
			timers.mockRestore();
		}
	});

	test("default polling gets a 45-second deadline", async () => {
		let received = false;
		const baseURL = await serve(async (_req, res) => {
			received = true;
			await sleep(10);
			res.end('{"ok":true,"result":[]}');
		});
		const bot = new Bot("test-token", { api: { baseURL } });
		const timers = spyOn(globalThis, "setTimeout");
		bot.updates.isStarted = true;
		const loop = bot.updates.startFetchLoop();
		try {
			await waitUntil(() => received);
			expect(timers.mock.calls.map((call) => call[1])).toContain(45_000);
		} finally {
			await bot.updates.stopPolling();
			await loop;
			timers.mockRestore();
		}
	});

	test("clears the deadline when reading JSON fails", async () => {
		const baseURL = await serve((_req, res) => res.end("invalid JSON"));
		const bot = new Bot("test-token", {
			api: { baseURL, getUpdatesTimeoutAllowance: 100 },
		});
		const fetchSpy = spyOn(globalThis, "fetch");
		try {
			await expect(bot.api.getUpdates()).rejects.toBeInstanceOf(SyntaxError);
			const signal = fetchSpy.mock.calls.at(-1)?.[1]?.signal;
			if (!signal) throw new Error("Missing signal");
			await sleep(150);
			expect(signal.aborted).toBe(false);
		} finally {
			fetchSpy.mockRestore();
		}
	});

	test("refreshes the deadline after Telegram retry_after", async () => {
		let calls = 0;
		const baseURL = await serve((_req, res) => {
			if (++calls === 1)
				res.end(
					JSON.stringify({
						ok: false,
						error_code: 429,
						description: "Too Many Requests",
						parameters: { retry_after: 0.02 },
					}),
				);
		});
		const bot = new Bot("test-token", {
			api: { baseURL, getUpdatesTimeoutAllowance: 100 },
		});
		const fetchSpy = spyOn(globalThis, "fetch");
		try {
			await expect(
				withRetries(() => bot.api.getUpdates()),
			).rejects.toMatchObject({ name: "TimeoutError" });
			expect(calls).toBe(2);
			const first = fetchSpy.mock.calls[0]?.[1]?.signal;
			const second = fetchSpy.mock.calls[1]?.[1]?.signal;
			expect(first).not.toBe(second);
			expect(first?.aborted).toBe(false);
			expect(second?.aborted).toBe(true);
		} finally {
			fetchSpy.mockRestore();
		}
	});

	test("preserves caller cancellation and does not abort the caller on deadline", async () => {
		const baseURL = await serve(() => {});
		const caller = new AbortController();
		const bot = new Bot("test-token", {
			api: {
				baseURL,
				getUpdatesTimeoutAllowance: 50,
				fetchOptions: { signal: caller.signal },
			},
		});
		await expect(bot.api.getUpdates()).rejects.toMatchObject({
			name: "TimeoutError",
		});
		expect(caller.signal.aborted).toBe(false);
		const pending = bot.api.getUpdates();
		caller.abort();
		await expect(pending).rejects.toMatchObject({ name: "AbortError" });
	});

	test("bounds dropPendingUpdates requests too", async () => {
		const baseURL = await serve(() => {});
		const bot = new Bot("test-token", {
			api: { baseURL, getUpdatesTimeoutAllowance: 50 },
		});
		await expect(bot.updates.dropPendingUpdates()).rejects.toMatchObject({
			name: "TimeoutError",
		});
	});

	test("does not add a deadline to other API methods", async () => {
		const baseURL = await serve(async (_req, res) => {
			await sleep(50);
			res.end('{"ok":true,"result":true}');
		});
		const bot = new Bot("test-token", {
			api: { baseURL, getUpdatesTimeoutAllowance: 1 },
		});
		await expect(bot.api.deleteWebhook()).resolves.toBe(true);
	});

	test("stopping during a stalled poll exits silently with request state reset", async () => {
		let calls = 0;
		const baseURL = await serve(() => {
			calls++;
		});
		const bot = new Bot("test-token", {
			api: { baseURL, getUpdatesTimeoutAllowance: 50 },
		});
		const errors = spyOn(console, "error").mockImplementation(() => {});
		bot.updates.isStarted = true;
		const loop = bot.updates.startFetchLoop({ timeout: 0 });
		try {
			await waitUntil(() => calls === 1);
			await bot.updates.stopPolling(true);
			await loop;
			expect(bot.updates.isRequestActive).toBe(false);
			expect(errors).not.toHaveBeenCalled();
			expect(calls).toBe(1);
		} finally {
			await bot.updates.stopPolling();
			await loop;
			errors.mockRestore();
		}
	});

	test("clears request state while waiting to retry a rejected poll", async () => {
		const baseURL = await serve((req) => req.socket.destroy());
		const bot = new Bot("test-token", {
			api: { baseURL, retryGetUpdatesWait: 50 },
		});
		const errors = spyOn(console, "error").mockImplementation(() => {});
		bot.updates.isStarted = true;
		const loop = bot.updates.startFetchLoop({ timeout: 0 });
		try {
			await waitUntil(() => errors.mock.calls.length > 0);
			expect(bot.updates.isRequestActive).toBe(false);
		} finally {
			await bot.updates.stopPolling();
			await loop;
			errors.mockRestore();
		}
	});

	test.each([
		-1,
		Number.NaN,
		Number.POSITIVE_INFINITY,
		2_147_483_648,
	])("rejects invalid allowance %s", (getUpdatesTimeoutAllowance) => {
		expect(
			() => new Bot("test-token", { api: { getUpdatesTimeoutAllowance } }),
		).toThrow(RangeError);
	});

	test("accepts zero allowance but rejects an overflowing total deadline", async () => {
		const bot = new Bot("test-token", {
			api: { getUpdatesTimeoutAllowance: 0 },
		});
		await expect(bot.api.getUpdates({ timeout: 2_147_484 })).rejects.toThrow(
			RangeError,
		);
	});
});
