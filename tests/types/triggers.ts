import { CallbackData } from "@gramio/callback-data";
import { expectTypeOf } from "expect-type";
import { Bot } from "../../src/bot.ts";

{
	const bot = new Bot("test")
		.command(["a", "b"], (context) => {
			expectTypeOf<typeof context>().toBeObject();
		})
		.command("a", (context) => {
			expectTypeOf<typeof context>().toBeObject();
		})
		.callbackQuery("a", (context) => {
			expectTypeOf<typeof context>().toBeObject();
		})
		.callbackQuery(new CallbackData("test").number("test"), (context) => {
			expectTypeOf<typeof context>().toBeObject();
			expectTypeOf<typeof context.queryData>().toEqualTypeOf<{
				test: number;
			}>();
		})
		.hears("a", (context) => {
			expectTypeOf<typeof context>().toBeObject();
		})
		.hears(/test (.*)/, (context) => {
			expectTypeOf<typeof context>().toBeObject();
			expectTypeOf<
				typeof context.args
			>().toEqualTypeOf<RegExpMatchArray | null>();
		})
		.inlineQuery(
			"a",
			(context) => {
				expectTypeOf<typeof context>().toBeObject();
			},
			{
				onResult: (context) => {
					expectTypeOf<typeof context>().toBeObject();
				},
			},
		)
		.chosenInlineResult("a", (context) => {
			expectTypeOf<typeof context>().toBeObject();
		});
}
