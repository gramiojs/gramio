import { describe, expect, test } from "bun:test";
import { EventQueue } from "@gramio/composer";

describe("EventQueue", () => {
	test("processes queued updates", async () => {
		const processed: number[] = [];
		const queue = new EventQueue<number>(async (update) => {
			processed.push(update);
			await Bun.sleep(1);
		});

		queue.add(1);
		queue.add(2);

		await queue.stop(50);

		expect(processed).toEqual([1, 2]);
	});

	test("stop resolves immediately when queue is idle", async () => {
		const queue = new EventQueue(async () => {});

		await expect(queue.stop()).resolves.toBeUndefined();
	});

	test("stop respects timeout when handlers never complete", async () => {
		const queue = new EventQueue<number>(
			async () =>
				new Promise(() => {
					// never resolve
				}),
		);

		queue.add(1);

		const start = Date.now();
		await queue.stop(20);
		const duration = Date.now() - start;

		expect(duration).toBeGreaterThanOrEqual(20);
		expect(duration).toBeLessThan(200);
	});
});
