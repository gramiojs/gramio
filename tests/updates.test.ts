import { beforeEach, describe, expect, it, jest } from "bun:test";
import { Updates } from "../src/updates.js";

class MockBot {
	api = {
		getUpdates: jest.fn(),
	};
	options = { api: {} };
}

describe("Updates.stopPolling", () => {
	let updates: Updates;
	let bot: MockBot;

	beforeEach(() => {
		bot = new MockBot();
		updates = new Updates(bot as any, jest.fn());
	});

	it("resolves immediately if no request is active", async () => {
		updates.isRequestActive = false;
		const promise = updates.stopPolling();

		expect(promise).resolves.toBeUndefined();
	});

	it("resolves after request completes if request is active", async () => {
		updates.isRequestActive = true;
		let resolved = false;
		const promise = updates.stopPolling().then(() => {
			resolved = true;
		});
		setTimeout(() => {
			updates.isRequestActive = false;

			updates.stopPollingPromiseResolve?.();
		}, 50);
		await promise;

		expect(resolved).toBe(true);
	});

	it("sets isStarted to false", () => {
		updates.isStarted = true;
		updates.stopPolling();
		expect(updates.isStarted).toBe(false);
	});
});
