import type { BotLike, ContextType, UpdateName, User } from "@gramio/contexts";
import { expectTypeOf } from "expect-type";
import { Bot } from "../../src/bot.ts";
import { Plugin } from "../../src/plugin.ts";

{
	const plugin = new Plugin("test");

	expectTypeOf<typeof plugin>().toBeObject();

	plugin
		.derive("message", (context) => {
			expectTypeOf<typeof context>().toEqualTypeOf<
				ContextType<BotLike, "message">
			>();
			expectTypeOf<typeof context.from>().toEqualTypeOf<User>();

			return {
				someThing: "plugin1" as const,
			};
		})
		.derive("message", (context) => {
			expectTypeOf<typeof context>().toBeObject();
			expectTypeOf<typeof context.from>().toEqualTypeOf<User>();

			expectTypeOf<typeof context.someThing>().toEqualTypeOf<"plugin1">();

			return {
				someThing: "plugin2" as const,
			};
		});
}

{
	const events = [
		"message",
		"callback_query",
		"chat_member",
	] as const satisfies UpdateName[];

	const bot = new Bot("test")
		.derive(events, (context) => {
			expectTypeOf<typeof context>().toBeObject();
			expectTypeOf<typeof context.from>().toEqualTypeOf<User>();

			return {
				contextUser: context.from,
			};
		})
		.on(events, (context) => {
			expectTypeOf<typeof context>().toBeObject();
			expectTypeOf<typeof context.from>().toEqualTypeOf<User>();

			expectTypeOf<typeof context.contextUser>().toEqualTypeOf<User>();
		});

	const plugin = new Plugin("test")
		.derive(events, (context) => {
			expectTypeOf<typeof context>().toBeObject();
			expectTypeOf<typeof context.from>().toEqualTypeOf<User>();

			return {
				contextUser: context.from,
			};
		})
		.on(events, (context) => {
			expectTypeOf<typeof context>().toBeObject();
			expectTypeOf<typeof context.from>().toEqualTypeOf<User>();

			expectTypeOf<typeof context.contextUser>().toEqualTypeOf<User>();
		});

	bot.extend(plugin);
}
