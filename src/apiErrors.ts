import { APIResponseError } from "./types"

//TODO: add APIResponseError.params

export interface APIErrorDetails {
    method: string
    params: Record<string, any>
}

//TODO: more elegant
export class APIError extends Error {
    method: string
    params: Record<string, any>
    code: number
    payload?: APIResponseError["parameters"]

    constructor({ method, params }: APIErrorDetails, error: APIResponseError) {
        super(error.description)

        this.name = method
        this.method = method
        this.params = params
        this.code = error.error_code
        //TODO: delete when undefined
        if (error.parameters) this.payload = error.parameters
    }
}
