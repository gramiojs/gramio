import debug from "debug";

// cant use node:timers/promises because possible browser usage...
export const sleep = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

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

export const debug$api = debug("gramio:api");
export const debug$updates = debug("gramio:updates");

export type MaybeArray<T> = T | T[] | ReadonlyArray<T>;

export function timeoutWebhook(
	task: Promise<unknown>,
	timeout: number,
	mode: "throw" | "return",
) {
	return new Promise((resolve, reject) => {
		const timeoutTask = setTimeout(() => {
			if (mode === "throw") {
				reject(
					new Error(`Webhook handler execution timed out after ${timeout}ms`),
				);
			} else {
				resolve(undefined);
			}
		}, timeout);

		task
			.then(resolve)
			.catch(reject)
			.finally(() => clearTimeout(timeoutTask));
	});
}
