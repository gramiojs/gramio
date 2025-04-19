import type { BotLike, ContextType, User } from "@gramio/contexts";
import { expectTypeOf } from "expect-type";
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
