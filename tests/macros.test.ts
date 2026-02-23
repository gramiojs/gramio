import { describe, expect, mock, test } from "bun:test";
import { TelegramTestEnvironment } from "@gramio/test";
import type { MacroDef, MacroHooks, Middleware } from "@gramio/composer";
import { Bot } from "../src/bot.ts";
import { Plugin } from "../src/plugin.ts";

const TOKEN = "test-token";

describe("Macro System — Bot", () => {
	test("bot.macro() registers a named macro", () => {
		const def: MacroHooks = {
			preHandler: ((_: any, next: any) => next()) as Middleware<any>,
		};
		const bot = new Bot(TOKEN).macro("auth", def);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		// Verify macro is registered on the underlying composer
		expect(env.bot.updates.composer["~"].macros.auth).toBe(def);
	});

	test("bot.macro() registers multiple macros at once", () => {
		const auth: MacroHooks = { preHandler: ((_: any, next: any) => next()) as Middleware<any> };
		const cache: MacroHooks = { preHandler: ((_: any, next: any) => next()) as Middleware<any> };

		const bot = new Bot(TOKEN).macro({ auth, cache });

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		expect(env.bot.updates.composer["~"].macros.auth).toBe(auth);
		expect(env.bot.updates.composer["~"].macros.cache).toBe(cache);
	});

	test("command with boolean macro preHandler", async () => {
		const calls: string[] = [];

		const onlyAdmin: MacroHooks = {
			preHandler: ((ctx: any, next: any) => {
				if (ctx.from?.id !== 123) {
					calls.push("blocked");
					return;
				}
				calls.push("allowed");
				return next();
			}) as Middleware<any>,
		};

		const bot = new Bot(TOKEN)
			.macro("onlyAdmin", onlyAdmin)
			.command("ban", (ctx) => {
				calls.push("handler");
			}, { onlyAdmin: true });

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const admin = env.createUser({ id: 123, first_name: "Admin" });
		const user = env.createUser({ id: 456, first_name: "User" });

		await admin.sendCommand("ban");
		expect(calls).toEqual(["allowed", "handler"]);

		calls.length = 0;
		await user.sendCommand("ban");
		expect(calls).toEqual(["blocked"]);
	});

	test("command with parameterized macro", async () => {
		const calls: string[] = [];

		const throttle: MacroDef<{ limit: number }> = (opts) => ({
			preHandler: ((ctx: any, next: any) => {
				calls.push(`throttle:${opts.limit}`);
				return next();
			}) as Middleware<any>,
		});

		const bot = new Bot(TOKEN)
			.macro("throttle", throttle)
			.command("quote", (ctx) => {
				calls.push("handler");
			}, { throttle: { limit: 5 } });

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendCommand("quote");
		expect(calls).toEqual(["throttle:5", "handler"]);
	});

	test("command with options.preHandler array", async () => {
		const calls: string[] = [];

		const g1: Middleware<any> = (_, next) => { calls.push("g1"); return next(); };
		const g2: Middleware<any> = (_, next) => { calls.push("g2"); return next(); };

		const bot = new Bot(TOKEN)
			.command("test", (ctx) => {
				calls.push("handler");
			}, { preHandler: [g1, g2] });

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendCommand("test");
		expect(calls).toEqual(["g1", "g2", "handler"]);
	});

	test("hears with macro preHandler", async () => {
		const calls: string[] = [];

		const log: MacroHooks = {
			preHandler: ((ctx: any, next: any) => {
				calls.push("log");
				return next();
			}) as Middleware<any>,
		};

		const bot = new Bot(TOKEN)
			.macro("log", log)
			.hears("hello", (ctx) => {
				calls.push("handler");
			}, { log: true });

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("hello");
		expect(calls).toEqual(["log", "handler"]);
	});

	test("callbackQuery with macro preHandler", async () => {
		const calls: string[] = [];

		const log: MacroHooks = {
			preHandler: ((ctx: any, next: any) => {
				calls.push("log");
				return next();
			}) as Middleware<any>,
		};

		const bot = new Bot(TOKEN)
			.macro("log", log)
			.command("start", (ctx) => ctx.send("hi", {
				reply_markup: { inline_keyboard: [[{ text: "Click", callback_data: "btn" }]] },
			}))
			.callbackQuery("btn", (ctx) => {
				calls.push("handler");
			}, { log: true });

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		const msg = await user.sendCommand("start");
		await user.on(msg).click("btn");
		expect(calls).toEqual(["log", "handler"]);
	});

	test("macro derive stops chain when returning void", async () => {
		const calls: string[] = [];

		const auth: MacroHooks = {
			derive: (ctx: any) => {
				calls.push("derive");
				if (ctx.from?.id !== 123) return undefined; // void = stop
				return { isAdmin: true };
			},
		};

		const bot = new Bot(TOKEN)
			.macro("auth", auth)
			.command("admin", (ctx) => {
				calls.push("handler");
			}, { auth: true });

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ id: 456, first_name: "User" });

		await user.sendCommand("admin");
		expect(calls).toEqual(["derive"]);
		// Handler was NOT called because derive returned void
	});

	test("macro derive enriches context", async () => {
		let capturedUser: any = null;

		const auth: MacroDef<void, { user: { name: string } }> = {
			derive: (ctx: any) => ({ user: { name: "Alice" } }),
		};

		const bot = new Bot(TOKEN)
			.macro("auth", auth)
			.command("profile", (ctx) => {
				capturedUser = (ctx as any).user;
			}, { auth: true });

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendCommand("profile");
		expect(capturedUser).toEqual({ name: "Alice" });
	});
});

describe("Macro System — Plugin", () => {
	test("plugin.macro() registers macros", () => {
		const def: MacroHooks = {
			preHandler: ((_: any, next: any) => next()) as Middleware<any>,
		};

		const plugin = new Plugin("test-plugin").macro("auth", def);
		expect(plugin._.composer["~"].macros.auth).toBe(def);
	});

	test("macros propagate from plugin to bot via extend", async () => {
		const calls: string[] = [];

		const onlyAdmin: MacroHooks = {
			preHandler: ((ctx: any, next: any) => {
				calls.push("admin-check");
				return next();
			}) as Middleware<any>,
		};

		const plugin = new Plugin("admin-plugin").macro("onlyAdmin", onlyAdmin);

		const bot = new Bot(TOKEN)
			.extend(plugin)
			.command("ban", (ctx) => {
				calls.push("handler");
			}, { onlyAdmin: true });

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendCommand("ban");
		expect(calls).toEqual(["admin-check", "handler"]);
	});

	test("execution order: preHandler → macro.preHandler → macro.derive → handler", async () => {
		const calls: string[] = [];

		const myMacro: MacroHooks = {
			preHandler: ((ctx: any, next: any) => {
				calls.push("macro.preHandler");
				return next();
			}) as Middleware<any>,
			derive: () => {
				calls.push("macro.derive");
				return { extra: 1 };
			},
		};

		const guard: Middleware<any> = (_, next) => {
			calls.push("preHandler");
			return next();
		};

		const bot = new Bot(TOKEN)
			.macro("myMacro", myMacro)
			.command("test", (ctx) => {
				calls.push("handler");
			}, { preHandler: guard, myMacro: true });

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendCommand("test");
		expect(calls).toEqual(["preHandler", "macro.preHandler", "macro.derive", "handler"]);
	});
});
