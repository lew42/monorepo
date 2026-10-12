import { Page, md, div, p, span, b } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on /framework/ai/2026-09-19/'s board — the ordinary
                page grid: main for prose, wide for the card wall and the table.
   2 SIZE       four disagreement cards at 1 1 20em wrap to 4 / 2 / 1 columns;
                the rest is one compact table. Prose stays at --measure.
   3 OWN LAYOUT prose, one card wall, one table. Nothing else.
   4 REGIONS    none.
   5 PREVIEW    core's default card on the day board.

   ⚠ ONE SCREEN: the verdict, then the disagreements (the news), then the rest
     as one line each. The evidence — file:line, quotes, the live shot — is in
     verify.jsonl and this task's log, never repeated here.
   ⚠ No template literals anywhere in this file — plain "…" strings with \n. */

// The four rows where this pass disagrees with the earlier audit. Every one
// of the four moves a verdict UP (partly/differs → done) — the earlier audit
// was too harsh here, not too soft.
const DISAGREE = [
	{
		id: "mastermind-log", was: "partly", now: "done", task: "devbar-chat",
		what: "The dev bar's log really is titled \"the mastermind log\" now, and a later line with the same card id really does update that card in place instead of piling up a duplicate below it.",
		found: "Both were built and landed over an hour before the audit ran, and the audit still called them not done.",
	},
	{
		id: "assistant-channel", was: "partly", now: "done", task: "devbar-chat",
		what: "The audit gave credit for the big card that explains how the assistant reaches the mastermind, but said bigger icons on meaningful cards were pushed to later.",
		found: "They were not pushed — a card the system marks important already gets a 2.2em icon instead of 1.3em, built before the audit ran.",
	},
	{
		id: "answer-cards", was: "partly", now: "done", task: "devbar-chat",
		what: "The audit said a card can be marked \"this is what the owner is asking about\" but the dashboard never actually draws it bigger.",
		found: "I loaded the importance view myself: the two top-ranked cards really do span two columns with a bigger title, above a column of normal-sized ones.",
	},
	{
		id: "asks-log", was: "differs", now: "done", url: "/framework/ai/2026-09-17/mastermind-layout-browser/asks.md",
		what: "The audit downgraded this from done to differs over one caveat: some of the ledger's own 'quote' fields are the mastermind's paraphrase, not the owner's exact words.",
		found: "That caveat is true but belongs to the ledger, not to asks.md — the file the owner actually asked for. It exists, is auto-generated so it can't drift, and is the second line of the handover, exactly as asked.",
	},
];

// The other ten: I checked each one directly (code, a landed task's own
// outcome text, or a live screenshot) and the earlier verdict holds.
const AGREE = [
	["assistant-mode", "done", "A real second Sonnet session, low effort, answered the owner 53 times this afternoon and rang the mastermind directly.", "assistant-stream"],
	["prompt-relay", "differs", "The mechanical hook is real code, sitting unwired: settings.json has no UserPromptSubmit entry at all.", "prompt-relay"],
	["assistant-cards", "done", "The assistant writes its own dashboard card with one command, and every card's edge is colored by status.", "assistant-stream"],
	["multi-level-assistants", "done", "The feasibility study gives the exact numbers the audit quoted: nine masterminds costs ~30 task-units to throw away 8 of 9 versions.", "worktree-study"],
	["every-prompt", "done", "Renamed, both tiers written down, and the one skill that used to say the old name (mastermind) has since been fixed.", "skill-roles"],
	["skill-roles", "done", "Both skills exist and are doing their jobs — the master assistant's own process page is live, dated, and current.", "skill-roles"],
	["dashboard-first", "partly", "The direction is written down for the next mastermind; cards-with-buttons is a real first step, but nothing makes a design itself a live, revisable object yet.", "card-replies"],
	["process-redesign", "done", "A real card titled \"How to restart me: three steps\" is on the live board, matching the audit's own words almost exactly.", "worktree-study"],
	["speed-and-reuse", "partly", "The one-line-change and reuse-a-minion rules are adopted; the V3 full-bleed timeline and usage-bar footer are still just a queued brief, never dispatched.", "v3-timeline"],
	["timing-audit", "not", "There is no task directory at all for this — not even a brief. Correctly the next item in the queue.", "v3-timeline"],
];

export default new Page({
	meta: import.meta,
	title: "Verify: assistant tiers",
	description: "A second, harder look at 14 of the 53 audit rows — the assistant tiers, the relay, and how fast the process moves.",
	icon: "fact_check",

	content(){

		p(b("All ten checks I could confirm held up. Four did not — and all four say the earlier audit was too harsh, not too soft: the assistant tiers are further along than it gave the owner credit for."), " Every row below is something I loaded, read in the actual file, or ran myself — not the earlier audit's word.");

		md("## Where I disagree — checked, and moved UP").ac("wide");
		this.wall();

		md("## The other ten — checked, verdict unchanged\n\n| topic | verdict | why | task |\n| --- | --- | --- | --- |\n" +
			AGREE.map(r => "| **" + r[0] + "** | " + r[1] + " | " + r[2] + " | [" + r[3] + "](/framework/ai/2026-09-19/" + r[3] + "/) |").join("\n")
		).ac("wide");

		p.c("muted", "Full evidence for all 14 rows — file and line, quotes, the exact live shot — is in ", span.c("code", "verify.jsonl"), " beside this page, and the reasoning is logged as it happened in this task's own log.");
	},

	wall(){
		return div.c("grid auto gap", () => {
			DISAGREE.forEach(d => this.card(d));
		}).style({ "--column": "20rem" }).ac("wide");
	},

	card(d){
		const url = d.url ?? "/framework/ai/2026-09-19/" + d.task + "/";
		const label = d.url ? "the evidence" : d.task;
		return div.c("surface pad flex v gap-25", () => {
			p.c("h4", d.id);
			p.c("muted", "audit said " + d.was + " → this pass: ", b(d.now));
			p(d.what);
			p.c("muted", d.found);
			md("[" + label + "](" + url + ")");
		});
	},
});
