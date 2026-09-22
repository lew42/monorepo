import { Page, md, div, p, span, b } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on /framework/ai/2026-09-19/'s board — the ordinary
                page grid, same shape as this dir's sibling reports today
                (mistake-audit, incident-site-down).
   2 SIZE       prose at --measure; the six-card wall, the measurements table
                and the one addition card all need the room, so each claims wide.
   3 OWN LAYOUT prose, one six-card wall, one measurements table, one addition
                card (a later, smaller follow-up question) with its own tiny
                cost table. Nothing else.
   4 REGIONS    none.  5 PREVIEW  core's default card on the day board.

   ⚠ ONE SCREEN, mostly: the answer in a sentence, the six points as cards, the
     numbers in one table, plus one later addition card. The evidence and all
     six full decision lines (with their alternatives) are in this task's log,
     not here.
   ⚠ No template literals anywhere in this file — plain "…" strings with \n. A
     stray backtick inside one is what blanked every page earlier today. */

const CARDS = [
	{
		n: "1",
		head: "Plain git worktree add works, cleanly, outside the repo",
		what: "git worktree add -b <branch> ../wt-study HEAD took 2.7s for 6504 files and wrote only one dir, .git/worktrees/wt-study/. A private server (PORT=8151) answered in under 2 seconds from inside it, while the owner's :80 and the mastermind's :8123 both kept answering 200 the whole time.",
		why: "A JUNCTIONED node_modules is not safe: removing the worktree afterward recursed through the junction and emptied the MAIN tree's real node_modules. Caught at once, fixed with npm install (871ms) — no lasting damage, neither live server ever dropped a request. The safe pattern is a real install per worktree, which cost under a second here.",
	},
	{
		n: "2",
		head: "The uncommitted-work blocker, measured",
		what: "1,500 files not yet committed today (1,377 tracked-modified, 123 untracked, 48.7 MB); michael/dev is 113 commits ahead of main. A worktree cut from HEAD sees none of it.",
		why: "A workaround is proven, today, no rule change: git diff --binary HEAD applies clean in a fresh worktree (8.6 MB, 0.5s) — the plain text-only diff (2.5 MB) fails on every screenshot without --binary. The owner committing regularly fixes this for good, for free. A standing branch the mastermind may commit to would also fix it, but that is a rule change only the owner can grant.",
	},
	{
		n: "3",
		head: "How proven work gets back to the live tree",
		what: "The mastermind takes the --binary diff from the worktree once a boot test, a page load and a critic all pass, applies it in the main tree inside one Server/hold.mjs hold, then removes the worktree — one reload for the whole task, not one per file.",
		why: "Two minions touching one file surface as a loud git apply failure before anything reaches the live tree. Today's single-tree fencing has no collision detector at all — a clobber between two agents editing one file is silent.",
	},
	{
		n: "4",
		head: "The ledger, the skills, whisper — still shared problems",
		what: "The ledger hook resolves its own root from its own file location; a worktree runs its OWN checked-out copy, rooted at the worktree, and its walk-up from an edited file can never reach the main tree's task.jsonl, env var or not. Skills are git-tracked the same way, so a worktree reads a stale rulebook whenever it is behind.",
		why: "Ports are trivial — one private number per worktree, proven above. Whisper-server and the OS temp scratchpad live outside git entirely; a worktree does nothing for either, ever.",
	},
	{
		n: "5",
		head: "The one-hour cache: resume beats respawn",
		what: "This session reports a one-hour prompt-cache TTL (five minutes only under usage overage). Minions here run 180k–480k tokens per task; waking the same landed minion or the persistent auditor inside that hour reuses nearly all of that from cache instead of a cold, full-price re-read of requirements, skills and files.",
		why: "A worktree minion's own long pauses — an install, a boot test, a screenshot loop — stay warm through the same hour instead of risking a cold reload on the next tool call. The exact cache-read discount is UNVERIFIED here: no pricing table in claude --help, and this task did not browse the web to find one.",
	},
	{
		n: "6",
		head: "Worktrees for the two edits that can take the site down — not everything, not yet",
		what: "Server/ and shared-module edits — the exact two incidents from today — move into a worktree, boot-tested privately, landed by the diff-apply script above under one hold. Everything else keeps today's fences; they already work and cost nothing new.",
		why: "Judged directly against the owner's two reasons: it removes the reload risk exactly where it bit today, and it turns a silent collision into a loud one before landing — with no rule change needed. Worktrees for every minion becomes the better call once committing regularly is a habit, or the owner grants a standing commit-branch.",
	},
];

const COST = [
	["Today (1 Fable mastermind + ~7 Sonnet minions)", "~8 units", "many different targets; reportedly hit the weekly line today"],
	["1 Sonnet assistant + 2 Opus masterminds", "~9 units", "2 targets in parallel; Opus costs more per unit than Sonnet (exact rate unverified)"],
	["9 Opus masterminds, one target, compare-and-pick", "~28–30 units", "1 target only; 8 of 9 built versions are thrown away"],
];

