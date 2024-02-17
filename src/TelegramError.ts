import {
	ApiMethods,
	TelegramAPIResponseError,
	TelegramResponseParameters,
} from "@gramio/types";

export class TelegramError<T extends keyof ApiMethods> extends Error {
	method: T;
	params: Parameters<ApiMethods[T]>[0];
	code: number;
	payload?: TelegramResponseParameters;

	constructor(
		error: TelegramAPIResponseError,
		method: T,
		params: Parameters<ApiMethods[T]>[0],
	) {
		super(error.description);

		this.name = method;
		this.method = method;
		this.params = params;
		this.code = error.error_code;

		if (error.parameters) this.payload = error.parameters;
	}
}
