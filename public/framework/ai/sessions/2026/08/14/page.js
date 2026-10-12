import { Page, md, AITask } from "/app.js";
import { dashboard, glance } from "/framework/ext/AITask/dashboard.js";

export default new Page({
	meta: import.meta,
	title: "2026-08-14",
	description: "jsonl logs, the Timeline module, a three-model vision comparison, and the AI dashboard rebuilt around steps.",
	icon: "history",
	// Task dirs stay undeclared unless they hold their own page.js: a declared
	// child skips route() and 404s on the page.js probe. The dashboard
	// enumerates them from directory.json either way.
	children: "editor-panel-review",

	// An undeclared task dir still gets a page: the manifest viewer, pointed at it.
	route(name){
		if (!name.includes(".")) return new AITask({
			title: name, icon: "receipt_long",
			url: this.url + name + "/", src: this.url + name + "/session.json",
		});
	},

	// My tile on /framework/ai/: preview_card()'s `thumb` slot, live.
	preview(nav){ return this.preview_card(nav, () => glance(this)); },

	content(){
		dashboard(this);

		md(`**The logs became append-only, the dashboard became a rail.**

- [ext/JSONL](/framework/ext/JSONL/) — \`task.jsonl\` replaces \`session.json\`:
  one verb per line, \`assign\` replaying the same \`Object.assign\` the
  constructor runs, so an assembled log quacks like the POJO it replaced.
- [ext/Timeline](/framework/ext/Timeline/) — a general-purpose h/v timeline
  positioned entirely by two CSS custom properties. It briefly *was* the
  \`/framework/ai/\` rail; the usage-and-cards rail replaced it there, and the
  module stands on its own.
- **Vision comparison** — haiku/sonnet/opus analysing the same 15 screenshots
  at ~$0.02/$0.10/$0.14 per shot; consensus on nav-rail clipping and 3440 dead
  space, haiku unreliable at 1920.
- **[ai-dashboard](/framework/ai/2026-08-14/ai-dashboard/)** — usage windows as
  *pace* (a ▼ marks the clock, the bar is spend), tasks as step outlines, and a
  detail template a task's own \`page.js\` can extend.
- **[ext/Ask](/framework/ext/Ask/)** — the log became two-way. A text input on a
  task's page runs one headless \`claude -p\` turn against that task's session
  and appends the exchange back as \`chat\` lines; \`shot\` hands the turn a
  screenshot of any element to look at.`);
	},
});
