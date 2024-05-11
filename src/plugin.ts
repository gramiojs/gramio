import type {
	Context,
	ContextType,
	MaybeArray,
	UpdateName,
} from "@gramio/contexts";
import type { APIMethods } from "@gramio/types";
import { Inspectable } from "inspectable";
import type { Bot } from "./bot";
import { ErrorKind } from "./errors";
import type { DeriveDefinitions, ErrorDefinitions, Hooks } from "./types";

/**
 * `Plugin` is an object  from which you can extends in Bot instance and adopt types
 *
 * @example
 * ```ts
 * import { Plugin, Bot } from "gramio";
 *
 * export class PluginError extends Error {
 *     wow: "type" | "safe" = "type";
 * }
 *
 * const plugin = new Plugin("gramio-example")
 *     .error("PLUGIN", PluginError)
 *     .derive(() => {
 *         return {
 *             some: ["derived", "props"] as const,
 *         };
 *     });
 *
 * const bot = new Bot(process.env.TOKEN!)
 *     .extend(plugin)
 *     .onError(({ context, kind, error }) => {
 *         if (context.is("message") && kind === "PLUGIN") {
 *             console.log(error.wow);
 *         }
 *     })
 *     .use((context) => {
 *         console.log(context.some);
 *     });
 * ```
 */
@Inspectable<Plugin>({
	serialize: (plugin) => ({
		name: plugin.name,
		dependencies: plugin.dependencies,
	}),
})
export class Plugin<
	Errors extends ErrorDefinitions = {},
	Derives extends DeriveDefinitions = DeriveDefinitions,
