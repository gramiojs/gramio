import { Bot } from "#bot";
import { frameworks } from "./adapters";

export function webhookHandler(bot: Bot, framework: keyof typeof frameworks) {
	const frameworkAdapter = frameworks[framework];

	return async (...args: any[]) => {
		const { update } = frameworkAdapter(...args);

		await bot.updates.handleUpdate(await update);
	};
}
