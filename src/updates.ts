import { Context, UpdateName, contextsMappings } from "@gramio/contexts";
import type { TelegramUpdate } from "@gramio/types";
import { CaughtMiddlewareHandler, Composer, noopNext } from "middleware-io";
import type { Bot } from "./bot";
import { Handler } from "./types";

export class Updates {
	private readonly bot: Bot;
	private isStarted = false;
	private offset = 0;
	private composer = Composer.builder<
		Context & {
			[key: string]: unknown;
		}
	>();
	private onError: CaughtMiddlewareHandler<Context>;

	constructor(bot: Bot, onError: CaughtMiddlewareHandler<Context>) {
		this.bot = bot;
		this.onError = onError;
	}

	on<T extends UpdateName>(
		updateName: T,
		handler: Handler<InstanceType<(typeof contextsMappings)[T]>>,
	) {
		return this.use(async (context, next) => {
			//TODO: fix typings
			if (context.is(updateName))
				await handler(
					context as InstanceType<(typeof contextsMappings)[T]>,
					next,
				);
			else await next();
		});
	}

	use(handler: Handler<Context>) {
		this.composer.caught(this.onError).use(handler);

		return this;
	}

	async handleUpdate(data: TelegramUpdate) {
		const updateType = Object.keys(data).at(1) as UpdateName;

		this.offset = data.update_id + 1;

		const UpdateContext = contextsMappings[updateType];
		if (!UpdateContext) return;

		try {
			let context = new UpdateContext({
				bot: this.bot,
				update: data,
				//@ts-expect-error
				payload: data[updateType as Exclude<keyof typeof data, "update_id">],
				type: updateType,
				updateId: data.update_id,
			});

			if ("isEvent" in context && context.isEvent() && context.eventType) {
				context = new contextsMappings[context.eventType]({
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
