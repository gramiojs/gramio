import {
	type Context,
	type MaybeArray,
	type UpdateName,
	contextsMappings,
} from "@gramio/contexts";
import type { APIMethodParams, TelegramUpdate } from "@gramio/types";
import {
	type CaughtMiddlewareHandler,
	Composer,
	noopNext,
} from "middleware-io";
import type { Bot } from "./bot";
import type { Handler } from "./types";

export class Updates {
	private readonly bot: Bot<any, any>;
	isStarted = false;
	private offset = 0;
	private composer = Composer.builder<
		Context<Bot> & {
			[key: string]: unknown;
		}
	>();
	private onError: CaughtMiddlewareHandler<Context<Bot>>;

	constructor(
		bot: Bot<any, any>,
		onError: CaughtMiddlewareHandler<Context<any>>,
	) {
		this.bot = bot;
		this.onError = onError;
	}

	//TODO: FIX
	on<T extends UpdateName>(updateName: MaybeArray<T>, handler: Handler<any>) {
		return this.use(async (context, next) => {
			//TODO: fix typings
			if (context.is(updateName)) await handler(context, next);
			else await next();
		});
	}

	use(handler: Handler<any>) {
		this.composer.caught(this.onError).use(handler);

		return this;
	}

	async handleUpdate(data: TelegramUpdate) {
		const updateType = Object.keys(data).at(1) as UpdateName;

		this.offset = data.update_id + 1;

		const UpdateContext = contextsMappings[updateType];
		if (!UpdateContext) throw new Error(updateType);

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
				context as unknown as Context<Bot> & {
					[key: string]: unknown;
				},
				noopNext,
			);
		} catch (error) {
			throw new Error(`[UPDATES] Update type ${updateType} not supported.`);
		}
	}
	/**@deprecated use bot.start instead */
	async startPolling(params: APIMethodParams<"getUpdates"> = {}) {
		if (this.isStarted) throw new Error("[UPDATES] Polling already started!");

		this.isStarted = true;

		this.startFetchLoop(params);

		return;
	}

	async startFetchLoop(params: APIMethodParams<"getUpdates"> = {}) {
		while (this.isStarted) {
			const updates = await this.bot.api.getUpdates({
				...params,
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
