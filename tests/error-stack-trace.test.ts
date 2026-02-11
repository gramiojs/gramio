import { afterEach, describe, expect, mock, test } from "bun:test";
import { Bot } from "../src/bot.ts";
import { TelegramError } from "../src/errors.ts";

const TOKEN = "test-token";
const originalFetch = globalThis.fetch;

function mockFetchError(description = "Bad Request", error_code = 400) {
	const fn = mock(() =>
		Promise.resolve(
			new Response(JSON.stringify({ ok: false, description, error_code }), {
				headers: { "Content-Type": "application/json" },
			}),
		),
	);
	globalThis.fetch = fn as any;
	return fn;
}

describe("Error stack trace preservation", () => {
	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	test("stack trace includes the original call site when error is thrown", async () => {
		mockFetchError("Chat not found", 404);

		const bot = new Bot(TOKEN);

		try {
			await bot.api.sendMessage({ chat_id: 123, text: "test" }); // This line should appear in stack
			expect.unreachable("Should have thrown an error");
		} catch (err) {
			expect(err).toBeInstanceOf(TelegramError);

			const error = err as TelegramError<"sendMessage">;
			expect(error.stack).toBeDefined();

			// The stack should include this test file
			expect(error.stack).toContain("error-stack-trace.test.ts");

			// The stack should reference the line where we called sendMessage
			// (allow some flexibility in line numbers due to formatting)
			expect(error.stack).toMatch(/error-stack-trace\.test\.ts:\d+:\d+/);

			// The stack should NOT only contain Proxy internals or _callApi
			// It should start with the method name and show our call site
			expect(error.stack).toContain("sendMessage: Chat not found");
		}
	});

	test("stack trace includes original call site with suppress: true", async () => {
		mockFetchError("Forbidden", 403);

		const bot = new Bot(TOKEN);

		const result = await bot.api.sendMessage({
			chat_id: 456,
			text: "test",
			suppress: true,
		}); // This line should appear in stack

		expect(result).toBeInstanceOf(TelegramError);

		const error = result as TelegramError<"sendMessage">;
		expect(error.stack).toBeDefined();
		expect(error.stack).toContain("error-stack-trace.test.ts");
		expect(error.stack).toMatch(/error-stack-trace\.test\.ts:\d+:\d+/);
	});

	test("stack trace is preserved across different API methods", async () => {
		mockFetchError("Invalid file_id", 400);

		const bot = new Bot(TOKEN);

		try {
			await bot.api.getFile({ file_id: "invalid" }); // Different method, stack should still work
			expect.unreachable("Should have thrown an error");
		} catch (err) {
			const error = err as TelegramError<"getFile">;

			expect(error.stack).toContain("error-stack-trace.test.ts");
			expect(error.stack).toContain("getFile: Invalid file_id");

			// Should not expose internal implementation details prominently
			const stackLines = error.stack?.split("\n") || [];
			// First few lines after the error message should be from our code, not Proxy internals
			const firstStackFrame = stackLines[1] || "";
			expect(firstStackFrame).toContain("error-stack-trace.test.ts");
		}
	});

	test("stack trace works when called through helper function", async () => {
		mockFetchError("Method not allowed", 405);

		const bot = new Bot(TOKEN);

		async function helperFunction() {
			await bot.api.sendMessage({ chat_id: 789, text: "helper" }); // This line should appear
		}

		try {
			await helperFunction();
			expect.unreachable("Should have thrown an error");
		} catch (err) {
			const error = err as TelegramError<"sendMessage">;

			expect(error.stack).toBeDefined();
			expect(error.stack).toContain("error-stack-trace.test.ts");

			// Should show both the helper function and the test
			// The important part is that it shows OUR code, not just internals
			const stackLines = error.stack?.split("\n") || [];
			const hasTestFile = stackLines.some((line) =>
				line.includes("error-stack-trace.test.ts"),
			);
			expect(hasTestFile).toBe(true);
		}
	});

	test("original error message and method name are preserved", async () => {
		mockFetchError("Custom error message", 418);

		const bot = new Bot(TOKEN);

		const result = await bot.api.sendPhoto({
			chat_id: 111,
			photo: "file_id",
			suppress: true,
		});

		expect(result).toBeInstanceOf(TelegramError);

		const error = result as TelegramError<"sendPhoto">;
		expect(error.message).toBe("Custom error message");
		expect(error.method).toBe("sendPhoto");
		expect(error.code).toBe(418);
		expect(error.name).toBe("sendPhoto");

		// Stack should start with method name and message
		expect(error.stack).toMatch(/^sendPhoto: Custom error message/);
	});
});
