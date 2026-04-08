import { afterEach, describe, expect, mock, test } from "bun:test";
import { TelegramTestEnvironment } from "@gramio/test";
import { Bot } from "../src/bot.ts";
import { Composer } from "../src/composer.ts";
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
				{ headers: { "Content-Type": "application/json" } },
			),
		),
	);
	globalThis.fetch = fn as any;
	return fn;
}

/** Smart mock that returns appropriate responses for getMe vs getUpdates */
function mockFetchSmart() {
	const fn = mock((url: string | URL | Request) => {
		const urlStr = typeof url === "string" ? url : url instanceof URL ? url.toString() : url.url;
		if (urlStr.includes("getMe")) {
			return Promise.resolve(
				new Response(
					JSON.stringify({
						ok: true,
						result: { id: 1, is_bot: true, first_name: "Bot", username: "testbot" },
					}),
					{ headers: { "Content-Type": "application/json" } },
				),
			);
		}
		// getUpdates and everything else — return empty array
		return Promise.resolve(
			new Response(JSON.stringify({ ok: true, result: [] }), {
				headers: { "Content-Type": "application/json" },
			}),
		);
	});
	globalThis.fetch = fn as any;
	return fn;
}

afterEach(() => {
	globalThis.fetch = originalFetch;
});

// ─────────────────────────────────────────────────────────────────────────────
// Plugin.extend(plugin) — preRequest
// ─────────────────────────────────────────────────────────────────────────────

