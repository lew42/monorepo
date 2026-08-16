import { Doc, md, code, demo, AITask } from "/app.js";
import { manifest_card, segments } from "./card.js";
import { usage_rail } from "./usage.js";
import { progress } from "./stats.js";

export default new Doc({
	meta: import.meta,
	title: "AITask",
	description: "A task's task.jsonl (or legacy session.json), rendered — request, checklist, spend, agents — with a live feed and a chat panel onto the raw transcript.",
	icon: "smart_toy",

	subject: AITask,
	properties: "src",
	methods:    "content session legacy base requirements report refresh head checklist unparsed extra figures chat log",
	notes:      "manifest effort starting-work pace template waves",
	files:      "AITask.js ai.css board.js card.js compose.js dashboard.js effort.js feed.js feed.css message.js prompt.js replay.js stats.js usage.js page.js readme.md",
	overview:   [
		{ title: "Task card", content(){
			demo(() => {
				manifest_card({ title: "improve-daily-task-dashboard", url: "#", m: {
					requested_at: new Date(Date.now() - 40 * 60000).toISOString(),
					logs: [{ at: new Date(Date.now() - 2 * 60000).toISOString(), msg: "still going" }],
					steps: ["scope the schema", "wire the dashboard", "verify in the browser", "write the docs"],
					step: 3, tokens: 738899, model: "claude-sonnet-5",
					agents: [{ task: "wire the dashboard", outcome: "done" }, { task: "verify in the browser" }],
				} });
			}, "One row — state dot, title, step segments, figures right-aligned. The same row the day dashboard and the index rail both use. Real ones: [the board](/framework/ai/).");
		} },
		{ title: "Quiet task", content(){
			demo(() => {
				manifest_card({ title: "improve-daily-task-dashboard", url: "#", m: {
					requested_at: new Date(Date.now() - 4 * 3600e3).toISOString(),
					logs: [{ at: new Date(Date.now() - 2 * 3600e3).toISOString(), msg: "wired the dashboard" }],
					steps: ["scope the schema", "wire the dashboard", "verify in the browser", "write the docs"],
					step: 3, tokens: 738899, model: "claude-sonnet-5",
					agents: [{ task: "wire the dashboard", outcome: "done" }, { task: "verify in the browser" }],
				} });
			}, "The same running card whose newest log line is two hours old. A silence over 30 minutes joins the figures as `2h 0m quiet` — computed in the browser from the log the card already holds, and worded as a silence because nothing here can tell a crash from a long think.");
		} },
		{ title: "Usage pace", content(){
			demo(() => {
				usage_rail({ utilization: { limits: [
					{ kind: "session", group: "session", percent: 42, resets_at: new Date(Date.now() + 2 * 3600e3).toISOString() },
					{ kind: "weekly_all", group: "weekly", percent: 61, resets_at: new Date(Date.now() + 3 * 86400e3).toISOString() },
				] } });
			}, "The fill is spend, the ▼ marks the clock — bar behind marker is under pace. Live: [/framework/ai/](/framework/ai/)'s rail.");
		} },
		{ title: "Step checklist", content(){
			demo(() => {
				segments(progress({ steps: ["scope", "write the schema", "wire the dashboard", "verify"], step: 3 }));
			}, "The bar moves a notch per completed step. `steps` is the outline, `step` the 1-based index underway — nothing else can disagree with it.");
		} },
	],

	content(){
		code.js(`import { AITask } from "/app.js";

export default new AITask({
    meta: import.meta,
    title: "Panel system",
    icon: "receipt_long",
    extra(){ md("what this one uniquely needs to say"); },
});`, "framework/ai/2026-08-13/panel/page.js");

		md("Three tiers: a **session** (one Claude transcript) works a **task** (`ai/<date>/<slug>/`); a **day** is the dashboard over its tasks; [`/framework/ai/`](/framework/ai/) is the rail over every task there has ever been. `AITask` renders one task's manifest — the request, the step checklist, the spend, one row per agent — and **is** the master template: `report()` is its outline, and a task's own `page.js` overrides whichever named part it wants and inherits the rest.");

		md("A task dir with no `page.js` still gets this page — the day's `route()` falls back to `new AITask({ url, src })` — so the template is the default across the whole archive, and a curated `extra()` is the exception.");

		md("**The raw transcript never enters the repo.** On the dev server, `/ai-logs/<session-id>` streams the real file from `~/.claude/projects/`, and each recorded session id becomes a live feed and a threaded replay. On static hosting the replay says \"unavailable\" and the manifest stands alone.");

		md("Live: [the AI board](/framework/ai/) · [a day](/framework/ai/2026-08-13/) · [a task with an `extra()`](/framework/ai/2026-08-13/panel/) · [a plain manifest](/framework/ai/2026-08-13/sessions/).");

		md.details(import.meta, "readme.md", "Design record — schema, the effort mechanism, pace, sharp edges");
	}
});
