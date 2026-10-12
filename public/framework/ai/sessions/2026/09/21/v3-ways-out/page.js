import { Page, p, md, div } from "/app.js";

/* One screen: what was broken, what four links fix it, where they live, and
   what this session's shell refused to let it prove. No shot led this page —
   `mcp__site__shot` was refused before it ran once; see below. Full brief:
   requirements.md. */
export default new Page({
	meta: import.meta,
	title: "v3-ways-out",
	icon: "signpost",
	description: "V3 had no way out — four links fix it: today's board, everything, process, start here.",

	content() {
		div.c("flow", () => {
			p.c("muted", "No screenshot leads this page — mcp__site__shot and every shell command " +
				"this task tried were refused before they ran (see the bottom section). What follows " +
				"is the change itself, read from the edited source.");

			md("**V3 had no way out.** V1's whole rail — every day, every task, the log, the " +
				"process page — was the entire AI section's navigation. V3 replaced it with a card " +
				"stream and shipped with nothing to click to leave it, not even back to today's own " +
				"board. Checked before touching anything: the only anchor in V3's head row was the " +
				"title, linking back to itself, and the version picker only ever swaps between " +
				"V1/V2/V3. Full brief: [requirements.md](requirements.md).");

			div.c("h4", "What was added — four links, in the head row");
			p("Right after the title, ahead of the version picker: **Today's board** " +
				"(`/framework/ai/<today>/`, the date computed from the browser's own clock — never " +
				"hardcoded, so it stays correct tomorrow), **Everything** (`/framework/ai/log/`), " +
				"**Process** (`/framework/ai/process/`), and **Start here** " +
				"(`/framework/ai/2026-09-20/start-here/`, the owner's own four-things page). Quiet " +
				"text, not buttons — `color: var(--subtle)`, no underline until hover — so they read" +
				"as a way out beside the title, not a fifth group crowding the toolbar.");

			p("**Today's link never risks a 404.** It starts pointing at the log (always real), then " +
				"a background check (`Socket.ls(\"/framework/ai/\")`) swaps it to the real day-dir url " +
				"the moment that directory is confirmed to exist. Before the first task of a day " +
				"lands, the link just stays on the log instead of dead-ending.");

			div.c("h4", "Where it sits, and the alternative");
			p("Considered folding the four links into `.v3-toolbar` as a fifth control group, next " +
				"to the view switch and Live — rejected because the toolbar is view *state* (how the " +
				"wall is sorted, filtered, sized right now), and these four are *destinations*: " +
				"mixing them in would read as more toolbar buttons, not an exit. They sit next to the " +
				"title instead — the page's other \"way home\" anchor — so a reader sees all the " +
				"wayfinding in one glance. Full reasoning: this task's own `decision` line in " +
				"task.jsonl.");

			div.c("h4", "What this session could not prove");
			p("Every command that would have proven this landed correctly was refused: " +
				"`node Server/hold.mjs on \"v3-ways-out\"` (no reload hold around the batch), " +
				"`mcp__site__shot` (no screenshot of the head row at 1920 or 400), and " +
				"`node --check` on the edited file (no independent parse proof beyond the syntax-" +
				"guard hook, which did not block either write). Nobody clicked the four links to " +
				"confirm all four resolve 200, and V1/V2 were not re-checked for console errors. " +
				"The mastermind runs the real proofs at harvest, per the brief.");
		});
	},
});
