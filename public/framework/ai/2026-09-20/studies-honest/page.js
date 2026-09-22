import { Page, p, b, md, div } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board — the page grid.
   2 SIZE       prose at --measure — one finding, no wide content needed.
   3 OWN LAYOUT one screen: the two numbers first, the big find, then what's left.
   4 REGIONS    none.  5 PREVIEW  core's default card. */

export default new Page({
	meta: import.meta,
	title: "Studies honest",
	description: "All nine of the studies module's missing pages turned out to be recoverable — an overlooked git stash from the exact minute of the 2026-09-19 reset held every one of them.",
	icon: "restore",

	content(){

		p(b("The studies index used to advertise nine pages that all 404'd. Now none of them do."), " Its own child list — size, spacing, padding, scale, type, color, themes, system, vocabulary — still named nine studies whose ", b("page.js"), " files the 2026-09-19 hard reset had wiped out. Before this task: 9 of 9 links on that one page were dead. After: 0 of 9 — plus the ten sub-study pages nested inside them (", b("padding/one-rule"), ", three under ", b("spacing/"), ", ", b("type/anchors"), ", two under ", b("color/"), ") all confirmed live by fetching every one and checking for a 200, not just by eye.");

		div.c("surface pad flex v gap-25", () => {
			p.c("h4", "the big find: an overlooked git stash");
			p("Two earlier tasks (", b("reset-recovery"), ", then the more thorough ", b("reset-deep"), ") searched every one of the 56 real session transcripts on this machine for the content of these nine files and came up empty — ", b("lost.jsonl"), " ended up marking all nine ", b("still_gone"), ", the most pessimistic outcome it has. Both were searching in the right place for the wrong thing: these files were never typed into a transcript in one piece, they were built in hundreds of small edits.");
			p("What neither task checked was ", b("git stash list"), ". Running it turned up ", b("stash@{0}"), ", timestamped ", b("2026-09-19 23:16:39"), " — the same minute the brief names for the reset itself. It holds the entire pre-reset working tree, 1,389 files. Reading (never applying) the studies files out of it with ", b("git show stash@{0}:<path>"), " recovered all 138 missing files, byte-for-byte. Before trusting it, the 3 files that HAD survived the reset on disk were diffed against the stash's copies of the same 3 files — identical in every byte — which is why the other 138 could be trusted too.");
		});

		md("## What's restored, what's still gone\n\nAll nine studies are back, with everything that shipped with them — CSS, docs, and the real screenshots each study's argument depends on (138 files in total; all `.js` files parse, all images hash-match their stash originals). **Nothing was gone for good.** The one thing genuinely lost and not rebuilt: a handful of regenerated screenshots the original studies task had already staged for deletion or replacement — not part of any study's argument, cheap to redo if ever needed, and not chased, the same call every recovery task before this one made about disposable screenshots.\n\nThe index itself now says this in one added paragraph, with a link back here, instead of staying silent about the near miss.").ac("wide");

		md("*The restored module: [/framework/styles/system/studies/](/framework/styles/system/studies/). Every check, timestamp and file list is in this task's own task.jsonl.*").ac("muted");
	},
});
