/**
 * Type-level tests: Plugin shorthand methods + composer.extend(plugin) chain.
 *
 * Verifies that:
 *  1. Plugin gets shorthand methods (.command, .callbackQuery, .hears, etc.)
 *     directly on its instance — same signatures as Composer.
 *  2. Plugin shorthand handlers see Plugin's own derives in ctx.
 *  3. composer.extend(plugin) returns a chainable Composer where:
 *     - Plugin's global derives are merged into TOut
 *     - Plugin's per-event derives are merged into TDerives
 *     - Plugin's macros are merged into TMacros
 *     - Custom shorthand methods (.command, etc.) remain available
 *  4. Multi-plugin extend chains accumulate types correctly
 *  5. Bot.extend(plugin) continues to work and has the same type behavior
 */
import { describe, expectTypeOf, test } from "bun:test";
import { Bot } from "../src/bot.ts";
import { Composer } from "../src/composer.ts";
import { Plugin } from "../src/plugin.ts";

// ─── Domain types ────────────────────────────────────────────────────────────

type Translator = (key: string) => string;
type Session = { count: number; userId: number };

const i18nPlugin = new Plugin("i18n").derive(() => ({
	t: ((k: string) => k) as Translator,
}));

const sessionPlugin = new Plugin("session").derive(() => ({
	session: { count: 0, userId: 0 } as Session,
}));

const messageOnlyPlugin = new Plugin("msg-only").derive(
	["message"],
	() => ({ msgCount: 1 }),
);

// ═════════════════════════════════════════════════════════════════════════════
// 1. Plugin instance shorthand methods
// ═════════════════════════════════════════════════════════════════════════════

