import { Page, md, div, p, span, b, details, summary } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on /framework/ai/2026-09-22/'s board — the ordinary
                page grid, same shape as this dir's siblings. Prose rides `main`
                at --measure; every table and the card wall claim `wide`.
   2 SIZE       one column of prose; the three-option wall is --column: 18rem so
                it is 1 track at 400, 2 at 1280 and 3+ at 1920 and up. The two
                tables are `wide` because a table squeezed into 52em is the
                commonest failure on this board.
   3 OWN LAYOUT prose flow, one three-card wall (.grid.auto is auto-fit, so three
                cards never leave a lone card on a second row), two md tables,
                then four collapsed sections. Cards are `.card`, which carries
                its own padding — never `.pad`, which pins at a 1em floor.
   4 REGIONS    none. One column, top to bottom.
   5 PREVIEW    core's default card on the day board, with a short description.

   ⚠ ONE SCREEN above the fold: the recommendation, the rule, the numbers, the
     three options. Everything else is inside a <details> — one click down, never
     deleted. The evidence, the decisions and the incident are in task.jsonl.
   ⚠ No template literals in this file — plain "…" strings joined with +. A stray
     backtick inside one has blanked every page on this site before. */

const RULE = [
	["The master-mastermind", "never gets a worktree", "It decides what gets built and by whom. It edits nothing, so it has nothing to isolate."],
	["A per-task mastermind", "gets exactly one", "One worktree per task, on a branch named task/<slug>, created when the task opens and removed when it lands. It spawns its minions into that worktree."],
	["A minion doing small, safe work", "stays in the main tree", "A single page edit, a doc pass, a log append, a report. Nothing another agent has open, nothing that can stop a server booting. Today's file fences already handle this and cost nothing."],
	["A minion doing risky or wide work", "works in the task's worktree", "Anything touching Server/ or a module every page imports, anything spanning a dozen files, and any rival team building a second version of the same thing for comparison."],
	["When the task lands", "the mastermind cleans up", "It merges its own minions' work itself, lands the result in the main tree under one reload hold, then removes the worktree. The branch outlives the worktree until the owner has seen the merge; only the master-mastermind or the owner chooses between two rival teams."],
];

const MEASURED = [
	["Tracked files in the repo", "8,187 — and the directory table below sums to exactly 8,187 too"],
	["What a worktree actually copies", "254 MB (the tracked files), not the 826 MB the working tree shows"],
	["Why the gap", "public/notes/inbox is 407 MB and public/framework/ai/**/shots/ is 143 MB — both gitignored, so no worktree ever sees them"],
	["A full worktree", "3.1 s, 274 MB on disk, plus 1.1 MB of bookkeeping. The 235 MB object store is NOT copied"],
	["A sparse worktree, code only", "0.8 s, 21 MB, 2,564 files (framework/core, ext, ui, styles, web + Server + .claude)"],
	["A sparse worktree, the ai log + Server", "1.6 s, 159 MB, 3,002 files"],
	["Its own dev server", "3.8 s from nothing to HTTP 200 on a free port, alongside the five servers already running"],
	["What that server costs in RAM", "about 125 MB fresh; the warm main-tree ones sit at 212-243 MB each"],
	["Free space on this drive", "771 GB of 1.9 TB"],
];

const DIRS = [
	["public/framework/ai", "2,939", "150.0"],
	["public/websites/site", "283", "38.2"],
	["public/imagine/design", "631", "6.9"],
	["public/framework/ext", "1,201", "5.8"],
	["public/layouts/browse", "263", "5.4"],
	["public/framework/styles", "334", "4.0"],
	["public/framework/core", "801", "2.9"],
	["public/imagine/paging", "111", "2.8"],
	["public/blog/ai", "45", "2.4"],
	["public/notes/doodles", "28", "2.0"],
	["everything else", "1,551", "34.0"],
];

const PRUNE = [
	["Screenshots under the ai log (1,084 files)", "-120.3 MB", "254 MB → 134 MB"],
	["The website corpus, public/websites/site/ (283 files)", "-38.2 MB", "134 MB → 96 MB"],
	["Design reference images (589 files)", "-6.7 MB", "96 MB → 89 MB"],
	["Layout browse shots (311 files)", "-9.8 MB", "89 MB → 79 MB"],
	["Blog images (36 files)", "-3.3 MB", "79 MB → 76 MB"],
	["Every remaining tracked image (791 files)", "-29.5 MB", "76 MB → 47 MB"],
];

