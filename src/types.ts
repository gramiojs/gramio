import { NextMiddleware } from "middleware-io";
import { contextMappings } from "./contexts";
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

export type THandler<T> = (context: T, next: NextMiddleware) => unknown;

export type UpdateNames = keyof typeof contextMappings;

/** Removes `[key: string]: any;` from interface
 *
 *  [source](https://github.com/nitreojs/puregram/blob/lord/packages/prompt/src/types.ts#L19C1-L22C2)
 */
export type Known<T> = {
    [K in keyof T as string extends K
        ? never
        : number extends K
        ? never
        : K]: T[K];
};

export type Optional<T, K extends keyof Known<T>> =
    /** We pick every field but `K` and leave them as is */
    Pick<
        Known<T>,
        Exclude<keyof Known<T>, K>
    > /** Then, we take our `K` fields and mark them as optional */ & {
        [P in K]?: Known<T>[P];
    } /** Lastly, we add `[key: string]: any;` */ & { [key: string]: any };
