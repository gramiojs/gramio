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

- **Bot** (`bot.ts`, ~1300 lines) — Main class. Holds the API proxy (`bot.api.*`), update handlers (`.on()`, `.command()`, `.hears()`, `.callbackQuery()`, `.reaction()`, `.inlineQuery()`, `.startParameter()`), plugin system (`.extend()`), derive system (`.derive()`, `.decorate()`), hooks, and lifecycle (`.start()`, `.stop()`). `.on()` has 5 overloads: filter-only type-narrowing, filter-only boolean, event+type-narrowing filter, event+boolean filter, and event-only (no filter).
- **Plugin** (`plugin.ts`) — Same handler/hook/derive API as Bot for composability. Plugins merge their types into the bot instance. Has dependency management between plugins. `.on()` mirrors Bot's 5 overloads.
- **Filters** (`filters.ts`) — Standalone predicate functions for narrowing context types in `.on()` handlers. Exports `Filter` type and `filters` object with built-in filters (attachment, text, caption, chat, from, regex, etc.) and composition (`and`, `or`, `not`). Filters use `any` as input type with intersection-based narrowing (`ContextType<T> & Narrowing`) so the handler preserves the full context type while adding type narrowing.
- **Composer** (`composer.ts`) — Middleware chain built on `middleware-io`. Sequential execution with `next()`. Both `.on(updateName, handler)` and `.use(handler)`.
- **Updates** (`updates.ts`) — Long-polling manager. `.handleUpdate()` dispatches a single update through the middleware chain.
- **UpdateQueue** (`queue.ts`) — Concurrent update processing queue with graceful shutdown support.
- **Webhook handler** (`webhook/`) — `webhookHandler()` function with adapters for Fastify, Elysia, Hono, Express, Koa, Bun.serve, Cloudflare Workers, std/http, node:http.

### Hook system (6 hooks)

`preRequest` (before API calls, mutable) → `onResponse` / `onResponseError` (after API calls) → `onError` (handler errors, type-safe with custom error kinds) → `onStart` / `onStop` (lifecycle).

### Re-exported packages

`src/index.ts` re-exports from `@gramio/contexts`, `@gramio/files`, `@gramio/keyboards`, `@gramio/types`, `@gramio/format`, `@gramio/callback-data`, and `./filters.js`. Changes to context types, file handling, keyboards, or formatting live in those separate packages.

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

### What we test

Tests here verify **GramIO framework behavior** — handlers, hooks, plugins, middleware, derives, error handling. `@gramio/test` is just a helper that simulates Telegram updates without real HTTP; its own features (UserObject, ChatObject, etc.) are tested in its own repository. Do not write tests whose sole purpose is to verify that `@gramio/test` works.

### Keeping tests up to date

When modifying bot behavior (handlers, hooks, plugins, middleware), update or add corresponding tests in `tests/`. The main behavioral test file is `tests/gramio-test.test.ts` — it uses `@gramio/test` (`TelegramTestEnvironment`) to simulate users, chats, messages, and callback queries without real HTTP requests.

### Testing patterns with @gramio/test

- **Preferred style**: Use the fluent scoped API — `user.on(msg).react("👍")`, `user.on(msg).click("data")`, `user.in(chat).sendMessage("text")` — rather than the lower-level positional overloads.
- **Simple messages/hears/callbacks**: Use `user.sendMessage(text)` and `user.on(msg).click(data)`.
- **Reactions**: Use `user.react(emojis, msg)` or `user.on(msg).react(emoji)`.
- **Inline queries**: Use `user.sendInlineQuery(query)` or `user.in(chat).sendInlineQuery(query)`.
- **Chosen inline results**: Use `user.chooseInlineResult(resultId, query)`.
- **Command handlers**: Commands require `entities` with `type: "bot_command"`. Use the `emitCommand()` helper or `env.emitUpdate()` with explicit entities — `user.sendMessage("/start")` alone won't trigger `.command()` handlers.
- **API call assertions**: Check `env.apiCalls` array for `{ method, params, response }`.
- **Error simulation**: Use `apiError(code, description)` with `env.onApi()`.
- **Source Bot vs packaged AnyBot**: When passing `new Bot()` to `TelegramTestEnvironment`, add `// @ts-expect-error source Bot vs packaged AnyBot` since the source `Bot` class has separate private property declarations from the packaged `AnyBot` type.
- **Filter tests** (`tests/filters.test.ts`): Tests for the `filters` system. Uses `env.emitUpdate()` with raw `TelegramMessage` objects (photoMessage, textMessage, captionPhotoMessage helpers) since filters need specific message shapes. Type-level tests use `expectTypeOf` inside `.on()` handlers to verify both context preservation (`ctx.reply`, `ctx.send`) and type narrowing (`ctx.attachment` as `PhotoAttachment`, `ctx.text` as `string`).

### Filters design notes

- `Filter<In, Out>` type — built-in filters use `In = any` so they're compatible with any bot's context type regardless of generics/derives.
- `.on()` event-based type-narrowing overload: `on<T, Narrowing>(name, filter: (ctx: any) => ctx is Narrowing, handler: Handler<ContextType<this, T> & Narrowing>)` — handler gets intersection of full context + narrowing.
- `.on()` filter-only overload: `on(filter, handler)` — no event name. Type-narrowing filters give handler `ContextType<Bot, CompatibleUpdates<Bot, Narrowing>> & Derives["global"] & Narrowing` — a union of all compatible context types (e.g. message-like contexts for `filters.text`) intersected with the narrowing. This means `ctx.send`, `ctx.text`, etc. are available when appropriate. `CompatibleUpdates<B, Narrowing>` is a local mapped type in `bot.ts`/`plugin.ts` that resolves which `UpdateName` values have all keys from `Narrowing`. Boolean filters give `Context<Bot> & Derives["global"]` (base class, no narrowing).
- Boolean filters (`from`, `chatId`, `not`) return `(ctx: any) => boolean` (not a type predicate), matching the boolean overload which preserves the full context without narrowing.
- `Require`/`RequireValue` from `@gramio/contexts` can't be used in filter output types because `Omit` strips class private properties. Use intersection (`{ attachment: PhotoAttachment }`) instead.
