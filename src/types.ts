import { contextsMappings } from "@gramio/contexts";
import type { TelegramResponseParameters } from "@gramio/types";
import { NextMiddleware } from "middleware-io";

export interface BotOptions {
	token?: string;
}

export interface APIResponseOk {
	ok: true;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
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

//TODO: fix
export type UpdateNames = Exclude<
	keyof typeof contextsMappings,
	"delete_chat_photo"
>;
