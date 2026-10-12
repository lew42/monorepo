# practice-layouts — three big, polished, responsive layouts that span 3440, with their small forms, every decision one click down

Load the `minion` skill first. Then this brief.

**Three laws.** Less is more (three layouts, not ten; each the fastest version that holds, then polished). Clear beats brief by far. Prioritize.
**Length budget:** `/layouts/practice/` level 1 is one screen: three picture cards, one line each. Each layout page IS the layout, filled with realistic content, and carries one fold at the bottom: "why it is the way it is". Your landing report is one screen of plain sentences with links and the four-width table.
**The reader is the overwhelmed newcomer.** Shown, not told.

## The owner's words (2026-09-17)

> the layouts are too complex and they're not polished enough. There's a lot of just random blank spaces. There's just a lot of things that don't line up properly.

> we need a better system to get a small number of robust layouts. That's a huge objective there. I'm going to repeat that, a small number of robust layouts. We need different size layouts. We need small mobile layouts. [...] Practice with big layouts that span 3440. That are also responsive. We need more of them. We need better ones.

> what does this thing need a box? [...] If it does, it needs padding. If it doesn't, it probably doesn't need padding. A lot of times we don't have a background change, but we add padding and then this thing just looks like it's floating in midair without aligning with the margins.

> for any thing we're creating [...] layout, navigation, structure, visual hierarchy. What goes where? [...] iceberg UX [...] color, focus, interaction, and purpose and outcome.

The full prompt: `../mastermind-layout-browser/requirements.md`.

## Deliverables (each ticked against the sentences above at harvest)

1. **`/layouts/practice/`** — a new child of `/layouts/` (top level: the page grid, so `wide` and `bleed` work; NOT under `/imagine/`, which is a columns host). Level 1: three picture cards (a 1920 shot each, jpeg, in `practice/shots/`), the layout's name, one line saying what it is for. Add `practice` to `/layouts/page.js` `children:` AND one visible `md()` line in its `content()` (`children:` only makes it routable — count `a[href='/layouts/practice/']` on `/layouts/` to prove the link). One line in `/layouts/readme.md` Use.
2. **Three layout pages**, each a real `page.js` under `practice/<name>/`, each a WHOLE-PAGE layout that spans 3440 and holds at 400 / 1280 / 1920 / 3440, each citing the `/layouts/` id it is an instance of (`N-name`; read `public/layouts/layouts.json` and `doc/naming.md`):
   - **Workbench** — a nav rail, a wall of tiles, a detail region: three regions at 3440 and 1920, two at 1280, one stacked column at 400 with the rail becoming a top strip.
   - **Reader** — nav rail, an article at the measure, and the leftover on a wide screen turned into a third region that earns it (figures, notes, a table of contents that stays put) instead of grey; at 400 one column, the ToC folded.
   - **Catalog** — a hero band with a fold budget in `vh`, a card wall that reaches 6–8 columns at 3440 and one at 400, a footer of links: bands, not columns.
   Fill each with REAL content from this site (readme sentences, real card titles, real links), never lorem, so the judgement is honest. The nav must not move when the reader does anything on the page (no column opens beside it; the layouts are page-grid, not columns).
3. **Polish is the deliverable**, measured: at each of the four widths, (a) no text or framed box at x:0, (b) no prose past the measure, (c) no constant where a spacing token exists (`--pad --gap --flow`, the `--size` knob), (d) every box with a background has padding and every box without one has none (the owner's rule — list every surface on the page and say which it is), (e) all left edges in a region sit on ONE axis (measure the distinct `x` of the region's direct children: one value), (f) width used at 3440 ≥ 0.9 of the viewport (`ext/DesignTool` `rate()`/`analyze()` or your own measure of the widest painted span), (g) the first nav element is above the fold at every width, (h) every `overflow: auto` box named and wanted. The table of those eight checks × four widths × three layouts is the proof; put it in your log and, in one line per layout, on the layout's own fold.
4. **The fold: "why it is the way it is"** at the bottom of each layout page (a `<details>`): the nine answers the layout skill now asks — layout · navigation · structure · visual hierarchy · iceberg · color (with the ratios) · focus · interaction · purpose and outcome — one line each, plus the four-width line. That is the decision browsing the owner asked for, nested where it belongs.
5. **For the browser:** the three items as an `items.json` block (`{id, tier: "global", name, url, source, shot}`) in your log, and the 400/1920/3440 shots in `practice/shots/` named the way `/layouts/browse/shots/` names them (look) — the mastermind adds them to the browser after its critic lands; you do not touch `/layouts/browse/`.

## Rules

- Load `code`, `layout` (all of it — the five questions, the 3440 spacing rules, the two bounds rules, the box-and-contrast section, the measure cycle; wall floors in `rem`), `css`, `new-css-class` (`std-` is `/layouts/`'s prefix; practice classes are `std-practice-*` or a new registered prefix), `new-page`; `new-task` before the first edit (your dir exists: `ai/2026-09-17/practice-layouts/`); `documentation` then `finish-task`; `skill-improvement` for any skill that misled you.
- **Fence:** `public/layouts/practice/**` (new), one `children:` word + one `md()` line in `public/layouts/page.js`, one line in `public/layouts/readme.md`, your task dir. Nothing else — not `/layouts/browse/` (a critic is editing it), not core, not framework.css, not `/imagine/`.
- Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`. The owner's server (port 80) is NOT running; start your own: `PORT=8098 node server.js` from the repo root, in the background; kill it by PID when you land. `ui-test` has the headless recipe; `fullPage` screenshots capture the viewport only here — give the viewport the height. A hidden tab does not lay out.
- The approved set at `/imagine/design/layout/approved/` is closed: these three are PRACTICE instances of approved shapes and encyclopedia ids, never a sixth approved layout; say which approved shape each one is.
- Two numbers that must agree: the widths table on each layout's fold and your headless table in the log.
- **Resolve, don't park.** Findings as `log` lines; timestamps from the clock; never Out-File for jsonl.
- Landing: `outcome` = a headline, the three links, the 1920 shot of the practice index, the eight-check table summarised as passes/total per layout, what was left and why. One screen.
