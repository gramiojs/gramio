import { describe, expect, test } from "bun:test";
import { TelegramTestEnvironment } from "@gramio/test";
import { Bot } from "../src/bot.ts";
import { Composer } from "../src/composer.ts";
import { Plugin } from "../src/plugin.ts";

const TOKEN = "test-token";

describe("Deduplication", () => {
	describe("Bot.extend(composer)", () => {
		test("named composer extended twice into bot runs middleware once", async () => {
			let callCount = 0;

			const shared = new Composer({ name: "shared" });
			shared.use((_ctx, next) => {
				callCount++;
				return next();
			});

			const bot = new Bot(TOKEN).extend(shared).extend(shared);

			// @ts-expect-error source Bot vs packaged AnyBot
			const env = new TelegramTestEnvironment(bot);
			const user = env.createUser();
			await user.sendMessage("hello");

			expect(callCount).toBe(1);
		});

		test("unnamed composer extended twice into bot runs middleware twice (no dedup)", async () => {
			let callCount = 0;

			const shared = new Composer();
			shared.use((_ctx, next) => {
				callCount++;
				return next();
			});

			const bot = new Bot(TOKEN).extend(shared).extend(shared);

			// @ts-expect-error source Bot vs packaged AnyBot
			const env = new TelegramTestEnvironment(bot);
			const user = env.createUser();
			await user.sendMessage("hello");

			expect(callCount).toBe(2);
		});
	});

	describe("Bot.extend(plugin)", () => {
		test("same named plugin extended twice into bot runs middleware once", async () => {
			let callCount = 0;

			const plugin = new Plugin("my-plugin").use((_ctx, next) => {
				callCount++;
				return next();
			});

			const bot = new Bot(TOKEN).extend(plugin).extend(plugin);

			// @ts-expect-error source Bot vs packaged AnyBot
			const env = new TelegramTestEnvironment(bot);
			const user = env.createUser();
			await user.sendMessage("hello");

			expect(callCount).toBe(1);
		});

		test("plugins with different names run middleware separately", async () => {
			let callCountA = 0;
			let callCountB = 0;

			const pluginA = new Plugin("plugin-a").use((_ctx, next) => {
				callCountA++;
				return next();
			});
			const pluginB = new Plugin("plugin-b").use((_ctx, next) => {
				callCountB++;
				return next();
			});

			const bot = new Bot(TOKEN).extend(pluginA).extend(pluginB);

			// @ts-expect-error source Bot vs packaged AnyBot
			const env = new TelegramTestEnvironment(bot);
			const user = env.createUser();
			await user.sendMessage("hello");

			expect(callCountA).toBe(1);
			expect(callCountB).toBe(1);
		});
	});

	describe("Transitive dedup: shared composer → multiple plugins → bot", () => {
		test("shared named composer in two plugins runs once in bot", async () => {
			let sharedCount = 0;
			let pluginACount = 0;
			let pluginBCount = 0;

			const shared = new Composer({ name: "shared" });
			shared.use((_ctx, next) => {
				sharedCount++;
				return next();
			});

			const pluginA = new Plugin("plugin-a")
				.extend(shared)
				.use((_ctx, next) => {
					pluginACount++;
					return next();
				});

			const pluginB = new Plugin("plugin-b")
				.extend(shared)
				.use((_ctx, next) => {
					pluginBCount++;
					return next();
				});

			const bot = new Bot(TOKEN).extend(pluginA).extend(pluginB);

			// @ts-expect-error source Bot vs packaged AnyBot
			const env = new TelegramTestEnvironment(bot);
			const user = env.createUser();
			await user.sendMessage("hello");

			expect(pluginACount).toBe(1);
			expect(pluginBCount).toBe(1);
			// The key assertion: shared middleware runs only once
			expect(sharedCount).toBe(1);
		});

		test("shared named composer with derive in two plugins derives once", async () => {
			let deriveCount = 0;

			const shared = new Composer({ name: "shared-derive" });
			shared.derive((_ctx) => {
				deriveCount++;
				return { sharedProp: 42 };
			});
			shared.as("scoped");

			const pluginA = new Plugin("plugin-a").extend(shared);
			const pluginB = new Plugin("plugin-b").extend(shared);

			let capturedValue: number | undefined;

			const bot = new Bot(TOKEN)
				.extend(pluginA)
				.extend(pluginB)
				.use((ctx, next) => {
					capturedValue = (ctx as any).sharedProp;
					return next();
				});

			// @ts-expect-error source Bot vs packaged AnyBot
			const env = new TelegramTestEnvironment(bot);
			const user = env.createUser();
			await user.sendMessage("hello");

			expect(deriveCount).toBe(1);
			expect(capturedValue).toBe(42);
		});

		test("shared unnamed composer in two plugins runs twice (no dedup)", async () => {
			let sharedCount = 0;

			const shared = new Composer();
			shared.use((_ctx, next) => {
				sharedCount++;
				return next();
			});

			const pluginA = new Plugin("plugin-a").extend(shared);
			const pluginB = new Plugin("plugin-b").extend(shared);

			const bot = new Bot(TOKEN).extend(pluginA).extend(pluginB);

			// @ts-expect-error source Bot vs packaged AnyBot
			const env = new TelegramTestEnvironment(bot);
			const user = env.createUser();
			await user.sendMessage("hello");

			// Without a name, no dedup happens
			expect(sharedCount).toBe(2);
		});
	});

	describe("Deep transitive: shared → plugin → plugin → bot", () => {
		test("deeply nested shared composer deduplicates", async () => {
			let sharedCount = 0;

			const shared = new Composer({ name: "deep-shared" });
			shared.use((_ctx, next) => {
				sharedCount++;
				return next();
			});

			// pluginInner extends shared
			const pluginInner = new Plugin("inner").extend(shared);

			// pluginOuter also extends shared directly
			const pluginOuter = new Plugin("outer")
				.extend(shared)
				.extend(pluginInner);

			const bot = new Bot(TOKEN).extend(pluginOuter);

			// @ts-expect-error source Bot vs packaged AnyBot
			const env = new TelegramTestEnvironment(bot);
			const user = env.createUser();
			await user.sendMessage("hello");

			expect(sharedCount).toBe(1);
		});
	});

	describe("Composer → Composer dedup (no plugins)", () => {
		test("shared named composer extended into two composers, both into bot", async () => {
			let sharedCount = 0;

			const shared = new Composer({ name: "shared-c" });
			shared.use((_ctx, next) => {
				sharedCount++;
				return next();
			});

			const composerA = new Composer({ name: "composer-a" });
			composerA.extend(shared);

			const composerB = new Composer({ name: "composer-b" });
			composerB.extend(shared);

			const bot = new Bot(TOKEN).extend(composerA).extend(composerB);

			// @ts-expect-error source Bot vs packaged AnyBot
			const env = new TelegramTestEnvironment(bot);
			const user = env.createUser();
			await user.sendMessage("hello");

			expect(sharedCount).toBe(1);
		});
	});

	describe("Plugin.extend(composer) dedup", () => {
		test("named composer extended twice into same plugin runs once", async () => {
			let callCount = 0;

			const shared = new Composer({ name: "shared-p" });
			shared.use((_ctx, next) => {
				callCount++;
				return next();
			});

			const plugin = new Plugin("my-plugin").extend(shared).extend(shared);

			const bot = new Bot(TOKEN).extend(plugin);

			// @ts-expect-error source Bot vs packaged AnyBot
			const env = new TelegramTestEnvironment(bot);
			const user = env.createUser();
			await user.sendMessage("hello");

			expect(callCount).toBe(1);
		});
	});

	describe("Composer.extend(plugin)", () => {
		test("composer can extend a plugin and run its middleware", async () => {
			let pluginCount = 0;

			const plugin = new Plugin("test-plugin").use((_ctx, next) => {
				pluginCount++;
				return next();
			});

			const composer = new Composer();
			composer.extend(plugin as any);

			const bot = new Bot(TOKEN).extend(composer);

			// @ts-expect-error source Bot vs packaged AnyBot
			const env = new TelegramTestEnvironment(bot);
			const user = env.createUser();
			await user.sendMessage("hello");

			expect(pluginCount).toBe(1);
		});

		test("composer.extend(plugin) deduplicates named plugins", async () => {
			let pluginCount = 0;

			const plugin = new Plugin("test-plugin").use((_ctx, next) => {
				pluginCount++;
				return next();
			});

			const composer = new Composer();
			composer.extend(plugin as any);
			composer.extend(plugin as any);

			const bot = new Bot(TOKEN).extend(composer);

			// @ts-expect-error source Bot vs packaged AnyBot
			const env = new TelegramTestEnvironment(bot);
			const user = env.createUser();
			await user.sendMessage("hello");

			expect(pluginCount).toBe(1);
		});

		test("composer.extend(plugin) with derive propagates when composer promoted to scoped", async () => {
			let capturedValue: number | undefined;

			const plugin = new Plugin("derive-plugin").derive((_ctx) => {
				return { derivedProp: 99 };
			});

			const composer = new Composer({ name: "wrapper" });
			composer.extend(plugin as any);
			// Promote so derives escape isolation when extended into bot
			composer.as("scoped");

			const bot = new Bot(TOKEN)
				.extend(composer)
				.use((ctx, next) => {
					capturedValue = (ctx as any).derivedProp;
					return next();
				});

			// @ts-expect-error source Bot vs packaged AnyBot
			const env = new TelegramTestEnvironment(bot);
			const user = env.createUser();
			await user.sendMessage("hello");

			expect(capturedValue).toBe(99);
		});

		test("composer.extend(plugin) derive stays isolated without scope promotion", async () => {
			let deriveRan = false;
			let capturedValue: number | undefined;

			const plugin = new Plugin("derive-plugin").derive((_ctx) => {
				deriveRan = true;
				return { derivedProp: 99 };
			});

			const composer = new Composer();
			composer.extend(plugin as any);
			// No .as("scoped") — derive runs but is isolated

			const bot = new Bot(TOKEN)
				.extend(composer)
				.use((ctx, next) => {
					capturedValue = (ctx as any).derivedProp;
					return next();
				});

			// @ts-expect-error source Bot vs packaged AnyBot
			const env = new TelegramTestEnvironment(bot);
			const user = env.createUser();
			await user.sendMessage("hello");

			expect(deriveRan).toBe(true);
			// Derive runs in isolated scope — value doesn't propagate
			expect(capturedValue).toBeUndefined();
		});

		test("transitive: shared composer in plugin, plugin in composer, both in bot", async () => {
			let sharedCount = 0;

			const shared = new Composer({ name: "shared-in-plugin" });
			shared.use((_ctx, next) => {
				sharedCount++;
				return next();
			});

			const plugin = new Plugin("wrapper-plugin").extend(shared);

			const composerA = new Composer({ name: "a" });
			composerA.extend(plugin as any);

			const composerB = new Composer({ name: "b" });
			composerB.extend(plugin as any);

			const bot = new Bot(TOKEN).extend(composerA).extend(composerB);

			// @ts-expect-error source Bot vs packaged AnyBot
			const env = new TelegramTestEnvironment(bot);
			const user = env.createUser();
			await user.sendMessage("hello");

			// shared runs once, plugin middleware runs once (deduped by plugin name)
			expect(sharedCount).toBe(1);
		});
	});
});
