import { describe, expect, mock, test } from "bun:test";
import { webhookHandler } from "../src/webhook/index.ts";

const SECRET_HEADER = "X-Telegram-Bot-Api-Secret-Token";
const SAMPLE_UPDATE = {
	update_id: 100,
	message: {
		message_id: 50,
		date: 0,
		chat: { id: 1, type: "private" },
	},
};

function createRequest(headers: Record<string, string> = {}) {
	return new Request("https://example.com/webhook", {
		method: "POST",
		body: JSON.stringify(SAMPLE_UPDATE),
		headers: {
			"content-type": "application/json",
			...headers,
		},
	});
}

function createBot() {
	const queueAdd = mock(() => {});
	const handleUpdate = mock(async () => {});

	return {
		bot: {
			updates: {
				queue: { add: queueAdd },
				handleUpdate,
			},
		},
		queueAdd,
		handleUpdate,
	};
}

describe("webhookHandler", () => {
	test("enqueues updates when shouldWait is disabled", async () => {
		const { bot, queueAdd, handleUpdate } = createBot();
		const handler = webhookHandler(bot as any, "Request");

		const response = await handler(createRequest());

		expect(queueAdd).toHaveBeenCalledTimes(1);
		expect(queueAdd.mock.calls[0][0]).toEqual(SAMPLE_UPDATE);
		expect(handleUpdate).not.toHaveBeenCalled();
		expect(response.status).toBe(200);
		expect(await response.text()).toBe("ok!");
	});

	test("rejects request with invalid secret token", async () => {
		const { bot, queueAdd } = createBot();
		const handler = webhookHandler(bot as any, "Request", "expected-secret");

		const response = await handler(
			createRequest({
				[SECRET_HEADER]: "wrong",
			}),
		);

		expect(queueAdd).not.toHaveBeenCalled();
		expect(response.status).toBe(401);
		expect(await response.text()).toBe("secret token is invalid");
	});

	test("waits for handler when shouldWait is true", async () => {
		const { bot, queueAdd, handleUpdate } = createBot();
		const handler = webhookHandler(bot as any, "Request", { shouldWait: true });

		const response = await handler(createRequest());

		expect(queueAdd).not.toHaveBeenCalled();
		expect(handleUpdate).toHaveBeenCalledTimes(1);
		expect(response.status).toBe(200);
	});

	test("resolves request when handler exceeds timeout and mode is return", async () => {
		const { bot, queueAdd, handleUpdate } = createBot();
		handleUpdate.mockImplementation(
			() =>
				new Promise(() => {
					// never resolve
				}),
		);
		const handler = webhookHandler(bot as any, "Request", {
			shouldWait: { timeout: 10, onTimeout: "return" },
		});

		const start = Date.now();
		const response = await handler(createRequest());
		const duration = Date.now() - start;

		expect(duration).toBeGreaterThanOrEqual(10);
		expect(queueAdd).not.toHaveBeenCalled();
		expect(handleUpdate).toHaveBeenCalledTimes(1);
		expect(response.status).toBe(200);
	});

	test("throws when handler exceeds timeout and mode is throw", async () => {
		const { bot, handleUpdate } = createBot();
		handleUpdate.mockImplementation(
			() =>
				new Promise(() => {
					// never resolve
				}),
		);
		const handler = webhookHandler(bot as any, "Request", {
			shouldWait: { timeout: 10, onTimeout: "throw" },
		});

		await expect(async () => handler(createRequest())).toThrow(
			"Webhook handler execution timed out after 10ms",
		);
	});
});
