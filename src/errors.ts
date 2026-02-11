import type {
	APIMethodParams,
	APIMethods,
	TelegramAPIResponseError,
	TelegramResponseParameters,
} from "@gramio/types";
import type { MaybeSuppressedParams } from "./types.js";

/** Symbol to determine which error kind is it */
export const ErrorKind: symbol = Symbol("ErrorKind");

/** Represent {@link TelegramAPIResponseError} and thrown in API calls */
export class TelegramError<T extends keyof APIMethods> extends Error {
	/** Name of the API Method */
	method: T;
	/** Params that were sent */
	params: MaybeSuppressedParams<T>;
	/** See  {@link TelegramAPIResponseError.error_code}*/
	code: number;
	/** Describes why a request was unsuccessful. */
	payload?: TelegramResponseParameters;

	/** Construct new TelegramError */
	constructor(
		error: TelegramAPIResponseError,
		method: T,
		params: MaybeSuppressedParams<T>,
		callSite?: Error,
	) {
		super(error.description);

		this.name = method;
		this.method = method;
		this.params = params;
		this.code = error.error_code;

		if (error.parameters) this.payload = error.parameters;

		// Restore stack trace from the original call site
		if (callSite?.stack) {
			// Extract the relevant part of the call site stack (skip the first line which is the error message)
			const callSiteLines = callSite.stack.split("\n");
			// Skip the first line (error message) and get the actual stack frames
			const relevantFrames = callSiteLines.slice(1);

			// Replace our stack with the call site stack
			// This makes the error appear as if it was thrown from the user's code
			this.stack = `${this.name}: ${this.message}\n${relevantFrames.join("\n")}`;
		}
	}
}

//@ts-expect-error
TelegramError.constructor[ErrorKind] = "TELEGRAM";
