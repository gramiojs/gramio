import { describe, expect, mock, test } from "bun:test";
import { TelegramTestEnvironment } from "@gramio/test";
import { Bot } from "../src/bot.ts";
import { Composer } from "../src/composer.ts";
import type { CommandMeta } from "../src/types.ts";

const TOKEN = "test-token";

/** Helper to get typed commandsMeta from bot */
function getCommandsMeta(bot: Bot<any, any, any>): Map<string, CommandMeta> {
	return (bot.updates.composer["~"].commandsMeta ?? new Map()) as Map<string, CommandMeta>;
}

describe("Command Metadata — Registration", () => {
	test("command with meta stores metadata on the composer", () => {
		const bot = new Bot(TOKEN)
			.command("start", {
				description: "Start the bot",
			}, (ctx) => ctx.send("Hello!"));

		const meta = getCommandsMeta(bot);
		expect(meta.size).toBe(1);
		expect(meta.get("start")).toEqual({
			description: "Start the bot",
		});
	});

	test("command without meta does not store metadata", () => {
		const bot = new Bot(TOKEN)
			.command("start", (ctx) => ctx.send("Hello!"));

		const meta = getCommandsMeta(bot);
		expect(meta?.size ?? 0).toBe(0);
	});

	test("command with locales stores localized descriptions", () => {
		const bot = new Bot(TOKEN)
			.command("start", {
				description: "Start the bot",
				locales: {
					ru: "Запустить бота",
					de: "Bot starten",
				},
			}, (ctx) => ctx.send("Hello!"));

		const meta = getCommandsMeta(bot).get("start");
		expect(meta?.locales).toEqual({
			ru: "Запустить бота",
			de: "Bot starten",
		});
	});

	test("command with scopes stores scope configuration", () => {
		const bot = new Bot(TOKEN)
			.command("ban", {
				description: "Ban a user",
				scopes: ["all_chat_administrators"],
			}, (ctx) => ctx.send("Banned"));

		const meta = getCommandsMeta(bot).get("ban");
		expect(meta?.scopes).toEqual(["all_chat_administrators"]);
	});

	test("multiple commands register separate metadata entries", () => {
		const bot = new Bot(TOKEN)
			.command("start", {
				description: "Start the bot",
			}, (ctx) => ctx.send("Hello!"))
			.command("help", {
				description: "Show help",
			}, (ctx) => ctx.send("Help"))
			.command("settings", (ctx) => ctx.send("Settings"));

		const meta = getCommandsMeta(bot);
		expect(meta.size).toBe(2);
		expect(meta.has("start")).toBe(true);
		expect(meta.has("help")).toBe(true);
		expect(meta.has("settings")).toBe(false);
	});

	test("array command names register metadata for each name", () => {
		const bot = new Bot(TOKEN)
			.command(["start", "begin"], {
				description: "Start the bot",
			}, (ctx) => ctx.send("Hello!"));

		const meta = getCommandsMeta(bot);
		expect(meta.size).toBe(2);
		expect(meta.get("start")?.description).toBe("Start the bot");
		expect(meta.get("begin")?.description).toBe("Start the bot");
	});

	test("later registration overwrites earlier metadata", () => {
		const bot = new Bot(TOKEN)
			.command("start", {
				description: "Old description",
			}, (ctx) => ctx.send("v1"))
			.command("start", {
				description: "New description",
			}, (ctx) => ctx.send("v2"));

		const meta = getCommandsMeta(bot);
		expect(meta.size).toBe(1);
		expect(meta.get("start")?.description).toBe("New description");
	});
});

describe("Command Metadata — Handler still works", () => {
	test("command with meta still handles messages correctly", async () => {
		const calls: string[] = [];
		const bot = new Bot(TOKEN)
			.command("start", {
				description: "Start the bot",
			}, (ctx) => {
				calls.push(`start:${ctx.args}`);
			});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ id: 1, first_name: "Test" });

		await user.sendCommand("start");
		expect(calls).toEqual(["start:null"]);
	});

	test("command with meta and macro options works", async () => {
		const calls: string[] = [];
		const bot = new Bot(TOKEN)
			.macro("log", {
				preHandler: ((ctx: any, next: any) => {
					calls.push("macro");
					return next();
				}) as any,
			})
			.command("test", {
				description: "Test command",
			}, (ctx) => {
				calls.push("handler");
			}, { log: true });

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ id: 1, first_name: "Test" });

		await user.sendCommand("test");
		expect(calls).toEqual(["macro", "handler"]);
	});
});

