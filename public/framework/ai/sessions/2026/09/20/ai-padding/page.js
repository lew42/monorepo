import { Page, p, b, md, div, img } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board — the page grid.
   2 SIZE       prose at --measure; the before/after shots claim wide.
   3 OWN LAYOUT headline, the before/after pair at three widths (the whole
                story), the numbers, what changed, then the one thing left
                open (a same-shape audit of other files, named not fixed).
   4 REGIONS    none.  5 PREVIEW  core's default card. */

const shot = name => new URL("shots/" + name + ".png", import.meta.url).pathname;

export default new Page({
	meta: import.meta,
	title: "AI page padding",
	description: "The AI dashboard and its cards had zero padding — a whole token block was missing from framework.css since last night's reset. Restored from the pre-incident stash; measured before and after.",
	icon: "crop_free",

	content(){

		p("The owner said it plainly: ", b("\"there's no padding on the page and most of the cards have no padding either.\""), " The page itself turned out fine — a `.page` always carries its own inset. The cards were the real bug, and it wasn't a missing class. `ext/AITask`'s cards ask for ", b("padding: var(--gap-50) var(--gap)"), ", and ", b("--gap-50"), " simply did not exist in `framework.css` any more. A CSS custom property that doesn't exist makes the whole declaration invalid, which computes to nothing — ", b("0px"), " of padding, silently, on every card on the site that used one of these tokens.");

		md("## Before and after, at three widths\n\nSame page, `/framework/ai/`, nothing else changed. Before: the ACTIVE task cards' text sits flush against the top-left corner — no padding anywhere. After: real breathing room, same page, same data.").ac("wide");

		div.c("grid auto gap", () => {
			this.figure("before-1920", "Before — 1920px. Text touches the card edge.", "0px");
			this.figure("after-1920", "After — 1920px. The standard's own padding.", "9.08px / 18.16px");
		}).style({ "--column": "28rem" }).ac("wide");

		div.c("grid auto gap", () => {
			this.figure("before-400", "Before — 400px.", "0px");
			this.figure("after-400", "After — 400px.", "7px / 14px");
			this.figure("before-3440", "Before — 3440px.", "0px");
			this.figure("after-3440", "After — 3440px.", "19.59px / 39.18px");
		}).style({ "--column": "16rem" }).ac("wide");

		md("## The numbers\n\nComputed padding, read from a fresh headless browser (never the owner's own tab), on the page container (`.page.active-page`) and a real card (`.ai-card`):").ac("wide");

		md("| width | page container | card, before | card, after |\n|---|---|---|---|\n| 400 | 21px top/bottom (by design — the grid's own gutter carries left/right, not a `padding`) | 0px | 7px / 14px |\n| 1920 | 48px top/bottom | 0px | 9.08px / 18.16px |\n| 3440 | 54px top/bottom | 0px | 19.59px / 39.18px |").ac("wide");

		md("The page container was never the bug — it already carries its own inset (a grid gutter for left/right, `--pad-y` for top/bottom) with no class needed. Every width above is the same before and after; only the card's padding moved, from a flat zero to the standard's own ramp.").ac("wide");

		md("## What actually changed\n\n**One file, restored — no new CSS written.** `public/framework/framework.css` was rebuilt from a transcript after last night's `git stash` incident, and the rebuild was incomplete: it was missing a whole block — `--gap-70/50/35/25` (four padding/gap sizes derived from `--gap`), the matching `.gap-70/50/35/25` utility classes, and the entire `.card` class (`.surface, .card` shared look, the card's own padding and rhythm, the `.selected` state) — plus a few other pieces from the same night (`--lighten/--darken` tokens, the `--field-bg` mechanism, one `--gap` ceiling correction dated before the incident). None of it was a new decision; all of it already existed, just not on disk. It was read back **read-only**, with `git show 'stash@{0}:public/framework/framework.css'` — never `stash apply` or `pop`, so the stash itself is untouched and still there as a backup — diffed line-by-line against the broken file first, and written over it only after confirming the stash version was a strict superset (nothing on disk that the stash was missing).").ac("wide");

		md("**One line, elsewhere.** `public/framework/ai/v/page.js` still listed a fourth version (`children: \"2 3 4\"`) after the owner deleted `/framework/ai/v/4/` (an accidental clone). Changed to `\"2 3\"` — the version picker now offers V1/V2/V3 only, confirmed by opening it.").ac("wide");

		md("**Proof.** `/framework/ai/`, `/framework/ai/2026-09-19/` and `/framework/ai/v/3/` all load 200 with zero console errors, before and after. A second, unrelated consumer of the same missing tokens — `/layouts/shell/`, which asks for `gap: var(--gap-50)` on its hero words — went from a would-be `0px` gap to a real `9.84px`, confirming the fix is sitewide, not AI-page-only.").ac("wide");

		md("## One thing named, not fixed\n\nThe mastermind asked for a follow-up: since `framework.css` turned out to be a partial rebuild that looked like ordinary \"newer work\" until read closely, are any of the other 57 files `stash-restore` (this morning's task) left alone for the same reason — differ from both the pre-incident stash and the last real commit — actually missing content the same way, rather than genuinely newer? A fast triage (3-way hash classification, then a line-count comparison against the stash) turned up two clear cases and a handful worth a closer look — **named here, none of them fixed**, per that request:\n\n- `public/framework/ai/2026-08-29/imagine-mag/task.jsonl` — 2 lines on disk, 30 in the stash. Only the launch line survived; the build log and landing line are gone.\n- `public/framework/ai/2026-08-21/pg-tree/task.jsonl` — 2 lines on disk, 4 in the stash.\n- Five `/imagine/design/*/page.js` files sit at ~10 lines in the stash against a full page in the old commit, with disk landing somewhere else again — this looks like a page migration was mid-flight at stash time (matches doc-link renames found inside framework.css's own restored comments), not crash damage, so it's flagged as *needs a decision*, not *broken*.\n- Smaller shortfalls worth a look: `core/Sidebar/doc/decisions.md` (422 vs 540 lines), `ux/Filter/doc/decisions.md` (129 vs 164), `imagine/paging/make/readme.md` (120 vs 158), `core/Page/readme.md` (57 vs 71), `core/Page/Page.class.js` (1050 vs 1147 — a core file).\n\nBoth task.jsonl truncations are historical logs with nothing live depending on them — a bookkeeping loss, not a site bug. Full method and the complete file list are in this task's own `task.jsonl`.").ac("wide");

		p.c("muted", "Every measurement, the stash diff, and the audit's full file list are in this task's own task.jsonl — nothing here is summarized from memory.");
	},

	figure(name, caption, number){
		return div.c("surface pad flex v gap-25", () => {
			img().attr("src", shot(name)).attr("alt", caption).style({ width: "100%", borderRadius: "0.4em" });
			p.c("muted", caption);
			p.c("h4", number);
		});
	},
});
