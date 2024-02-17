import { Context, UpdateName, contextsMappings } from "@gramio/contexts";
import type { TelegramUpdate } from "@gramio/types";
import { Composer, noopNext } from "middleware-io";
import type { Bot } from "./bot";
import { THandler } from "./types";

export class Updates {
	private readonly bot: Bot;
	private isStarted = false;
	private offset = 0;
	private composer = Composer.builder<
		Context & {
			[key: string]: unknown;
		}
	>();

	constructor(bot: Bot) {
		this.bot = bot;
	}

	on<T extends UpdateName>(
		updateName: T,
		handler: THandler<InstanceType<(typeof contextsMappings)[T]>>,
	) {
		return this.use((context, next) => {
			//TODO: fix typings
			if (context.is(updateName))
				handler(context as InstanceType<(typeof contextsMappings)[T]>, next);
			else next();
		});
	}

	use(handler: THandler<Context>) {
		this.composer.use(handler);

		return this;
	}

	async handleUpdate(data: TelegramUpdate) {
		const updateType = Object.keys(data).at(1) as UpdateName;

		this.offset = data.update_id + 1;

		const UpdateContext = contextsMappings[updateType];
		if (!UpdateContext) return;

		try {
			let context = new UpdateContext({
				//@ts-expect-error
				bot: this.bot,
				update: data,
				//@ts-expect-error
				payload: data[updateType as Exclude<keyof typeof data, "update_id">],
				type: updateType,
				updateId: data.update_id,
			});

			if ("isEvent" in context && context.isEvent() && context.eventType) {
				context = new contextsMappings[context.eventType]({
					//@ts-expect-error
					bot: this.bot,
					update: data,
					//@ts-expect-error
					payload:
						data.message ??
						data.edited_message ??
						data.channel_post ??
						data.edited_channel_post,
					type: context.eventType,
					updateId: data.update_id,
				});
			}

			this.composer.compose()(
				//TODO: fix typings
				context as unknown as Context & {
					[key: string]: unknown;
				},
				noopNext,
			);
		} catch (error) {
			throw new Error(`[UPDATES] Update type ${updateType} not supported.`);
		}
	}

	async startPolling() {
		if (this.isStarted) throw new Error("[UPDATES] Polling already started!");

		this.isStarted = true;

		this.startFetchLoop();

		return;
	}

	async startFetchLoop() {
		while (this.isStarted) {
			const updates = await this.bot.api.getUpdates({
				offset: this.offset,
			});

			for await (const update of updates) {
				//TODO: update errors
				await this.handleUpdate(update).catch(console.error);
			}
		}
	}

	stopPolling() {
		this.isStarted = false;
	}
}