const MEASURED = [
	["git worktree add, 6,504 files", "2.7s — wrote one dir, .git/worktrees/wt-study/"],
	["private server boot from the worktree", "under 2s; :80 and :8123 stayed 200 throughout"],
	["today's uncommitted state", "1,500 files (1,377 tracked, 123 untracked, 48.7 MB); 113 commits behind main"],
	["diff apply, text-only (no --binary)", "fails — cannot apply binary patch without a full index line"],
	["diff apply, --binary", "clean, 0 errors — 8.6 MB, 0.5s to build, dry-run checked in 0.25s"],
	["untracked-file copy into a worktree", "plain file copy, no surprises"],
	["node_modules as a junction", "UNSAFE — worktree removal deleted the main tree's real copy; fixed with npm install, 871ms"],
];

export default new Page({
	meta: import.meta,
	title: "Worktree study",
	description: "One real worktree experiment, one real mistake caught and fixed, and what the session's one-hour prompt cache changes for resuming minions.",
	icon: "account_tree",

	content(){

		p(b("Worktrees work today for the two kinds of edit that can take the whole site down — Server/ and shared-module changes — landed through a small diff-apply script under one reload hold; everything else should keep today's file fences, which already work and cost nothing new."), " One real experiment worktree was created and fully removed to test this; it caught one real mistake along the way (below) and fixed it before it could reach anyone.");

		this.wall();

		md("## Measured today\n\n| | |\n| --- | --- |\n" + MEASURED.map(r => "| " + r[0] + " | " + r[1] + " |").join("\n")).ac("wide");

		md("### What the owner does once, to unlock more\n\n" +
			"- **Commit michael/dev regularly** (even a rough work-in-progress commit) — fixes the uncommitted-work blocker for every future worktree, for free, forever, until it drifts again. This is the single highest-leverage unlock and needs no new rule.\n" +
			"- **Or grant a standing branch the mastermind may commit to** — more convenient once running, but it is a change to the never-commit rule and only the owner can make that call.\n" +
			"- Neither is required to start using worktrees for the two hazardous edit classes today — the diff-copy workaround (proven above) already covers it.").ac("wide");

		this.addition();

		p.c("muted", "Full evidence, exact commands, and all six decision lines with their alternatives: this task's log.");
	},

	/* One card, added later the same day: the owner's multi-tier / nine-masterminds
	   question, answered from today's own measurements — not a new experiment. */
	addition(){
		return div.c("surface pad flex v gap-25", () => {
			span.c("h4 muted", "Addition");
			p.c("h4", "Nine masterminds on one target? Feasible, but start with three");
			p("A worktree per mastermind is mechanically sound at nine — disk (about 7.25 GB total against 772 GB free), ports and the diff carry-in are all trivial, proven above. A sub-worktree (a worktree cut from another worktree's own branch) works the same way for anything already committed on that branch, but never for its uncommitted diff — the identical limit proven twice today, not a new one. ", b("What actually breaks at nine is coordination, not git:"), " the harness notifies a nested agent's completion to the MAIN session, never its parent, so every sub-mastermind must run its own minions in the foreground or it stalls forever awaiting a harvest that never reaches it (already hit twice, 2026-08-21) — and nine simultaneous masterminds already exceeds the mastermind skill's own stated practical ceiling of about three to six agents at once, before a single minion underneath any of them is counted.");
			p("The coordination fix reuses what already exists: one ", b("decision"), " line per claimed target in the main tree's own ledger, written only by the mastermind that owns it — the assistant reads it to route the owner's words to the right mastermind by name, and to show a comparison page, but never merges a diff or judges between versions itself. That split (route / show, never merge / judge) is what keeps a fast, lesser model from becoming the left hand that loses track of the right.");
			md("| scenario | rough cost | buys |\n| --- | --- | --- |\n" + COST.map(r => "| " + r.join(" | ") + " |").join("\n"));
			p(b("Recommendation: not nine. "), "Start with the assistant (already built) plus one mastermind running compare-and-pick of THREE worktree versions — not nine — on the next real design question with taste in it, such as the V3 timeline, then measure before trusting the pattern with real Opus spend at nine.");
		}).ac("wide");
	},

	wall(){
		return div.c("grid auto gap", () => {
			CARDS.forEach(c => { this.card(c); });
		}).style({ "--column": "18rem" }).ac("wide");
	},

	card(c){
		return div.c("surface pad flex v gap-25", () => {
			span.c("h4 muted", "Point " + c.n);
			p.c("h4", c.head);
			p(c.what);
			p.c("muted", c.why);
		});
	},
});
