import { Page, md, div, p, span, b } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on /framework/ai/2026-09-19/'s board — the page grid.
   2 SIZE       prose at --measure; the timeline, the four findings and the
                ranked table claim wide.
   3 OWN LAYOUT prose, one timeline table, a four-card wall, one ranked table.
   4 REGIONS    none.  5 PREVIEW  core's default card.

   ⚠ No template literals in this file — plain "…" strings with \n. A stray
     backtick inside one is what blanked every page earlier today. */

const TIMELINE = [
	["~15:47", "reload-hold saves LiveReload.js. It parses; node --check, the syntax-guard hook and the supervisor's pre-restart check all pass it. It cannot boot."],
	["~15:50", "The mastermind's supervised server (8123) restarts into it and dies. Nothing watches the port."],
	["15:51", "The mastermind notices — because a screenshot failed, a minute later."],
	["15:51:43", "\"do NOT restart yet\" is posted on the dev bar, which lives on the site that is down. The owner, asked four times today to restart once, restarts. Port 80 crashes at boot."],
	["15:52:40", "The fix is saved. Both supervisors log \"restarting — changed: LiveReload.js\" and then print nothing at all, for ever."],
	["~15:55 – 15:56", "The mastermind fixes server.js by hand (spawn at once if the old child is already dead), and the assistant tab tells the owner to Ctrl+C and rerun. Port 80 is back. About four minutes down."],
];

const FINDINGS = [
	{
		n: "1",
		head: "Parseable is checked three times. Bootable is checked nowhere.",
		what: "reload-hold's brief named the hazard in its own Never list: 8123 is supervised and will restart on a Server/ save, so make every save parseable and bootable.",
		why: "It had the sentence and saved anyway. Three mechanisms guard parsing — node --check, the syntax-guard hook, the supervisor's own check — and no mechanism guards booting, which is the half that took the site down.",
	},
	{
		n: "2",
		head: "The proof list was read as a ceiling.",
		what: "server-self's brief listed three proofs for the supervisor: a comment edit restarts once, a syntax error does not restart, a read does not restart. The agent proved exactly those three.",
		why: "The untested case is the one a supervisor exists for — the child is already dead when the fix arrives. There restart() waited on an exit event a dead process cannot emit, and the flag stayed true for ever.",
	},
	{
		n: "3",
		head: "The warning rode the failing system.",
		what: "The do-not-restart notice went on the dev bar. The dev bar is served by the server that was down, to a reader who had been asked four times that day to restart.",
		why: "A notice that needs the broken thing to work is not a notice. The channel that did work was the assistant tab — a separate process writing a file, out of band.",
	},
	{
		n: "4",
		head: "Seven minions, one live tree.",
		what: "Three of them saved under Server/ the same afternoon (reload-hold, whisper-autostart, devbar-chat, assistant-stream), into the one tree that both live servers watch.",
		why: "Nothing serialises those saves and nothing tests one before it becomes the live server. With change 1 in place it does not need serialising; without it, every Server/ save is a coin flip on the owner's site.",
	},
];

const RANKED = [
	["1", "The supervisor boot-tests before it swaps: spawn a candidate child on a spare port, wait for a real HTTP 200, then restart the live child. On failure keep the healthy child running, print why, and write .server-boot-failed.json at the repo root.", "~45 lines of server.js", "the whole class — cases 1 and 4, and the warning in case 3 becomes unnecessary"],
	["2", "A supervisor may never wedge: replace the restarting flag with a deadline (no live child after N seconds, spawn anyway) plus one liveness poll on the port.", "~10 lines", "case 2, and every unknown path of the same shape"],
	["3", "Anything the owner must act on now goes out of band — the assistant channel and the terminal, never only the dev bar or a board page.", "1 line in the mastermind skill", "case 3"],
	["4", "Keep port 80 following Server/ changes automatically — once change 1 lands. The boot test is what makes automatic safe, and a release gate hands the owner back the hand-restarts the supervisor was built to remove.", "0 lines (a decision, with the 15-line gate written down in case it is ever needed)", "the next argument about it"],
	["5", "One line in the minion skill: a Server/ save restarts every supervised server, and a file that parses can still fail to boot — boot it yourself first.", "1 line — APPLIED", "the gap until change 1 lands"],
];

export default new Page({
	meta: import.meta,
	title: "Incident: the site went down",
	description: "Four minutes down. A save that parsed but could not boot, and a supervisor that could not restart a child that was already dead.",
	icon: "error",

	content(){

		p("Four minutes down, from two mechanism gaps — not two rule gaps. ", b("The rule was in the brief, in the same sentence as the warning: make every save parseable and bootable."), " Parsing is guarded three times over; booting was guarded nowhere. Then the supervisor that exists to bring the port back could not, because the child it tried to restart had already died.");

		md("| | |\n| --- | --- |\n" + TIMELINE.map(r => "| **" + r[0] + "** | " + r[1] + " |").join("\n")).ac("wide");

		this.wall();

		md("## The changes, ranked by outages prevented per line\n\n| | the change | cost | prevents |\n| --- | --- | --- | --- |\n" +
			RANKED.map((r, i) => "| " + (i + 1) + " | " + r[1] + " | " + r[2] + " | " + r[3] + " |").join("\n")).ac("wide");

		md("### Applied now (fail-safe)\n\n" +
			"- **minion/SKILL.md** — one line in the Never list: a `Server/` save restarts every supervised server watching this tree, and a file that parses can still fail to boot.\n" +
			"- **mastermind/improvements.md** — two notes: an enumerated proof list in a brief is read as complete, so anything whose job is *recovery* must be briefed with the broken state it recovers from; and a warning that rides the failing system is not a warning.\n\n" +
			"### For the owner and the mastermind\n\n" +
			"Changes 1–4 are `decision` lines in this task's log, each with its alternative. **`Server/**` and `server.js` were read-only for this audit** — changes 1 and 2 want one task, *server-boot-test*, fenced to `server.js`, `Server/doc/watch.md` and `Server/README.md`. Dispatch it today: until it lands, every `Server/` save by any of seven concurrent minions is a coin flip on the live site.\n\n" +
			"⚠ One line has been waiting in `mastermind/improvements.md` since **2026-09-04**: *the mastermind should not make hands-on edits itself.* Today it was the evidence for two more mistakes (the ledger hook broken by a heredoc, the hand-written spacing at 3440) — and the hand fix to `server.js` at 15:55 was the right call under an outage, which is exactly the exception worth writing into it.").ac("wide");

		md("## What I would not change\n\n" +
			"- **The briefs' wording.** reload-hold's brief said the right thing in the right place and the outage happened anyway; more emphasis would not have helped.\n" +
			"- **The syntax guard.** It did its job — the file it was asked about parsed. It is not, and should not become, a boot test.\n" +
			"- **The supervisor itself.** It is the right idea: the owner has been asked to restart by hand three times this week. It needs a boot test and a watchdog, not a retreat.");

		p.c("muted", "Evidence, timestamps and the four decision lines with their alternatives: this task's log. Written by the auditor skill, its second run.");
	},

	wall(){
		return div.c("grid auto gap", () => {
			FINDINGS.forEach(f => { this.card(f); });
		}).style({ "--column": "18rem" }).ac("wide");
	},

	card(f){
		return div.c("surface pad flex v gap-25", () => {
			span.c("h4 muted", "Finding " + f.n);
			p.c("h4", f.head);
			p(f.what);
			p.c("muted", f.why);
		});
	},
});
