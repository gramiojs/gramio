import type {
	EventComposer,
	MacroDef,
	MacroDefinitions,
} from "@gramio/composer";
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
 * Yields the subset of UpdateName whose context type contains all keys from Narrowing.
 */
type CompatibleUpdates<B extends BotLike, Narrowing> = {
	[K in UpdateName]: keyof Narrowing & string extends keyof ContextType<B, K>
		? K
		: never;
}[UpdateName];

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
// biome-ignore lint/suspicious/noUnsafeDeclarationMerging: shorthand methods are merged via interface declaration below
export class Plugin<
	Errors extends ErrorDefinitions = {},
	Derives extends DeriveDefinitions = DeriveDefinitions,
	Macros extends MacroDefinitions = {},
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
		/** remap generic type. {} in runtime */
		Macros: {} as Macros,
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
	get "~"(): Omit<InstanceType<typeof Composer>["~"], "Out" | "Derives"> & { Out: Derives["global"]; Derives: Omit<Derives, "global"> } {
		// Promote to "scoped" so plugin middleware shares context (not isolated).
		// Same as what Bot.extend(plugin) does. Idempotent — safe to call repeatedly.
		this._.composer.as("scoped");
		return this._.composer["~"] as any;
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
			Derives,
			Macros
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
	): Plugin<Errors, Derives & { global: Awaited<ReturnType<Handler>> }, Macros>;

	derive<
		Update extends UpdateName,
		Handler extends Hooks.Derive<
			ContextType<BotLike, Update> & Derives["global"] & Derives[Update]
		>,
	>(
		updateName: MaybeArray<Update>,
		handler: Handler,
	): Plugin<
		Errors,
		Derives & { [K in Update]: Awaited<ReturnType<Handler>> },
		Macros
	>;

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
				updateNameOrHandler,
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
		},
		Macros
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
		},
		Macros
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

	/**
	 * Register a single named macro definition on this plugin
	 */
	macro<const Name extends string, TDef extends MacroDef<any, any>>(
		name: Name,
		definition: TDef,
	): Plugin<Errors, Derives, Macros & Record<Name, TDef>>;

	/** Register multiple macro definitions at once */
	macro<const TDefs extends Record<string, MacroDef<any, any>>>(
		definitions: TDefs,
	): Plugin<Errors, Derives, Macros & TDefs>;

	macro(
		nameOrDefs: string | Record<string, MacroDef<any, any>>,
		definition?: MacroDef<any, any>,
	): any {
		this._.composer.macro(nameOrDefs as any, definition as any);
		return this;
	}

	/** Register handler with a type-narrowing filter (auto-discovers matching events) */
	on<Narrowing>(
		filter: (ctx: any) => ctx is Narrowing,
		handler: Handler<
			ContextType<BotLike, CompatibleUpdates<BotLike, Narrowing>> &
				Derives["global"] &
				Narrowing
		>,
	): this;

	/** Register handler with a boolean filter (all updates) */
	on(
		filter: (ctx: Context<BotLike> & Derives["global"]) => boolean,
		handler: Handler<Context<BotLike> & Derives["global"]>,
	): this;

	/** Register handler to one or many Updates with a type-narrowing filter */
	on<T extends UpdateName, Narrowing>(
		updateName: MaybeArray<T>,
		filter: (ctx: any) => ctx is Narrowing,
		handler: Handler<
			ContextType<BotLike, T> & Derives["global"] & Derives[T] & Narrowing
		>,
	): this;

	/** Register handler to one or many Updates with a boolean filter (no type narrowing) */
	on<T extends UpdateName>(
		updateName: MaybeArray<T>,
		filter: (
			ctx: ContextType<BotLike, T> & Derives["global"] & Derives[T],
		) => boolean,
		handler: Handler<ContextType<BotLike, T> & Derives["global"] & Derives[T]>,
	): this;

	/** Register handler to one or many Updates */
	on<T extends UpdateName>(
		updateName: MaybeArray<T>,
		handler: Handler<ContextType<BotLike, T> & Derives["global"] & Derives[T]>,
	): this;

	on<T extends UpdateName>(
		updateNameOrFilter: MaybeArray<T> | ((ctx: any) => boolean),
		filterOrHandler: Handler<any> | ((ctx: any) => boolean),
		handler?: Handler<any>,
	) {
		// Filter-only mode: first arg is a function
		if (typeof updateNameOrFilter === "function") {
			this._.composer.on(updateNameOrFilter as any, filterOrHandler as any);
			return this;
		}

		if (handler) {
			this._.composer.on(
				updateNameOrFilter as any,
				filterOrHandler as any,
				handler,
			);
		} else {
			this._.composer.on(
				updateNameOrFilter,
				filterOrHandler as Handler<ContextType<AnyBot, T>>,
			);
		}

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
	 *     ({ plugins, info, updatesFrom, bot }) => {
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
	 *     ({ plugins, info, bot }) => {
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

	/** Extend plugin with another Plugin (merges middleware, hooks, decorators, error definitions, groups, and dependencies) */
	extend<NewPlugin extends AnyPlugin>(
		plugin: MaybePromise<NewPlugin>,
	): Plugin<
		Errors & NewPlugin["_"]["Errors"],
		Derives & NewPlugin["_"]["Derives"],
		Macros & NewPlugin["_"]["Macros"]
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
			return this;
		}

		const plugin = pluginOrComposer as AnyPlugin;

		// Merge middleware/macros via composer
		if (plugin._.composer["~"].middlewares.length) {
			plugin._.composer.as("scoped");
			this._.composer.extend(plugin._.composer);
		} else if (Object.keys(plugin._.composer["~"].macros).length) {
			Object.assign(this._.composer["~"].macros, plugin._.composer["~"].macros);
		}

		// Merge error definitions
		for (const [key, value] of Object.entries(plugin._.errorsDefinitions)) {
			this._.errorsDefinitions[key] = value;
			this._.composer["~"].errorsDefinitions[key] = value;
		}

		// Merge decorators
		Object.assign(this._.decorators, plugin._.decorators);

		// Merge hooks
		this._.preRequests.push(...plugin._.preRequests);
		this._.onResponses.push(...plugin._.onResponses);
		this._.onResponseErrors.push(...plugin._.onResponseErrors);
		this._.onApiCalls.push(...plugin._.onApiCalls);
		this._.onErrors.push(...plugin._.onErrors);
		this._.onStarts.push(...plugin._.onStarts);
		this._.onStops.push(...plugin._.onStops);

		// Merge groups
		this._.groups.push(...plugin._.groups);

		// Merge dependencies
		for (const dep of plugin._.dependencies) {
			if (!this._.dependencies.includes(dep)) {
				this._.dependencies.push(dep);
			}
		}

		return this;
	}
}

