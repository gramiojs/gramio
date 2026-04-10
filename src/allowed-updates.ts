import type {
	CustomEventName,
	MessageEventName,
	UpdateName,
} from "@gramio/contexts";
import { contextsMappings } from "@gramio/contexts";

/**
 * Telegram Bot API top-level update type name.
 * Valid values for `allowed_updates` in `getUpdates` / `setWebhook`.
 */
export type AllowedUpdateName = Exclude<
	UpdateName,
	MessageEventName | CustomEventName
>;

const ALL_NAMES = [
	"message",
	"edited_message",
	"channel_post",
	"edited_channel_post",
	"business_connection",
	"business_message",
	"edited_business_message",
	"deleted_business_messages",
	"message_reaction",
	"message_reaction_count",
	"inline_query",
	"chosen_inline_result",
	"callback_query",
	"shipping_query",
	"pre_checkout_query",
	"purchased_paid_media",
	"poll",
	"poll_answer",
	"my_chat_member",
	"chat_member",
	"chat_join_request",
	"chat_boost",
	"removed_chat_boost",
	"managed_bot",
] as const satisfies readonly AllowedUpdateName[];

// Completeness check: TS error if a new AllowedUpdateName value is not listed above.
function _assertComplete<T extends true>(_: T): void {}
_assertComplete<
	AllowedUpdateName extends (typeof ALL_NAMES)[number] ? true : false
>(true as any);

/** The 5 update types carrying Message objects (can contain sub-events). */
const MESSAGE_PARENT_TYPES: readonly AllowedUpdateName[] = [
	"message",
	"edited_message",
	"channel_post",
	"edited_channel_post",
	"business_message",
] as const;

/** The 3 types Telegram excludes by default (must be explicitly requested). */
export const OPT_IN_TYPES: readonly AllowedUpdateName[] = [
	"chat_member",
	"message_reaction",
	"message_reaction_count",
] as const;

const KNOWN_EVENTS = new Set(Object.keys(contextsMappings));
const ALL_NAMES_SET = new Set<string>(ALL_NAMES);

/**
 * Maps any event name to the `AllowedUpdateName` values needed in `allowed_updates`.
 *
 * - Top-level update names → themselves
 * - Sub-message events (MessageEventName) → all 5 message-carrying parent types
 * - Unknown names (filter names like "text") → `undefined` (skipped)
 */
export function mapEventToAllowedUpdates(
	event: string,
): readonly AllowedUpdateName[] | undefined {
	if (ALL_NAMES_SET.has(event)) return [event as AllowedUpdateName];
	if (KNOWN_EVENTS.has(event)) return MESSAGE_PARENT_TYPES;
	return undefined;
}

/**
 * Detect which of the 3 opt-in types have handlers registered.
 * Used by `bot.start()` for default auto opt-in behavior.
 */
export function detectOptInUpdates(
	registeredEvents: Set<string>,
): AllowedUpdateName[] {
	return OPT_IN_TYPES.filter((type) => registeredEvents.has(type));
}

/**
 * Fluent, immutable builder for the Telegram Bot API `allowed_updates` list.
 *
 * Instances directly extend `Array<AllowedUpdateName>`, so they can be passed
 * wherever `allowedUpdates` is expected without any conversion.
 *
 * @example
 * ```typescript
 * import { AllowedUpdatesFilter } from "gramio";
 *
 * // All updates (opt-in types included: chat_member, message_reaction, message_reaction_count)
 * bot.start({ allowedUpdates: AllowedUpdatesFilter.all });
 *
 * // Telegram's default set (opt-in types excluded)
 * bot.start({ allowedUpdates: AllowedUpdatesFilter.default });
 *
 * // Explicit list
 * bot.start({ allowedUpdates: AllowedUpdatesFilter.only("message", "callback_query") });
 *
 * // All except poll events
 * bot.start({ allowedUpdates: AllowedUpdatesFilter.all.except("poll", "poll_answer") });
 *
 * // Default + opt-in to chat_member
 * bot.start({ allowedUpdates: AllowedUpdatesFilter.default.add("chat_member") });
 * ```
 */