describe("Plugin shorthand methods", () => {
	test("Plugin has all shorthand methods on instance", () => {
		expectTypeOf(i18nPlugin.command).toBeFunction();
		expectTypeOf(i18nPlugin.callbackQuery).toBeFunction();
		expectTypeOf(i18nPlugin.hears).toBeFunction();
		expectTypeOf(i18nPlugin.reaction).toBeFunction();
		expectTypeOf(i18nPlugin.inlineQuery).toBeFunction();
		expectTypeOf(i18nPlugin.chosenInlineResult).toBeFunction();
		expectTypeOf(i18nPlugin.startParameter).toBeFunction();
	});

	test("plugin.command() handler ctx contains plugin's own derives", () => {
		i18nPlugin.command("start", (ctx) => {
			expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
		});
	});

	test("plugin.callbackQuery() handler ctx contains plugin's own derives", () => {
		i18nPlugin.callbackQuery("test", (ctx) => {
			expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
		});
	});

	test("plugin.hears() handler ctx contains plugin's own derives", () => {
		i18nPlugin.hears("hi", (ctx) => {
			expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
		});
	});

	test("plugin.reaction() handler ctx contains plugin's own derives", () => {
		i18nPlugin.reaction("👍", (ctx) => {
			expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
		});
	});

	test("plugin.inlineQuery() handler ctx contains plugin's own derives", () => {
		i18nPlugin.inlineQuery("query", (ctx) => {
			expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
		});
	});

	test("plugin.startParameter() handler ctx contains plugin's own derives", () => {
		i18nPlugin.startParameter("ref", (ctx) => {
			expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
		});
	});

	test("plugin shorthand methods chain — return type preserves derives", () => {
		const chained = i18nPlugin
			.command("start", () => {})
			.command("help", () => {})
			.callbackQuery("a", () => {});

		// Chain returns Plugin with the same Derives type
		chained.on("message", (ctx) => {
			expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
		});
	});
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. composer.extend(plugin) — type propagation
// ═════════════════════════════════════════════════════════════════════════════

describe("composer.extend(plugin) type propagation", () => {
	test("global derives propagate into TOut after extend", () => {
		const c = new Composer({ name: "r1" }).extend(i18nPlugin);
		c.on("message", (ctx) => {
			expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
		});
	});

	test("custom shorthand methods are available immediately after extend(plugin)", () => {
		const c = new Composer({ name: "r2" }).extend(i18nPlugin);

		// .command() is callable directly on the result of extend(plugin)
		expectTypeOf(c.command).toBeFunction();
		expectTypeOf(c.callbackQuery).toBeFunction();
		expectTypeOf(c.hears).toBeFunction();
		expectTypeOf(c.reaction).toBeFunction();
		expectTypeOf(c.inlineQuery).toBeFunction();
		expectTypeOf(c.chosenInlineResult).toBeFunction();
		expectTypeOf(c.startParameter).toBeFunction();
	});

	test("ctx in command handler after extend(plugin) sees plugin derives", () => {
		new Composer({ name: "r3" })
			.extend(i18nPlugin)
			.command("start", (ctx) => {
				expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
			});
	});

	test("ctx in callbackQuery handler after extend(plugin) sees plugin derives", () => {
		new Composer({ name: "r4" })
			.extend(i18nPlugin)
			.callbackQuery("test", (ctx) => {
				expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
			});
	});

	test("ctx in hears handler after extend(plugin) sees plugin derives", () => {
		new Composer({ name: "r5" })
			.extend(i18nPlugin)
			.hears("hi", (ctx) => {
				expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
			});
	});

	test("per-event derives are visible only in matching events", () => {
		new Composer({ name: "r6" })
			.extend(messageOnlyPlugin)
			.command("test", (ctx) => {
				expectTypeOf(ctx.msgCount).toEqualTypeOf<number>();
			});
	});

	test("multi-plugin extend chains accumulate all derives", () => {
		new Composer({ name: "r7" })
			.extend(i18nPlugin)
			.extend(sessionPlugin)
			.command("start", (ctx) => {
				expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
				expectTypeOf(ctx.session).toEqualTypeOf<Session>();
			});
	});

	test("multi-plugin chain with mixed global + per-event derives", () => {
		new Composer({ name: "r8" })
			.extend(i18nPlugin)
			.extend(sessionPlugin)
			.extend(messageOnlyPlugin)
			.command("start", (ctx) => {
				expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
				expectTypeOf(ctx.session).toEqualTypeOf<Session>();
				expectTypeOf(ctx.msgCount).toEqualTypeOf<number>();
			});
	});
});

// ═════════════════════════════════════════════════════════════════════════════
// 3. Long chains — derives & methods don't get lost or overridden
// ═════════════════════════════════════════════════════════════════════════════

describe("Long chains preserve types", () => {
	test("composer.extend(plugin).on().use().derive().command() preserves all types", () => {
		new Composer({ name: "r9" })
			.extend(i18nPlugin)
			.on("message", () => {})
			.use((_ctx, next) => next())
			.derive(() => ({ extra: 42 as const }))
			.command("test", (ctx) => {
				expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
				expectTypeOf(ctx.extra).toEqualTypeOf<42>();
			});
	});

	test("composer.extend(plugin).as('scoped').command() preserves derives", () => {
		new Composer({ name: "r10" })
			.extend(i18nPlugin)
			.as("scoped")
			.command("test", (ctx) => {
				expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
			});
	});

	test("nested extend: requires .as('scoped') to promote derives transitively", () => {
		// composer.extend(plugin) updates TOut but not TExposed (TS bug prevents
		// updating TExposed in the augmented overload). Use .as('scoped') to
		// promote TOut → TExposed so the derives flow into outer extends.
		const inner = new Composer({ name: "inner" })
			.extend(i18nPlugin)
			.as("scoped");
		new Composer({ name: "outer" }).extend(inner).command("test", (ctx) => {
			expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
		});
	});

	test("plugin.extend(plugin) — Plugin chain still gets derives", () => {
		new Plugin("compound")
			.extend(i18nPlugin)
			.extend(sessionPlugin)
			.command("start", (ctx) => {
				expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
				expectTypeOf(ctx.session).toEqualTypeOf<Session>();
			});
	});
});

// ═════════════════════════════════════════════════════════════════════════════
// 4. Bot.extend(plugin) — types still flow correctly
// ═════════════════════════════════════════════════════════════════════════════

describe("Bot.extend(plugin) type flow", () => {
	test("bot.command() after extend sees plugin derives", () => {
		new Bot("test")
			.extend(i18nPlugin)
			.command("start", (ctx) => {
				expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
			});
	});

	test("bot.on('message') after extend sees plugin derives", () => {
		new Bot("test")
			.extend(i18nPlugin)
			.extend(sessionPlugin)
			.on("message", (ctx) => {
				expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
				expectTypeOf(ctx.session).toEqualTypeOf<Session>();
			});
	});

	test("bot extend chain — derives don't get overridden by later extends", () => {
		new Bot("test")
			.extend(i18nPlugin)
			.extend(sessionPlugin)
			.extend(messageOnlyPlugin)
			.command("start", (ctx) => {
				expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
				expectTypeOf(ctx.session).toEqualTypeOf<Session>();
				expectTypeOf(ctx.msgCount).toEqualTypeOf<number>();
			});
	});
});

// ═════════════════════════════════════════════════════════════════════════════
// 5. Plugin as a self-contained router (the recommended pattern)
// ═════════════════════════════════════════════════════════════════════════════

describe("Plugin as self-contained router", () => {
	test("plugin with derives + handlers in one place", () => {
		const router = new Plugin("router")
			.derive(() => ({ config: { lang: "en" } }))
			.command("start", (ctx) => {
				expectTypeOf(ctx.config).toEqualTypeOf<{ lang: string }>();
			})
			.callbackQuery("settings", (ctx) => {
				expectTypeOf(ctx.config).toEqualTypeOf<{ lang: string }>();
			});

		// Router can be plugged into Bot
		const bot = new Bot("test").extend(router);
		bot.on("message", (ctx) => {
			expectTypeOf(ctx.config).toEqualTypeOf<{ lang: string }>();
		});
	});

	test("plugin can extend another plugin and add its own routes", () => {
		const baseRouter = new Plugin("base").extend(i18nPlugin).command(
			"hello",
			(ctx) => {
				expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
			},
		);

		new Bot("test").extend(baseRouter).on("message", (ctx) => {
			expectTypeOf(ctx.t).toEqualTypeOf<Translator>();
		});
	});
});
