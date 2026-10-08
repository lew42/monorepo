verdict: pass
1. [note] The `ext/grip` doc page's Overview tab still doesn't show the new asymmetric box directly (only crop screenshots do) — grip-page-1920.png shows only prose and the code sample, no live diagram of the two zones.

## Requirements
- 1 "Two invisible zones: show ~50px, grab smaller, biased ~1px toward the scrollbar, ~5–10px the other way" — yes — `ai2-grip-crop-near.png` shows the pill sitting right beside the rail's scrollbar track with a visible gap, and `grip.css`'s `--grip-out: 0.5rem` (~8px) / `--grip-in: 0.0625rem` (~1px) match the owner's ask; `grip.js`'s `NEAR_PX = 50` matches the ~50px show radius.
- 2 "The same on every grip surface, both axes, both directions" — yes — `ai2-grip-crop-near/rest.png` (mirrored `.grip-start`, x-axis), `drawer-grip-crop-near.png`, `devbar-grip-crop-near.png`, `sidebar-grip-crop-near.png`, `layouts-shell-grip-crop-near.png` (plain `.grip`, x-axis) all show the same pill/line behaviour; the CSS block also mirrors the asymmetric split onto `.grip-start.grip-y` for the y-axis, though no surface currently uses `from:"start"` on the y-axis to screenshot (owner's brief itself says "nothing uses this yet").
- 3 "Names: the grip's page says what it's called and where it lives; names the preview rail and detail; recorded in the design system's naming list" — yes — `page.js`'s new "Its name, and where it lives" section (seen in `grip-page-1920.png`) names the grip, `ext/grip`, the preview rail and the detail; `readme.md` repeats it; `design/layout/doc/rules.md` gets the new bullet naming "preview rail" as reused terminology.
- 4 "No regressions: screenshots at 400 and 1920 on each surface; touch keeps working" — yes — `ai2-400/1920.png`, `drawer-400/1920.png`, `devbar-400/1920.png`, `sidebar-400/1920.png`, `layouts-shell-400/1920.png` all present; `ai2-touch-900.png` and `drawer-touch-900.png` show the coarse-pointer width reset (flush, symmetric, wider) called out in the CSS's touch media block.

## Page structure
- n/a — this change edits an existing doc page's content and a shared widget's CSS/JS; it isn't a new page. The touched page (`ext/grip`) still opens with what it is (`grip-page-1920.png`: title, code sample, "try it" line) before detail, unchanged by this diff except two added sections at the end — consistent with priority order.

## Navigation
- Identify: tabs (Overview/Docs/Files on the grip doc page, Inbox/Log/Overview on AI 2) — n/a for the rest (grip itself is not a nav technique).
- 2 tab rows — yes — `layout.json` `tab_rows: 1` at all four widths on `/framework/ext/grip/`.
- 3 tab URLs — n/a, unchanged by this diff.
- 4 tab usefulness — n/a, unchanged by this diff.
- 5–10 — n/a, this diff touches no rail/sidebar/sheet/modal structure — the grip is the resize edge *between* such regions, not the region itself.

## Layout
- 1 fills width at 3440 — n/a, not measured for the surfaces this diff touches (grip itself has no width); the one page with a `layout.json` (`ext/grip`) shows `empty: 0.876` at 3440, unchanged by this diff (a doc page, pre-existing shape).
- 2 approved layout — n/a, unchanged.
- 3–6 — n/a, this diff is a widget-level CSS fix, not a page layout change.
- 7 band share vs importance — yes — `layout.json`'s three bands (`doc-well`, `tab-bar`, `tab-panel`) are unchanged by this diff.
- 8–12 — n/a, unaffected by this diff.

## Sizing
- 13 auto height — n/a, the grip strip is a fixed-width resize target by design (an exception the rule already names).
- 14–19 — n/a, unaffected; the grip's own size tokens (`--grip-out`, `--grip-in`) are new but are exactly the kind of small, deliberate fixed target the rule expects, in `rem` as required (question 19 — yes, `0.5rem`/`0.0625rem`, never `em` or a raw px in CSS).

## Wrapping
- 20 one line — yes — `layout.json` `wraps` lists only pre-existing drawer buttons (`drawer-rail-ai`, `drawer-rail-menu` at 400; `mode-btn`, `drawer-menu` at wider widths), nothing newly introduced by this diff.
- 21–24 — n/a, this diff adds no row or list content.

## Spacing and padding
- 33 left-stack padding ≤3em at 400 — yes — `layout.json` `left_stack.h1.total: 28`, `p.total: 28` (well under 3em/48px).
- 34 nested padding — yes — both `h1` and `p` show a single 28px layer each, not stacked layers.
- 35–42 — yes/n/a — the new CSS (`--grip-out`, `--grip-in`) is scoped inside the existing `@layer theme` block (question 41), uses `rem` not a spacing-clamp token (question 38: "every control keeps its own `em`/size, never a spacing clamp" — the grip is a control-sized hit target, not a clamped region, so a plain `rem` constant is correct here, not a violation); no new class beyond `.grip-near`, which is a state class, not a spacing word (question 42 — the smallest CSS that does the job, reusing `.grip`/`.grip-start`/`.grip-pill`).

## Colour and contrast
- 1–2 contrast — n/a, the pill's colour token is untouched by this diff (still `--prim`, per the comment kept in `grip.css`).
- 3 tokens not literals — yes — no literal colour added; only geometry custom properties (`--grip-out`, `--grip-in`).
- 4–8 — n/a, unaffected.

## Flow
- 25–32 — n/a, this diff changes a resize handle's hit-box geometry and two doc pages' text, not page flow.

## Words
- 1 shown before told — yes — `page.js`'s new sections point at the crop screenshots and the decisions record rather than re-explaining the mechanism in prose.
- 2 layout shows structure — n/a, the new prose describes an invisible hit zone, which by definition has no visual structure to show beyond the crops already in `shots/`.
- 3 paragraphs ≤60 words — yes — each new `md()` block in `page.js` is one to two sentences.
- 4 ten-second point — yes — "Its name, and where it lives" and "Two invisible zones" each answer one question, headline first.
- 5 titles say what the thing is — yes.
- 6 captions ≤1 line — n/a, no captions added.
- 7 one name per concept — yes — "the grip", "preview rail", "detail", "show zone", "grab zone" are each used consistently across `readme.md`, `page.js` and `doc/decisions.md`.
- 8 links to pages — yes — `page.js` links `design/layout/doc/rules.md` and `core/Layout/list-and-detail/` for "preview rail" and "list and detail"; `readme.md` does the same.
- 9 picture beside prose — yes — the task folder's crop shots are the picture for this prose; the live page itself (`grip-page-1920.png`) still only has the code sample as its picture, so the two new sections on that page are words without their own inline image (a note, not a fix — the crops exist, just not embedded in the page).
- 10 most important first — yes.
- 11 plain sentences — yes — e.g. "A ~50px show zone makes the line and pill visible..." is a full sentence, not clipped jargon.
