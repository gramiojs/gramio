import { ErrorDefinitions } from "types";
import { ErrorKind } from "#errors";

export class Plugin<Errors extends ErrorDefinitions = {}> {
	// TODO: fix that dump error. https://www.typescriptlang.org/play?#code/KYDwDg9gTgLgBDAnmYcCiUrQCLAGYCWAdgTAREQM5wC8cASsAMbQAmAPAFACQlMUxAOYAaHhixROAPgDcnTqEiw4TADYBDStQAKqgK6Di7cdGqgYwIq2omouQiTIVqdAN4BfKXFc8i6gLbAAFxwfAJEgnI8wJim9sSk5FQhjCxQHDy8-EKi3NyucETAAO5wABQAdFXqUIKUIepEiACUDU0ycGBYMBBIKCG2cO48Xm7uUdwsVPx6TD1QZX6BIWFCzd6ZMAAWBJQVS6h0B3LcwzwA9ABUlzxwlwzAhnwxKnp8EP4qGloAtDEScGInX0hiIt2u52isSgXDyADkAqhzJZrKFshFctw4SVBsirNQCkVSpVqrV6nBGi02ogOl1er1kMF0NChrkpGUANbEVghBGBYRwf7QXk46HrHx5c7nAACMEof3AzBgfxZAGVgPBbABpbmZIVQADa2u5AF1aHAuVYTtxNjs9vrKPFHElKAbLawzXR9RNuFANXooEQEHaKdQ9EQOUQIMUg5o4LoDEZMtxbNQAGTeOAGg6AoN84AmkIASWmjSYwAAKoz2NjirYvMM8rIeMMzgpwNB4GpNNQAEK9YzQswgCz45kSJ2JZzmjxeHzybh4ji1hOgwUjlE6EFGSlSdmZMDbogi4qr4i5VpwFdH9ej1FnojsYh4F4P1NeAD8cH7MEHEnT8ZHu+cAhNsuwbHkfowAGQZgdQcaUicrbyO2Shdt81BwhA9AEIIWxyrem7jtAEFFMArD0BAqhMgAROorD+MQNFwAAPnANH+BArAxOo8w0RMUxhLM8xlFg1EhHRDFMax7GcdxUC8dANHipklB6CgCzNNacH7MA5GUdR5picASGcGcgnwBYfDmkSgGJkQZQ0TAykVPqjlwgA8gA+vQRYAOIABIVqqNEClhOF4XKWnyBZcAAEa9DZJTfr0ZTNDwrkblYZRWTAzRAA
	Errors!: Errors;

	name: string;
	errorsDefinitions: Record<
		string,
		{ new (...args: any): any; prototype: Error }
	> = {};

	constructor(name: string) {
		this.name = name;
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
			Errors & { [name in Name]: InstanceType<NewError> }
		>;
	}
}
