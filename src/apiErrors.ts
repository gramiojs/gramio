import { APIResponseError } from "./types";

export interface APIErrorDetails {
    method: string;
    params: Record<string, any>;
}

//TODO: more elegant
export class APIError extends Error {
    method: string;
    params: Record<string, any>;
    code: number;

    constructor({ method, params }: APIErrorDetails, error: APIResponseError) {
        super(error.description);

        this.name = method;
        this.method = method;
        this.params = params;
        this.code = error.error_code;
    }
}