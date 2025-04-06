/**
 * @module
 *
 * Pack of useful utilities for Telegram Bot API and GramIO
 */

import { TelegramError } from "./errors.ts";
import { sleep } from "./utils.internal.ts";

async function suppressError<T>(
	fn: () => Promise<T>,
): Promise<[T | unknown, boolean]> {
	try {
		return [await fn(), false];
	} catch (error) {
		return [error, true];
	}
}

export async function withRetries<Result extends Promise<unknown>>(
	resultPromise: () => Result,
): Promise<Result> {
	let [result, isFromCatch] = await suppressError(resultPromise);

	while (result instanceof TelegramError) {
		const retryAfter = result.payload?.retry_after;

		if (retryAfter) {
			await sleep(retryAfter * 1000);
			[result, isFromCatch] = await suppressError(resultPromise);
		} else {
			if (isFromCatch) throw result;

			// TODO: hard conditional typings. fix later
			// @ts-expect-error
			return result;
		}
	}

	if (result instanceof Error && isFromCatch) throw result;

	// @ts-expect-error
	return result;
}