const OPTIONS = [
	{
		letter: "a",
		head: "Full worktrees — the recommendation",
		size: "274 MB each · 822 MB for three teams",
		what: "Every team gets the whole repo, exactly as `Server/worktree-up.mjs` already does it. Nothing 404s, nothing needs deciding up front, and the scripts exist.",
		why: "822 MB against 771 GB free is one tenth of one percent of the space you have. The worry was real but the number is not: the 826 MB figure everyone was reacting to is mostly the gitignored notes inbox, which a worktree never touches.",
	},
	{
		letter: "b",
		head: "Sparse worktrees — only when you need many at once",
		size: "21 MB each for code work · 63 MB for three teams",
		what: "`git sparse-checkout set --cone <dirs>` after a `--no-checkout` add materialises only the directories the task names. Per-worktree, stored in .git/worktrees/<name>/info/, and it cannot leak into the main checkout.",
		why: "The catch is that the dev server in a sparse worktree serves a partial site — every page outside the cone 404s, so you cannot click around it or crawl it. Right for the nine-masterminds-on-one-target idea, wrong as the default.",
	},
	{
		letter: "c",
		head: "Restructure — worth doing anyway, not instead",
		size: "134 MB each · 402 MB for three teams",
		what: "Move the 1,084 screenshots under public/framework/ai/ out of the tracked tree. One rule, and .gitignore already carries its sibling (public/framework/ai/**/shots/).",
		why: "It halves what every clone, worktree, fetch and checkout costs forever, and it is 47% of the total in a single line. But it is housekeeping, not the unlock — do it because the repo is cleaner for it, not because worktrees need it.",
	},
];

