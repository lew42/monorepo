import { Page, p, md, b, div } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board — the page grid.
   2 SIZE       prose at --measure, a plain list under it — nothing wide needed.
   3 OWN LAYOUT one screen: what happened, what's back, what's gone, grouped lists.
   4 REGIONS    none.  5 PREVIEW  core's default card. */

export default new Page({
	meta: import.meta,
	title: "Reset recovery",
	description: "The 23:16 reset destroyed 1,470 files' worth of uncommitted work. 216 are fully recovered from transcripts; 285 are gone for good; the rest are replaceable screenshots.",
	icon: "restore",

	content(){

		p(b("The 23:16 reset destroyed uncommitted work in 1,470 files. 216 of those are fully recovered from session transcripts and could be restored on request; 285 more (32 partial, 253 with no trace at all) are gone for good; the remaining 969 are regenerated screenshots that cost nothing but a re-run to replace."), " Something — most likely VS Code's Discard All Changes button — reverted every uncommitted change to every tracked file in this repo, twice: 23:16 tonight, and again on 2026-09-18. Untracked files were untouched, which is why most of tonight's work survived. This page is the recovery: what's back, what's confirmed gone, and the complete, counted list for the rest.");

		md("## What's back\n\nThe padding fix — the reason the dev bar's log cards were cramped — is fully restored and proven live, not just in the file. The mastermind log's own card measures **16px** of padding at both 400px and 1920px, on the real site, with real data (226 cards), zero console errors.\n\nGetting there took more than the two lines the brief expected: the whole `--pad-card` token and the entire mastermind-log/chat-tab CSS in `devbar.css` were missing outright, not just wrong — both were today's earlier uncommitted work, wiped along with the padding fix on top of it. Recovered byte-for-byte from real tool-call records in today's session transcripts (a file `Read` from just before it was edited, plus the exact edits applied after it) — never guessed at. Also restored, for the same reason: `DevBar.js` (the path bar in the head) and `tools.js` (wiring the log into the rail) and three new lines in `readme.md` — without these the CSS fix would have stayed invisible on the live site.").ac("wide");

		md("## One file gone for a different reason\n\n**`chat.js` — the live chat tab itself — cannot be found anywhere.** It was a brand-new file today, which should have survived the reset since only tracked files were wiped — but it isn't on disk and has no git history. Something else removed it, separately from tonight's incident. Its CSS is sitting in `devbar.css`, restored and unused, waiting for this one file — and unlike everything below, its full content IS sitting in a transcript, just not yet extracted.").ac("wide");

		md("## The complete list — 1,470 files, not roughly a hundred\n\nA follow-up task found the true scope, mechanically rather than by sampling: every tracked file whose last-modified time exactly matches the reset's own timestamp (1,043 files — this matches the mastermind's own independent count exactly) plus 422 more that were brand-new work, staged with `git add` but never committed, which a hard reset deletes outright rather than reverts. `public/app.js`, the blog, `core/Layout`, `core/Page`, `core/Sidebar`, several `Server/` plugins, a whole unfinished `public/layouts/browse` encyclopedia, and a `public/framework/styles/system` design study are all in it. The full, graded list is in this task's own [`lost.jsonl`](./lost.jsonl): one line per file, saying whether a session transcript holds its content in full, in part, or not at all — and exactly which transcript, so nothing here is a guess. Nothing on the list was restored beyond the six files named above; deciding what to restore is the owner's next step, not more silent recovery.").ac("wide");

		div.c("surface pad flex v gap-25", () => {
			p.c("h4", "recoverable, by the numbers — 1,470 files total");
			p("216 fully recoverable from a session transcript (a complete file Read or Write, found and cited) · 32 partial (only a diff fragment survives, not the whole file) · 1,222 with no trace at all — but 969 of those are regenerated screenshots, replaceable by re-running whatever tool made them, so the real unrecoverable loss is 253 files of actual code, docs or data, plus the 32 partials.");
		});

		md("## What would have prevented this\n\nOne thing: commit `michael/dev` regularly, or open a branch the mastermind may commit to — every hour of uncommitted work is an hour one keystroke (or, twice now, one button in an editor) can erase for good.").ac("wide");

		p.c("muted", "Full manifest: lost.jsonl. Every measurement and decision, with its reasoning, is in reset-recovery's task.jsonl and reset-scope's task.jsonl.");
	},
});
