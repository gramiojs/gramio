import {
	BotLike,
	Context,
	ContextType,
	MaybeArray,
	UpdateName,
} from "@gramio/contexts";
import { Inspectable } from "inspectable";
import { DeriveDefinitions, ErrorDefinitions, Hooks } from "types";
import { ErrorKind } from "#errors";

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
	Errors!: Errors;
	Derives!: Derives;

	derives: [Hooks.Derive<any>, UpdateName | undefined][] = [];

	name: string;
	errorsDefinitions: Record<
		string,
		{ new (...args: any): any; prototype: Error }
	> = {};
	dependencies: string[] = [];

	constructor(
		name: string,
		{ dependencies }: { dependencies?: string[] } = {},
	) {
		this.name = name;
		if (dependencies) this.dependencies = dependencies;
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

	derive<Handler extends Hooks.Derive<Context<BotLike>>>(
		handler: Handler,
	): Plugin<Errors, Derives & { global: Awaited<ReturnType<Handler>> }>;

	derive<
		Update extends UpdateName,
		Handler extends Hooks.Derive<ContextType<BotLike, Update>>,
	>(
		updateName: MaybeArray<Update>,
		handler: Handler,
	): Plugin<Errors, Derives & { [K in Update]: Awaited<ReturnType<Handler>> }>;

	derive<
		Update extends UpdateName,
		Handler extends Hooks.Derive<ContextType<BotLike, Update>>,
	>(updateNameOrHandler: MaybeArray<Update> | Handler, handler?: Handler) {
		if (typeof updateNameOrHandler === "string" && handler)
			this.derives.push([handler, updateNameOrHandler]);
		else if (typeof updateNameOrHandler === "function")
			this.derives.push([updateNameOrHandler, undefined]);

		return this;
	}
}
