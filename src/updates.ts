import { scheduler } from "node:timers/promises";
import {
	type Context,
	type UpdateName,
	contextsMappings,
} from "@gramio/contexts";
import type { APIMethodParams, TelegramUpdate } from "@gramio/types";
import type { CaughtMiddlewareHandler } from "middleware-io";
import { Composer } from "./composer";
import type { AnyBot } from "./types";

export class Updates {
	private readonly bot: AnyBot;
	isStarted = false;
	private offset = 0;
	composer: Composer;

	constructor(bot: AnyBot, onError: CaughtMiddlewareHandler<Context<any>>) {
		this.bot = bot;
		this.composer = new Composer(onError);
	}

	async handleUpdate(data: TelegramUpdate) {
		const updateType = Object.keys(data).at(1) as UpdateName;

		this.offset = data.update_id + 1;

		const UpdateContext = contextsMappings[updateType];
		if (!UpdateContext) throw new Error(updateType);

		const updatePayload =
			data[updateType as Exclude<keyof typeof data, "update_id">];
		if (!updatePayload) throw new Error("");
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

			this.composer.compose(context as unknown as Context<AnyBot>);
		} catch (error) {
			throw new Error(`[UPDATES] Update type ${updateType} not supported.`);
		}
	}
	/** @deprecated use bot.start instead @internal */
	async startPolling(params: APIMethodParams<"getUpdates"> = {}) {
		if (this.isStarted) throw new Error("[UPDATES] Polling already started!");

		this.isStarted = true;

		this.startFetchLoop(params);

		return;
	}

	async startFetchLoop(params: APIMethodParams<"getUpdates"> = {}) {
		while (this.isStarted) {
			try {
				const updates = await this.bot.api.getUpdates({
					...params,
					offset: this.offset,
				});

				for await (const update of updates) {
					//TODO: update errors
					await this.handleUpdate(update).catch(console.error);
				}
			} catch (error) {
				console.error("Error received when fetching updates", error);

				await scheduler.wait(this.bot.options.api.retryGetUpdatesWait);
			}
		}
	}

	stopPolling() {
		this.isStarted = false;
	}
}
