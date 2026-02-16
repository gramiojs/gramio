import { describe, expect, mock, test } from "bun:test";
import { apiError, TelegramTestEnvironment } from "@gramio/test";
import type { TelegramMessage } from "@gramio/types";
import { Bot } from "../src/bot.ts";
import { Plugin } from "../src/plugin.ts";

const TOKEN = "test-token";

/** Helper: build a command message with proper entities */
function commandMessage(
	text: string,
	user: { id: number; first_name: string; is_bot: boolean },
	chatId: number,
): TelegramMessage {
	const cmdEnd = text.indexOf(" ") === -1 ? text.length : text.indexOf(" ");
	return {
		message_id: Date.now(),
		date: Math.floor(Date.now() / 1000),
		chat: { id: chatId, type: "private" },
		from: user,
		text,
		entities: [{ type: "bot_command", offset: 0, length: cmdEnd }],
	};
}

/** Helper: emit a command update through the environment */
function emitCommand(
	env: TelegramTestEnvironment,
	user: ReturnType<TelegramTestEnvironment["createUser"]>,
	text: string,
) {
	return env.emitUpdate({
		update_id: 0,
		message: commandMessage(text, user.payload, user.payload.id),
	});
}

describe("@gramio/test — command handler", () => {
	test("responds to /start command", async () => {
		const bot = new Bot(TOKEN).command("start", (ctx) => ctx.send("Welcome!"));

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await emitCommand(env, user, "/start");

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

		await emitCommand(env, user, "/echo hello world");

		expect(capturedArgs as string).toBe("hello world");
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

		await emitCommand(env, user, "/ping");

		expect(capturedArgs).toBeNull();
	});

	test("handles multiple command names", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).command(["help", "h"], handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Dave" });

		await emitCommand(env, user, "/help");
		await emitCommand(env, user, "/h");

		expect(handler).toHaveBeenCalledTimes(2);
	});

	test("does not trigger on non-matching command", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).command("start", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Eve" });

		await emitCommand(env, user, "/other");

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
		expect((capturedArgs as RegExpMatchArray)[1]).toBe("42");
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
		await user.click("btn:1", msg);

		const answerCall = env.apiCalls.find(
			(c) => c.method === "answerCallbackQuery",
		);
		expect(answerCall).toBeDefined();
	});

	test("does not match different callback data", async () => {
		const handler = mock(() => {});

		const bot = new Bot(TOKEN).callbackQuery("btn:1", handler);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Bob" });

		const msg = await user.sendMessage("click me");
		await user.click("btn:2", msg);

		expect(handler).not.toHaveBeenCalled();
	});

	test("matches regex callback data", async () => {
		let capturedData: RegExpMatchArray | null = null;

		const bot = new Bot(TOKEN).callbackQuery(/^action:(\w+)$/, (ctx) => {
			capturedData = ctx.queryData;
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Charlie" });

		const msg = await user.sendMessage("test");
		await user.click("action:delete", msg);

		expect(capturedData).not.toBeNull();
		expect((capturedData as RegExpMatchArray)[1]).toBe("delete");
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
		await user.click("data", msg);

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

		expect(caughtError).toBeDefined();
		expect(caughtError?.message).toBe("Something went wrong");
		expect(caughtKind).toBe("UNKNOWN");
	});

	test("onError catches API errors via apiError mock", async () => {
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

		expect(caughtError).toBeDefined();
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

		const call = env.apiCalls.find((c) => c.method === "sendMessage");
		expect(call).toBeDefined();
		expect(call?.response).toMatchObject({ message_id: 999 });
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

		const call = env.apiCalls.find((c) => c.method === "sendMessage");
		expect(call).toBeDefined();
		expect(call?.response).toHaveProperty("text", "hi");
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

		const call = env.apiCalls.find((c) => c.method === "sendMessage");
		expect(call).toBeDefined();
		expect((call?.response as any).message_id).not.toBe(999);
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

		const call = env.apiCalls.find((c) => c.method === "sendMessage");
		expect(call).toBeDefined();
		expect((call?.response as any).message_id).not.toBe(999);
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

		await user.sendMessage(group, "Hello group!");

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

		await user.sendMessage(group, "Message 1");
		await user.sendMessage(group, "Message 2");

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

		const call = env.apiCalls.find((c) => c.method === "sendMessage");
		expect(call).toBeDefined();
		expect(call?.method).toBe("sendMessage");
		expect(call?.params).toHaveProperty("text", "reply");
		expect(call?.response).toHaveProperty("message_id");
	});
});

describe("@gramio/test — command with emitUpdate for entities", () => {
	test("command handler with emitUpdate and proper entities", async () => {
		const bot = new Bot(TOKEN).command("start", (ctx) => ctx.send("Welcome!"));

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await env.emitUpdate({
			update_id: 0,
			message: {
				message_id: 1,
				date: Math.floor(Date.now() / 1000),
				chat: { id: user.payload.id, type: "private" },
				from: user.payload,
				text: "/start",
				entities: [{ type: "bot_command", offset: 0, length: 6 }],
			},
		});

		expect(env.apiCalls).toHaveLength(1);
		expect(env.apiCalls[0].method).toBe("sendMessage");
		expect(env.apiCalls[0].params).toHaveProperty("text", "Welcome!");
	});

	test("startParameter handler via emitUpdate", async () => {
		let rawPayload: string | undefined;

		const bot = new Bot(TOKEN).startParameter("ref_123", (ctx) => {
			rawPayload = ctx.rawStartPayload;
			return ctx.send("Deep link received!");
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Bob" });

		await env.emitUpdate({
			update_id: 0,
			message: {
				message_id: 1,
				date: Math.floor(Date.now() / 1000),
				chat: { id: user.payload.id, type: "private" },
				from: user.payload,
				text: "/start ref_123",
				entities: [{ type: "bot_command", offset: 0, length: 6 }],
			},
		});

		expect(rawPayload).toBe("ref_123");
		expect(env.apiCalls[0].params).toHaveProperty(
			"text",
			"Deep link received!",
		);
	});

	test("startParameter with regex", async () => {
		let matched = false;

		const bot = new Bot(TOKEN).startParameter(/^ref_(.+)$/, (ctx) => {
			matched = true;
			return ctx.send(`Ref: ${ctx.rawStartPayload}`);
		});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Charlie" });

		await env.emitUpdate({
			update_id: 0,
			message: {
				message_id: 1,
				date: Math.floor(Date.now() / 1000),
				chat: { id: user.payload.id, type: "private" },
				from: user.payload,
				text: "/start ref_abc",
				entities: [{ type: "bot_command", offset: 0, length: 6 }],
			},
		});

		expect(matched).toBe(true);
	});
});
