import { Page, p, b, md, div } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board — the page grid.
   2 SIZE       prose at --measure — one finding, no wide content needed.
   3 OWN LAYOUT one screen: headline, the three counts, then what's still not back
                and why, then the proof.  4 REGIONS none.  5 PREVIEW default card. */

export default new Page({
	meta: import.meta,
	title: "Stash restore",
	description: "The tree was never lost — it was stashed. 1,008 of the 1,389 pre-reset files are back on disk; 301 were already there; 80 were left alone on purpose.",
	icon: "restore",

	content(){

		p(b("Nothing from last night was ever destroyed. It was a "), b("git stash"), b(", not a reset."), " The stash — ", b("stash@{0}"), ", timestamped the exact minute of the incident — has held the whole pre-reset working tree all along: 1,389 files. This task read every one of them back out with ", b("git show"), " (never ", b("apply"), " or ", b("pop"), ", so the stash itself is untouched and still there as a backup) and put back everything that was safe to put back.");

		div.c("surface pad flex v gap-25", () => {
			p.c("h4", "the three counts — they add up to 1,389");
			md("- **1,008 restored** — 877 files that were simply gone from disk, plus 131 that were sitting there matching the OLD commit, meaning they'd been quietly reverted and nobody had touched them since.\n- **301 already identical** — on disk already, byte-for-byte the same as the stash. Nothing to do.\n- **80 skipped, on purpose** — left alone because writing them would have thrown away something newer. Never touched.");
		});

		p(b("The 877 number is a strong cross-check: "), "the brief said 877 files were still absent from disk, and counting fresh from the stash's own file list landed on exactly 877, independently.");

		md("## The 80 that were left alone\n\nThree different reasons, all erring toward *do nothing* rather than guess:\n\n- **57 files** have real, newer content on disk — genuine recovery work or edits made since the stash, different from both the stash's copy and the old commit's copy. Overwriting these would have been the exact mistake this task was warned against.\n- **22 files** are an edge case: the stash shows them as *deleted* (they'd been intentionally removed in the hours before the incident, as part of ongoing cleanup work), but the reset brought the old versions back and nobody has touched them since. Putting the stash's true intent into effect here would mean **deleting** files, which is outside what a restore task should do unasked — so they were left exactly as found, listed by name in the task log, for a person to decide.\n- **1 file**, `CLAUDE.md`, was named explicitly out of bounds in the brief and skipped without being evaluated at all.").ac("wide");

		md("## Proof\n\n- `node --check` on all 141 restored `.js` files — 0 failures, all parse.\n- Five pages loaded in a fresh headless browser (never the owner's own tabs): `/`, `/framework/`, `/framework/ai/`, `/framework/ai/v/3/`, `/framework/styles/system/studies/` — all HTTP 200, zero console errors.\n- Three restored files hand-diffed against `git show stash@{0}:<path>` — `ext/Panel/doc/focus.md`, `ext/JSONL/page.js`, `layouts/labs/blogx/finder/page.js` — byte-for-byte identical, all three.\n- The whole write batch (1,008 files, 12 seconds) ran inside a reload hold, so no open tab flashed mid-write.").ac("wide");

		md("*Every count, path list and timestamp is in this task's own task.jsonl — nothing here is summarized from memory.*").ac("muted");
	},
});
