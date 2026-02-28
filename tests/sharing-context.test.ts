/**
 * Production-ready: Sharing Context Across Modules
 *
 * Tests the pattern of extracting shared derives into standalone Composers /
 * Plugins, extending them into feature routers, and assembling everything in
 * the Bot — while verifying that:
 *
 *  1. Types flow correctly through every layer (.on(), .command(), .hears(), etc.)
 *  2. Deduplication ensures shared middleware runs exactly once at runtime
 *  3. Per-event derives are only present on the matching events
 *  4. Plugin-level derives (global + per-event) compose with Composer derives
 *  5. EventContextOf fix: per-event derives visible inside .command() / .hears()
 */
import { describe, expect, expectTypeOf, test } from "bun:test";
import { TelegramTestEnvironment } from "@gramio/test";
import { Bot } from "../src/bot.ts";
import { Composer } from "../src/composer.ts";
import { filters } from "../src/filters.ts";
import { Plugin } from "../src/plugin.ts";

const TOKEN = "test-token";

// ─── Domain types ────────────────────────────────────────────────────────────

type UserRecord = { id: number; name: string; isPremium: boolean };
type RoleKind = "admin" | "user";

// Fake DB — synchronous so tests don't need async setup
const fakeDb = {
	getUser: (id: number): UserRecord => ({
		id,
		name: `User_${id}`,
		isPremium: id > 1000,
	}),
};

// ─── Shared middleware (simulates src/middleware/*.ts) ────────────────────────

/**
 * withUser — global scoped Composer.
 * Derives `ctx.user` on every event.
 * Named so deduplication skips it when extended more than once.
 */
const withUser = new Composer({ name: "withUser" })
	.derive((ctx) => ({
		user: fakeDb.getUser((ctx as any).from?.id ?? 0),
	}))
	.as("scoped");

/**
 * withRole — per-event scoped Composer.
 * Derives `ctx.role` only on message + callback_query.
 */
const withRole = new Composer({ name: "withRole" })
	.derive(["message", "callback_query"], (ctx) => ({
		role: ((ctx as any).from?.id ?? 0) > 1000
			? ("admin" as RoleKind)
			: ("user" as RoleKind),
	}))
	.as("scoped");

// ─── Plugin with custom error + layered derives ───────────────────────────────

class SessionError extends Error {
	readonly code = "SESSION" as const;
}

/**
 * sessionPlugin — Plugin that contributes:
 *   global derive → `ctx.session`
 *   message-only derive → `ctx.messageCount`
 */
const sessionPlugin = new Plugin("session")
	.error("SESSION", SessionError)
	.derive(() => ({ session: { count: 0 as number } }))
	.derive(["message"], () => ({ messageCount: 1 as number }));

// ─── Feature routers (simulates src/features/*.ts) ────────────────────────────

/**
 * profileRouter extends withUser (global) and withRole (per-event).
 * Standalone, it has full type access to ctx.user (via ContextOf/TOut)
 * and ctx.role (via TDerives["message"]) inside .on("message").
 */
const profileRouter = new Composer({ name: "profileRouter" })
	.extend(withUser)
	.extend(withRole);

/**
 * adminRouter extends only withUser.
 */
const adminRouter = new Composer({ name: "adminRouter" }).extend(withUser);

// ─── Bot assembly ─────────────────────────────────────────────────────────────

const bot = new Bot(TOKEN)
	.extend(withUser) //      1) ctx.user on real ctx
	.extend(withRole) //      2) ctx.role on message + callback_query
	.extend(sessionPlugin) // 3) ctx.session (global) + ctx.messageCount (message)
	.extend(profileRouter) // 4) withUser + withRole inside are deduped
	.extend(adminRouter); //  5) withUser inside is deduped again

// ═════════════════════════════════════════════════════════════════════════════
// TYPE TESTS (compile-time only — handlers are never invoked at runtime)
// ═════════════════════════════════════════════════════════════════════════════

