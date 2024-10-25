import type {
	Context,
	ContextType,
	MaybeArray,
	MessageContext,
	UpdateName,
} from "@gramio/contexts";
import type { Bot } from "./bot.js";

export interface AdditionDefinitions {
	equal: any;
	addition: Record<string, any>;
}

type ReturnIfNonNever<T> = [T] extends [never] ? {} : T;

export type Filters<
	BotType extends Bot = Bot,
	Base = Context<BotType>,
	ConditionalAdditions extends AdditionDefinitions[] = [],
> = {
	_s: Base;
	_ad: ConditionalAdditions;
	__filters: ((context: Context<BotType>) => boolean)[];
	context<T extends UpdateName>(
		updateName: MaybeArray<T>,
	): Filters<BotType, ContextType<BotType, T>, ConditionalAdditions>;
	is2(): Filters<BotType, 2, ConditionalAdditions>;
} & ReturnIfNonNever<
	{
		[K in keyof ConditionalAdditions &
			number]: ConditionalAdditions[K] extends {
			equal: infer E;
			addition: infer T;
		}
			? Base extends E
				? T
				: {}
			: {};
	}[number]
>;

// type filter = Filters<
// 	Context<Bot> & {prop: 2},
// 	[{ equal: { prop: 2 }; addition: { some: 2 } }]
// >;

// const a = {} as filter;

// // a.s;

// type S = [{ equal: { prop: 2 }; addition: { some: 2 } }];

// type C = {[K in keyof S & number]: S[K]};

// type SA = {
// 	[K in keyof S & number]: S[K] extends {
// 		equal: infer E;
// 		addition: infer T;
// 	} ? Context<Bot> & {prop: 2} extends E ? T : {} : {}}[number];

// type A = Context<Bot> & {prop: 2} extends SA ? true : false;

// export const filters: Filters = {
// 	__filters: [],
// 	context(updateName) {
// 		this.__filters.push((context) => context.is(updateName));

// 		return this;
// 	},
// };
