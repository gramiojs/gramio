import type {
	APIMethodParams,
	APIMethods,
	TelegramAPIResponseError,
	TelegramResponseParameters,
} from "@gramio/types";

export const ErrorKind = Symbol("ErrorKind");

export class TelegramError<T extends keyof APIMethods> extends Error {
	method: T;
	params: APIMethodParams<T>;
	code: number;
	payload?: TelegramResponseParameters;

	constructor(
		error: TelegramAPIResponseError,
		method: T,
		params: APIMethodParams<T>,
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
