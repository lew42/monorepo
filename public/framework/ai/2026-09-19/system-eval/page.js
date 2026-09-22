import { Page, md, div, p, b, details, summary } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on /framework/ai/2026-09-19/'s board — the ordinary page
                grid: main for the opening sentences, wide for the roles table, the
                three-card wall and every fold.
   2 SIZE       three cards on --column 18rem: three across from about 1000px, one at
                400. The roles table has five columns and claims wide; prose stays at
                --measure.
   3 OWN LAYOUT one screen first: two sentences, one table, three cards, three sentences
                on ids. The eight-hop walkthrough and four deep pages are all <details>
                folds, closed by default, so the first screen stays a screen.
   4 REGIONS    none.   5 PREVIEW  core's default card on the day board.
   ⚠ No template literals anywhere in this file — plain "…" strings, so a stray
     backtick can never end one (the site blanked twice today that way).
   ⚠ Written by a session that could not load it: this page was never rendered by
     its author (spawned.md says why); the minion that copied it in (2026-09-19)
     found it about 2.5 screens tall and folded the eight-hop walkthrough into a
     <details> to bring the top of the page back to one screen — nothing deleted,
     one click further away. Load it once, headless, after any change. */

const ROLES = [
	["**Fast assistant** — `every-prompt`", "Sonnet, low effort, its own tab", "CLAUDE.md (43 lines) + 47, on every prompt", "a marker file in the OS temp dir, keyed by its session id", "`say.mjs` writes the board and the mastermind's inbox; `SendMessage` rings a tab NAME"],
	["**Master assistant**", "Opus in the skill; Fable in the owner's words", "43 + 52 (+ 71, and about 2,700 when auditing)", "nowhere — no run log, no registry line", "a card under the same topic id"],
	["**Mastermind**", "Opus tonight; Fable in tiers.md", "about 750 (skill 360, handover, new-task, usage, finish-task) + about 90 improvement entries each cycle", "`mastermind_session` in its run log — a tab name, not its uuid", "the inbox it polls; briefs; `SendMessage`"],
	["**Minion**", "Sonnet tonight", "about 1,100 (brief, minion, code, new-task, layout, css, new-page, new-css-class, documentation, finish-task)", "`session_id` in its task.jsonl line 1 — written by whoever launched it", "its task log; a `claude --resume` message"],
	["**Auditor**", "Opus", "71 + everything, about 2,800", "a tab name while its tab lives", "one line in a skill's improvements.md"],
];

const HOPS = [
	"The owner dictates into the fast assistant's tab. Identity: that tab's uuid, which the repo never sees.",
	"`say.mjs heard` writes the words to `ai/v/3/board.jsonl` as a card, and to the mastermind's inbox as a `chat` line in the newest unlanded `mastermind-*/task.jsonl`.",
	"The doorbell: `SendMessage` to the name in `mastermind_session`, a tab name such as `monorepo-00`. A CLI session has no such name.",
	"The mastermind reads its inbox at the top of a cycle, writes `requirements.md`, and starts a minion — tonight with `claude --session-id <id> -p`, the ids typed by hand.",
	"The minion's `task.jsonl` line 1 carries `session_id`: the only pointer from the repo to a transcript, written tonight by the mastermind before the minion existed.",
	"The minion builds. `ledger.mjs` appends `action` and `skill:` lines only when that first line's id equals the id on the hook's stdin — for this session, nothing ever matched.",
	"`finish-task`: the landing line and a `day.jsonl` line; the mastermind harvests and posts a card under the owner's topic id.",
	"The owner reads the board.",
];

const TOP = [
	{ head: "1. One script: start, message, fork", body: "It mints the id, writes the task's launch line with that id before the process exists, passes the permission mode, and closes stdin. Tonight's launch had none of that: this minion could read the repo and write nothing in it, and the ledger never knew it was here." },
	{ head: "2. The master assistant is the Fable architect", body: "It edits the skills when the system fails, as the owner said; the auditor folds into it as one section. About ninety improvement lines wait across fifteen files and none has been applied in two weeks, because the job belongs to nobody." },
	{ head: "3. A trap is one sentence and a link", body: "Every dated story in a skill becomes the trap, the check, and a link to the task that holds the story. About 600 of 2,740 lines leave the skills agents load, and no story is lost." },
];

export default new Page({
	meta: import.meta,
	title: "System eval",
	description: "Every skill evaluated, seven ranked changes, the subtractions, and how session ids work — by the first minion started as a real CLI session.",
	icon: "account_tree",

	content(){
		p("The skill system is about 3,050 lines in 45 files. About a fifth of it is dated incident stories, about a tenth is the same rule written in several places, and five role skills plus three hooks exist only in the working tree, uncommitted. ", b("The roles the owner described all exist on paper, but the one thing that makes a session findable again — its id — is written by hand, in one place"), ", and tonight's first CLI-started minion could read the whole repo and write nothing in it.");

		md("## The system as it runs tonight\n\n| role | runs on | reads at start | where its identity lives | reaches others by |\n| --- | --- | --- | --- | --- |\n" +
			ROLES.map(r => "| " + r.join(" | ") + " |").join("\n")).ac("wide");

		details(() => {
			summary("How a request travels, and where the id is at each hop — eight hops, closed by default so the page reads as one screen");
			md(HOPS.map((h, i) => (i + 1) + ". " + h).join("\n") +
				"\n\nNowhere in these eight hops is there a list of the sessions that are alive. That list is the registry, designed one fold down.");
		}).ac("wide");

		md("## The top three changes").ac("wide");
		this.wall();

		md("**Session ids in three sentences.** A session is one file, `~/.claude/projects/<folder-slug>/<uuid>.jsonl`, outside the repo — this one is `8b6bbbe8-3f32-4e8d-a497-9b6192b9c757.jsonl`, created at 18:41:01 with the id the brief chose. `claude --session-id <uuid>` picks the name up front, and `claude --resume <uuid>` reopens it from any folder. The repo points at a session only where a task's first log line says `session_id`, so a registry is the list that does not exist yet.");

		md.details(import.meta, "skills.md", "Every skill, evaluated — one line each, then the duplicates and the contradictions").ac("wide");
		md.details(import.meta, "changes.md", "The ranked list — seven changes, then the subtractions").ac("wide");
		md.details(import.meta, "sessions.md", "Session ids, explained — and the design for tracking them").ac("wide");
		md.details(import.meta, "spawned.md", "What being started as a CLI session was like").ac("wide");
	},

	wall(){
		return div.c("grid auto gap", () => {
			TOP.forEach(c => { this.card(c); });
		}).style({ "--column": "18rem" }).ac("wide");
	},

	card(c){
		return div.c("card", () => {
			p.c("h4", c.head);
			p(c.body);
		});
	},
});
