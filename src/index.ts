/**
 * @module
 *
 * Powerful Telegram Bot API framework
 */

// INFO: Temp polyfill, more info https://github.com/microsoft/TypeScript/issues/55453#issuecomment-1687496648
(Symbol as any).metadata ??= Symbol("Symbol.metadata");

export * from "@gramio/callback-data";
export * from "@gramio/contexts";
export * from "@gramio/files";
export * from "@gramio/format";
export * from "@gramio/keyboards";
export type * from "@gramio/types";
export * from "./bot.js";
export * from "./composer.js";
export * from "./errors.js";
export * from "./filters.js";
export * from "./plugin.js";
export * from "./types.js";
export * from "./updates.js";
export * from "./webhook/index.js";
