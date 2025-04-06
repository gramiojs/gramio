import { TelegramError } from "./errors.ts";

// cant use node:timers/promises because possible browser usage...
export const sleep = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

export async function withRetries<Result extends Promise<unknown>>(
	resultPromise: () => Result,
): Promise<Result> {
	let [result, isFromCatch] = await resultPromise()
		.then((result) => [result, true] as const)
		.catch((error) => [error, false] as const);

	const mode = isFromCatch ? "suppress" : "rethrow";

	while (result instanceof TelegramError) {
		const retryAfter = result.payload?.retry_after;

		if (retryAfter) {
			await sleep(retryAfter * 1000);
			result = await resultPromise().catch((error) => error);
		} else {
			if (mode === "rethrow") throw result;

			// TODO: hard conditional typings. fix later
			// @ts-expect-error
			return result;
		}
	}

	if (result instanceof Error) throw result;

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
