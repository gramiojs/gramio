import { beforeEach, describe, expect, mock, test } from "bun:test";
import { TelegramError } from "../src/errors.ts";
import { withRetries } from "../src/utils.ts";

describe("utils", () => {
	describe("withRetries", () => {
		let isErrorReturned = false;

		const mockApi = mock(async (success = true, suppress = false) => {
			if (!success && !isErrorReturned) {
				const error = new TelegramError(
					{
						ok: false,
						description: "test",
						error_code: 429,
						parameters: { retry_after: 0.01 },
					},
					"sendMessage",
					{
						chat_id: 1,
						text: "test",
					},
				);

				isErrorReturned = true;

				if (suppress) return error;

				throw error;
			}

			return "success";
		});

		beforeEach(() => {
			mockApi.mockClear();
			isErrorReturned = false;
		});

		test("Should return success", async () => {
			const result = await withRetries(() => mockApi(true));

			expect(result).toBe("success");
		});

		test("Should retry on error", async () => {
			const result = await withRetries(() => mockApi(false));

			expect(result).toBe("success");

			expect(mockApi).toHaveBeenCalledTimes(2);
		});

		test("Should suppress errors", async () => {
			const result = await withRetries(() => mockApi(false, true));

			expect(result).toBe("success");
		});

		test("Should consider retry_after", async () => {
			const error = new TelegramError(
				{
					ok: false,
					description: "test",
					error_code: 429,
					parameters: { retry_after: 0.01 },
				},
				"sendMessage",
				{
					chat_id: 1,
					text: "test",
				},
			);
			let isErrorReturned = false;

			const failingApi = mock(async () => {
				if (!isErrorReturned) {
					isErrorReturned = true;

					throw error;
				}

				return "success";
			});
			console.log("start");

			const start = Date.now();
			await withRetries(() => failingApi());
			const duration = Date.now() - start;

			expect(duration).toBeGreaterThanOrEqual(8);
			expect(failingApi).toHaveBeenCalledTimes(2);
		});

		test("Should rethrow non-Telegram errors", async () => {
			const error = new Error("Critical error");
			const failingApi = mock(async () => {
				throw error;

				// biome-ignore lint/correctness/noUnreachable: <explanation>
				return "success";
			});

			// TODO: https://github.com/oven-sh/bun/issues/16144
			expect(
				(async () => {
					const result = await withRetries(() => failingApi());

					console.log("result", result);
				})(),
			).rejects.toThrow(error);

			expect(failingApi).toHaveBeenCalledTimes(1);
		});
	});
});
