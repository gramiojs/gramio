import { expectTypeOf } from "expect-type";
import { Bot } from "../../src/bot.ts";
import { Plugin } from "../../src/plugin.ts";
import { webhookHandler } from "../../src/webhook/index.ts";

// ── webhookHandler must accept a plain Bot ───────────────────────────────────
{
	const bot = new Bot("test");
	const handler = webhookHandler(bot, "Bun.serve");
	expectTypeOf<typeof handler>().toBeFunction();
}

// ── webhookHandler must accept a Bot with derives (no `as any` needed) ───────
{
	const bot = new Bot("test").derive(() => ({ myProp: "x" as const }));
	webhookHandler(bot, "Bun.serve");
	webhookHandler(bot, "fastify");
	webhookHandler(bot, "elysia");
	webhookHandler(bot, "hono");
	webhookHandler(bot, "express");
	webhookHandler(bot, "koa");
	webhookHandler(bot, "std/http");
	webhookHandler(bot, "http");
	webhookHandler(bot, "cloudflare");
	webhookHandler(bot, "Request");
}

// ── webhookHandler must accept a Bot extended with a plugin that adds derives ─
{
	const plugin = new Plugin("test").derive(() => ({
		pluginProp: 42 as const,
	}));
	const bot = new Bot("test")
		.extend(plugin)
		.derive(() => ({ botProp: "y" as const }));

	webhookHandler(bot, "Bun.serve");
}

// ── webhookHandler must accept a Bot with custom errors ──────────────────────
{
	class AppError extends Error {
		readonly name = "AppError";
	}
	const bot = new Bot("test").error("app", AppError);
	webhookHandler(bot, "Bun.serve");
}

// ── webhookHandler must accept a Bot with macros ─────────────────────────────
{
	const bot = new Bot("test").macro("auth", () => ({
		derive: () => ({ user: { id: 1 } }),
	}));
	webhookHandler(bot, "Bun.serve");
}

// ── webhookHandler must accept a fully-loaded Bot (errors + derives + macros) ─
{
	class AppError extends Error {
		readonly name = "AppError";
	}
	const plugin = new Plugin("p").derive(() => ({ p: 1 as const }));
	const bot = new Bot("test")
		.extend(plugin)
		.error("app", AppError)
		.derive(() => ({ d: "x" as const }))
		.macro("auth", () => ({ derive: () => ({ user: { id: 1 } }) }));

	webhookHandler(bot, "Bun.serve");
	webhookHandler(bot, "fastify", "secret");
	webhookHandler(bot, "hono", { secretToken: "s", shouldWait: true });
}
