import { Bot } from "#bot";
import { FrameworkAdapter, frameworks } from "./adapters";

export function webhookHandler(bot: Bot, framework: keyof typeof frameworks) {
	const frameworkAdapter = frameworks[framework] as FrameworkAdapter;

	return async (...args: any[]) => {
		const { update } = frameworkAdapter(...args);

		await bot.updates.handleUpdate(update);
	};
}
