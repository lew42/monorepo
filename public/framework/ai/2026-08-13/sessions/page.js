import { AITask } from "/app.js";

export default new AITask({
	meta: import.meta,
	title: "Session recorder",
	description: "The session that built ext/ai, recorded by it — manifest, agents, replays.",
	icon: "receipt_long",
});