describe("Sharing Context — type tests", () => {
	test("profileRouter.on('message'): ctx.user (ContextOf/TOut) and ctx.role (TDerives) both typed", () => {
		profileRouter.on("message", (ctx) => {
			expectTypeOf(ctx.user).toEqualTypeOf<UserRecord>();
			expectTypeOf(ctx.role).toEqualTypeOf<RoleKind>();
		});
	});

	test("profileRouter.on('callback_query'): ctx.user and ctx.role both typed", () => {
		profileRouter.on("callback_query", (ctx) => {
			expectTypeOf(ctx.user).toEqualTypeOf<UserRecord>();
			expectTypeOf(ctx.role).toEqualTypeOf<RoleKind>();
		});
	});

	test("bot.on('message'): all four derives (user, role, session, messageCount) typed", () => {
		bot.on("message", (ctx) => {
			expectTypeOf(ctx.user).toEqualTypeOf<UserRecord>();
			expectTypeOf(ctx.role).toEqualTypeOf<RoleKind>();
			expectTypeOf(ctx.session).toEqualTypeOf<{ count: number }>();
			expectTypeOf(ctx.messageCount).toEqualTypeOf<number>();
		});
	});

	test("bot.on('callback_query'): user, role, session — no messageCount (message-only)", () => {
		bot.on("callback_query", (ctx) => {
			expectTypeOf(ctx.user).toEqualTypeOf<UserRecord>();
			expectTypeOf(ctx.role).toEqualTypeOf<RoleKind>();
			expectTypeOf(ctx.session).toEqualTypeOf<{ count: number }>();
		});
	});

	test("bot.on('inline_query'): user, session — role absent (not in withRole events)", () => {
		bot.on("inline_query", (ctx) => {
			expectTypeOf(ctx.user).toEqualTypeOf<UserRecord>();
			expectTypeOf(ctx.session).toEqualTypeOf<{ count: number }>();
		});
	});

	// ── EventContextOf fix: shorthand methods now see per-event derives ──────

	test("bot.command(): ctx.user and ctx.messageCount visible (EventContextOf fix)", () => {
		bot.command("test", (ctx) => {
			expectTypeOf(ctx.user).toEqualTypeOf<UserRecord>();
			expectTypeOf(ctx.messageCount).toEqualTypeOf<number>();
		});
	});

	test("bot.hears(): ctx.user and ctx.messageCount visible (EventContextOf fix)", () => {
		bot.hears("hi", (ctx) => {
			expectTypeOf(ctx.user).toEqualTypeOf<UserRecord>();
			expectTypeOf(ctx.messageCount).toEqualTypeOf<number>();
		});
	});

	test("bot.callbackQuery(): ctx.user and ctx.role visible (EventContextOf fix)", () => {
		bot.callbackQuery("btn", (ctx) => {
			expectTypeOf(ctx.user).toEqualTypeOf<UserRecord>();
			expectTypeOf(ctx.role).toEqualTypeOf<RoleKind>();
		});
	});

	test("standalone Composer: command() sees per-event derive after extend+as('scoped')", () => {
		// This is the exact pattern the user reported as broken:
		//   composer.derive("message", fn).as("scoped")
		//   startPlugin.extend(composer).command("start", ctx => ctx.t(...))  ← was error
		const i18nComposer = new Composer({ name: "i18n" })
			.derive("message", (_ctx) => ({
				t: (key: string) => key, // mock translator
			}))
			.as("scoped");

		const startPlugin = new Composer({ name: "start" }).extend(i18nComposer);

		startPlugin.command("start", (ctx) => {
			expectTypeOf(ctx.t).toEqualTypeOf<(key: string) => string>();
		});
		startPlugin.on("message", (ctx) => {
			expectTypeOf(ctx.t).toEqualTypeOf<(key: string) => string>();
		});
	});
});

// ═════════════════════════════════════════════════════════════════════════════
// RUNTIME TESTS
// ═════════════════════════════════════════════════════════════════════════════

