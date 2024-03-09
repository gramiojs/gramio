import type { Bot } from "#bot";
import { type FrameworkAdapter, frameworks } from "./adapters";

export function webhookHandler(bot: Bot, framework: keyof typeof frameworks) {
	const frameworkAdapter = frameworks[framework] as FrameworkAdapter;

	return async (...args: any[]) => {
		const { update } = frameworkAdapter(...args);

		await bot.updates.handleUpdate(await update);
	};
}