export class AllowedUpdatesFilter extends Array<AllowedUpdateName> {
	/** @internal use static factory methods instead */
	constructor(updates: readonly AllowedUpdateName[]) {
		super(...updates);
	}

	/**
	 * All update types, including the opt-in ones:
	 * `chat_member`, `message_reaction`, and `message_reaction_count`.
	 */
	static get all(): AllowedUpdatesFilter {
		return new AllowedUpdatesFilter(ALL_NAMES);
	}

	/**
	 * Telegram's **default** update set.
	 *
	 * Receive all updates _except_ `chat_member`, `message_reaction`, and
	 * `message_reaction_count` — the three types that Telegram requires to be
	 * explicitly listed in `allowed_updates`.
	 *
	 * This matches what Telegram does when `allowed_updates` is omitted or
	 * passed as an empty array.
	 */
	static get default(): AllowedUpdatesFilter {
		return AllowedUpdatesFilter.all.except(
			"chat_member",
			"message_reaction",
			"message_reaction_count",
		);
	}

	/**
	 * Create a filter with **exactly** the specified update types.
	 *
	 * @example
	 * ```typescript
	 * AllowedUpdatesFilter.only("message", "callback_query", "inline_query")
	 * ```
	 */
	static only(...types: AllowedUpdateName[]): AllowedUpdatesFilter {
		return new AllowedUpdatesFilter(types);
	}

	/**
	 * Return a new filter with the given types **added**.
	 * Already-present types are silently deduplicated.
	 *
	 * @example
	 * ```typescript
	 * AllowedUpdatesFilter.default.add("chat_member", "message_reaction")
	 * ```
	 */
	add(...types: AllowedUpdateName[]): AllowedUpdatesFilter {
		const set = new Set<AllowedUpdateName>(this);
		for (const t of types) set.add(t);
		return new AllowedUpdatesFilter([...set]);
	}

	/**
	 * Return a new filter with the given types **removed**.
	 *
	 * @example
	 * ```typescript
	 * AllowedUpdatesFilter.all.except("poll", "poll_answer", "chosen_inline_result")
	 * ```
	 */
	except(...types: AllowedUpdateName[]): AllowedUpdatesFilter {
		const excluded = new Set<string>(types);
		return new AllowedUpdatesFilter(
			(Array.from(this) as AllowedUpdateName[]).filter((t) => !excluded.has(t)),
		);
	}

	/** Convert to a plain `AllowedUpdateName[]` array. */
	toArray(): AllowedUpdateName[] {
		return Array.from(this);
	}
}

/**
 * Build an {@link AllowedUpdatesFilter} automatically from a bot's registered
 * `.on()` handlers (including handlers from extended plugins).
 *
 * Returns **only** the update types that handlers explicitly register for.
 * Use this for strict filtering — Telegram will only send these update types.
 *
 * **Note:** filter-only `.on(filterFn, handler)` and `.use()` middleware
 * do not declare specific events and are not included.
 * Manually `.add()` additional types if needed.
 *
 * Call after all handlers/plugins are registered (or after `bot.init()`).
 *
 * @example
 * ```typescript
 * const bot = new Bot(token)
 *     .command("start", handler)
 *     .callbackQuery("data", handler);
 *
 * bot.start({ allowedUpdates: buildAllowedUpdates(bot) });
 * // → allowed_updates: ["message", "business_message", "callback_query"]
 *
 * // With customization:
 * bot.start({ allowedUpdates: buildAllowedUpdates(bot).add("poll") });
 * ```
 */
export function buildAllowedUpdates(bot: {
	updates: { composer: { registeredEvents(): Set<string> } };
}): AllowedUpdatesFilter {
	const registeredEvents = bot.updates.composer.registeredEvents();
	const allowedSet = new Set<AllowedUpdateName>();
	for (const event of registeredEvents) {
		const mapped = mapEventToAllowedUpdates(event);
		if (mapped) for (const name of mapped) allowedSet.add(name);
	}
	return new AllowedUpdatesFilter([...allowedSet]);
}
