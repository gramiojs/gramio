import { describe, expect, expectTypeOf, mock, test } from "bun:test";
import { apiError, TelegramTestEnvironment } from "@gramio/test";
import { Bot } from "../src/bot.ts";
import { Composer } from "../src/composer.ts";
import { Plugin } from "../src/plugin.ts";

const TOKEN = "test-token";

describe("@gramio/test — command handler", () => {
	test("responds to /start command", async () => {
		const bot = new Bot(TOKEN).command("start", (ctx) => ctx.send("Welcome!"));

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendCommand("start");

		expect(env.apiCalls).toHaveLength(1);
		expect(env.apiCalls[0].method).toBe("sendMessage");
		expect(env.apiCalls[0].params).toHaveProperty("text", "Welcome!");
	});

	test("passes args after command", async () => {
		let capturedArgs: string | null = null;

		const bot = new Bot(TOKEN).command("echo", (ctx) => {
			capturedArgs = ctx.args;
			return ctx.send(`Echo: ${ctx.args}`);
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Bob" });

		await user.sendCommand("echo", "hello world");

		expect(capturedArgs!).toBe("hello world");
		expect(env.apiCalls[0].params).toHaveProperty("text", "Echo: hello world");
	});

	test("args is null when no text after command", async () => {
		let capturedArgs: string | null | undefined;

		const bot = new Bot(TOKEN).command("ping", (ctx) => {
			capturedArgs = ctx.args;
			return ctx.send("pong");
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Charlie" });

		await user.sendCommand("ping");

		expect(capturedArgs).toBeNull();
	});

	test("handles multiple command names", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).command(["help", "h"], handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Dave" });

		await user.sendCommand("help");
		await user.sendCommand("h");

		expect(handler).toHaveBeenCalledTimes(2);
	});

	test("does not trigger on non-matching command", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).command("start", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Eve" });

		await user.sendCommand("other");

		expect(handler).not.toHaveBeenCalled();
	});

	test("does not trigger on plain text", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).command("start", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Frank" });

		await user.sendMessage("hello");

		expect(handler).not.toHaveBeenCalled();
	});

	test("throws if command name starts with /", () => {
		expect(() => {
			new Bot(TOKEN).command("/start", () => {});
		}).toThrow("Do not use / in command name");
	});
});

describe("@gramio/test — startParameter handler", () => {
	test("matches exact deep-link payload", async () => {
		let rawPayload: string | undefined;

		const bot = new Bot(TOKEN).startParameter("ref_123", (ctx) => {
			rawPayload = ctx.rawStartPayload;
			return ctx.send("Deep link received!");
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendCommand("start", "ref_123");

		expect(rawPayload).toBe("ref_123");
		expect(env.lastApiCall("sendMessage")?.params).toHaveProperty(
			"text",
			"Deep link received!",
		);
	});

	test("matches regex deep-link payload", async () => {
		let matched = false;

		const bot = new Bot(TOKEN).startParameter(/^ref_(.+)$/, (ctx) => {
			matched = true;
			return ctx.send(`Ref: ${ctx.rawStartPayload}`);
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Bob" });

		await user.sendCommand("start", "ref_abc");

		expect(matched).toBe(true);
	});

	test("does not match a different deep-link payload", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).startParameter("ref_123", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Charlie" });

		await user.sendCommand("start", "other_payload");

		expect(handler).not.toHaveBeenCalled();
	});
});

describe("@gramio/test — hears handler", () => {
	test("matches exact string", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).hears("hello", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("hello");

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("does not match different text", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).hears("hello", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Bob" });

		await user.sendMessage("world");

		expect(handler).not.toHaveBeenCalled();
	});

	test("matches regex and provides args", async () => {
		let capturedArgs: RegExpMatchArray | null = null;

		const bot = new Bot(TOKEN).hears(/^order (\d+)$/i, (ctx) => {
			capturedArgs = ctx.args;
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Charlie" });

		await user.sendMessage("order 42");

		expect(capturedArgs).not.toBeNull();
		expect(capturedArgs![1]!).toBe("42");
	});

	test("matches array of strings", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).hears(["hi", "hello", "hey"], handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Dave" });

		await user.sendMessage("hey");

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("matches with function trigger", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).hears(
			(ctx) => ctx.text?.includes("secret") ?? false,
			handler,
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Eve" });

		await user.sendMessage("the secret word");

		expect(handler).toHaveBeenCalledTimes(1);
	});
});

describe("@gramio/test — callbackQuery handler", () => {
	test("matches exact callback data string", async () => {
		const bot = new Bot(TOKEN).callbackQuery("btn:1", (ctx) =>
			ctx.answer({ text: "clicked" }),
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		const msg = await user.sendMessage("click me");
		await user.on(msg).click("btn:1");

		expect(env.lastApiCall("answerCallbackQuery")).toBeDefined();
	});

	test("does not match different callback data", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).callbackQuery("btn:1", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Bob" });

		const msg = await user.sendMessage("click me");
		await user.on(msg).click("btn:2");

		expect(handler).not.toHaveBeenCalled();
	});

	test("matches regex callback data and provides args", async () => {
		let capturedData: RegExpMatchArray | null = null;

		const bot = new Bot(TOKEN).callbackQuery(/^action:(\w+)$/, (ctx) => {
			capturedData = ctx.queryData;
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Charlie" });

		const msg = await user.sendMessage("test");
		await user.on(msg).click("action:delete");

		expect(capturedData).not.toBeNull();
		expect(capturedData![1]!).toBe("delete");
	});
});

describe("@gramio/test — .on() handler", () => {
	test("handles message update", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).on("message", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("hello");

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("handles multiple update types", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).on(["message", "callback_query"], handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Bob" });

		await user.sendMessage("hello");
		const msg = await user.sendMessage("test");
		await user.on(msg).click("data");

		expect(handler).toHaveBeenCalledTimes(3);
	});
});

describe("@gramio/test — .use() middleware", () => {
	test("runs for every update", async () => {
		const handler = mock((_ctx: any, next: any) => next());

		const bot = new Bot(TOKEN).use(handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("hello");
		await user.sendMessage("world");

		expect(handler).toHaveBeenCalledTimes(2);
	});
});

describe("@gramio/test — plugin system", () => {
	test("extends bot with plugin handlers", async () => {
		const plugin = new Plugin("test-plugin").on("message", (ctx, next) => {
			// @ts-expect-error
			ctx.pluginRan = true;
			return next();
		});

		let pluginRan = false;

		const bot = new Bot(TOKEN).extend(plugin).on("message", (ctx) => {
			// @ts-expect-error
			pluginRan = ctx.pluginRan === true;
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("hi");

		expect(pluginRan).toBe(true);
	});

	test("plugin with derive adds properties to context", async () => {
		const plugin = new Plugin("derive-plugin").derive(() => ({
			greeting: "Hello from plugin",
		}));

		let derivedValue: string | undefined;

		const bot = new Bot(TOKEN).extend(plugin).on("message", (ctx) => {
			derivedValue = ctx.greeting;
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Bob" });

		await user.sendMessage("test");

		expect(derivedValue).toBe("Hello from plugin");
	});

	test("plugin dependency check throws on missing dependency", () => {
		new Plugin("dependency-plugin");
		const child = new Plugin("child-plugin", {
			dependencies: ["dependency-plugin"],
		});

		expect(() => {
			new Bot(TOKEN).extend(child);
		}).toThrow("needs dependencies registered before");
	});

	test("plugin dependency check passes when dependency is registered", () => {
		const dep = new Plugin("dependency-plugin");
		const child = new Plugin("child-plugin", {
			dependencies: ["dependency-plugin"],
		});

		expect(() => {
			new Bot(TOKEN).extend(dep).extend(child);
		}).not.toThrow();
	});
});

describe("@gramio/test — derive and decorate", () => {
	test("derive adds properties to context", async () => {
		let derivedValue: number | undefined;

		const bot = new Bot(TOKEN)
			.derive(() => ({ counter: 42 }))
			.on("message", (ctx) => {
				derivedValue = ctx.counter;
			});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("test");

		expect(derivedValue).toBe(42);
	});

	test("decorate adds static properties", async () => {
		let decorated: string | undefined;

		const bot = new Bot(TOKEN)
			.decorate("appName", "TestBot")
			.on("message", (ctx) => {
				decorated = ctx.appName;
			});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Bob" });

		await user.sendMessage("test");

		expect(decorated).toBe("TestBot");
	});
});

describe("@gramio/test — onError hook", () => {
	test("catches handler errors", async () => {
		let caughtError: Error | undefined;
		let caughtKind: string | undefined;

		const bot = new Bot(TOKEN)
			.onError(({ error, kind }) => {
				caughtError = error as Error;
				caughtKind = kind;
			})
			.on("message", () => {
				throw new Error("Something went wrong");
			});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("trigger error");

		expect(caughtError?.message).toBe("Something went wrong");
		expect(caughtKind).toBe("UNKNOWN");
	});

	test("catches API errors via apiError mock", async () => {
		let caughtError: Error | undefined;

		const bot = new Bot(TOKEN)
			.onError(({ error }) => {
				caughtError = error as Error;
			})
			.on("message", (ctx) => ctx.send("test"));

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		env.onApi(
			"sendMessage",
			apiError(403, "Forbidden: bot was blocked by the user"),
		);

		const user = env.createUser({ first_name: "Bob" });

		await user.sendMessage("trigger");

		expect(caughtError?.message).toBe("Forbidden: bot was blocked by the user");
	});

	test("custom error kind via .error()", async () => {
		class AppError extends Error {
			code: number;
			constructor(message: string, code: number) {
				super(message);
				this.code = code;
			}
		}

		let caughtKind: string | undefined;

		const bot = new Bot(TOKEN)
			.error("APP", AppError)
			.onError(({ kind }) => {
				caughtKind = kind;
			})
			.on("message", () => {
				throw new AppError("App failure", 500);
			});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Charlie" });

		await user.sendMessage("trigger");

		expect(caughtKind).toBe("APP");
	});
});

describe("@gramio/test — API mocking", () => {
	test("static response mock", async () => {
		const bot = new Bot(TOKEN).on("message", (ctx) => ctx.send("hi"));

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		env.onApi("sendMessage", {
			message_id: 999,
			date: Date.now(),
			chat: { id: 1, type: "private" as const },
		});

		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("trigger");

		expect(env.lastApiCall("sendMessage")?.response).toMatchObject({
			message_id: 999,
		});
	});

	test("dynamic response mock", async () => {
		const bot = new Bot(TOKEN).on("message", (ctx) => ctx.send("hi"));

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		env.onApi("sendMessage", (params) => ({
			message_id: 1,
			date: Date.now(),
			chat: { id: params.chat_id as number, type: "private" as const },
			text: params.text as string,
		}));

		const user = env.createUser({ first_name: "Bob" });

		await user.sendMessage("trigger");

		expect(env.lastApiCall("sendMessage")?.response).toHaveProperty(
			"text",
			"hi",
		);
	});

	test("error mock with apiError", async () => {
		let caughtError = false;

		const bot = new Bot(TOKEN)
			.onError(() => {
				caughtError = true;
			})
			.on("message", (ctx) => ctx.send("test"));

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		env.onApi(
			"sendMessage",
			apiError(429, "Too Many Requests", { retry_after: 30 }),
		);

		const user = env.createUser({ first_name: "Charlie" });

		await user.sendMessage("trigger");

		expect(caughtError).toBe(true);
	});

	test("offApi resets specific method", async () => {
		const bot = new Bot(TOKEN).on("message", (ctx) => ctx.send("hi"));

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		env.onApi("sendMessage", {
			message_id: 999,
			date: 0,
			chat: { id: 1, type: "private" as const },
		});
		env.offApi("sendMessage");

		const user = env.createUser({ first_name: "Dave" });

		await user.sendMessage("trigger");

		expect(
			(env.lastApiCall("sendMessage")?.response as any).message_id,
		).not.toBe(999);
	});

	test("offApi with no args resets all overrides", async () => {
		const bot = new Bot(TOKEN).on("message", (ctx) => ctx.send("hi"));

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		env.onApi("sendMessage", {
			message_id: 999,
			date: 0,
			chat: { id: 1, type: "private" as const },
		});
		env.offApi();

		const user = env.createUser({ first_name: "Eve" });

		await user.sendMessage("trigger");

		expect(
			(env.lastApiCall("sendMessage")?.response as any).message_id,
		).not.toBe(999);
	});
});

describe("@gramio/test — chat and user management", () => {
	test("send message to group chat", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).on("message", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });
		const group = env.createChat({ type: "group", title: "Test Group" });

		await user.in(group).sendMessage("Hello group!");

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("user join emits chat_member update", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).on("chat_member", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });
		const group = env.createChat({ type: "supergroup", title: "Test Group" });

		await user.join(group);

		expect(group.members.has(user)).toBe(true);
		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("user leave emits chat_member update", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).on("chat_member", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Bob" });
		const group = env.createChat({ type: "supergroup", title: "Test Group" });

		await user.join(group);
		await user.leave(group);

		expect(group.members.has(user)).toBe(false);
		expect(handler).toHaveBeenCalledTimes(2);
	});

	test("chat tracks message history", async () => {
		const bot = new Bot(TOKEN);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Charlie" });
		const group = env.createChat({ type: "group", title: "Test Group" });

		await user.in(group).sendMessage("Message 1");
		await user.in(group).sendMessage("Message 2");

		expect(group.messages).toHaveLength(2);
	});

	test("env tracks created users and chats", () => {
		const bot = new Bot(TOKEN);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		env.createUser({ first_name: "Alice" });
		env.createUser({ first_name: "Bob" });
		env.createChat({ type: "group", title: "Group 1" });

		expect(env.users).toHaveLength(2);
		expect(env.chats).toHaveLength(1);
	});
});

describe("@gramio/test — multiple handlers chain", () => {
	test("middleware chain with next()", async () => {
		const order: string[] = [];

		const bot = new Bot(TOKEN)
			.use((_ctx, next) => {
				order.push("middleware-1");
				return next();
			})
			.use((_ctx, next) => {
				order.push("middleware-2");
				return next();
			})
			.on("message", () => {
				order.push("handler");
			});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("test");

		expect(order).toEqual(["middleware-1", "middleware-2", "handler"]);
	});

	test("middleware can short-circuit chain", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN)
			.use((_ctx, _next) => {
				// Don't call next — blocks further handlers
			})
			.on("message", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Bob" });

		await user.sendMessage("test");

		expect(handler).not.toHaveBeenCalled();
	});
});

describe("@gramio/test — apiCalls tracking", () => {
	test("tracks all API calls in order", async () => {
		const bot = new Bot(TOKEN).on("message", async (ctx) => {
			await ctx.send("first");
			await ctx.send("second");
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("trigger");

		const sendCalls = env.apiCalls.filter((c) => c.method === "sendMessage");
		expect(sendCalls).toHaveLength(2);
		expect(sendCalls[0].params).toHaveProperty("text", "first");
		expect(sendCalls[1].params).toHaveProperty("text", "second");
	});

	test("records method, params, and response", async () => {
		const bot = new Bot(TOKEN).on("message", (ctx) => ctx.send("reply"));

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Bob" });

		await user.sendMessage("trigger");

		const call = env.lastApiCall("sendMessage");
		expect(call?.method).toBe("sendMessage");
		expect(call?.params).toHaveProperty("text", "reply");
		expect(call?.response).toHaveProperty("message_id");
	});

	test("clearApiCalls empties the call log", async () => {
		const bot = new Bot(TOKEN).on("message", (ctx) => ctx.send("hi"));

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Charlie" });

		await user.sendMessage("first");
		env.clearApiCalls();
		await user.sendMessage("second");

		expect(env.apiCalls).toHaveLength(1);
	});

	test("lastApiCall returns the most recent call for a method", async () => {
		const bot = new Bot(TOKEN).on("message", async (ctx) => {
			await ctx.send("first");
			await ctx.send("second");
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Dave" });

		await user.sendMessage("trigger");

		expect(env.lastApiCall("sendMessage")?.params).toHaveProperty(
			"text",
			"second",
		);
	});

	test("lastApiCall returns undefined when method was never called", async () => {
		const bot = new Bot(TOKEN);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);

		expect(env.lastApiCall("sendMessage")).toBeUndefined();
	});
});

describe("@gramio/test — reaction handler", () => {
	test("triggers on matching emoji add", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).reaction("👍", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });
		const msg = await user.sendMessage("react here");

		await user.on(msg).react("👍");

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("does not trigger when emoji is not in the list", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).reaction("👍", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Bob" });
		const msg = await user.sendMessage("react here");

		await user.on(msg).react("❤");

		expect(handler).not.toHaveBeenCalled();
	});

	test("triggers when any of multiple watched emojis is added", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).reaction(["👍", "❤"], handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Charlie" });
		const msg = await user.sendMessage("react here");

		await user.on(msg).react("❤");

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("does not trigger when emoji is removed, not added", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).reaction("👍", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Dave" });
		const msg = await user.sendMessage("react here");

		await user.on(msg).react("👍");
		const callsBefore = handler.mock.calls.length;

		await user.on(msg).react([]);

		expect(handler.mock.calls.length).toBe(callsBefore);
	});

	test("second add of same emoji is a no-op", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).reaction("👍", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Eve" });
		const msg = await user.sendMessage("react here");

		await user.on(msg).react("👍");
		await user.on(msg).react("👍");

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("two different users can react independently", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).reaction("👍", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const alice = env.createUser({ first_name: "Alice" });
		const bob = env.createUser({ first_name: "Bob" });
		const msg = await alice.sendMessage("react here");

		await alice.on(msg).react("👍");
		await bob.on(msg).react("👍");

		expect(handler).toHaveBeenCalledTimes(2);
	});
});

describe("@gramio/test — inlineQuery handler", () => {
	test("matches exact string query", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).inlineQuery("cats", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendInlineQuery("cats");

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("does not match different string query", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).inlineQuery("cats", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Bob" });

		await user.sendInlineQuery("dogs");

		expect(handler).not.toHaveBeenCalled();
	});

	test("matches regex query and provides args", async () => {
		let capturedArgs: RegExpMatchArray | null = null;

		const bot = new Bot(TOKEN).inlineQuery(/^search:(.+)$/, (ctx) => {
			capturedArgs = ctx.args;
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Charlie" });

		await user.sendInlineQuery("search:typescript");

		expect(capturedArgs).not.toBeNull();
		expect(capturedArgs![1]!).toBe("typescript");
	});

	test("does not match regex that doesn't fit", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).inlineQuery(/^search:(.+)$/, handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Dave" });

		await user.sendInlineQuery("find:something");

		expect(handler).not.toHaveBeenCalled();
	});

	test("matches with function predicate", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).inlineQuery(
			(ctx) => ctx.query.length > 3,
			handler,
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Eve" });

		await user.sendInlineQuery("long query");

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("function predicate: no trigger on short query", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).inlineQuery(
			(ctx) => ctx.query.length > 3,
			handler,
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Frank" });

		await user.sendInlineQuery("hi");

		expect(handler).not.toHaveBeenCalled();
	});

	test("onResult option registers chosenInlineResult handler", async () => {
		const onResultHandler = mock(() => {});

		const bot = new Bot(TOKEN).inlineQuery(/^search:(.+)$/, () => {}, {
			onResult: onResultHandler,
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Grace" });

		await user.chooseInlineResult("result-1", "search:cats");

		expect(onResultHandler).toHaveBeenCalledTimes(1);
	});

	test("user.in(chat).sendInlineQuery() carries chat_type", async () => {
		let receivedChatType: string | undefined;

		const bot = new Bot(TOKEN).on("inline_query", (ctx) => {
			receivedChatType = ctx.payload.chat_type;
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });
		const group = env.createChat({ type: "group", title: "Test Group" });

		await user.in(group).sendInlineQuery("test query");

		expect(receivedChatType).toBe("group");
	});
});

describe("@gramio/test — chosenInlineResult handler", () => {
	// Note: chosenInlineResult trigger matches context.query (the inline query string),
	// not the result_id. Use a function predicate to filter by result_id.

	test("matches exact string query that led to chosen result", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).chosenInlineResult("cats", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.chooseInlineResult("result-abc", "cats");

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("does not match when query differs from string trigger", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).chosenInlineResult("cats", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Bob" });

		await user.chooseInlineResult("result-abc", "dogs");

		expect(handler).not.toHaveBeenCalled();
	});

	test("matches regex against query and provides args", async () => {
		let capturedArgs: RegExpMatchArray | null = null;

		const bot = new Bot(TOKEN).chosenInlineResult(/^search:(.+)$/, (ctx) => {
			capturedArgs = ctx.args;
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Charlie" });

		await user.chooseInlineResult("item-1", "search:typescript");

		expect(capturedArgs).not.toBeNull();
		expect(capturedArgs![1]!).toBe("typescript");
	});

	test("function predicate receives full context (can check query)", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).chosenInlineResult(
			(ctx) => ctx.query.startsWith("premium:"),
			handler,
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Dave" });

		await user.chooseInlineResult("result-1", "premium:plan");

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("function predicate: no trigger on non-matching query", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).chosenInlineResult(
			(ctx) => ctx.query.startsWith("premium:"),
			handler,
		);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Eve" });

		await user.chooseInlineResult("result-1", "free:plan");

		expect(handler).not.toHaveBeenCalled();
	});
});

describe("@gramio/test — UserInChatScope", () => {
	test("user.in(chat).sendMessage() sends to the scoped chat", async () => {
		let receivedChatId: number | undefined;

		const bot = new Bot(TOKEN).on("message", (ctx) => {
			receivedChatId = ctx.chat.id;
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });
		const group = env.createChat({ type: "group", title: "My Group" });

		await user.in(group).sendMessage("hello group");

		expect(receivedChatId).toBe(group.payload.id);
	});

	test("user.in(chat).join() and leave() update membership", async () => {
		const bot = new Bot(TOKEN).on("chat_member", () => {});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Bob" });
		const group = env.createChat({ type: "supergroup", title: "SG" });

		await user.in(group).join();
		expect(group.members.has(user)).toBe(true);

		await user.in(group).leave();
		expect(group.members.has(user)).toBe(false);
	});

	test("user.in(chat).on(msg).react() triggers reaction handler", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).reaction("😎", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Dave" });
		const group = env.createChat({ type: "group", title: "Group" });

		const msg = await user.in(group).sendMessage("hi");
		await user.in(group).on(msg).react("😎");

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("user.in(chat).on(msg).click() triggers callbackQuery handler", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).callbackQuery("action:yes", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Eve" });
		const group = env.createChat({ type: "group", title: "Group" });

		const msg = await user.in(group).sendMessage("do action?");
		await user.in(group).on(msg).click("action:yes");

		expect(handler).toHaveBeenCalledTimes(1);
	});
});

describe("@gramio/test — UserOnMessageScope", () => {
	test("user.on(msg).react() sets reaction on the message", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).reaction("💅", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });
		const msg = await user.sendMessage("message");

		await user.on(msg).react("💅");

		expect(handler).toHaveBeenCalledTimes(1);
		expect(msg.reactions.get(user.payload.id)).toContain("💅");
	});

	test("user.on(msg).click() triggers callbackQuery handler", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).callbackQuery("btn:go", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Bob" });
		const msg = await user.sendMessage("pick action");

		await user.on(msg).click("btn:go");

		expect(handler).toHaveBeenCalledTimes(1);
	});

	test("user.on(msg).react() with array of emojis", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).reaction(["👍", "❤"], handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Charlie" });
		const msg = await user.sendMessage("test");

		await user.on(msg).react(["👍", "❤"]);

		expect(handler).toHaveBeenCalled();
	});
});

describe("lazy-cached getter + composer isolation — TypeError: Unable to delete property", () => {
	// Regression: @gramio/contexts caches lazy getters (ctx.from, ctx.chat, …) via
	//   Object.defineProperty(this, field, { value, enumerable: true, writable: true })
	// Notice: `configurable` is NOT set → defaults to false.
	// When a plain Composer (local scope) is extended into the bot, the isolation
	// wrapper captures preKeys, runs the chain, then does `delete ctx[key]` for any
	// new own keys. If a handler accessed ctx.from / ctx.chat inside that chain,
	// those are now non-configurable own props → "TypeError: Unable to delete property."

	test("bot.extend(plainComposer) accessing ctx.from does not throw", async () => {
		let errorCaught: unknown = null;

		// Plain Composer without .as("scoped") → "local" scope → isolated by extend()
		const composer = new Composer().on("message", (ctx: any, next) => {
			void ctx.from; // triggers lazy caching with configurable: false
			return next();
		});

		const bot = new Bot(TOKEN)
			.extend(composer)
			.on("message", (ctx) => ctx.send("ok"))
			.onError(({ error }) => {
				errorCaught = error;
			});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("hello");

		expect(errorCaught).toBeNull();
		expect(env.apiCalls[0]?.method).toBe("sendMessage");
	});

	test("bot.extend(plainComposer) accessing ctx.chat does not throw", async () => {
		let errorCaught: unknown = null;

		const composer = new Composer().on("message", (ctx: any, next) => {
			void ctx.chat; // triggers lazy caching with configurable: false
			return next();
		});

		const bot = new Bot(TOKEN)
			.extend(composer)
			.on("message", (ctx) => ctx.send("ok"))
			.onError(({ error }) => {
				errorCaught = error;
			});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Bob" });

		await user.sendMessage("hello");

		expect(errorCaught).toBeNull();
		expect(env.apiCalls[0]?.method).toBe("sendMessage");
	});
});

describe("bot.extend(plainComposer) — command WeakMap isolation", () => {
	// Regression guard: plain Composer extended into Bot must run handlers on the
	// original ctx (not Object.create(ctx)), so WeakMap-backed getters work correctly.

	test("baseline: bot.command() handler can access ctx.text", async () => {
		let capturedText: string | null = null;

		const bot = new Bot(TOKEN).command("hello", (ctx) => {
			capturedText = ctx.text ?? null;
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendCommand("hello");

		expect(capturedText as string | null).toBe("/hello");
	});

	test("plain Composer.command() extended into Bot — handler reaches cleanly", async () => {
		let handlerReached = false;
		let errorCaught = false;

		const composer = new Composer().command("hello", (ctx) => {
			handlerReached = true;
			void ctx.text;
		});

		const bot = new Bot(TOKEN).extend(composer).onError(() => {
			errorCaught = true;
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Bob" });

		await user.sendCommand("hello");

		expect(handlerReached).toBe(true);
		expect(errorCaught).toBe(false);
	});
});

describe(".derive(['event1', 'event2']) — per-event scoped derive", () => {
	describe("via Plugin.extend()", () => {
		test("type: ctx.shared is string in .on('message') and .on('callback_query')", () => {
			const plugin = new Plugin("shared-derive").derive(
				["message", "callback_query"],
				() => ({ shared: "hello" as string }),
			);
			const bot = new Bot(TOKEN).extend(plugin);

			// Compile-time assertions only — handlers are never invoked at runtime
			bot.on("message", (ctx) => {
				expectTypeOf(ctx.shared).toEqualTypeOf<string>();
			});
			bot.on("callback_query", (ctx) => {
				expectTypeOf(ctx.shared).toEqualTypeOf<string>();
			});
		});

		test("runtime: derive runs and value appears in .on('message') and .on('callback_query')", async () => {
			let capturedMessage: unknown;
			let capturedCallback: unknown;

			const plugin = new Plugin("shared-derive").derive(
				["message", "callback_query"],
				() => ({ shared: "derived-value" }),
			);

			const bot = new Bot(TOKEN)
				.extend(plugin)
				.on("message", (ctx) => {
					capturedMessage = (ctx as any).shared;
				})
				.on("callback_query", (ctx) => {
					capturedCallback = (ctx as any).shared;
				});

			// @ts-expect-error source Bot vs packaged AnyBot
			const env = new TelegramTestEnvironment(bot);
			const user = env.createUser({ first_name: "Alice" });

			await user.sendMessage("hello");
			expect(capturedMessage).toBe("derived-value");

			const msg = await user.sendMessage("trigger");
			await user.on(msg).click("btn");
			expect(capturedCallback).toBe("derived-value");
		});
	});

	describe("via Composer.as('scoped') + bot.extend()", () => {
		test("type: ctx.shared is string in .on('message') and .on('callback_query')", () => {
			const composer = new Composer()
				.derive(["message", "callback_query"], () => ({ shared: "hello" as string }))
				.as("scoped");

			const bot = new Bot(TOKEN).extend(composer);

			// Compile-time assertions only — handlers are never invoked at runtime
			bot.on("message", (ctx) => {
				expectTypeOf(ctx.shared).toEqualTypeOf<string>();
			});
			bot.on("callback_query", (ctx) => {
				expectTypeOf(ctx.shared).toEqualTypeOf<string>();
			});
		});

		test("runtime: derive propagates to shared context after .as('scoped')", async () => {
			let capturedMessage: unknown;
			let capturedCallback: unknown;

			const composer = new Composer()
				.derive(["message", "callback_query"], () => ({ shared: "composer-derived" }))
				.as("scoped");

			const bot = new Bot(TOKEN)
				.extend(composer)
				.on("message", (ctx) => {
					capturedMessage = (ctx as any).shared;
				})
				.on("callback_query", (ctx) => {
					capturedCallback = (ctx as any).shared;
				});

			// @ts-expect-error source Bot vs packaged AnyBot
			const env = new TelegramTestEnvironment(bot);
			const user = env.createUser({ first_name: "Alice" });

			await user.sendMessage("hello");
			expect(capturedMessage).toBe("composer-derived");

			const msg = await user.sendMessage("trigger");
			await user.on(msg).click("btn");
			expect(capturedCallback).toBe("composer-derived");
		});
	});
});
