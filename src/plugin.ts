import type { EventComposer } from "@gramio/composer";
import type {
	BotLike,
	Context,
	ContextType,
	UpdateName,
} from "@gramio/contexts";
import type { APIMethods } from "@gramio/types";
import type { Bot } from "./bot.js";
import { Composer } from "./composer.js";
import { ErrorKind } from "./errors.js";
import type {
	AnyBot,
	AnyPlugin,
	DeriveDefinitions,
	ErrorDefinitions,
	Handler,
	Hooks,
	MaybePromise,
} from "./types.js";
import type { MaybeArray } from "./utils.internal.js";

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
export class Plugin<
	Errors extends ErrorDefinitions = {},
	Derives extends DeriveDefinitions = DeriveDefinitions,
> {
	/**
	 * 	@internal
	 * 	Set of Plugin data
	 *
	 *
	 */
	_ = {
		/** Name of plugin */
		name: "",

		/** List of plugin dependencies. If user does't extend from listed there dependencies it throw a error */
		dependencies: [] as string[],
		/** remap generic type. {} in runtime */
		Errors: {} as Errors,
		/** remap generic type. {} in runtime */
		Derives: {} as Derives,
		/**	Composer */
		composer: new Composer(),
		/** Store plugin preRequests hooks */
		preRequests: [] as [
			Hooks.PreRequest<any>,
			MaybeArray<keyof APIMethods> | undefined,
		][],
		/** Store plugin onResponses hooks */
		onResponses: [] as [
			Hooks.OnResponse<any>,
			MaybeArray<keyof APIMethods> | undefined,
		][],
		/** Store plugin onResponseErrors hooks */
		onResponseErrors: [] as [
			Hooks.OnResponseError<any>,
			MaybeArray<keyof APIMethods> | undefined,
		][],
		/** Store plugin onApiCalls hooks */
		onApiCalls: [] as [
			Hooks.OnApiCall<any>,
			MaybeArray<keyof APIMethods> | undefined,
		][],
		/**
		 * Store plugin groups
		 *
		 * If you use `on` or `use` in group and on plugin-level groups handlers are registered after plugin-level handlers
		 *  */
		groups: [] as ((bot: AnyBot) => AnyBot)[],
		/** Store plugin onStarts hooks */
		onStarts: [] as Hooks.OnStart[],
		/** Store plugin onStops hooks */
		onStops: [] as Hooks.OnStop[],
		/** Store plugin onErrors hooks */
		onErrors: [] as Hooks.OnError<any, any>[],
		/** Map of plugin errors */
		errorsDefinitions: {} as Record<
			string,
			{ new (...args: any): any; prototype: Error }
		>,
		decorators: {} as Record<string, unknown>,
	};

	/** Expose composer internals so `composer.extend(plugin)` works via duck-typing */
	get "~"(): InstanceType<typeof Composer>["~"] {
		// Promote to "scoped" so plugin middleware shares context (not isolated).
		// Same as what Bot.extend(plugin) does. Idempotent — safe to call repeatedly.
		this._.composer.as("scoped");
		return this._.composer["~"];
	}

	/** Create new Plugin. Please provide `name` */
	constructor(
		name: string,
		{ dependencies }: { dependencies?: string[] } = {},
	) {
		this._.name = name;
		this._.composer["~"].name = name;
		if (dependencies) this._.dependencies = dependencies;
	}

	/** Currently not isolated!!!
	 *
	 * > [!WARNING]
	 * > If you use `on` or `use` in a `group` and at the plugin level, the group handlers are registered **after** the handlers at the plugin level
	 */
	group(grouped: (bot: Bot<Errors, Derives>) => AnyBot) {
		this._.groups.push(grouped);

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

		this._.errorsDefinitions[kind] = error;
		this._.composer["~"].errorsDefinitions[kind] = error;

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
	derive<Handler extends Hooks.Derive<Context<BotLike> & Derives["global"]>>(
		handler: Handler,
	): Plugin<Errors, Derives & { global: Awaited<ReturnType<Handler>> }>;

	derive<
		Update extends UpdateName,
		Handler extends Hooks.Derive<
			ContextType<BotLike, Update> & Derives["global"] & Derives[Update]
		>,
	>(
		updateName: MaybeArray<Update>,
		handler: Handler,
	): Plugin<Errors, Derives & { [K in Update]: Awaited<ReturnType<Handler>> }>;

	derive<
		Update extends UpdateName,
		Handler extends Hooks.Derive<
			ContextType<BotLike, Update> & Derives["global"] & Derives[Update]
		>,
	>(updateNameOrHandler: MaybeArray<Update> | Handler, handler?: Handler) {
		if (typeof updateNameOrHandler === "function")
			this._.composer.derive(
				updateNameOrHandler as Hooks.Derive<Context<AnyBot>>,
			);
		else if (handler)
			this._.composer.derive(
				updateNameOrHandler as Update | Update[],
				handler as Hooks.Derive<ContextType<AnyBot, Update>>,
			);

		return this;
	}

	decorate<Value extends Record<string, any>>(
		value: Value,
	): Plugin<
		Errors,
		Derives & {
			global: {
				[K in keyof Value]: Value[K];
			};
		}
	>;

	decorate<Name extends string, Value>(
		name: Name,
		value: Value,
	): Plugin<
		Errors,
		Derives & {
			global: {
				[K in Name]: Value;
			};
		}
	>;
	decorate<Name extends string, Value>(
		nameOrValue: Name | Record<string, any>,
		value?: Value,
	) {
		if (typeof nameOrValue === "string") this._.decorators[nameOrValue] = value;
		else {
			for (const [name, value] of Object.entries(nameOrValue)) {
				this._.decorators[name] = value;
			}
		}

		return this;
	}

	/** Register handler to one or many Updates */
	on<T extends UpdateName>(
		updateName: MaybeArray<T>,
		handler: Handler<ContextType<BotLike, T> & Derives["global"] & Derives[T]>,
	) {
		this._.composer.on(
			updateName as T | T[],
			handler as Handler<ContextType<AnyBot, T>>,
		);

		return this;
	}

	/** Register handler to any Updates */
	use(handler: Handler<Context<BotLike> & Derives["global"]>) {
		this._.composer.use(handler as Handler<Context<AnyBot>>);

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
	 * [Documentation](https://gramio.dev/hooks/pre-request.html)
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
			this._.preRequests.push([handler, methodsOrHandler]);
		else if (typeof methodsOrHandler === "function")
			this._.preRequests.push([methodsOrHandler, undefined]);

		return this;
	}

	/**
	 * This hook called when API return successful response
	 *
	 * [Documentation](https://gramio.dev/hooks/on-response.html)
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
			this._.onResponses.push([handler, methodsOrHandler]);
		else if (typeof methodsOrHandler === "function")
			this._.onResponses.push([methodsOrHandler, undefined]);

		return this;
	}

	/**
	 * This hook called when API return an error
	 *
	 * [Documentation](https://gramio.dev/hooks/on-response-error.html)
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
			this._.onResponseErrors.push([handler, methodsOrHandler]);
		else if (typeof methodsOrHandler === "function")
			this._.onResponseErrors.push([methodsOrHandler, undefined]);

		return this;
	}

	/**
	 * This hook wraps the entire API call, enabling tracing/instrumentation.
	 *
	 * @example
	 * ```typescript
	 * const plugin = new Plugin("example").onApiCall(async (context, next) => {
	 *     console.log(`Calling ${context.method}`);
	 *     const result = await next();
	 *     console.log(`${context.method} completed`);
	 *     return result;
	 * });
	 * ```
	 *  */
	onApiCall<
		Methods extends keyof APIMethods,
		Handler extends Hooks.OnApiCall<Methods>,
	>(methods: MaybeArray<Methods>, handler: Handler): this;

	onApiCall(handler: Hooks.OnApiCall): this;

	onApiCall<
		Methods extends keyof APIMethods,
		Handler extends Hooks.OnApiCall<Methods>,
	>(
		methodsOrHandler: MaybeArray<Methods> | Hooks.OnApiCall,
		handler?: Handler,
	) {
		if (
			(typeof methodsOrHandler === "string" ||
				Array.isArray(methodsOrHandler)) &&
			handler
		)
			this._.onApiCalls.push([handler, methodsOrHandler]);
		else if (typeof methodsOrHandler === "function")
			this._.onApiCalls.push([methodsOrHandler, undefined]);

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
	 * [Documentation](https://gramio.dev/hooks/on-start.html)
	 *  */
	onStart(handler: Hooks.OnStart) {
		this._.onStarts.push(handler);

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
	 * [Documentation](https://gramio.dev/hooks/on-stop.html)
	 *  */
	onStop(handler: Hooks.OnStop) {
		this._.onStops.push(handler);

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
			ContextType<BotLike, T> & Derives["global"] & Derives[T]
		>,
	): this;

	onError(
		handler: Hooks.OnError<Errors, Context<BotLike> & Derives["global"]>,
	): this;

	onError<T extends UpdateName>(
		updateNameOrHandler: T | Hooks.OnError<Errors>,
		handler?: Hooks.OnError<
			Errors,
			ContextType<BotLike, T> & Derives["global"] & Derives[T]
		>,
	): this {
		if (typeof updateNameOrHandler === "function") {
			this._.onErrors.push(updateNameOrHandler);

			return this;
		}

		if (handler) {
			this._.onErrors.push(async (errContext) => {
				if (errContext.context.is(updateNameOrHandler))
					await handler(errContext);
			});
		}

		return this;
	}

	/** Extend plugin with a Composer instance (merges middleware with deduplication) */
	extend<UExposed extends object, UDerives extends Record<string, object>>(
		composer: EventComposer<any, any, any, any, UExposed, UDerives>,
	): Plugin<Errors, Derives & { global: UExposed } & UDerives>;

	/**
	 * ! ** At the moment, it can only pick up types** */
	extend<NewPlugin extends AnyPlugin>(
		plugin: MaybePromise<NewPlugin>,
	): Plugin<
		Errors & NewPlugin["_"]["Errors"],
		Derives & NewPlugin["_"]["Derives"]
	>;

	extend(
		pluginOrComposer:
			| MaybePromise<AnyPlugin>
			| EventComposer<any, any, any, any, any, any>,
	): this {
		if (
			"compose" in pluginOrComposer &&
			"run" in pluginOrComposer &&
			!("_" in pluginOrComposer)
		) {
			this._.composer.extend(pluginOrComposer);
		}

		return this;
	}
}
