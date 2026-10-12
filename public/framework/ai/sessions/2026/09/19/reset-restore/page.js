import { Page, p, b, md, div } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board — the page grid.
   2 SIZE       prose at --measure, plain lists under it — nothing wide needed.
   3 OWN LAYOUT one screen: the two numbers first, then what's still gone, grouped.
   4 REGIONS    none.  5 PREVIEW  core's default card. */

export default new Page({
	meta: import.meta,
	title: "Reset restore",
	description: "171 of the 216 fully-recoverable files are back on disk, byte-for-byte from a session transcript; 45 stay gone, three of them held back on purpose because restoring them broke the live site.",
	icon: "restore_page",

	content(){

		p(b("171 of the 216 files reset-scope marked fully recoverable are back on disk, byte-for-byte from a real session transcript. 45 are still gone."), " Every one of the 171 was checked against the transcript it came from before being written, and a hand-diff on three of them at random (named below) confirms the copy is identical to the source, character for character. The other 45 are not guesses either — each one is gone because nothing in any of the five session transcripts on this machine holds its complete content, or because restoring it broke the live site and it was pulled back out rather than shipped broken.");

		div.c("surface pad flex v gap-25", () => {
			p.c("h4", "the three safety rules, and how each one bit");
			p("Byte-for-byte or nothing: three files' own manifest lines turned out to cite a ", b("partial"), " read (an explicit line range, not the whole file) as if it were complete — found by checking every recovered Read for that before trusting it, then searching all five session transcripts by real timestamp instead of just the lines the manifest happened to name. Never clobber newer content: zero of the 171 conflicted with something already on disk — nothing to report there. Prove the site survives: writing all 168 freshly-extracted files left every page returning 200, but a console check (a real throwaway headless browser, never the owner's own tabs) caught three of them throwing on every single page — see below.");
		});

		md("## Three files pulled back out, on purpose\n\n`AITask.js`, `LocalStorageSaver.js` and `Sidebar.js` all recovered clean and byte-perfect — and all three call a small persistence feature (`Page.Store`'s `read_raw`/`write_raw`/`clear_raw`, merged into `core/Page/Page.class.js` on the 18th) that `Page.class.js` itself never got back — no session transcript holds a complete copy of that file, only fragments. Deploying the three recovered files without it threw a real error on every page. They were reverted back to the same commit content they started at (checked: zero difference from the commit) rather than ship a broken site at 1am. Their correct, fully recovered text is not lost — it is sitting in this task's own log, ready the moment `Page.class.js` is rebuilt or recovered.").ac("wide");

		md("## What's still gone — 45 files, none of them guessed at\n\nGrouped so it is easy to see what matters:\n\n- **The framework's own core** (7 files) — `Page.class.js` itself, its `page.js`/`words.js`/`Page.css`/a decisions doc, plus `Sidebar/page.js` and `catalog/browse.js`. This is the one worth knowing about: it is why the three files above had to be held back.\n- **The paging program** (7 files) — `public/imagine/paging/`'s own `.js`/`.css`/doc files.\n- **Site-wide** (2 files) — `public/app.js` (the framework bootstrap) and `public/styles.css` (the site's skin). Both citations turned out to be short partial reads (40 and 45 lines) of much longer files.\n- **About 20 individual page bodies** across `imagine`, `layouts`, `ux`, `ui` and a few one-off pages (`michael`, `notes/short-minded`) — each page still loads, just without today's unfinished edit.\n- **A handful of docs and one data file** (`items.json`, a few `decisions.md`).\n\nThe full, honest reason for every one of the 45 — plus the outcome recorded for all 216 — is in this task's own [`lost.jsonl`](../reset-recovery/lost.jsonl).").ac("wide");

		div.c("surface pad flex v gap-25", () => {
			p.c("h4", "one page still shows an error, and it isn't this task's");
			p("`/framework/ai/v/3/` still throws the same `Page.Store` error from its own `page.js` — but that file is untracked and this task never touched it, and `core/Page/Page.class.js` had a zero-byte difference from the commit for this task's entire run. It is the same already-known gap, reached from a different, unrelated caller. `/`, `/framework/` and `/framework/ai/` all load clean.");
		});

		p.c("muted", "Full manifest with every outcome: lost.jsonl. Every measurement, the extraction method, and the three hand-verified diffs are in this task's own task.jsonl.");
	},
});
