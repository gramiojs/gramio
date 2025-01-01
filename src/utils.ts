import type { APIMethodReturn, APIMethods } from "@gramio/types";
import { TelegramError } from "./errors.ts";
import type {
	MaybeSuppressedReturn,
	SuppressedAPIMethodReturn,
} from "./types.ts";

// cant use node:timers/promises because possible browser usage...
export const sleep = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

// TODO: improve types. suppress should be required
export async function withRetries<
	Result extends Promise<unknown>,
	Mode extends "suppress" | "rethrow" = "suppress",
>(
	resultPromise: () => Result,
	mode: Mode = "suppress" as Mode,
): Promise<Result> {
	let result = await resultPromise().catch((error) => error);

	while (result instanceof TelegramError) {
		const retryAfter = result.payload?.retry_after;
		console.log(result.method, retryAfter);

		if (retryAfter) {
			await sleep(retryAfter * 1000);
			result = await resultPromise();
		} else {
			if (mode === "rethrow") throw result;

			// TODO: hard conditional typings. fix later
			// @ts-expect-error
			return result;
		}
	}

	// TODO: find why it miss types. but it works as expected
	// @ts-expect-error this is fine
	return result;
}
