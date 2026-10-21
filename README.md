# GramIO

<div align="center">

[![Bot API](https://img.shields.io/badge/Bot%20API-9.5-blue?logo=telegram&style=flat&labelColor=000&color=3b82f6)](https://core.telegram.org/bots/api)
[![npm](https://img.shields.io/npm/v/gramio?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/gramio)
[![npm downloads](https://img.shields.io/npm/dw/gramio?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/gramio)
[![JSR](https://jsr.io/badges/@gramio/core)](https://jsr.io/@gramio/core)
[![JSR Score](https://jsr.io/badges/@gramio/core/score)](https://jsr.io/@gramio/core)

</div>

TypeScript/JavaScript Telegram Bot API Framework for create your bots with convenience!

✨ **Extensible** - Our [plugin](https://gramio.dev/plugins/) and [hook](https://gramio.dev/hooks/overview) system is awesome

🛡️ **Type-safe** - Written in TypeScript with love ❤️

🌐 **Multi-runtime** - Works on [Node.js](https://nodejs.org/), [Bun](https://bun.sh/) and [Deno](https://deno.com/)

⚙️ **Code-generated** - Many parts are code-generated (for example, [code-generated and auto-published Telegram Bot API types](https://github.com/gramiojs/types))

## [Get started](https://gramio.dev/get-started)

To create your new bot, you just need to write it to the console:

```bash [npm]
npm create gramio@latest ./bot
```

and GramIO customize your project the way you want it!

### Example

```typescript
import { Bot } from "gramio";

const bot = new Bot(process.env.TOKEN as string)
    .command("start", (context) => context.send("Hello!"))
    .onStart(({ info }) => console.log(`✨ Bot ${info.username} was started!`));

bot.start();
```

For more, please see [documentation](https://gramio.dev).

### Long-polling request deadlines

Every `getUpdates` HTTP request has a client-side deadline covering both the
response headers and body: the Telegram `timeout` (in seconds) plus a 15-second
allowance. Default polling uses `timeout: 30`, giving a 45-second deadline.
Stalled polls are aborted and retried without advancing the update offset.

Configure the allowance in milliseconds for slower networks or local Bot API
servers:

```typescript
const bot = new Bot(process.env.TOKEN as string, {
    api: { getUpdatesTimeoutAllowance: 20_000 },
});

bot.start({ longPolling: { timeout: 30 } }); // 50-second HTTP deadline
```

The deadline also applies to direct `bot.api.getUpdates()` calls and
`dropPendingUpdates`. It composes with `api.fetchOptions.signal` and does not
change other API methods. The allowance must be finite and nonnegative, and the
total deadline must not exceed 2,147,483,647 milliseconds.

### GramIO in action

Example which uses some interesting features.

```ts
import { Bot, format, bold, code } from "gramio";
import { findOrRegisterUser } from "./utils";

const bot = new Bot(process.env.BOT_TOKEN as string)
    .derive("message", async () => {
        const user = await findOrRegisterUser();

        return {
            user,
        };
    })
    .on("message", (context) => {
        context.user; // typed

        return context.send(format`
        Hi, ${bold(context.user.name)}! 
        You balance: ${code(context.user.balance)}`);
    });
```