export default new Page({
	meta: import.meta,
	title: "Worktrees without the bloat",
	description: "A second copy of this repo costs 274 MB, not 826 MB.",
	icon: "account_tree",

	content(){

		p(b("Give every parallel team a full worktree. A second copy of this repo costs 274 MB, not the 826 MB it appears to — two thirds of what you see on disk is gitignored and a worktree never copies it — so three teams working at once cost about 0.8 GB out of the 771 GB free on this drive."), " That is a tenth of a percent, which is not worth restructuring the repo to avoid. Pruning is still worth doing, just for its own sake, and it would halve everything again.");

		p("Two things have to be fixed first, and both are small. ", b("Server/worktree-up.mjs junctions node_modules into the new worktree, and removing that worktree then follows the junction and empties the main checkout's real node_modules."), " It happened to me today while proving these numbers; the running servers survived because they already had their modules in memory, but the next restart would have died on `Cannot find package 'express'`. Repaired in one second with `npm install`. ", b("And Server/worktree-down.mjs can never remove anything it made"), " — it refuses on the uncommitted `.worktree-server.log` that worktree-up.mjs itself wrote there, so every worktree leaks 278 MB and a branch. The fixes are one line each, ", b("below"), "; neither is applied here, because this task is paper-only and may not edit Server/.");

		this.rule();
		this.numbers();
		this.options();

		this.where();
		this.server();
		this.merging();
		this.prune();

		p.c("muted", "Every measurement, the four experiment worktrees and their cleanup, both defects, the incident and the decisions are in this task's log.");
	},

	/* Deliverable 3, the owner's own shape: a master-mastermind decides, a
	   per-task mastermind owns the worktree, not every minion needs one. Five
	   rows, because the answer genuinely is five rows and no shorter. */
	rule(){
		return div.c("flex v gap", () => {
			p.c("h3", "Who gets a worktree");
			RULE.forEach(r => {
				div.c("card", () => {
					p(b(r[0]), " — ", b(r[1]));
					p.c("muted", r[2]);
				});
			});
		});
	},

	/* The TABLE takes the wide track; the sentence under it does not. A paragraph
	   left inside the same md() ran 2972px at 3440 — prose past the measure, the
	   one real finding of the four-width sweep. */
	numbers(){
		md("## The numbers, measured today\n\n" +
			"| | |\n| --- | --- |\n" +
			MEASURED.map(r => "| " + r[0] + " | " + r[1] + " |").join("\n")
		).ac("wide");

		p.c("muted", "Measured 2026-09-22 between 14:58 and 15:08, on michael/dev at 3e9536d4, with the working tree dirty by ten files. The prior study's estimate of about 805 MB per worktree is three times high — it counted the working tree, not the files a checkout writes.");
	},

	options(){
		return div.c("flex v gap", () => {
			p.c("h3", "Three ways to pay for it");
			div.c("grid auto gap", () => {
				OPTIONS.forEach(o => {
					div.c("card", () => {
						span.c("h4 muted", "Option " + o.letter);
						p.c("h4", o.head);
						p.c("muted", o.size);
						p(o.what);
						p.c("muted", o.why);
					});
				});
			}).style({ "--column": "18rem" });
		}).ac("wide");
	},

	/* Deliverable 2 — the owner asked this one directly, so it answers the
	   question in their own words before any detail. */
	where(){
		return details.c("card", () => {
			summary("Where a worktree actually goes — and what breaks if it goes in the wrong place");
			p("You asked whether a worktree is a copy in place — repo/dir/ beside repo/dir-branch-2/. It is not, and nothing in git works that way. ", b("A worktree is a whole second checkout of the repo in its own directory, anywhere on disk, sharing the one .git object store with the original."), " You never duplicate a sub-directory; you make a second copy of the whole project somewhere else, and git keeps one shared pile of history behind both.");
			p("Ours should go at ", b("C:/Code/lew42/worktrees/<task>/"), " — a sibling of monorepo/, outside the repo entirely. That is already what Server/worktree-up.mjs does, and it is the right call for one reason: the dev server watches only public/, with one recursive fs.watch handle (Server/watch.js), so a worktree that lives outside the repo is completely invisible to live reload. Nobody's tab ever flickers because a minion saved a file in a worktree.");
			p("Put one under public/ and two things go wrong at once. ", b("Server/plugins/Directory.js walks public/ recursively and skips only .git and node_modules"), " — so every file of the worktree lands in directory.json, which is already 2.6 MB, and the ai dashboard (which lists task dirs out of that file) would show a duplicate of every task on the board. And the checkout itself writes 8,187 files in about three seconds, which is exactly the burst Server/watch.js warns can overflow Windows' ReadDirectoryChangesW buffer and silently drop events, while each directory.json rebuild blocks for roughly 110 ms on a tree that just doubled.");
			p(b("Claude Code's own --worktree flag is still not usable here"), ", and I can now name why precisely. The CLI (2.1.260) puts its worktree at .claude/worktrees/<name> — inside the repo but outside public/, so it dodges both problems above — on a branch worktree-<name>, and quietly excludes it via .git/info/exclude. But it cuts from b55a7cae, the last merge commit on main, not from the michael/dev HEAD you have checked out. That worktree had 815 files where this branch has 8,187: `git diff --stat` between them is 7,887 files changed and 799,876 deletions. An agent in it would see a repo with no ai log, no imagine, no layouts, no websites. Same verdict as the 2026-09-18 test, re-proven today.");
		});
	},

	/* Deliverable 4 — what the per-worktree server needs, and what it costs. */
	server(){
		return details.c("card", () => {
			summary("The per-worktree dev server, and routing it through the Servex proxy");
			p("Each worktree runs its own `node server.js` with its own PORT, and the Servex proxy maps <task>.localhost:8080 to that port. I proved the server half today: ", b("Server/worktree-up.mjs took 3.8 seconds from nothing to a real HTTP 200"), " on a free port, serving / and /framework/ at 2,870 bytes and /app.js at 7,495 — alongside the five dev servers already running on this machine, with no port collision.");
			p(b("It needs almost nothing special."), " PORT is the only variable that matters. Whisper already skips itself: Server/plugins/Whisper.js treats any PORT other than 80 as not owner-facing and stays quiet, so NO_WHISPER=1 is belt-and-braces rather than a requirement. directory.json builds itself per-worktree, because Directory.js writes it relative to its own working directory. BOOT_TEST=1 is for a boot test only — it suppresses the directory rebuild and the reload-hold lock, which is right for a throwaway check and wrong for a server anybody is going to use.");
			p("The one thing it does need is ", b("its own node_modules, installed rather than junctioned"), " — one second, 68 packages, for the reason in the lead paragraph.");
			p(b("Two shared files a worktree minion must still write into the MAIN tree"), ", or the owner's board goes blind. The ledger hook honours LEDGER_ROOT (.claude/hooks/ledger.mjs line 6), so a worktree minion launched with LEDGER_ROOT set to the main checkout logs its file touches where you can see them — that is a fix that already exists, contrary to what the earlier study assumed. say.mjs has no such override and resolves its root from its own location, so a worktree minion must call the MAIN tree's copy by absolute path. Same for its task.jsonl.");
			p(b("The cost of one more server, measured from Win32_Process:"), " about 125 MB fresh (a 57 MB supervisor plus a 68 MB Server/run.js child), settling around 212-243 MB once warm and holding its own directory.json — which is what the five main-tree servers weigh right now. Three parallel teams is therefore roughly 0.7 GB of RAM, which is a bigger real constraint than the disk.");
		});
	},

	/* Deliverable 6 — two teams on one task, best of each merged. */
	merging(){
		return details.c("card", () => {
			summary("Two teams on one task, and why you pick rather than merge");
			p("It works like this. The task mastermind creates two branches, task/<slug>/a and task/<slug>/b, each with its own worktree and its own dev server, so the proxy gives you <slug>-a.localhost and <slug>-b.localhost side by side. A compare page puts the two live, at the same widths, with each team's one-paragraph rationale beneath. A judge — you, or the master-mastermind — presses Approve on one. That branch is landed in the main tree under a single reload hold; the loser's worktree is removed and its branch kept until you have seen the result.");
			p(b("The hard part is that \"best of each, merged\" is usually not a thing git can do for you here, and you should not ask it to."), " A three-way merge of two agents' independent rewrites of the same page.js produces conflict hunks that nobody can adjudicate without rereading both versions in full — which costs more than picking one did. On a tree of generated pages it is worse still: directory.json is rebuilt by whichever server ran last and conflicts on essentially every line; task.jsonl, board.jsonl and day.jsonl are append-only logs of two different histories, so a merge interleaves two teams' events into one stream that reads as neither.");
			p("So the practical rule is ", b("pick one version whole, then cherry-pick specific FILES from the other"), " — never hunks, never a three-way merge of a page. If the two teams genuinely produced separable wins (team A's layout, team B's data loader), those live in different files and a file-level cherry-pick is clean and reviewable. If they do not — if both rewrote the same page and each did one thing better — the honest answer is to pick the better whole and brief a follow-up minion to add the one idea from the other. That is cheaper and far more legible than any merge.");
			p(b("What this is worth doing for:"), " a design question with taste in it, where two versions genuinely teach you something by sitting next to each other. ", b("What it wastes tokens on:"), " a bug fix with one right answer, where the second team is paying full price to arrive at the same place.");
		});
	},

	prune(){
		return details.c("card", () => {
			summary("The directory table, and what a prune would save — a proposal, nothing deleted");
			md("### What a worktree copies, by directory\n\n" +
				"| directory | tracked files | MB |\n| --- | ---: | ---: |\n" +
				DIRS.map(r => "| " + r[0] + " | " + r[1] + " | " + r[2] + " |").join("\n") +
				"\n| **total** | **8,187** | **254.4** |\n\n" +
				"That total and `git ls-files | wc -l` agree exactly, which is the check that says the table is not lying.");
			p("Generated bulk against hand-written source: ", b("images are 206 MB of the 254 MB"), " — 117.5 MB of PNG across 1,115 files and 88.2 MB of JPG across 1,929. Hand-written source, meaning every .js, .css, .md and .mjs outside the ai log and notes, is 17.1 MB across 3,177 files. Put plainly: 81% of what a worktree copies is screenshots, and 7% of it is the code anyone is actually editing.");
			md("### If you pruned, in order of payoff\n\n" +
				"| what leaves the tracked tree | saves | a full worktree becomes |\n| --- | ---: | --- |\n" +
				PRUNE.map(r => "| " + r[0] + " | " + r[1] + " | " + r[2] + " |").join("\n"));
			p(b("Nothing here has been deleted or moved."), " These are counts of what would leave the tracked tree, for you to decide on. The first row is the one that matters — one rule, 47% off, and .gitignore already carries the pattern for the screenshots that live in a shots/ directory. These are the ones that do not.");
		});
	},
});