> {
	// TODO: fix that dump error. https://www.typescriptlang.org/play?#code/KYDwDg9gTgLgBDAnmYcCiUrQCLAGYCWAdgTAREQM5wC8cASsAMbQAmAPAFACQlMUxAOYAaHhixROAPgDcnTqEiw4TADYBDStQAKqgK6Di7cdGqgYwIq2omouQiTIVqdAN4BfKXFc8i6gLbAAFxwfAJEgnI8wJim9sSk5FQhjCxQHDy8-EKi3NyucETAAO5wABQAdFXqUIKUIepEiACUDU0ycGBYMBBIKCG2cO48Xm7uUdwsVPx6TD1QZX6BIWFCzd6ZMAAWBJQVS6h0B3LcwzwA9ABUlzxwlwzAhnwxKnp8EP4qGloAtDEScGInX0hiIt2u52isSgXDyADkAqhzJZrKFshFctw4SVBsirNQCkVSpVqrV6nBGi02ogOl1er1kMF0NChrkpGUANbEVghBGBYRwf7QXk46HrHx5c7nAACMEof3AzBgfxZAGVgPBbABpbmZIVQADa2u5AF1aHAuVYTtxNjs9vrKPFHElKAbLawzXR9RNuFANXooEQEHaKdQ9EQOUQIMUg5o4LoDEZMtxbNQAGTeOAGg6AoN84AmkIASWmjSYwAAKoz2NjirYvMM8rIeMMzgpwNB4GpNNQAEK9YzQswgCz45kSJ2JZzmjxeHzybh4ji1hOgwUjlE6EFGSlSdmZMDbogi4qr4i5VpwFdH9ej1FnojsYh4F4P1NeAD8cH7MEHEnT8ZHu+cAhNsuwbHkfowAGQZgdQcaUicrbyO2Shdt81BwhA9AEIIWxyrem7jtAEFFMArD0BAqhMgAROorD+MQNFwAAPnANH+BArAxOo8w0RMUxhLM8xlFg1EhHRDFMax7GcdxUC8dANHipklB6CgCzNNacH7MA5GUdR5picASGcGcgnwBYfDmkSgGJkQZQ0TAykVPqjlwgA8gA+vQRYAOIABIVqqNEClhOF4XKWnyBZcAAEa9DZJTfr0ZTNDwrkblYZRWTAzRAA
	/** @internal. remap generic */
	Errors!: Errors;
	/** @internal. remap generic */
	Derives!: Derives;

	/** Store derives */
	derives: [Hooks.Derive<any>, MaybeArray<UpdateName> | undefined][] = [];
	/** Store plugin preRequests hooks */
	preRequests: [
		Hooks.PreRequest<any>,
		MaybeArray<keyof APIMethods> | undefined,
	][] = [];
	/** Store plugin onResponses hooks */
	onResponses: [
		Hooks.OnResponse<any>,
		MaybeArray<keyof APIMethods> | undefined,
	][] = [];
	/** Store plugin onResponseErrors hooks */
	onResponseErrors: [
		Hooks.OnResponseError<any>,
		MaybeArray<keyof APIMethods> | undefined,
	][] = [];

	/** Store plugin groups hooks */
	groups: ((bot: Bot<any, any>) => Bot<any, any>)[] = [];
	/** Store plugin onStarts hooks */
	onStarts: Hooks.OnStart[] = [];
	/** Store plugin onStops hooks */
	onStops: Hooks.OnStop[] = [];
	/** Store plugin onErrors hooks */
	onErrors: Hooks.OnError<any, any>[] = [];
	/** Name of plugin */
	name: string;
	/** Map of plugin errors */
	errorsDefinitions: Record<
		string,
		{ new (...args: any): any; prototype: Error }
	> = {};
	/** List of plugin dependencies. If user does't extend from listed there dependencies it throw a error */
	dependencies: string[] = [];

	/** Create new Plugin. Please provide `name` */
	constructor(
		name: string,
		{ dependencies }: { dependencies?: string[] } = {},
	) {
		this.name = name;
		if (dependencies) this.dependencies = dependencies;
	}

	/** Currently not isolated!!! */
	group(grouped: (bot: Bot<Errors, Derives>) => Bot<any, any>) {
		this.groups.push(grouped);

		return this;
	}

	/**
	 * Register custom class-error in plugin
	 **/
	error<
		Name extends string,
		NewError extends { new (...args: any): any; prototype: Error },
	>(kind: Name, error: NewError) {
		//@ts-expect-error Set ErrorKind
		error[ErrorKind] = kind;

		this.errorsDefinitions[kind] = error;

		return this as unknown as Plugin<
			Errors & { [name in Name]: InstanceType<NewError> },
			Derives
		>;
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
	derive<Handler extends Hooks.Derive<Context<Bot>>>(
		handler: Handler,
	): Plugin<Errors, Derives & { global: Awaited<ReturnType<Handler>> }>;

	derive<
		Update extends UpdateName,
		Handler extends Hooks.Derive<ContextType<Bot, Update>>,
	>(
		updateName: MaybeArray<Update>,
		handler: Handler,
	): Plugin<Errors, Derives & { [K in Update]: Awaited<ReturnType<Handler>> }>;

	derive<
		Update extends UpdateName,
		Handler extends Hooks.Derive<ContextType<Bot, Update>>,
	>(updateNameOrHandler: MaybeArray<Update> | Handler, handler?: Handler) {
		if (
			(typeof updateNameOrHandler === "string" ||
				Array.isArray(updateNameOrHandler)) &&
			handler
		)
			this.derives.push([handler, updateNameOrHandler]);
		else if (typeof updateNameOrHandler === "function")
			this.derives.push([updateNameOrHandler, undefined]);

		return this;
	}

	/**
	 * This hook called before sending a request to Telegram Bot API (allows us to impact the sent parameters).
	 *
	 * @example
	 * ```typescript
	 * import { Bot } from "gramio";
	 *
	 * const bot = new Bot(process.env.TOKEN!).preRequest((context) => {
	 *     if (context.method === "sendMessage") {
	 *         context.params.text = "mutate params";
	 *     }
	 *
	 *     return context;
	 * });
	 *
	 * bot.start();
	 * ```
	 *
	 * [Documentation](https://gramio.netlify.app/hooks/pre-request.html)
	 *  */
	preRequest<
		Methods extends keyof APIMethods,
		Handler extends Hooks.PreRequest<Methods>,
	>(methods: MaybeArray<Methods>, handler: Handler): this;

	preRequest(handler: Hooks.PreRequest): this;

	preRequest<
		Methods extends keyof APIMethods,
		Handler extends Hooks.PreRequest<Methods>,
	>(
		methodsOrHandler: MaybeArray<Methods> | Hooks.PreRequest,
		handler?: Handler,
	) {
		if (
			(typeof methodsOrHandler === "string" ||
				Array.isArray(methodsOrHandler)) &&
			handler
		)
			this.preRequests.push([handler, methodsOrHandler]);
		else if (typeof methodsOrHandler === "function")
			this.preRequests.push([methodsOrHandler, undefined]);

		return this;
	}

	/**
	 * This hook called when API return sucesfull response
	 *
	 * [Documentation](https://gramio.netlify.app/hooks/on-response.html)
	 * */
	onResponse<
		Methods extends keyof APIMethods,
		Handler extends Hooks.OnResponse<Methods>,
	>(methods: MaybeArray<Methods>, handler: Handler): this;

	onResponse(handler: Hooks.OnResponse): this;

	onResponse<
		Methods extends keyof APIMethods,
		Handler extends Hooks.OnResponse<Methods>,
	>(
		methodsOrHandler: MaybeArray<Methods> | Hooks.OnResponse,
		handler?: Handler,
	) {
		if (
			(typeof methodsOrHandler === "string" ||
				Array.isArray(methodsOrHandler)) &&
			handler
		)
			this.onResponses.push([handler, methodsOrHandler]);
		else if (typeof methodsOrHandler === "function")
			this.onResponses.push([methodsOrHandler, undefined]);

		return this;
	}

	/**
	 * This hook called when API return an error
	 *
	 * [Documentation](https://gramio.netlify.app/hooks/on-response-error.html)
	 * */
	onResponseError<
		Methods extends keyof APIMethods,
		Handler extends Hooks.OnResponseError<Methods>,
	>(methods: MaybeArray<Methods>, handler: Handler): this;

	onResponseError(handler: Hooks.OnResponseError): this;

	onResponseError<
		Methods extends keyof APIMethods,
		Handler extends Hooks.OnResponseError<Methods>,
	>(
		methodsOrHandler: MaybeArray<Methods> | Hooks.OnResponseError,
		handler?: Handler,
	) {
		if (
			(typeof methodsOrHandler === "string" ||
				Array.isArray(methodsOrHandler)) &&
			handler
		)
			this.onResponseErrors.push([handler, methodsOrHandler]);
		else if (typeof methodsOrHandler === "function")
			this.onResponseErrors.push([methodsOrHandler, undefined]);

		return this;
	}

	/**
	 * This hook called when the bot is `started`.
	 *
	 * @example
	 * ```typescript
	 * import { Bot } from "gramio";
	 *
	 * const bot = new Bot(process.env.TOKEN!).onStart(
	 *     ({ plugins, info, updatesFrom }) => {
	 *         console.log(`plugin list - ${plugins.join(", ")}`);
	 *         console.log(`bot username is @${info.username}`);
	 * 		   console.log(`updates from ${updatesFrom}`);
	 *     }
	 * );
	 *
	 * bot.start();
	 * ```
	 *
	 * [Documentation](https://gramio.netlify.app/hooks/on-start.html)
	 *  */
	onStart(handler: Hooks.OnStart) {
		this.onStarts.push(handler);

		return this;
	}

	/**
	 * This hook called when the bot stops.
	 *
	 * @example
	 * ```typescript
	 * import { Bot } from "gramio";
	 *
	 * const bot = new Bot(process.env.TOKEN!).onStop(
	 *     ({ plugins, info, updatesFrom }) => {
	 *         console.log(`plugin list - ${plugins.join(", ")}`);
	 *         console.log(`bot username is @${info.username}`);
	 *     }
	 * );
	 *
	 * bot.start();
	 * bot.stop();
	 * ```
	 *
	 * [Documentation](https://gramio.netlify.app/hooks/on-stop.html)
	 *  */
	onStop(handler: Hooks.OnStop) {
		this.onStops.push(handler);

		return this;
	}

	/**
	 * Set error handler.
	 * @example
	 * ```ts
	 * bot.onError("message", ({ context, kind, error }) => {
	 * 	return context.send(`${kind}: ${error.message}`);
	 * })
	 * ```
	 */
	onError<T extends UpdateName>(
		updateName: MaybeArray<T>,
		handler: Hooks.OnError<
			Errors,
			ContextType<Bot, T> & Derives["global"] & Derives[T]
		>,
	): this;

	onError(
		handler: Hooks.OnError<Errors, Context<Bot> & Derives["global"]>,
	): this;

	onError<T extends UpdateName>(
		updateNameOrHandler: T | Hooks.OnError<Errors>,
		handler?: Hooks.OnError<
			Errors,
			ContextType<Bot, T> & Derives["global"] & Derives[T]
		>,
	): this {
		if (typeof updateNameOrHandler === "function") {
			this.onErrors.push(updateNameOrHandler);

			return this;
		}

		if (handler) {
			this.onErrors.push(async (errContext) => {
				if (errContext.context.is(updateNameOrHandler))
					await handler(errContext);
			});
		}

		return this;
	}
}
