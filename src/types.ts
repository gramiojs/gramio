import { NextMiddleware } from "middleware-io";

export interface BotOptions {
	token?: string;
}

export type THandler<T> = (context: T, next: NextMiddleware) => unknown;