// Add shorthand methods (command, callbackQuery, hears, etc.) to Plugin prototype.
// These are the same functions used by EventComposer — they call `this.on()` internally
// and use `this["~"]` for macros/commandsMeta, both of which Plugin exposes.
import { _composerMethods } from "./composer.js";
for (const [name, fn] of Object.entries(_composerMethods)) {
	(Plugin.prototype as any)[name] = fn;
}

// Type-level declaration: Plugin gets the same shorthand methods as Composer
export interface Plugin<
	// biome-ignore lint/correctness/noUnusedVariables: generic params required for declaration merging
	Errors,
	// biome-ignore lint/correctness/noUnusedVariables: generic params required for declaration merging
	Derives,
	// biome-ignore lint/correctness/noUnusedVariables: generic params required for declaration merging
	Macros,
> {
	/** Register callback query handler */
	callbackQuery: (typeof _composerMethods)["callbackQuery"];
	/** Register command handler */
	command: (typeof _composerMethods)["command"];
	/** Register text/caption pattern handler */
	hears: (typeof _composerMethods)["hears"];
	/** Register reaction handler */
	reaction: (typeof _composerMethods)["reaction"];
	/** Register inline query handler */
	inlineQuery: (typeof _composerMethods)["inlineQuery"];
	/** Register chosen inline result handler */
	chosenInlineResult: (typeof _composerMethods)["chosenInlineResult"];
	/** Register deep-link parameter handler */
	startParameter: (typeof _composerMethods)["startParameter"];
}
