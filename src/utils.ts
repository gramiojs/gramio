/**
 * @module
 *
 * Pack of useful utilities for Telegram Bot API and GramIO
 */

import { TelegramError } from "./errors.ts";
import { sleep } from "./utils.internal.ts";

type SuppressResult<T> =
	| { value: T; caught: false }
	| { value: unknown; caught: true };

async function suppressError<T>(
	fn: () => Promise<T>,
): Promise<SuppressResult<T>> {
	try {
		return { value: await fn(), caught: false };
	} catch (error) {
		return { value: error, caught: true };
	}
}

export async function withRetries<Result>(
	resultPromise: () => Promise<Result>,
): Promise<Result> {
	let state = await suppressError(resultPromise);

	while (state.value instanceof TelegramError) {
		const retryAfter = state.value.payload?.retry_after;

		if (retryAfter) {
			await sleep(retryAfter * 1000);
			state = await suppressError(resultPromise);
		} else {
			if (state.caught) throw state.value;
			return state.value;
		}
	}

	if (state.caught) throw state.value;

	return state.value;
}
