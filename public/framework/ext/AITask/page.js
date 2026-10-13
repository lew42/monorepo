import { Page, md } from "/app.js";

// A pointer: ext/AITask moved to ai/AITask on 2026-10-13 (readme.md here says why).
export default new Page({
	meta: import.meta,
	title: "AITask (moved)",
	description: "Moved to ai/AITask on 2026-10-13: it renders agent task logs, so it lives with the AI system.",
	icon: "smart_toy",
	content(){
		md("**AITask moved to [ai/AITask](/framework/ai/AITask/)** on 2026-10-13. It renders an agent task's log (one task, a day, the board), so it lives with the AI system now; the rule for what goes in `ai/` is at the top of the [AI readme](/framework/ai/readme.md).");
	},
});