describe("Command Metadata — Merging via extend()", () => {
	test("extend merges commandsMeta from sub-composer", () => {
		const sub = new Composer()
			.command("help", {
				description: "Show help",
			}, () => {});

		const bot = new Bot(TOKEN)
			.command("start", {
				description: "Start the bot",
			}, (ctx) => ctx.send("Hello!"))
			.extend(sub);

		const meta = getCommandsMeta(bot);
		expect(meta.size).toBe(2);
		expect(meta.get("start")?.description).toBe("Start the bot");
		expect(meta.get("help")?.description).toBe("Show help");
	});

	test("extend overwrites same command name metadata", () => {
		const sub = new Composer()
			.command("start", {
				description: "Overridden",
			}, () => {});

		const bot = new Bot(TOKEN)
			.command("start", {
				description: "Original",
			}, (ctx) => ctx.send("Hello!"))
			.extend(sub);

		const meta = getCommandsMeta(bot);
		expect(meta.get("start")?.description).toBe("Overridden");
	});

	test("nested extend merges transitively", () => {
		const inner = new Composer()
			.command("inner", {
				description: "Inner command",
			}, () => {});

		const outer = new Composer()
			.command("outer", {
				description: "Outer command",
			}, () => {})
			.extend(inner);

		const bot = new Bot(TOKEN).extend(outer);

		const meta = getCommandsMeta(bot);
		expect(meta.size).toBe(2);
		expect(meta.has("inner")).toBe(true);
		expect(meta.has("outer")).toBe(true);
	});
});

describe("Command Metadata — syncCommands()", () => {
	test("syncCommands calls setMyCommands for each scope+language group", async () => {
		const apiCalls: any[] = [];

		const bot = new Bot(TOKEN)
			.command("start", {
				description: "Start the bot",
				locales: { ru: "Запустить бота" },
			}, (ctx) => ctx.send("Hello!"))
			.command("help", {
				description: "Show help",
				locales: { ru: "Помощь" },
			}, (ctx) => ctx.send("Help"));

		// Mock the API
		const originalCallApi = (bot as any)._callApi.bind(bot);
		(bot as any)._callApi = async (method: string, params: any) => {
			if (method === "setMyCommands") {
				apiCalls.push(params);
				return true;
			}
			if (method === "getMe") {
				return { id: 123, is_bot: true, first_name: "TestBot", username: "test_bot" };
			}
			return originalCallApi(method, params);
		};

		await bot.init();
		await bot.syncCommands();

		// Should have 2 calls: default language + ru
		expect(apiCalls.length).toBe(2);

		// Default language
		const defaultCall = apiCalls.find((c) => !c.language_code);
		expect(defaultCall).toBeDefined();
		expect(defaultCall.commands).toEqual([
			{ command: "start", description: "Start the bot" },
			{ command: "help", description: "Show help" },
		]);

		// Russian
		const ruCall = apiCalls.find((c) => c.language_code === "ru");
		expect(ruCall).toBeDefined();
		expect(ruCall.commands).toEqual([
			{ command: "start", description: "Запустить бота" },
			{ command: "help", description: "Помощь" },
		]);
	});

	test("syncCommands with scopes groups correctly", async () => {
		const apiCalls: any[] = [];

		const bot = new Bot(TOKEN)
			.command("start", {
				description: "Start the bot",
			}, (ctx) => ctx.send("Hello!"))
			.command("ban", {
				description: "Ban a user",
				scopes: ["all_chat_administrators"],
			}, (ctx) => ctx.send("Banned"));

		(bot as any)._callApi = async (method: string, params: any) => {
			if (method === "setMyCommands") {
				apiCalls.push(params);
				return true;
			}
			if (method === "getMe") {
				return { id: 123, is_bot: true, first_name: "TestBot", username: "test_bot" };
			}
		};

		await bot.init();
		await bot.syncCommands();

		// Should have 2 calls: default scope + admin scope
		expect(apiCalls.length).toBe(2);

		const defaultCall = apiCalls.find((c) => !c.scope || c.scope?.type === "default");
		expect(defaultCall?.commands).toEqual([
			{ command: "start", description: "Start the bot" },
		]);

		const adminCall = apiCalls.find((c) => c.scope?.type === "all_chat_administrators");
		expect(adminCall?.commands).toEqual([
			{ command: "ban", description: "Ban a user" },
		]);
	});

	test("syncCommands with storage skips unchanged groups", async () => {
		const apiCalls: any[] = [];
		const storageData = new Map<string, string>();
		const storage = {
			get: (key: string) => storageData.get(key),
			set: (key: string, value: string) => { storageData.set(key, value); },
		};

		const bot = new Bot(TOKEN)
			.command("start", {
				description: "Start the bot",
			}, (ctx) => ctx.send("Hello!"));

		(bot as any)._callApi = async (method: string, params: any) => {
			if (method === "setMyCommands") {
				apiCalls.push(params);
				return true;
			}
			if (method === "getMe") {
				return { id: 123, is_bot: true, first_name: "TestBot", username: "test_bot" };
			}
		};

		await bot.init();

		// First sync — should call API
		await bot.syncCommands({ storage });
		expect(apiCalls.length).toBe(1);

		// Second sync — should skip (hash matches)
		await bot.syncCommands({ storage });
		expect(apiCalls.length).toBe(1); // no new call
	});

	test("syncCommands does nothing when no metadata is registered", async () => {
		const apiCalls: any[] = [];

		const bot = new Bot(TOKEN)
			.command("start", (ctx) => ctx.send("Hello!"));

		(bot as any)._callApi = async (method: string, params: any) => {
			if (method === "setMyCommands") {
				apiCalls.push(params);
				return true;
			}
			if (method === "getMe") {
				return { id: 123, is_bot: true, first_name: "TestBot", username: "test_bot" };
			}
		};

		await bot.init();
		await bot.syncCommands();
		expect(apiCalls.length).toBe(0);
	});

	test("syncCommands with cleanUnusedScopes deletes undeclared scopes", async () => {
		const apiCalls: { method: string; params: any }[] = [];

		const bot = new Bot(TOKEN)
			.command("start", {
				description: "Start the bot",
				scopes: ["all_private_chats"],
			}, (ctx) => ctx.send("Hello!"));

		(bot as any)._callApi = async (method: string, params: any) => {
			apiCalls.push({ method, params });
			if (method === "getMe") {
				return { id: 123, is_bot: true, first_name: "TestBot", username: "test_bot" };
			}
			return true;
		};

		await bot.init();
		await bot.syncCommands({ cleanUnusedScopes: true });

		const setCalls = apiCalls.filter((c) => c.method === "setMyCommands");
		const deleteCalls = apiCalls.filter((c) => c.method === "deleteMyCommands");

		expect(setCalls.length).toBe(1);
		// Should delete default, all_group_chats, all_chat_administrators (3 scopes not declared)
		expect(deleteCalls.length).toBe(3);
	});
});

