// INFO: Temp polyfill, more info https://github.com/microsoft/TypeScript/issues/55453#issuecomment-1687496648
(Symbol as any).metadata ??= Symbol("Symbol.metadata");

export * from "./bot";
export * from "./errors";
export * from "./types";
export * from "./plugin";
export * from "./webhook";

export * from "@gramio/contexts";
export * from "@gramio/files";
export * from "@gramio/keyboards";
export * from "@gramio/types";
export * from "@gramio/format";
export * from "@gramio/callback-data";
