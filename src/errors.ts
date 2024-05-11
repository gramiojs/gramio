import type {
	APIMethodParams,
	APIMethods,
	TelegramAPIResponseError,
	TelegramResponseParameters,
} from "@gramio/types";
import type { MaybeSuppressedParams } from "./types";

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
	) {
		super(error.description);

		this.name = method;
		this.method = method;
		this.params = params;
		this.code = error.error_code;

		if (error.parameters) this.payload = error.parameters;
	}
}

//@ts-expect-error
TelegramError.constructor[ErrorKind] = "TELEGRAM";
