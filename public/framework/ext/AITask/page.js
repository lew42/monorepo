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
	methods:    "content session legacy base requirements report asks decisions streamed refresh outcome links head status checklist unparsed extra shots figures chat composer log",
	notes:      "asks ranking decisions-tab highlights manifest effort starting-work pace template waves decisions",
	files:      "AITask.js ai.css asks.js board.js card.js compose.js conversation.js dashboard.js decisions.js decisions.mjs effort.js highlights.js message.js needs.js prompt.js rank.js shots.js stats.js usage.js page.js readme.md",
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

		md("A task page is up to five tabs. **Asks** comes first whenever the log carries any: one preview card per thing the owner asked for — a picture of what the work produced, their own sentence, and a link back to the message they said it in, grouped into a band per topic. Click a card and a sheet opens **in the wall, under that card's own row**: the quote verbatim, then what each serving task shipped. Then **Requirements** (the brief), **Decisions** (what was chosen, and what over), **Report** (the answer) and **Session** (the transcript, read as a chat). [The Asks tab, live](/framework/ai/2026-09-17/mastermind-layout-browser/) · [doc/asks.md](/framework/ext/AITask/doc/asks/).");

		code.js(`{"ask": {"id": "session-as-chat", "at": "2026-09-17T16:50:40-05:00",
  "summary": "The session log reads like a chat conversation, with flow and rhythm.",
  "quote": "the session logs can even be clicked through, although that navigation ...",
  "prompt": "534b8723-d1a1-4eab-a4b6-c1b3a8138351",
  "status": "building", "tasks": ["ai-log-asks"]}}`, "framework/ai/<date>/<slug>/task.jsonl");

		md("**Once a card is answered, its title becomes the answer.** The owner's own words: \"lead with the conclusion as the title; if I'm curious I drill down and see what I asked.\" Stamp a `conclusion` onto an ask already in the log and the card's title switches from the id-derived guess to that sentence, verbatim — `summary` moves down into the sheet, under a small \"you asked\" label. `minutes`, set only on the rare card that takes the owner longer than a glance to read, shows as a quiet `~N min` beside the status. [Live, on the run this was built against](/framework/ai/2026-09-17/mastermind-layout-browser/) · [doc/asks.md](/framework/ext/AITask/doc/asks/).");

		code.js(`{"ask": {"id": "layout-browser", "conclusion": "Every layout on the site is one wall you can approve or improve."}}
{"ask": {"id": "sqlite-status", "minutes": 5}}`, "framework/ai/<date>/<slug>/task.jsonl");

		md("## Decisions — and the loop back to the rule");

		md("A worker makes dozens of choices an hour and the owner sees none of them. A **decision** line writes one down: the question, the options really considered, the one that won, why, and the **skill rule** that produced it. The Decisions tab draws the options as cards with a ground each ([`ui/decision`](/framework/ui/decision/)), and the owner presses Approve or Improve.");

		code.js(`{"decision": {"id": "option-cards", "at": "2026-09-17T23:25:55-05:00",
  "about": "How does a set of options read as a choice rather than as a paragraph?",
  "options": [{"id": "boxes", "say": "A card per option, each with its own ground",
               "why": "The set is visibly a choice before a word is read."},
              {"id": "bullets", "say": "A bulleted list, the winner in bold",
               "why": "Cheaper, and indistinguishable from any other list."}],
  "chose": "boxes", "because": "Options get a box each, so the set reads as a choice.",
  "rule": "layout#boxes-padding-and-contrast", "status": "open"}}`, "framework/ai/<date>/<slug>/task.jsonl");

		md("A press appends a `verdict` line to **that task's own log** over the dev socket, and the row updates live. An **Improve** is then a defect in the rule it names, and `node public/framework/ext/AITask/decisions.mjs file` writes it into that skill's `improvements.md` as one dated line — the browser cannot reach `.claude/`, which is why the filing is a CLI the mastermind runs at harvest. [The tab, live](/framework/ai/2026-09-17/decisions-system/) · [doc/decisions-tab.md](/framework/ext/AITask/doc/decisions-tab/).");

		md("## Owner items first, and the order you put things in");

		md("A bot can do almost everything on this site. It cannot log into Cloudflare, pay for an account, or press deploy — and when a run hits one of those, the whole thread behind it stops. An `ask` or a `decision` carrying **`needs`** becomes one line in the **Needs you** strip, at the top of [`/framework/ai/`](/framework/ai/) and of that task's own Asks tab: the minutes, what it is, and a link to the work waiting on it. Shortest first, gone when `needs.done` says so.");

		code.js(`{"ask": {"id": "sqlite-status", "at": "2026-09-17T23:19:00-05:00", "status": "landed",
  "needs": {"owner": "Cloudflare login and wrangler d1 create", "minutes": 5}}}`, "framework/ai/<date>/<slug>/task.jsonl");

		md("Every list here is rankable. Grab the grip on an ask card or a decision row, drop it where it belongs, and the whole order is one **`rank`** line in that task's own log — the last line wins, the static site still renders the order, and no grip is drawn where there is no dev server to write to.");

		code.js(`{"rank": {"list": "asks", "at": "2026-09-18T00:14:55-05:00",
  "order": ["owner-items-first", "threaded-lists", "rank-the-asks"]}}`, "framework/ai/<date>/<slug>/task.jsonl");

		md("The **bands** rank too — `list: \"topics\"` orders the headings themselves, dragged the same way — and a busy band can carry a **`fold`**, tucking the owner's own words for it, \"side tangential things, footnotes further down the page\", under an \"N more\" bar. Fallback without either: first-seen order, nothing folded — every earlier run renders exactly as it did before. [Both live, on the run this was measured against](/framework/ai/2026-09-17/mastermind-layout-browser/).");

		code.js(`{"rank": {"list": "topics", "at": "2026-09-18T12:51:58-05:00",
  "order": ["Layouts", "Design system", "Pages", "AI log", "Ask"]}}`, "framework/ai/<date>/<slug>/task.jsonl");

		md("**Threaded** means an item's thread is the list under it — an ask's serving tasks, a task's decisions — and each level ranks on its own. The thread pages in columns: [/imagine/importance/ranked/](/imagine/importance/ranked/) walks topics → asks → tasks, every column a ranked list. [The strip and a ranked wall, live](/framework/ai/2026-09-17/ranked-lists/) · [doc/ranking.md](/framework/ext/AITask/doc/ranking/).");

		md("A task dir with no `page.js` still gets this page — the day's `route()` falls back to `new AITask({ url, src })` — so the template is the default across the whole archive, and a curated `extra()` is the exception.");

		md("**The raw transcript never enters the repo.** On the dev server, `/ai-logs/<session-id>` streams the real file from `~/.claude/projects/`, and the Session tab renders it as a conversation: the owner's messages and Claude's replies in one column, every run of tool calls folded to one line (\"edited 3 files\"), and a rail of every prompt beside it. On static hosting it says \"unavailable\" and the manifest stands alone.");

		md("Live: [the AI board](/framework/ai/) · [a day](/framework/ai/2026-08-13/) · [a task with an `extra()`](/framework/ai/2026-08-13/panel/) · [a plain manifest](/framework/ai/2026-08-13/sessions/).");

		md.details(import.meta, "readme.md", "Readme");
	}
});