describe("Command Metadata — hide & exclude", () => {
	test("hide: true excludes command from syncCommands", async () => {
		const apiCalls: any[] = [];

		const bot = new Bot(TOKEN)
			.command("start", {
				description: "Start the bot",
			}, (ctx) => ctx.send("Hello!"))
			.command("secret", {
				description: "Secret command",
				hide: true,
			}, (ctx) => ctx.send("Shh"));

		(bot as any)._callApi = async (method: string, params: any) => {
			if (method === "setMyCommands") {
				apiCalls.push(params);
				return true;
			}
			if (method === "getMe") {
				return { id: 123, is_bot: true, first_name: "TestBot", username: "test_bot" };
			}
		};

		await bot.init();
		await bot.syncCommands();

		expect(apiCalls.length).toBe(1);
		expect(apiCalls[0].commands).toEqual([
			{ command: "start", description: "Start the bot" },
		]);
	});

	test("hide: true command handler still works", async () => {
		const calls: string[] = [];
		const bot = new Bot(TOKEN)
			.command("secret", {
				description: "Secret command",
				hide: true,
			}, (ctx) => {
				calls.push("secret");
			});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(bot);
		const user = env.createUser({ id: 1, first_name: "Test" });

		await user.sendCommand("secret");
		expect(calls).toEqual(["secret"]);
	});

	test("exclude option filters commands at sync time", async () => {
		const apiCalls: any[] = [];

		const bot = new Bot(TOKEN)
			.command("start", {
				description: "Start the bot",
			}, (ctx) => ctx.send("Hello!"))
			.command("help", {
				description: "Show help",
			}, (ctx) => ctx.send("Help"))
			.command("debug", {
				description: "Debug info",
			}, (ctx) => ctx.send("Debug"));

		(bot as any)._callApi = async (method: string, params: any) => {
			if (method === "setMyCommands") {
				apiCalls.push(params);
				return true;
			}
			if (method === "getMe") {
				return { id: 123, is_bot: true, first_name: "TestBot", username: "test_bot" };
			}
		};

		await bot.init();
		await bot.syncCommands({ exclude: ["debug", "help"] });

		expect(apiCalls.length).toBe(1);
		expect(apiCalls[0].commands).toEqual([
			{ command: "start", description: "Start the bot" },
		]);
	});

	test("hide and exclude work together", async () => {
		const apiCalls: any[] = [];

		const bot = new Bot(TOKEN)
			.command("start", {
				description: "Start the bot",
			}, (ctx) => ctx.send("Hello!"))
			.command("hidden", {
				description: "Hidden",
				hide: true,
			}, () => {})
			.command("excluded", {
				description: "Excluded",
			}, () => {});

		(bot as any)._callApi = async (method: string, params: any) => {
			if (method === "setMyCommands") {
				apiCalls.push(params);
				return true;
			}
			if (method === "getMe") {
				return { id: 123, is_bot: true, first_name: "TestBot", username: "test_bot" };
			}
		};

		await bot.init();
		await bot.syncCommands({ exclude: ["excluded"] });

		expect(apiCalls.length).toBe(1);
		expect(apiCalls[0].commands).toEqual([
			{ command: "start", description: "Start the bot" },
		]);
	});
});

describe("Command Metadata — Validation", () => {
	test("command name with / prefix still throws", () => {
		expect(() => {
			new Bot(TOKEN).command("/start", {
				description: "Start the bot",
			}, () => {});
		}).toThrow("Do not use / in command name");
	});
});
