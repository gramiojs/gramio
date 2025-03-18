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

function convertToString(value: unknown): string {
	const typeOfValue = typeof value;

	// wtf
	if (typeOfValue === "string") return value as string;
	if (typeOfValue === "object") return JSON.stringify(value);
	return String(value);
}

export function simplifyObject(obj: Record<any, any>) {
	const result: Record<string, string> = {};

	for (const [key, value] of Object.entries(obj)) {
		const typeOfValue = typeof value;

		if (value === undefined || value === null || typeOfValue === "function")
			continue;

		result[key] = convertToString(value);
	}

	return result;
}

export const IS_BUN = typeof Bun !== "undefined";