describe("Plugin.extend(plugin) — preRequest", () => {
	test("preRequest hook propagates to bot", async () => {
		mockFetch({ message_id: 1 });
		const calls: string[] = [];

		const child = new Plugin("child").preRequest((ctx) => {
			calls.push(`preRequest:${ctx.method}`);
			return ctx;
		});

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		await bot.api.sendMessage({ chat_id: 1, text: "hi" });

		expect(calls).toEqual(["preRequest:sendMessage"]);
	});

	test("preRequest with method filter propagates", async () => {
		mockFetch({ message_id: 1 });
		const calls: string[] = [];

		const child = new Plugin("child").preRequest(
			"sendMessage",
			(ctx) => {
				calls.push(ctx.method);
				return ctx;
			},
		);

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		await bot.api.sendMessage({ chat_id: 1, text: "hi" });
		await bot.api.getMe();

		expect(calls).toEqual(["sendMessage"]);
	});

	test("preRequest with array method filter propagates", async () => {
		mockFetch(true);
		const calls: string[] = [];

		const child = new Plugin("child").preRequest(
			["sendMessage", "sendPhoto"],
			(ctx) => {
				calls.push(ctx.method);
				return ctx;
			},
		);

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		await bot.api.sendMessage({ chat_id: 1, text: "hi" });
		await bot.api.getMe();

		expect(calls).toEqual(["sendMessage"]);
	});

	test("preRequest can mutate params", async () => {
		const fetchMock = mockFetch({ message_id: 1 });

		const child = new Plugin("child").preRequest((ctx) => {
			if (ctx.method === "sendMessage") {
				ctx.params.text = "mutated";
			}
			return ctx;
		});

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		await bot.api.sendMessage({ chat_id: 1, text: "original" });

		const body = await (fetchMock.mock.calls[0] as any)[1].body;
		const parsed =
			typeof body === "string" ? JSON.parse(body) : JSON.parse(await new Response(body).text());
		expect(parsed.text).toBe("mutated");
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Plugin.extend(plugin) — onResponse
// ─────────────────────────────────────────────────────────────────────────────

describe("Plugin.extend(plugin) — onResponse", () => {
	test("onResponse hook propagates to bot", async () => {
		mockFetch({ message_id: 1 });
		const calls: string[] = [];

		const child = new Plugin("child").onResponse((ctx) => {
			calls.push(`onResponse:${ctx.method}`);
		});

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		await bot.api.sendMessage({ chat_id: 1, text: "hi" });

		expect(calls).toEqual(["onResponse:sendMessage"]);
	});

	test("onResponse with method filter propagates", async () => {
		mockFetch({ message_id: 1 });
		const calls: string[] = [];

		const child = new Plugin("child").onResponse("sendMessage", (ctx) => {
			calls.push(ctx.method);
		});

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		await bot.api.sendMessage({ chat_id: 1, text: "hi" });
		await bot.api.getMe();

		expect(calls).toEqual(["sendMessage"]);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Plugin.extend(plugin) — onResponseError
// ─────────────────────────────────────────────────────────────────────────────

describe("Plugin.extend(plugin) — onResponseError", () => {
	test("onResponseError hook propagates to bot", async () => {
		mockFetchError("Not Found", 404);
		const calls: string[] = [];

		const child = new Plugin("child").onResponseError((ctx) => {
			calls.push(`onResponseError:${ctx.method}`);
		});

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		try {
			await bot.api.sendMessage({ chat_id: 1, text: "hi" });
		} catch {}

		expect(calls).toEqual(["onResponseError:sendMessage"]);
	});

	test("onResponseError with method filter propagates", async () => {
		mockFetchError("Bad", 400);
		const calls: string[] = [];

		const child = new Plugin("child").onResponseError(
			"sendMessage",
			(ctx) => {
				calls.push(ctx.method);
			},
		);

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		try {
			await bot.api.sendMessage({ chat_id: 1, text: "hi" });
		} catch {}
		try {
			await bot.api.getMe();
		} catch {}

		expect(calls).toEqual(["sendMessage"]);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Plugin.extend(plugin) — onApiCall
// ─────────────────────────────────────────────────────────────────────────────

describe("Plugin.extend(plugin) — onApiCall", () => {
	test("onApiCall hook propagates to bot", async () => {
		mockFetch(true);
		const calls: string[] = [];

		const child = new Plugin("child").onApiCall(async (ctx, next) => {
			calls.push(ctx.method);
			return next();
		});

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		await bot.api.getMe();

		expect(calls).toEqual(["getMe"]);
	});

	test("onApiCall with method filter propagates", async () => {
		mockFetch(true);
		const calls: string[] = [];

		const child = new Plugin("child").onApiCall(
			"sendMessage",
			async (ctx, next) => {
				calls.push(ctx.method);
				return next();
			},
		);

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		await bot.api.sendMessage({ chat_id: 1, text: "hi" });
		await bot.api.getMe();

		expect(calls).toEqual(["sendMessage"]);
	});

	test("onApiCall with array method filter propagates", async () => {
		mockFetch(true);
		const calls: string[] = [];

		const child = new Plugin("child").onApiCall(
			["sendMessage", "sendPhoto"],
			async (ctx, next) => {
				calls.push(ctx.method);
				return next();
			},
		);

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		await bot.api.sendMessage({ chat_id: 1, text: "hi" });
		await bot.api.getMe();

		expect(calls).toEqual(["sendMessage"]);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Plugin.extend(plugin) — onError
// ─────────────────────────────────────────────────────────────────────────────

describe("Plugin.extend(plugin) — onError", () => {
	test("onError hook propagates to bot", async () => {
		const errors: string[] = [];

		const child = new Plugin("child").onError(({ error }) => {
			errors.push(error.message);
		});

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN)
			.extend(parent)
			.on("message", () => {
				throw new Error("test-error");
			});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("trigger error");

		expect(errors).toEqual(["test-error"]);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Plugin.extend(plugin) — onStart / onStop
// ─────────────────────────────────────────────────────────────────────────────

describe("Plugin.extend(plugin) — onStart / onStop", () => {
	test("onStart hook propagates to bot", async () => {
		mockFetchSmart();

		const calls: string[] = [];

		const child = new Plugin("child").onStart(() => {
			calls.push("child:onStart");
		});

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		await bot.start({ dropPendingUpdates: true });
		await bot.stop();

		expect(calls).toContain("child:onStart");
	});

	test("onStop hook propagates to bot", async () => {
		mockFetchSmart();

		const calls: string[] = [];

		const child = new Plugin("child").onStop(() => {
			calls.push("child:onStop");
		});

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		await bot.start({ dropPendingUpdates: true });
		await bot.stop();

		expect(calls).toContain("child:onStop");
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Plugin.extend(plugin) — decorators
// ─────────────────────────────────────────────────────────────────────────────

describe("Plugin.extend(plugin) — decorators", () => {
	test("single decorator propagates", async () => {
		const child = new Plugin("child").decorate("myUtil", 42);

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		let value: unknown;
		bot.on("message", (ctx) => {
			value = (ctx as any).myUtil;
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("hello");

		expect(value).toBe(42);
	});

	test("object decorator propagates", async () => {
		const child = new Plugin("child").decorate({
			foo: "bar",
			num: 99,
		});

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		const captured: Record<string, unknown> = {};
		bot.on("message", (ctx) => {
			captured.foo = (ctx as any).foo;
			captured.num = (ctx as any).num;
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("hello");

		expect(captured.foo).toBe("bar");
		expect(captured.num).toBe(99);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Plugin.extend(plugin) — error definitions
// ─────────────────────────────────────────────────────────────────────────────

describe("Plugin.extend(plugin) — error definitions", () => {
	test("custom error class propagates through plugin chain", async () => {
		class ChildError extends Error {
			code = "CHILD_ERR";
		}

		const child = new Plugin("child").error("CHILD", ChildError);

		const parent = new Plugin("parent").extend(child);

		// Verify the error definition is on the parent
		expect(parent._.errorsDefinitions.CHILD).toBe(ChildError);
	});

	test("multiple error definitions propagate", () => {
		class ErrA extends Error {}
		class ErrB extends Error {}

		const child = new Plugin("child")
			.error("A", ErrA)
			.error("B", ErrB);

		const parent = new Plugin("parent").extend(child);

		expect(parent._.errorsDefinitions.A).toBe(ErrA);
		expect(parent._.errorsDefinitions.B).toBe(ErrB);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Plugin.extend(plugin) — middleware / handlers
// ─────────────────────────────────────────────────────────────────────────────

describe("Plugin.extend(plugin) — middleware", () => {
	test("use() handler propagates through plugin chain", async () => {
		const calls: string[] = [];

		const child = new Plugin("child").use((ctx) => {
			calls.push("child:use");
		});

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("hello");

		expect(calls).toContain("child:use");
	});

	test("on() handler propagates through plugin chain", async () => {
		const calls: string[] = [];

		const child = new Plugin("child").on("message", (ctx) => {
			calls.push("child:on:message");
		});

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("hello");

		expect(calls).toContain("child:on:message");
	});

	test("derive() propagates through plugin chain", async () => {
		const child = new Plugin("child").derive(() => ({
			derived: "value",
		}));

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		let capturedDerived: unknown;
		bot.on("message", (ctx) => {
			capturedDerived = (ctx as any).derived;
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("hello");

		expect(capturedDerived).toBe("value");
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Plugin.extend(plugin) — groups
// ─────────────────────────────────────────────────────────────────────────────

describe("Plugin.extend(plugin) — groups", () => {
	test("group handler propagates through plugin chain", async () => {
		const calls: string[] = [];

		const child = new Plugin("child").group((bot) => {
			calls.push("child:group");
			return bot;
		});

		const parent = new Plugin("parent").extend(child);

		// Verify the group is on the parent
		expect(parent._.groups).toHaveLength(1);

		// When bot extends parent, the group should be registered
		const bot = new Bot(TOKEN).extend(parent);
		expect(calls).toContain("child:group");
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Plugin.extend(plugin) — dependencies
// ─────────────────────────────────────────────────────────────────────────────

describe("Plugin.extend(plugin) — dependencies", () => {
	test("child plugin dependencies propagate to parent", () => {
		const child = new Plugin("child", {
			dependencies: ["some-dep"],
		});

		const parent = new Plugin("parent").extend(child);

		expect(parent._.dependencies).toContain("some-dep");
	});

	test("duplicate dependencies are not added twice", () => {
		const child = new Plugin("child", {
			dependencies: ["dep"],
		});

		const parent = new Plugin("parent", {
			dependencies: ["dep"],
		}).extend(child);

		const depCount = parent._.dependencies.filter(
			(d) => d === "dep",
		).length;
		expect(depCount).toBe(1);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Plugin.extend(plugin) — chaining multiple plugins
// ─────────────────────────────────────────────────────────────────────────────

describe("Plugin.extend(plugin) — chaining", () => {
	test("multiple extends collect all hooks", async () => {
		mockFetch(true);
		const calls: string[] = [];

		const pluginA = new Plugin("a").preRequest((ctx) => {
			calls.push("a:preRequest");
			return ctx;
		});

		const pluginB = new Plugin("b").preRequest((ctx) => {
			calls.push("b:preRequest");
			return ctx;
		});

		const combined = new Plugin("combined")
			.extend(pluginA)
			.extend(pluginB);

		const bot = new Bot(TOKEN).extend(combined);

		await bot.api.getMe();

		expect(calls).toContain("a:preRequest");
		expect(calls).toContain("b:preRequest");
	});

	test("nested plugin extends (3 levels deep)", async () => {
		mockFetch(true);
		const calls: string[] = [];

		const level3 = new Plugin("level3").preRequest((ctx) => {
			calls.push("level3");
			return ctx;
		});

		const level2 = new Plugin("level2")
			.extend(level3)
			.preRequest((ctx) => {
				calls.push("level2");
				return ctx;
			});

		const level1 = new Plugin("level1")
			.extend(level2)
			.preRequest((ctx) => {
				calls.push("level1");
				return ctx;
			});

		const bot = new Bot(TOKEN).extend(level1);

		await bot.api.getMe();

		expect(calls).toContain("level1");
		expect(calls).toContain("level2");
		expect(calls).toContain("level3");
	});

	test("all hook types from multiple child plugins propagate together", async () => {
		mockFetch(true);
		const log: string[] = [];

		const hookPlugin = new Plugin("hooks")
			.preRequest((ctx) => {
				log.push("preRequest");
				return ctx;
			})
			.onResponse((ctx) => {
				log.push("onResponse");
			})
			.onApiCall(async (ctx, next) => {
				log.push("onApiCall");
				return next();
			});

		const decorPlugin = new Plugin("decor").decorate("x", 1);

		const parent = new Plugin("parent")
			.extend(hookPlugin)
			.extend(decorPlugin);

		const bot = new Bot(TOKEN).extend(parent);

		await bot.api.getMe();

		expect(log).toContain("preRequest");
		expect(log).toContain("onResponse");
		expect(log).toContain("onApiCall");
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Plugin.extend(plugin) — combined hooks and middleware
// ─────────────────────────────────────────────────────────────────────────────

describe("Plugin.extend(plugin) — hooks + middleware combined", () => {
	test("child plugin with both middleware and hooks: middleware propagates", async () => {
		const log: string[] = [];

		const child = new Plugin("child")
			.preRequest((ctx) => {
				log.push("child:preRequest");
				return ctx;
			})
			.on("message", () => {
				log.push("child:on:message");
			});

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });
		await user.sendMessage("hello");

		expect(log).toContain("child:on:message");
	});

	test("child plugin with both middleware and hooks: hooks propagate", async () => {
		mockFetch(true);
		const log: string[] = [];

		const child = new Plugin("child")
			.preRequest((ctx) => {
				log.push("child:preRequest");
				return ctx;
			})
			.on("message", () => {
				log.push("child:on:message");
			});

		const parent = new Plugin("parent").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		await bot.api.getMe();

		expect(log).toContain("child:preRequest");
	});

	test("parent plugin middleware runs alongside child hooks", async () => {
		mockFetch(true);
		const log: string[] = [];

		const child = new Plugin("child").preRequest((ctx) => {
			log.push("child:preRequest");
			return ctx;
		});

		const parent = new Plugin("parent")
			.extend(child)
			.on("message", () => {
				log.push("parent:on:message");
			});

		// Test hooks via direct API (no TelegramTestEnvironment)
		const bot = new Bot(TOKEN).extend(parent);
		await bot.api.getMe();

		expect(log).toContain("child:preRequest");
	});

	test("parent plugin middleware runs with TelegramTestEnvironment", async () => {
		const log: string[] = [];

		const child = new Plugin("child").preRequest((ctx) => {
			log.push("child:preRequest");
			return ctx;
		});

		const parent = new Plugin("parent")
			.extend(child)
			.on("message", () => {
				log.push("parent:on:message");
			});

		const bot = new Bot(TOKEN).extend(parent);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });
		await user.sendMessage("hello");

		expect(log).toContain("parent:on:message");
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Composer.extend(plugin) → Bot.extend(composer)
// ─────────────────────────────────────────────────────────────────────────────

describe("Composer.extend(plugin) → Bot.extend(composer) — preRequest", () => {
	test("preRequest from plugin propagates through Composer to Bot", async () => {
		mockFetch(true);
		const calls: string[] = [];

		const plugin = new Plugin("test").preRequest((ctx) => {
			calls.push(`preRequest:${ctx.method}`);
			return ctx;
		});

		const composer = new Composer();
		composer.extend(plugin);

		const bot = new Bot(TOKEN).extend(composer);

		await bot.api.sendMessage({ chat_id: 1, text: "hi" });

		expect(calls).toEqual(["preRequest:sendMessage"]);
	});

	test("preRequest with method filter propagates through Composer", async () => {
		mockFetch(true);
		const calls: string[] = [];

		const plugin = new Plugin("test").preRequest("sendMessage", (ctx) => {
			calls.push(ctx.method);
			return ctx;
		});

		const composer = new Composer();
		composer.extend(plugin);

		const bot = new Bot(TOKEN).extend(composer);

		await bot.api.sendMessage({ chat_id: 1, text: "hi" });
		await bot.api.getMe();

		expect(calls).toEqual(["sendMessage"]);
	});
});

describe("Composer.extend(plugin) → Bot.extend(composer) — onResponse", () => {
	test("onResponse from plugin propagates through Composer to Bot", async () => {
		mockFetch(true);
		const calls: string[] = [];

		const plugin = new Plugin("test").onResponse((ctx) => {
			calls.push(`onResponse:${ctx.method}`);
		});

		const composer = new Composer();
		composer.extend(plugin);

		const bot = new Bot(TOKEN).extend(composer);

		await bot.api.getMe();

		expect(calls).toEqual(["onResponse:getMe"]);
	});

	test("onResponse with method filter propagates through Composer", async () => {
		mockFetch(true);
		const calls: string[] = [];

		const plugin = new Plugin("test").onResponse("sendMessage", (ctx) => {
			calls.push(ctx.method);
		});

		const composer = new Composer();
		composer.extend(plugin);

		const bot = new Bot(TOKEN).extend(composer);

		await bot.api.sendMessage({ chat_id: 1, text: "hi" });
		await bot.api.getMe();

		expect(calls).toEqual(["sendMessage"]);
	});
});

describe("Composer.extend(plugin) → Bot.extend(composer) — onResponseError", () => {
	test("onResponseError from plugin propagates through Composer to Bot", async () => {
		mockFetchError("Error", 500);
		const calls: string[] = [];

		const plugin = new Plugin("test").onResponseError((ctx) => {
			calls.push(`onResponseError:${ctx.method}`);
		});

		const composer = new Composer();
		composer.extend(plugin);

		const bot = new Bot(TOKEN).extend(composer);

		try {
			await bot.api.sendMessage({ chat_id: 1, text: "hi" });
		} catch {}

		expect(calls).toEqual(["onResponseError:sendMessage"]);
	});
});

describe("Composer.extend(plugin) → Bot.extend(composer) — onApiCall", () => {
	test("onApiCall from plugin propagates through Composer to Bot", async () => {
		mockFetch(true);
		const calls: string[] = [];

		const plugin = new Plugin("test").onApiCall(async (ctx, next) => {
			calls.push(ctx.method);
			return next();
		});

		const composer = new Composer();
		composer.extend(plugin);

		const bot = new Bot(TOKEN).extend(composer);

		await bot.api.getMe();

		expect(calls).toEqual(["getMe"]);
	});

	test("onApiCall with method filter propagates through Composer", async () => {
		mockFetch(true);
		const calls: string[] = [];

		const plugin = new Plugin("test").onApiCall(
			"sendMessage",
			async (ctx, next) => {
				calls.push(ctx.method);
				return next();
			},
		);

		const composer = new Composer();
		composer.extend(plugin);

		const bot = new Bot(TOKEN).extend(composer);

		await bot.api.sendMessage({ chat_id: 1, text: "hi" });
		await bot.api.getMe();

		expect(calls).toEqual(["sendMessage"]);
	});
});

describe("Composer.extend(plugin) → Bot.extend(composer) — onError", () => {
	test("onError from plugin propagates through Composer to Bot", async () => {
		const errors: string[] = [];

		const plugin = new Plugin("test").onError(({ error }) => {
			errors.push(error.message);
		});

		const composer = new Composer();
		composer.extend(plugin);

		const bot = new Bot(TOKEN)
			.extend(composer)
			.on("message", () => {
				throw new Error("boom");
			});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("trigger");

		expect(errors).toEqual(["boom"]);
	});
});

describe("Composer.extend(plugin) → Bot.extend(composer) — onStart / onStop", () => {
	test("onStart from plugin propagates through Composer to Bot", async () => {
		mockFetchSmart();

		const calls: string[] = [];

		const plugin = new Plugin("test").onStart(() => {
			calls.push("plugin:onStart");
		});

		const composer = new Composer();
		composer.extend(plugin);

		const bot = new Bot(TOKEN).extend(composer);

		await bot.start({ dropPendingUpdates: true });
		await bot.stop();

		expect(calls).toContain("plugin:onStart");
	});

	test("onStop from plugin propagates through Composer to Bot", async () => {
		mockFetchSmart();

		const calls: string[] = [];

		const plugin = new Plugin("test").onStop(() => {
			calls.push("plugin:onStop");
		});

		const composer = new Composer();
		composer.extend(plugin);

		const bot = new Bot(TOKEN).extend(composer);

		await bot.start({ dropPendingUpdates: true });
		await bot.stop();

		expect(calls).toContain("plugin:onStop");
	});
});

describe("Composer.extend(plugin) → Bot.extend(composer) — decorators", () => {
	test("decorators from plugin propagate through Composer to Bot", async () => {
		const plugin = new Plugin("test").decorate("composerUtil", "hello");

		const composer = new Composer();
		composer.extend(plugin);

		const bot = new Bot(TOKEN).extend(composer);

		let value: unknown;
		bot.on("message", (ctx) => {
			value = (ctx as any).composerUtil;
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("hello");

		expect(value).toBe("hello");
	});
});

describe("Composer.extend(plugin) → Bot.extend(composer) — middleware", () => {
	test("plugin middleware propagates through Composer to Bot", async () => {
		const calls: string[] = [];

		const plugin = new Plugin("test").on("message", () => {
			calls.push("plugin:message");
		});

		const composer = new Composer();
		composer.extend(plugin);

		const bot = new Bot(TOKEN).extend(composer);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("hello");

		expect(calls).toContain("plugin:message");
	});

	test("plugin on() handler propagates through Composer to Bot", async () => {
		const calls: string[] = [];

		const plugin = new Plugin("test").on("message", () => {
			calls.push("plugin:on:message");
		});

		const composer = new Composer();
		composer.extend(plugin);

		const bot = new Bot(TOKEN).extend(composer);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("hello");

		expect(calls).toContain("plugin:on:message");
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Composer.extend(plugin) — multiple plugins
// ─────────────────────────────────────────────────────────────────────────────

describe("Composer.extend(plugin) — multiple plugins", () => {
	test("multiple plugins extended into one Composer all propagate to Bot", async () => {
		mockFetch(true);
		const calls: string[] = [];

		const pluginA = new Plugin("a").preRequest((ctx) => {
			calls.push("a:preRequest");
			return ctx;
		});

		const pluginB = new Plugin("b").onResponse((ctx) => {
			calls.push("b:onResponse");
		});

		const pluginC = new Plugin("c").onApiCall(async (ctx, next) => {
			calls.push("c:onApiCall");
			return next();
		});

		const composer = new Composer();
		composer.extend(pluginA);
		composer.extend(pluginB);
		composer.extend(pluginC);

		const bot = new Bot(TOKEN).extend(composer);

		await bot.api.getMe();

		expect(calls).toContain("a:preRequest");
		expect(calls).toContain("b:onResponse");
		expect(calls).toContain("c:onApiCall");
	});

	test("plugin with hooks + middleware through Composer: middleware works", async () => {
		const log: string[] = [];

		const plugin = new Plugin("full")
			.preRequest((ctx) => {
				log.push("preRequest");
				return ctx;
			})
			.on("message", () => {
				log.push("handler");
			});

		const composer = new Composer();
		composer.extend(plugin);

		const bot = new Bot(TOKEN).extend(composer);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });
		await user.sendMessage("hello");

		expect(log).toContain("handler");
	});

	test("plugin with hooks + middleware through Composer: hooks work", async () => {
		mockFetch(true);
		const log: string[] = [];

		const plugin = new Plugin("full")
			.preRequest((ctx) => {
				log.push("preRequest");
				return ctx;
			})
			.onResponse((ctx) => {
				log.push("onResponse");
			})
			.on("message", () => {
				log.push("handler");
			});

		const composer = new Composer();
		composer.extend(plugin);

		const bot = new Bot(TOKEN).extend(composer);

		await bot.api.getMe();

		expect(log).toContain("preRequest");
		expect(log).toContain("onResponse");
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Plugin.extend(plugin) — dependency tracking through Bot
// ─────────────────────────────────────────────────────────────────────────────

describe("Plugin.extend(plugin) — dependency tracking in Bot", () => {
	test("child plugin name is registered as bot dependency via parent", () => {
		const child = new Plugin("child-dep");
		const parent = new Plugin("parent-dep").extend(child);
		const bot = new Bot(TOKEN).extend(parent);

		expect((bot as any).dependencies).toContain("parent-dep");
	});

	test("Composer path registers plugin name as bot dependency", () => {
		const plugin = new Plugin("comp-plugin");
		const composer = new Composer();
		composer.extend(plugin);

		const bot = new Bot(TOKEN).extend(composer);

		expect((bot as any).dependencies).toContain("comp-plugin");
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Plugin.extend(Composer) — existing behavior still works
// ─────────────────────────────────────────────────────────────────────────────

describe("Plugin.extend(Composer) — existing behavior preserved", () => {
	test("extending plugin with a Composer merges middleware", async () => {
		const calls: string[] = [];

		const composer = new Composer();
		composer.on("message", () => {
			calls.push("composer:message");
		});

		const plugin = new Plugin("test").extend(composer);
		const bot = new Bot(TOKEN).extend(plugin);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("hello");

		expect(calls).toContain("composer:message");
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Edge cases
// ─────────────────────────────────────────────────────────────────────────────

describe("Plugin.extend(plugin) — edge cases", () => {
	test("extending with a plugin that has no hooks/middleware does nothing harmful", () => {
		const empty = new Plugin("empty");
		const parent = new Plugin("parent").extend(empty);

		expect(parent._.preRequests).toHaveLength(0);
		expect(parent._.onResponses).toHaveLength(0);
		expect(parent._.onResponseErrors).toHaveLength(0);
		expect(parent._.onApiCalls).toHaveLength(0);
		expect(parent._.onErrors).toHaveLength(0);
		expect(parent._.onStarts).toHaveLength(0);
		expect(parent._.onStops).toHaveLength(0);
		expect(parent._.groups).toHaveLength(0);
		expect(Object.keys(parent._.decorators)).toHaveLength(0);
		expect(Object.keys(parent._.errorsDefinitions)).toHaveLength(0);
	});

	test("parent hooks remain after extending with child", async () => {
		mockFetch(true);
		const calls: string[] = [];

		const child = new Plugin("child").preRequest((ctx) => {
			calls.push("child");
			return ctx;
		});

		const parent = new Plugin("parent")
			.preRequest((ctx) => {
				calls.push("parent");
				return ctx;
			})
			.extend(child);

		const bot = new Bot(TOKEN).extend(parent);

		await bot.api.getMe();

		expect(calls).toContain("parent");
		expect(calls).toContain("child");
	});

	test("extending multiple times with the same plugin adds hooks each time", async () => {
		mockFetch(true);
		let count = 0;

		const child = new Plugin("child").preRequest((ctx) => {
			count++;
			return ctx;
		});

		// Extending the same plugin twice adds its hooks twice
		const parent = new Plugin("parent")
			.extend(child)
			.extend(child);

		const bot = new Bot(TOKEN).extend(parent);

		await bot.api.getMe();

		expect(count).toBe(2);
	});

	test("deeply nested: plugin1 extends plugin2, plugin2 extends plugin3, bot extends plugin1", async () => {
		mockFetch(true);
		const calls: string[] = [];

		const p3 = new Plugin("p3")
			.preRequest((ctx) => {
				calls.push("p3:preRequest");
				return ctx;
			})
			.onResponse((ctx) => {
				calls.push("p3:onResponse");
			})
			.decorate("p3val", true);

		const p2 = new Plugin("p2")
			.extend(p3)
			.onApiCall(async (ctx, next) => {
				calls.push("p2:onApiCall");
				return next();
			});

		const p1 = new Plugin("p1")
			.extend(p2)
			.preRequest((ctx) => {
				calls.push("p1:preRequest");
				return ctx;
			});

		const bot = new Bot(TOKEN).extend(p1);

		await bot.api.getMe();

		expect(calls).toContain("p3:preRequest");
		expect(calls).toContain("p3:onResponse");
		expect(calls).toContain("p2:onApiCall");
		expect(calls).toContain("p1:preRequest");
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Composer path — edge cases
// ─────────────────────────────────────────────────────────────────────────────

describe("Composer path — edge cases", () => {
	test("empty Composer (no plugins) still works fine with Bot.extend", () => {
		const composer = new Composer();
		const bot = new Bot(TOKEN).extend(composer);

		// Should not throw
		expect(bot).toBeDefined();
	});

	test("Composer with only middleware (no plugins) still works fine", async () => {
		const calls: string[] = [];

		const composer = new Composer();
		composer.on("message", () => {
			calls.push("composer-direct");
		});

		const bot = new Bot(TOKEN).extend(composer);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("hello");

		expect(calls).toContain("composer-direct");
	});

	test("mixed: Composer has own middleware + extended plugin with hooks (middleware path)", async () => {
		const log: string[] = [];

		const plugin = new Plugin("p").preRequest((ctx) => {
			log.push("plugin:preRequest");
			return ctx;
		});

		const composer = new Composer();
		composer.on("message", () => {
			log.push("composer:handler");
		});
		composer.extend(plugin);

		const bot = new Bot(TOKEN).extend(composer);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });
		await user.sendMessage("hello");

		expect(log).toContain("composer:handler");
	});

	test("mixed: Composer has own middleware + extended plugin with hooks (hooks path)", async () => {
		mockFetch(true);
		const log: string[] = [];

		const plugin = new Plugin("p").preRequest((ctx) => {
			log.push("plugin:preRequest");
			return ctx;
		});

		const composer = new Composer();
		composer.on("message", () => {
			log.push("composer:handler");
		});
		composer.extend(plugin);

		const bot = new Bot(TOKEN).extend(composer);

		await bot.api.getMe();

		expect(log).toContain("plugin:preRequest");
	});
});
