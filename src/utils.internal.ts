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

export const $debugger = debug("gramio");
export const debug$api = $debugger.extend("api");
export const debug$updates = $debugger.extend("updates");
