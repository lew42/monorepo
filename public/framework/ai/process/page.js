import { Page, md, div, p, b } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a page on the AI board — the page grid.
   2 SIZE       prose at --measure; the four panels claim wide.
   3 OWN LAYOUT one line of prose, then four cards in an auto grid.
   4 REGIONS    none.  5 PREVIEW  core's default card.
   ⚠ No template literals — plain "…" strings with \n.
   Kept by the master assistant (skill `master-assistant`): HOW the work is going,
   never what was built. Rewritten when something structural changes, not on a timer. */

const AS_OF = "2026-09-19 17:20";

const ROLES = [
	"**Fast assistant** (Sonnet, `every-prompt`) — awake in the sidebar tab; echoes every prompt to the board and rings the mastermind and the master assistant.",
	"**Master assistant** (Fable, `master-assistant`) — awake since 17:19, spawned by the fast assistant; opinions in two sentences, this page, audits.",
	"**Mastermind** (`monorepo-48`) — handing over: spawns nothing more; a fresh tab that says *begin* registers its name in the ledger and the relay follows it.",
	"**Minions** — `dashboard-next` (Sonnet, V3 + dev bar) and `card-replies` (Sonnet, buttons that answer) still working; 21 tasks landed today.",
];

const OWED = [
	"Start the fresh mastermind tab (Opus) and say *you are the mastermind, begin — read the handover*.",
	"Say yes to the prompt hook in the mastermind tab — one settings entry.",
	"Restart `node server.js` once, and run `pm2 kill` once.",
	"Try Dictate and the streaming demo with your own voice; say if it cuts you off.",
	"Cloudflare login + `wrangler d1 create`; a GitHub and a Google OAuth app.",
];

const AUDITS = [
	"**mistake-audit** — four failing agents; three never loaded the skill holding the rule they broke. Applied: the fast assistant's skill shrank 128 → 43 lines so it is re-read every prompt.",
	"**blunder-critic** — six findings, queued as `blunder-fixes`; not yet applied.",
	"**padding-audit** — the sidebar's rows measured 49–69 px; the lint found it; the sidebar repair landed.",
	"**skill-roles** (the auditor's fourth wake) — one roles table; five contradictions in the mastermind skill, fixed the same hour.",
];

const FAILING = [
	"**Answers still land in chat.** You said at 17:17 you do not read it. The rule is on the board only; this page and every card is the test.",
	"**A blank site is silent.** The health watcher logged today's second site-wide blank 84 times and reached nobody. `health-alarm` is queued, unbuilt.",
	"**The week's budget hit the line** (40/40 at 16:35): small Sonnet tasks, one at a time, until the window turns.",
];

export default new Page({
	meta: import.meta,
	title: "Process",
	description: "How the work itself is going: who is awake, what you owe an answer on, what the audits changed, where it is failing.",
	icon: "monitor_heart",

	content(){
		p("How the machine is running as of ", b(AS_OF), ". What was built is on the day boards; this is only whether the process is healthy.");
		div.c("grid auto gap", () => {
			this.panel("Who is awake", "groups", ROLES);
			this.panel("You owe an answer on", "help", OWED);
			this.panel("Audits, and what changed", "fact_check", AUDITS);
			this.panel("Where it is failing today", "warning", FAILING);
		}).style({ "--column": "20rem" }).ac("wide");
	},

	panel(head, icon, lines){
		return div.c("surface pad flex v gap-25", () => {
			p.c("h4", head);
			md(lines.map(l => "- " + l).join("\n"));
		});
	},
});