describe("Sharing Context — runtime tests", () => {
	test("withUser derive runs exactly once per request (dedup across bot + profileRouter)", async () => {
		let userDeriveCalls = 0;

		const trackedWithUser = new Composer({ name: "trackedWithUser" })
			.derive((ctx) => {
				userDeriveCalls++;
				return { user: fakeDb.getUser((ctx as any).from?.id ?? 0) };
			})
			.as("scoped");

		// profileRouter also extends the same named composer — should be deduped
		const trackedProfileRouter = new Composer({ name: "trackedProfile" }).extend(
			trackedWithUser,
		);

		const testBot = new Bot(TOKEN)
			.extend(trackedWithUser) //  registers it
			.extend(trackedProfileRouter); // withUser inside is skipped (dedup)

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(testBot);
		const user = env.createUser({ first_name: "Alice" });

		await user.sendMessage("hello");
		expect(userDeriveCalls).toBe(1); // NOT 2
	});

	test("withRole: per-event derive runs for message+callback_query, NOT inline_query", async () => {
		let roleCalls = 0;
		let capturedMsgRole: unknown;
		let capturedCbRole: unknown;
		let capturedInlineRole: unknown;

		const trackedWithRole = new Composer({ name: "trackedWithRole" })
			.derive(["message", "callback_query"], () => {
				roleCalls++;
				return { role: "user" as RoleKind };
			})
			.as("scoped");

		const testBot = new Bot(TOKEN)
			.extend(trackedWithRole)
			.on("message", (ctx) => {
				capturedMsgRole = (ctx as any).role;
			})
			.on("callback_query", (ctx) => {
				capturedCbRole = (ctx as any).role;
			})
			.on("inline_query", (ctx) => {
				capturedInlineRole = (ctx as any).role;
			});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(testBot);
		const alice = env.createUser({ first_name: "Alice" });

		await alice.sendMessage("hi");
		expect(capturedMsgRole).toBe("user");
		expect(roleCalls).toBe(1);

		const msg = await alice.sendMessage("click"); // 2nd message → roleCalls = 2
		await alice.on(msg).click("data"); //            callback_query → roleCalls = 3
		expect(capturedCbRole).toBe("user");
		expect(roleCalls).toBe(3);

		await alice.sendInlineQuery("search"); // inline_query → derive does NOT run
		expect(capturedInlineRole).toBeUndefined();
		expect(roleCalls).toBe(3); // unchanged
	});

	test("Plugin derives (global + per-event) stack with Composer derives", async () => {
		let captured: Record<string, unknown> = {};

		const withUserLocal = new Composer({ name: "userLocal" })
			.derive((ctx) => ({ user: fakeDb.getUser((ctx as any).from?.id ?? 0) }))
			.as("scoped");

		const testPlugin = new Plugin("test-session")
			.derive(() => ({ session: { count: 42 } }))
			.derive(["message"], () => ({ messageCount: 7 }));

		const testBot = new Bot(TOKEN)
			.extend(withUserLocal)
			.extend(testPlugin)
			.on("message", (ctx) => {
				captured.user = (ctx as any).user;
				captured.session = (ctx as any).session;
				captured.messageCount = (ctx as any).messageCount;
			});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(testBot);
		const alice = env.createUser({ id: 500, first_name: "Alice" });

		await alice.sendMessage("hi");
		expect(captured.user).toEqual({ id: 500, name: "User_500", isPremium: false });
		expect(captured.session).toEqual({ count: 42 });
		expect(captured.messageCount).toBe(7);
	});

	test("full assembly: bot with all extends delivers all derives in one request", async () => {
		let captured: Record<string, unknown> = {};

		const testBot = new Bot(TOKEN)
			.extend(withUser)
			.extend(withRole)
			.extend(sessionPlugin)
			.on("message", (ctx) => {
				captured.user = (ctx as any).user;
				captured.role = (ctx as any).role;
				captured.session = (ctx as any).session;
				captured.messageCount = (ctx as any).messageCount;
			});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(testBot);
		const alice = env.createUser({ id: 100, first_name: "Alice" });

		await alice.sendMessage("hi");
		expect(captured.user).toEqual({ id: 100, name: "User_100", isPremium: false });
		expect(captured.role).toBe("user");
		expect(captured.session).toEqual({ count: 0 });
		expect(captured.messageCount).toBe(1);
	});

	test(".command() receives ctx.user and ctx.messageCount from extends chain", async () => {
		let capturedUser: unknown;
		let capturedMsgCount: unknown;

		const withUserLocal = new Composer({ name: "cmdUser" })
			.derive((ctx) => ({ user: fakeDb.getUser((ctx as any).from?.id ?? 0) }))
			.as("scoped");

		const testPlugin = new Plugin("cmd-session").derive(["message"], () => ({
			messageCount: 99,
		}));

		const testBot = new Bot(TOKEN)
			.extend(withUserLocal)
			.extend(testPlugin)
			.command("profile", (ctx) => {
				capturedUser = (ctx as any).user;
				capturedMsgCount = (ctx as any).messageCount;
				return ctx.send(`Hi ${(ctx as any).user.name}`);
			});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(testBot);
		const alice = env.createUser({ id: 42, first_name: "Alice" });

		await alice.sendCommand("profile");
		expect(capturedUser).toEqual({ id: 42, name: "User_42", isPremium: false });
		expect(capturedMsgCount).toBe(99);
		expect(env.apiCalls[0]?.method).toBe("sendMessage");
		expect(env.apiCalls[0]?.params).toHaveProperty("text", "Hi User_42");
	});

	test("profileRouter command uses ctx.user from its own extend chain", async () => {
		let capturedName: unknown;

		const withUserLocal = new Composer({ name: "routerUser" })
			.derive((ctx) => ({ user: fakeDb.getUser((ctx as any).from?.id ?? 0) }))
			.as("scoped");

		const router = new Composer({ name: "testRouter" })
			.extend(withUserLocal)
			.command("me", (ctx) => {
				capturedName = (ctx as any).user.name;
				return ctx.send(`Name: ${(ctx as any).user.name}`);
			});

		const testBot = new Bot(TOKEN).extend(withUserLocal).extend(router);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(testBot);
		const alice = env.createUser({ id: 77, first_name: "Alice" });

		await alice.sendCommand("me");
		expect(capturedName).toBe("User_77");
		expect(env.apiCalls[0]?.params).toHaveProperty("text", "Name: User_77");
	});

	test("filters.text + scoped global derive: ctx.user and ctx.text both available", async () => {
		let capturedText: unknown;
		let capturedUser: unknown;

		const withUserLocal = new Composer({ name: "filterUser" })
			.derive((ctx) => ({ user: fakeDb.getUser((ctx as any).from?.id ?? 0) }))
			.as("scoped");

		const testBot = new Bot(TOKEN)
			.extend(withUserLocal)
			.on(filters.text, (ctx) => {
				capturedText = ctx.text;
				capturedUser = (ctx as any).user;
			});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(testBot);
		const bob = env.createUser({ id: 7, first_name: "Bob" });

		await bob.sendMessage("hello there");
		expect(capturedText).toBe("hello there");
		expect(capturedUser).toEqual({ id: 7, name: "User_7", isPremium: false });
	});

	test("i18n pattern: per-event derive('message', fn) visible in .command() after fix", async () => {
		let capturedTranslation: unknown;

		// Exact pattern from the reported issue
		const i18nComposer = new Composer({ name: "i18n-rt" })
			.derive("message", (ctx) => ({
				t: (key: string) => `[${(ctx as any).from?.language_code ?? "en"}] ${key}`,
			}))
			.as("scoped");

		const startPlugin = new Composer({ name: "start-rt" })
			.extend(i18nComposer)
			.command("start", (ctx) => {
				capturedTranslation = (ctx as any).t("welcome");
				return ctx.send((ctx as any).t("welcome"));
			});

		const testBot = new Bot(TOKEN).extend(i18nComposer).extend(startPlugin);

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(testBot);
		const alice = env.createUser({ first_name: "Alice" });

		await alice.sendCommand("start");
		expect(typeof capturedTranslation).toBe("string");
		expect(capturedTranslation).toMatch(/welcome/);
	});

	test("deep chain: Plugin → Composer → Bot — derives survive all layers", async () => {
		let capturedValues: Record<string, unknown> = {};

		// Layer 1: plugin with global derive
		const dbPlugin = new Plugin("db").derive(() => ({ db: { version: "1.0" } }));

		// Layer 2: composer extends plugin, adds per-event derive
		const requestComposer = new Composer({ name: "request" })
			.extend(dbPlugin)
			.derive(["message", "callback_query"], () => ({ requestId: "req-123" }))
			.as("scoped");

		// Layer 3: feature router extends both
		const featureRouter = new Composer({ name: "feature" }).extend(requestComposer);

		// Layer 4: bot assembles everything
		const testBot = new Bot(TOKEN)
			.extend(dbPlugin) //       plugin first (gets deduped in requestComposer)
			.extend(requestComposer) // requestId on message + callback_query
			.extend(featureRouter) //  requestComposer inside is deduped
			.on("message", (ctx) => {
				capturedValues.db = (ctx as any).db;
				capturedValues.requestId = (ctx as any).requestId;
			});

		// @ts-expect-error source Bot vs packaged AnyBot
		const env = new TelegramTestEnvironment(testBot);
		const alice = env.createUser({ first_name: "Alice" });

		await alice.sendMessage("test");
		expect(capturedValues.db).toEqual({ version: "1.0" });
		expect(capturedValues.requestId).toBe("req-123");
	});
});
