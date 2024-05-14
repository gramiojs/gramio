# GramIO

[![Bot API](https://img.shields.io/badge/Bot%20API-7.3-blue?logo=telegram&style=flat&labelColor=000&color=3b82f6)](https://core.telegram.org/bots/api)
[![npm](https://img.shields.io/npm/v/gramio?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/gramio)
[![JSR](https://jsr.io/badges/@gramio/core)](https://jsr.io/@gramio/core)
[![JSR Score](https://jsr.io/badges/@gramio/core/score)](https://jsr.io/@gramio/core)


Work in progress.

Currently support Bot API 7.3

See [Documentation](https://gramio.dev/)

## Usage

```ts
import { Bot } from "gramio";

const bot = new Bot("") // put you token here
    .command("start", (context) => context.send("Hi!"))
    .onError(console.error)
    .onStart(console.log);

bot.start();
```