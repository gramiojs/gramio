import type { TelegramUpdate } from "@gramio/types";
import { sleep } from "./utils.internal.ts";

// concurrent queue (like event loop) for managing updates with graceful shutdown support
export class UpdateQueue<Data = TelegramUpdate> {
	private updateQueue: Data[] = [];

	private pendingUpdates: Set<Promise<unknown>> = new Set();
	private handler: (update: Data) => Promise<unknown>;
	private onIdleResolver: (() => void) | undefined;
	private onIdlePromise: Promise<void> | undefined;
	private isActive = false;

	constructor(handler: (update: Data) => Promise<unknown>) {
		//TODO: update errors
		this.handler = handler;
	}

	add(update: Data) {
		// console.log("ADD", update);
		this.updateQueue.push(update);

		this.start();
	}

	private start() {
		this.isActive = true;

		// try {
		while (this.updateQueue.length && this.isActive) {
			const update = this.updateQueue.shift();

			if (!update) continue;
			const promise = this.handler(update);
			this.pendingUpdates.add(promise);

			promise.finally(async () => {
				this.pendingUpdates.delete(promise);

				if (
					this.pendingUpdates.size === 0 &&
					this.updateQueue.length === 0 &&
					this.onIdleResolver
				) {
					this.onIdleResolver();
					this.onIdleResolver = undefined;
				}
			});
		}
		// } finally {
		// this.isActive = false;
		// }
	}

	async stop(timeout = 3_000) {
		if (this.updateQueue.length === 0 && this.pendingUpdates.size === 0) {
			return;
		}

		this.onIdlePromise = new Promise((resolve) => {
			this.onIdleResolver = resolve;
		});

		await Promise.race([this.onIdlePromise, sleep(timeout)]);

		this.isActive = false;
	}
}
