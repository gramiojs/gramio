import type { Context, ContextType, UpdateName } from "@gramio/contexts";
import {
	type CaughtMiddlewareHandler,
	type Middleware,
	Composer as MiddlewareComposer,
	noopNext,
} from "middleware-io";
import type { AnyBot, Handler, Hooks } from "./types.js";
import type { MaybeArray } from "./utils.internal.js";

/** Base-composer without chainable type-safety */
export class Composer {
	protected composer = MiddlewareComposer.builder<
		Context<AnyBot> & {
			[key: string]: unknown;
		}
	>();
	length = 0;
	composed!: Middleware<Context<AnyBot>>;
	protected onError: CaughtMiddlewareHandler<Context<AnyBot>>;

	constructor(onError?: CaughtMiddlewareHandler<Context<any>>) {
		this.onError =
			onError ||
			((_, error) => {
				throw error;
			});

		this.recompose();
	}

	/** Register handler to one or many Updates */
	on<T extends UpdateName>(updateName: MaybeArray<T>, handler: Handler<any>) {
		return this.use(async (context, next) => {
			if (context.is(updateName)) return await handler(context, next);

			return await next();
		});
	}

	/** Register handler to any Update */
	use(handler: Handler<any>) {
		this.composer.caught(this.onError).use(handler);

		return this.recompose();
	}

	/**
	 * Derive some data to handlers
	 *
	 * @example
	 * ```ts
	 * new Bot("token").derive((context) => {
	 * 		return {
	 * 			superSend: () => context.send("Derived method")
	 * 		}
	 * })
	 * ```
	 */
	derive<
		Update extends UpdateName,
		Handler extends Hooks.Derive<ContextType<AnyBot, Update>>,
	>(updateNameOrHandler: MaybeArray<Update> | Handler, handler?: Handler) {
		if (typeof updateNameOrHandler === "function")
			this.use(async (context, next) => {
				for (const [key, value] of Object.entries(
					await updateNameOrHandler(context),
				)) {
					context[key] = value;
				}

				return await next();
			});
		else if (handler)
			this.on(updateNameOrHandler, async (context, next) => {
				for (const [key, value] of Object.entries(await handler(context))) {
					context[key] = value;
				}

				return await next();
			});

		return this;
	}

	protected recompose() {
		// @ts-expect-error middleware-io moment

		this.composed = this.composer.compose();
		this.length = this.composer.length;

		return this;
	}

	compose(context: Context<AnyBot>, next = noopNext) {
		this.composed(context, next);
	}

	composeWait(context: Context<AnyBot>, next = noopNext) {
		return this.composed(context, next);
	}
}
