import { Page, p, b, md, div } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board — the page grid.
   2 SIZE       prose at --measure, plain lists under it — nothing wide needed.
   3 OWN LAYOUT one screen: the two numbers first, the big find, then what's still gone, grouped.
   4 REGIONS    none.  5 PREVIEW  core's default card. */

export default new Page({
	meta: import.meta,
	title: "Reset deep",
	description: "346 of the 501 real files the reset destroyed are back on disk now, across all four recovery tasks. 155 are still gone or blocked — found by finally searching all 56 session transcripts instead of 5.",
	icon: "find_in_page",

	content(){

		p(b("346 of the 501 real files the reset destroyed are now back on disk, byte-for-byte. 155 are still gone or held back."), " That is every recovery task's work added up. This task's own share: 175 newly written files, on top of the 171 reset-restore already had — found by searching all 56 real session transcripts on this machine instead of the 5 reset-restore actually opened.");

		div.c("surface pad flex v gap-25", () => {
			p.c("h4", "the big find: Page.class.js");
			p("Three files — ", b("Sidebar.js"), ", ", b("LocalStorageSaver.js"), " and ", b("AITask.js"), " — were sitting fully recovered in reset-restore's own log, but held back because they all call a save feature (", b("Page.Store"), "'s ", b("read_raw"), "/", b("write_raw"), "/", b("clear_raw"), ") that only lives inside ", b("core/Page/Page.class.js"), " itself — and that file had no full copy in the 5 transcripts anyone had opened. It was sitting in one of the other 51: a 60-step edit history spanning five different sessions from mid-August to last night. Recovering it (byte-verified, hand-diffed independently) let ", b("Sidebar.js"), " and ", b("LocalStorageSaver.js"), " deploy clean. ", b("AITask.js"), " is still held back — it needs a second file, ", b("card.js"), ", which nobody has a full copy of anywhere.");
		});

		md("## What's still gone or blocked — 155 files\n\nGrouped so it's easy to see what matters:\n\n- **A design-study module, never committed** (40 files) — `framework/styles/system/studies/`, a whole page-per-topic exploration (color, size, spacing, vocabulary) that was staged but never saved. None of its content ever reached a session transcript in full.\n- **`ext/Panel`** (17 files) — the panel toolbar/flow CSS and docs.\n- **`ext/AITask`** (21 files, including `card.js` and `AITask.js` itself) — this is the one worth knowing about: `card.js` is the single file blocking `AITask.js` from going live.\n- **The paging program** (21 files) — `imagine/paging/`'s build, make and mechanism pages.\n- **A design program** (15 files) — `imagine/design/`'s controls, journey, scale, system and themes pages.\n- **The framework's own core** (10 files) — `words.js`, `Page.css`, `Frame.js`, and a few docs.\n- **Everything else** (31 files) — scattered one-off pages across `imagine/layouts`, `layouts/labs`, `michael`, `notes/short-minded`, `public/styles.css` and a handful of docs.\n\nNone of it is guessed at — the full reason for every file, plus the outcome for all 1,470 original entries, is in [`lost.jsonl`](../reset-recovery/lost.jsonl).").ac("wide");

		div.c("surface pad flex v gap-25", () => {
			p.c("h4", "what was never going to come back, and wasn't chased");
			p("969 of the 1,470 original losses are regenerated screenshots — cheap to redo by re-running whatever took them, skipped entirely on purpose, same as every earlier task in this chain. The 155 above are the honest remainder: either nothing in any of the 56 transcripts holds their content, or (for `card.js` and a few others) only fragments exist with no full file to anchor them to.");
		});

		md("## How this task checked itself\n\nThree files were hand-diffed byte-for-byte against the raw transcript, using a second script written from scratch (not the same extractor that found them), to make sure a bug in one didn't hide in the other: `Page.class.js` (the 60-step chain), `public/framework/core/Search/page.js`, and `public/blog/doc/front.md`. All three matched exactly (SHA256-identical). One real bug was caught and fixed along the way: the first pass trusted every recorded `Edit` call as having applied — but a handful actually failed in the original session (the file didn't match what the agent expected) and the transcript still records the attempt. Skipping those specifically is what surfaced `Page.class.js`.").ac("wide");

		p.c("muted", "Full manifest with every outcome: lost.jsonl. Every measurement, the extraction method, and the hand-diffs are in this task's own task.jsonl.");
	},
});
