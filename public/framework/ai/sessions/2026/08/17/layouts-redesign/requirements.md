# Redesign `/framework/styles/layouts/` — the whole thing

Mike, 2026-08-17, verbatim. Read every line; these are requirements, not context:

> our styles/layouts/ page's layout SUCKS. it has 1 item in the first row. 3
> items in the second. all the items in the flex and grid sections should
> probably be on the main page. on my 3440 screen, i wanted a masonry layout
> there.. a way to see ALL THE THINGS, and eventaully filter them.
>
> the PAGES and APPS layouts look broken. the previews render scrollbars at full
> size (they don't obey zoom), so maybe we can turn off scrolling for those?
>
> however, those designs actually suck. they don't look cool, inspiring, useful.
> they look unfinished, broken, etc.
>
> I'm not 100% the responsive mobile + 3440 previews are the way: they're too
> hard to see. I like the dual slider mode, but not for those previews.
>
> how do we organize these layout previews? the super simple flex/grid cards
> (just white cards on the light gray bg, but visually grouped?) are nice and
> simple... each is like a category of potential layouts. we don't really need a
> separate card for gap vs no gap. and maybe don't need one for 2 columsn vs 3
> columns.
>
> your job is to make massive progress on the styles/layouts/ page. redesign the
> whole thing. make sure it looks good.

Also standing, and it governs every choice below:

> MINIMIZE THE CHAOS — if I have you running constantly, I always want the
> objective to create clean, simpler solutions, not generate hacks, bandaids,
> spaghetti, that I'll never understand.

And: **`styles/layouts/` is now the sole home for layout** (CLAUDE.md RULE#17).
Don't open a second address for any of it.

## Why the rows are wrong (start here, don't rediscover it)

`page.js:18-23` declares 27 children in one flat list. `previews()` emits **one
flat run** — a full-width group heading, then that group's cards, then the next
heading (see the comment at `page.js:120`). A group with one member therefore
gets a row containing exactly one card. That is the "1 item in the first row, 3
in the second" Mike is looking at: `model` alone, then `fit flex grid`.

So this is a **grouping and information-architecture problem**, not a CSS bug.
Don't patch the grid — decide what the wall should contain.

## The four decisions you own

**1. Consolidate to categories.** Mike: *"each is like a category of potential
layouts. we don't really need a separate card for gap vs no gap. and maybe don't
need one for 2 columsn vs 3 columns."* Collapse trivial variants into one card
per category, and let **variants live one click inside the category** — a reader
clicks a basic card and sees its variants. Fewer, better cards. **Deleting beats
adding.** Report the before → after card count.

**2. Promote the flex and grid items to the main page.** They're currently buried
inside `flex/` and `grid/`. Mike wants them on the wall — they're the simple white
cards he says already work.

**3. Masonry at 3440.** *"a way to see ALL THE THINGS."* Widescreen space gets
**used**, not left as gutters (the prime objective). Note a real trap: this
directory has a `masonry/` child, so the *page's own* arrangement and the
*catalogued layout named masonry* are different things — don't let them collide in
class names (`page-<slug>` colliding with a module class has bitten this repo
before). Keep it working from 390 up.

**4. Kill the responsive mobile+3440 previews here.** *"too hard to see."* The
dual-slider mode stays valuable elsewhere — just not for these cards. Removing
it is the point; don't replace it with something equally busy.

## Two concrete bugs to fix

- **Preview scrollbars don't obey zoom.** A preview is a **PICTURE, not a live
  instance** — it should not scroll. `overflow: hidden` on the thumb is likely
  right. ⚠ If the rule you need lives in core `Page.css` (`.page-preview-thumb`),
  that fix lands site-wide: check a few other preview walls before and after, and
  say what else changed. Site-wide is probably *correct* here — but verify, don't
  assume.
- **The PAGES and APPS previews look broken/unfinished.** Look at them. Decide
  per-card: is the *preview* broken, or is the *layout itself* weak? Fix broken
  previews. For genuinely weak designs, you may improve them — but if a design
  needs more than a tidy, **log it as a finding and leave it**; a half-redesigned
  layout is worse than an honestly-listed weak one.

## Simplification you are authorised to make

`page.js:2` imports `ext/Panel/workspace.js` and builds the index as a
**draggable Panel workspace**. Look at the ⚠ comments at lines 41-71: this page
already fights panel-body shrink-wrap, centring spill and unreachable headings.

**A filter rail plus a masonry wall does not need a draggable workspace.** You are
authorised to drop `panel()` from this page if the result is genuinely simpler —
that *removes* a dependency and a whole class of traps rather than adding
anything. It is not required. **State which you chose and why in one sentence.**

⚠ **You may not edit `ext/Panel/**` either way — another session owns it.**
Dropping the import is fine; changing Panel is not.

## Prove it looks good

*"make sure it looks good"* is a requirement, and the score is Mike's eye, not a
metric.

- **Screenshot before and after at 390, 1280 and 3440.** Put them in the session
  scratchpad, never in the repo (RULE#12), and **log their absolute paths in your
  `task.jsonl`** so they can be surfaced later.
- **Look at your own screenshots and judge them.** Is the wall scannable? Do the
  cards read as a grouped set? Is 3440 filled rather than gutter-padded? Write the
  honest verdict, including anything still weak.
- **A change that improves a metric while looking worse is a regression** — keep
  the better-looking version and say so.
- Confirm the filter rail and search still work, and that a filtered-to-nothing
  wall still has a way back (the ⚠ at `page.js:37`).

## Files you own

- `public/framework/styles/layouts/page.js`, `layouts.css`, `preview.js`,
  `full.js`, `web.js`, `word.js`, `readme.md`
- The child directories under `styles/layouts/` **except `space/`**, in particular
  `flex/`, `grid/`, `model/` and any category pages you restructure.
- `public/framework/core/Page/Page.css` **only** for the preview-overflow fix, and
  only if that's genuinely where it belongs.
- `public/framework/ai/2026-08-17/layouts-redesign/**` — your task dir.
- `public/framework/ai/usage.json`, `public/framework/ai/2026-08-17/day.jsonl` —
  the `new-task` skill's own writes, permitted.

**Fenced off:** `styles/layouts/space/**` (another agent is in it right now),
`ext/Panel/**` (another session), `ext/LayoutTool/**` (frozen — read-only, and you
may run it to measure).

## Deliverables, in this order

1. **The redesigned page, looking good at 390 / 1280 / 3440.** This is the
   deliverable. Everything else supports it.
2. **Before/after screenshots**, paths logged in `task.jsonl`, with your own
   honest verdict on each.
3. A **Decisions** entry in `styles/layouts/readme.md`: the new grouping, the card
   count before → after, and the Panel keep-or-drop call with its reason.
4. Findings for any layout too weak to fix in passing.

Running short? Cut 4, then 3. **Never cut the screenshots** — without them nobody
can tell whether "looks good" was achieved, and a silent truncation reads as
"covered everything".

## Working notes

- RULE#6/#11: as little code and CSS as possible, most files under 100 lines.
  RULE#9: comments near zero — but the ⚠ trap comments already in this file are
  *exactly* the kind that earn their place. Don't delete a trap comment for a trap
  that still exists; do delete ones whose trap you removed.
- Climb the CSS ladder and stop at the first rung that works: nothing → utility
  class → existing component class → module `.css` (layout only) → `/styles.css`
  skin. **Never escalate downstream** — overriding `framework.css` is a bug report
  about `framework.css`.
- Restate the full layer order in any stylesheet you touch:
  `@layer base, theme, site, util;`. Every rule inside a layer.
- **Capturing is synchronous — never build DOM after an `await`.** A factory call
  textually after an `await` is wrong; fill containers inside a callback
  (`$box.append(() => …)`).
- **Foreground is the default.** If you background a command, poll it:
  `while (-not (Test-Path out.png)) { Start-Sleep 15 }`
- Headless Playwright is installed **globally** — LAW#4, add no npm dependency.
  Assert `document.visibilityState === "visible"` before trusting any measurement
  or screenshot: hidden tabs run no rAF, no ResizeObserver, and return frozen
  geometry. Never wait for `networkidle` (the live-reload socket never idles).
  Reuse the dev server already on port 80.
- Check usage before wide work.
