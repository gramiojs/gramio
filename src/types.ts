import { TelegramResponseParameters } from "./generated";

export interface BotOptions {
    token?: string;
}

export interface APIResponseOk {
    ok: true;
    result: Record<string, any>;
}
export interface APIResponseError {
    ok: false;
    description: string;
    error_code: number;

    parameters?: TelegramResponseParameters;
}

export type APIResponse = APIResponseOk | APIResponseError;
