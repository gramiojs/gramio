# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is this?

GramIO — a TypeScript Telegram Bot API framework. Multi-runtime (Node.js, Bun, Deno), type-safe, extensible via plugins and hooks. The npm package is `gramio`, JSR package is `@gramio/core`.

## Commands

```bash
bun test                # Run all tests (Bun's built-in test runner)
bun test tests/foo.test.ts  # Run a single test file
bun run type            # Type-check (tsc --noEmit)
bun run lint            # Lint with Biome
bun run lint:fix        # Auto-fix lint issues
bunx pkgroll            # Build (dual CJS/ESM via pkgroll)
```

## Architecture

### Core classes (all in `src/`)

- **Bot** (`bot.ts`, ~1300 lines) — Main class. Holds the API proxy (`bot.api.*`), update handlers (`.on()`, `.command()`, `.hears()`, `.callbackQuery()`, `.reaction()`, `.inlineQuery()`, `.startParameter()`), plugin system (`.extend()`), derive system (`.derive()`, `.decorate()`), hooks, and lifecycle (`.start()`, `.stop()`).
- **Plugin** (`plugin.ts`) — Same handler/hook/derive API as Bot for composability. Plugins merge their types into the bot instance. Has dependency management between plugins.
- **Composer** (`composer.ts`) — Middleware chain built on `middleware-io`. Sequential execution with `next()`. Both `.on(updateName, handler)` and `.use(handler)`.
- **Updates** (`updates.ts`) — Long-polling manager. `.handleUpdate()` dispatches a single update through the middleware chain.
- **UpdateQueue** (`queue.ts`) — Concurrent update processing queue with graceful shutdown support.
- **Webhook handler** (`webhook/`) — `webhookHandler()` function with adapters for Fastify, Elysia, Hono, Express, Koa, Bun.serve, Cloudflare Workers, std/http, node:http.

### Hook system (6 hooks)

`preRequest` (before API calls, mutable) → `onResponse` / `onResponseError` (after API calls) → `onError` (handler errors, type-safe with custom error kinds) → `onStart` / `onStop` (lifecycle).

### Re-exported packages

`src/index.ts` re-exports from `@gramio/contexts`, `@gramio/files`, `@gramio/keyboards`, `@gramio/types`, `@gramio/format`, `@gramio/callback-data`. Changes to context types, file handling, keyboards, or formatting live in those separate packages.

### Key patterns

- **Heavy generics** — Bot class accumulates type parameters as plugins/derives/errors are chained. Type inference flows through the fluent API.
- **API proxy** — `bot.api` is a Proxy that maps method names to Telegram Bot API calls. Supports `suppress: true` to return error objects instead of throwing.
- **`debug` logging** — Namespaces: `gramio:api`, `gramio:updates`.
- **Runtime detection** — `IS_BUN` constant switches file upload strategy (Bun has optimized paths).
- **Dual package** — pkgroll builds both CJS and ESM from the same source.

## Testing

### Workflow

After making changes, always run:

1. `bun test` — Run all tests. All must pass.
2. `bun run type` — Type-check. Must have no errors.
3. `bun run lint` — Lint with Biome. Must be clean.

### Keeping tests up to date

When modifying bot behavior (handlers, hooks, plugins, middleware), update or add corresponding tests in `tests/`. The main behavioral test file is `tests/gramio-test.test.ts` — it uses `@gramio/test` (`TelegramTestEnvironment`) to simulate users, chats, messages, and callback queries without real HTTP requests.

### Testing patterns with @gramio/test

- **Simple messages/hears/callbacks**: Use `user.sendMessage(text)` and `user.click(data, msg)`.
- **Command handlers**: Commands require `entities` with `type: "bot_command"`. Use the `emitCommand()` helper or `env.emitUpdate()` with explicit entities — `user.sendMessage("/start")` alone won't trigger `.command()` handlers.
- **API call assertions**: Check `env.apiCalls` array for `{ method, params, response }`.
- **Error simulation**: Use `apiError(code, description)` with `env.onApi()`.
- **Source Bot vs packaged AnyBot**: When passing `new Bot()` to `TelegramTestEnvironment`, add `// @ts-expect-error source Bot vs packaged AnyBot` since the source `Bot` class has separate private property declarations from the packaged `AnyBot` type.
