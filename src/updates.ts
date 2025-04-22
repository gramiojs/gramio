import {
	type Context,
	type UpdateName,
	contextsMappings,
} from "@gramio/contexts";
import type { APIMethodParams, TelegramUpdate } from "@gramio/types";
import type { CaughtMiddlewareHandler } from "middleware-io";
import { Composer } from "./composer.js";
import { TelegramError } from "./errors.js";
import { UpdateQueue } from "./queue.js";
import type { AnyBot } from "./types.js";
import { debug$updates, sleep } from "./utils.internal.ts";

export class Updates {
	private readonly bot: AnyBot;
	isStarted = false;
	isRequestActive = false;
	private offset = 0;
	composer: Composer;
	queue: UpdateQueue<TelegramUpdate>;
	stopPollingPromiseResolve: ((value?: undefined) => void) | undefined;

	constructor(bot: AnyBot, onError: CaughtMiddlewareHandler<Context<any>>) {
		this.bot = bot;
		this.composer = new Composer(onError);
		this.queue = new UpdateQueue(this.handleUpdate.bind(this));
	}

	async handleUpdate(data: TelegramUpdate, mode: "wait" | "lazy" = "wait") {
		const updateType = Object.keys(data).at(1) as UpdateName;

		const UpdateContext = contextsMappings[updateType];
		if (!UpdateContext) throw new Error(updateType);

		const updatePayload =
			data[updateType as Exclude<keyof typeof data, "update_id">];
		if (!updatePayload) throw new Error("Unsupported event??");
		try {
			let context = new UpdateContext({
				bot: this.bot,
				update: data,
				// @ts-expect-error
				payload: updatePayload,
				type: updateType,
				updateId: data.update_id,
			});

			if ("isEvent" in context && context.isEvent() && context.eventType) {
				const payload =
					data.message ??
					data.edited_message ??
					data.channel_post ??
					data.edited_channel_post ??
					data.business_message;
				if (!payload) throw new Error("Unsupported event??");

				context = new contextsMappings[context.eventType]({
					bot: this.bot,
					update: data,
					payload,
					// @ts-expect-error
					type: context.eventType,
					updateId: data.update_id,
				});
			}

			return mode === "wait"
				? this.composer.composeWait(context as unknown as Context<AnyBot>)
				: this.composer.compose(context as unknown as Context<AnyBot>);
		} catch (error) {
			throw new Error(`[UPDATES] Update type ${updateType} not supported.`);
		}
	}

	/** @deprecated use bot.start instead @internal */
	startPolling(
		params: APIMethodParams<"getUpdates"> = {},
		dropPendingUpdates = false,
	) {
		if (this.isStarted) throw new Error("[UPDATES] Polling already started!");

		this.isStarted = true;

		this.startFetchLoop(params, dropPendingUpdates);

		return;
	}

	async startFetchLoop(
		params: APIMethodParams<"getUpdates"> = {},
		dropPendingUpdates = false,
	) {
		if (dropPendingUpdates) await this.dropPendingUpdates();

		while (this.isStarted) {
			try {
				this.isRequestActive = true;
				const updates = await this.bot.api.getUpdates({
					timeout: 30,
					...params,
					offset: this.offset,
				});
				this.isRequestActive = false;

				const updateId = updates.at(-1)?.update_id;
				this.offset = updateId ? updateId + 1 : this.offset;

				for await (const update of updates) {
					this.queue.add(update);
					// await this.handleUpdate(update).catch(console.error);
				}
			} catch (error) {
				console.error("Error received when fetching updates", error);

				if (error instanceof TelegramError && error.payload?.retry_after) {
					await sleep(error.payload.retry_after * 1000);
				} else await sleep(this.bot.options.api.retryGetUpdatesWait ?? 1000);
			}
		}

		this.stopPollingPromiseResolve?.();
	}

	async dropPendingUpdates() {
		const result = await this.bot.api.getUpdates({
			// The negative offset can be specified to retrieve updates starting from *-offset* update from the end of the updates queue.
			// All previous updates will be forgotten.
			offset: -1,
			timeout: 0,
		});

		const lastUpdateId = result.at(-1)?.update_id;

		debug$updates(
			"Dropping pending updates... Set offset to last update id %s + 1",
			lastUpdateId,
		);

		this.offset = lastUpdateId ? lastUpdateId + 1 : this.offset;
	}

	/**
	 * ! Soon waitPendingRequests param default will changed to true
	 */
	stopPolling(waitPendingRequests = false): Promise<void> {
		this.isStarted = false;

		if (!this.isRequestActive || !waitPendingRequests) return Promise.resolve();

		return new Promise((resolve) => {
			this.stopPollingPromiseResolve = resolve;
		});
	}
}
