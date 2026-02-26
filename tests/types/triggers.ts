import { CallbackData } from "@gramio/callback-data";
import { expectTypeOf } from "expect-type";
import { Bot } from "../../src/bot.ts";
import { Composer } from "../../src/composer.ts";
import { Plugin } from "../../src/plugin.ts";

// ── Basic trigger smoke tests ─────────────────────────────────────────────────
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
		.hears(["a", "b"], (context) => {
			expectTypeOf<typeof context>().toBeObject();
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

// ── ContextOf propagation: derive flows into shorthand methods ────────────────
{
	const derived = { myProp: "hello" as const };

	// command
	new Bot("test")
		.derive(() => derived)
		.command("start", (ctx) => {
			expectTypeOf<typeof ctx.myProp>().toEqualTypeOf<"hello">();
		});

	// hears (string)
	new Bot("test")
		.derive(() => derived)
		.hears("hi", (ctx) => {
			expectTypeOf<typeof ctx.myProp>().toEqualTypeOf<"hello">();
			expectTypeOf<typeof ctx.args>().toEqualTypeOf<RegExpMatchArray | null>();
		});

	// hears (regexp)
	new Bot("test")
		.derive(() => derived)
		.hears(/foo (.*)/, (ctx) => {
			expectTypeOf<typeof ctx.myProp>().toEqualTypeOf<"hello">();
			expectTypeOf<typeof ctx.args>().toEqualTypeOf<RegExpMatchArray | null>();
		});

	// callbackQuery (string)
	new Bot("test")
		.derive(() => derived)
		.callbackQuery("action", (ctx) => {
			expectTypeOf<typeof ctx.myProp>().toEqualTypeOf<"hello">();
		});

	// inlineQuery
	new Bot("test")
		.derive(() => derived)
		.inlineQuery("q", (ctx) => {
			expectTypeOf<typeof ctx.myProp>().toEqualTypeOf<"hello">();
			expectTypeOf<typeof ctx.args>().toEqualTypeOf<RegExpMatchArray | null>();
		});

	// chosenInlineResult
	new Bot("test")
		.derive(() => derived)
		.chosenInlineResult("r", (ctx) => {
			expectTypeOf<typeof ctx.myProp>().toEqualTypeOf<"hello">();
		});

	// reaction
	new Bot("test")
		.derive(() => derived)
		.reaction("👍", (ctx) => {
			expectTypeOf<typeof ctx.myProp>().toEqualTypeOf<"hello">();
		});

	// startParameter
	new Bot("test")
		.derive(() => derived)
		.startParameter("ref", (ctx) => {
			expectTypeOf<typeof ctx.myProp>().toEqualTypeOf<"hello">();
		});
}

// ── ContextOf propagation: plugin derive flows into bot shorthand methods ─────
{
	const plugin = new Plugin("test").derive(() => ({ fromPlugin: 42 as const }));

	new Bot("test")
		.extend(plugin)
		.command("start", (ctx) => {
			expectTypeOf<typeof ctx.fromPlugin>().toEqualTypeOf<42>();
		});

	new Bot("test")
		.extend(plugin)
		.hears("hi", (ctx) => {
			expectTypeOf<typeof ctx.fromPlugin>().toEqualTypeOf<42>();
		});

	new Bot("test")
		.extend(plugin)
		.callbackQuery("action", (ctx) => {
			expectTypeOf<typeof ctx.fromPlugin>().toEqualTypeOf<42>();
		});
}

// ── ContextOf propagation: multiple chained derives ───────────────────────────
{
	new Bot("test")
		.derive(() => ({ a: 1 as const }))
		.derive(() => ({ b: "two" as const }))
		.command("start", (ctx) => {
			expectTypeOf<typeof ctx.a>().toEqualTypeOf<1>();
			expectTypeOf<typeof ctx.b>().toEqualTypeOf<"two">();
		});

	new Bot("test")
		.derive(() => ({ a: 1 as const }))
		.derive(() => ({ b: "two" as const }))
		.hears(/pattern/, (ctx) => {
			expectTypeOf<typeof ctx.a>().toEqualTypeOf<1>();
			expectTypeOf<typeof ctx.b>().toEqualTypeOf<"two">();
			expectTypeOf<typeof ctx.args>().toEqualTypeOf<RegExpMatchArray | null>();
		});
}

// ── Composer: smoke tests ─────────────────────────────────────────────────────
{
	new Composer()
		.command("start", (ctx) => {
			expectTypeOf<typeof ctx>().toBeObject();
			expectTypeOf<typeof ctx.args>().toEqualTypeOf<string | null>();
		})
		.hears(/foo (.*)/, (ctx) => {
			expectTypeOf<typeof ctx.args>().toEqualTypeOf<RegExpMatchArray | null>();
		})
		.callbackQuery("action", (ctx) => {
			expectTypeOf<typeof ctx>().toBeObject();
			expectTypeOf<typeof ctx.queryData>().toEqualTypeOf<never>();
		})
		.callbackQuery(/cb_(.*)/, (ctx) => {
			expectTypeOf<typeof ctx.queryData>().toEqualTypeOf<RegExpMatchArray>();
		})
		.callbackQuery(new CallbackData("test").number("id"), (ctx) => {
			expectTypeOf<typeof ctx.queryData>().toEqualTypeOf<{ id: number }>();
		})
		.chosenInlineResult("r", (ctx) => {
			expectTypeOf<typeof ctx.args>().toEqualTypeOf<RegExpMatchArray | null>();
		})
		.inlineQuery("q", (ctx) => {
			expectTypeOf<typeof ctx.args>().toEqualTypeOf<RegExpMatchArray | null>();
		});
}

// ── Composer: ContextOf propagation via derive ────────────────────────────────
{
	const derived = { myProp: "hello" as const };

	new Composer()
		.derive(() => derived)
		.command("start", (ctx) => {
			expectTypeOf<typeof ctx.myProp>().toEqualTypeOf<"hello">();
			expectTypeOf<typeof ctx.args>().toEqualTypeOf<string | null>();
		});

	new Composer()
		.derive(() => derived)
		.hears("hi", (ctx) => {
			expectTypeOf<typeof ctx.myProp>().toEqualTypeOf<"hello">();
			expectTypeOf<typeof ctx.args>().toEqualTypeOf<RegExpMatchArray | null>();
		});

	new Composer()
		.derive(() => derived)
		.hears(/foo (.*)/, (ctx) => {
			expectTypeOf<typeof ctx.myProp>().toEqualTypeOf<"hello">();
			expectTypeOf<typeof ctx.args>().toEqualTypeOf<RegExpMatchArray | null>();
		});

	new Composer()
		.derive(() => derived)
		.callbackQuery("action", (ctx) => {
			expectTypeOf<typeof ctx.myProp>().toEqualTypeOf<"hello">();
			expectTypeOf<typeof ctx.queryData>().toEqualTypeOf<never>();
		});

	new Composer()
		.derive(() => derived)
		.inlineQuery("q", (ctx) => {
			expectTypeOf<typeof ctx.myProp>().toEqualTypeOf<"hello">();
			expectTypeOf<typeof ctx.args>().toEqualTypeOf<RegExpMatchArray | null>();
		});

	new Composer()
		.derive(() => derived)
		.chosenInlineResult("r", (ctx) => {
			expectTypeOf<typeof ctx.myProp>().toEqualTypeOf<"hello">();
		});

	new Composer()
		.derive(() => derived)
		.reaction("👍", (ctx) => {
			expectTypeOf<typeof ctx.myProp>().toEqualTypeOf<"hello">();
		});

	new Composer()
		.derive(() => derived)
		.startParameter("ref", (ctx) => {
			expectTypeOf<typeof ctx.myProp>().toEqualTypeOf<"hello">();
		});
}

// ── Composer: multiple chained derives ───────────────────────────────────────
{
	new Composer()
		.derive(() => ({ a: 1 as const }))
		.derive(() => ({ b: "two" as const }))
		.command("start", (ctx) => {
			expectTypeOf<typeof ctx.a>().toEqualTypeOf<1>();
			expectTypeOf<typeof ctx.b>().toEqualTypeOf<"two">();
		});

	new Composer()
		.derive(() => ({ a: 1 as const }))
		.derive(() => ({ b: "two" as const }))
		.hears(/pattern/, (ctx) => {
			expectTypeOf<typeof ctx.a>().toEqualTypeOf<1>();
			expectTypeOf<typeof ctx.b>().toEqualTypeOf<"two">();
			expectTypeOf<typeof ctx.args>().toEqualTypeOf<RegExpMatchArray | null>();
		});
}
