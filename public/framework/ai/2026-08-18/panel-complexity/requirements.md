# panel-complexity — has ext/Panel sprawled, and what is the simplest thing that meets the north star?

Laws: less is more · clarity · prioritize. **Deliverable: `proposal.md` in this dir — ≤ 2 screens (≤ 120 lines): a complexity map with numbers, a keep/delete/merge verdict per surface, and a strategy for the Panel work that follows. Final message ≤ 20 lines.** You are the judge here (Opus); a written redesign is the result, not edits.

## The north star (the owner, 2026-08-18, verbatim)

> I want a simple, easy to use Panel system that allows me to explore flex and grid responsive layouts quickly and easily. also remember we have that layouts/space/ layout generator system (i think it was implemented at one point into the ext/Panel, not sure).

And the surrounding asks, verbatim:

> So, we have all these demos, stages, panels, etc. They often have similar features: resize, split, fill, etc. […] I feel like we might need variants of the ext/Panel. Maybe a Stage? I feel like some of the demo stuff could be merged in? I like the `demo()` or `demo.stage()` api, it feels nice, so maybe the demo integrates the Panel system?
>
> I feel like the ext/Panel might have sprawled in complexity. Spawn a minion to analyze it's complexity, propose simplifying measures, etc. […] Formulate a strategy.
>
> One of the variants for the ext/Panel, should be a full-screen mode. Maybe we want to keep the sidebar nav, not sure at this point. But, we could have a page layout that is basically a panel. It can be split, you can change the alignment, etc. […] If you have a split column page layout, like the catalog (rail), the panel could let you resize it, zoom it, (play with it until it feels right). If you had a grid layout, the panel could let you reconfigure it.
>
> Ahh, yes, the mini apps (demo.app): Panels should definitely be able to BE or HAVE mini apps, that are like self contained navigations.
>
> A panel flow is like, a recorded progression of panel steps. So when you're testing, and you start, split, split, resize, etc... each step, each action, is a step, that you can replay, step through, etc.
>
> The Panel system has a large library of swappable components, which is cool. However, let's focus on making a handful of basic layouts that are preconfigured. Some fill, some hug. Look at yesterday's figma work, it produced a lot of basic layouts.

## Read (in this order; do not read every file line by line — the map is the point)

- `public/framework/ext/Panel/readme.md`, `doc/decisions.md` (long — skim the headings and the *Open* list), `doc/templates.md`, `doc/generator.md`, `doc/overlays.md`, `doc/focus.md`. `wc -l` every file: 36 files, ~3,800 lines of JS+CSS today.
- `Panel.js` (verbs), `workspace.js` (the two doors, the redraw), `size.js`, `split.js`, `grip.js`, `display.js`, `templates.js`, `generate.js` (the seam to `styles/layouts/space/` — `generate()` draws a seed as a picture; `structure(seed)` translates it into panels), `persist.js`, `text.js`, `repeat.js`, `insert.js`, `tools.js`, `toolbar.js`, `properties.js`, `PanelDrag.js`.
- `public/framework/ext/demo/readme.md` + `demo.js`, `stage.js`, `exhibit.js`, `app.js` — the demo family the owner likes (`demo()`, `demo.stage()`, `demo.app()`).
- `public/framework/styles/layouts/space/readme.md` — the generator; `styles/layouts/` — the wall of layouts, incl. yesterday's Figma-derived ones (`wire/`, `home/`, `anatomy/`, `screens/`, `apidoc/`, `spec/`).
- The prior simplify pass: `public/framework/ai/2026-08-17/panel-simplify/` (task.jsonl outcome + any md) — know what was already tried so you don't re-propose it.
- Memory notes the owner has accepted: composition over subclassing; a theme is CSS; parts as static subclasses; ~100 lines is a try not a rule.

## Deliver — `proposal.md`

1. **The map** (a table, ≤ 20 rows): each surface/file group → lines · what it does in one clause · who calls it (count) · does it serve the north star (yes / no / only for the editor). Two numbers that must agree: total lines by `wc`, and the sum of your rows.
2. **Verdicts**: KEEP (the minimum that lets a person split, resize, nest, set flex/grid words, swap content, and see the layout at several widths) · PARK (move behind a flag or into `ext/editor`, no deletion yet) · DELETE (dead or duplicated — say what duplicates it) · MERGE (with `demo.stage()` / `demo.app()`; be concrete about which door absorbs which).
3. **Variants**: Stage / full-screen page-as-panel / panel-hosts-a-mini-app — for each, is it a new class, a `workspace()` option, or a page layout wearing panel chrome? Pick one shape per variant with one sentence of why. Say how the `space` generator and the Figma-derived layouts become the "handful of preconfigured basic layouts" (some fill, some hug).
4. **Panel-flow**: the smallest recorder that would let the owner replay a sequence of panel actions — where would it hook (Panel verbs? Item history? persist.js?), and what would a step be. ≤ 12 lines. Build or don't build: your call, with the reason.
5. **The strategy**, ≤ 15 lines, ordered: what to do first, what waits, what should never be done. Cost each step as S/M/L.

## Rules

- READ-ONLY on `public/` outside this dir. Findings as `log` lines in this dir's `task.jsonl` as you go.
- Run `new-task` first (dir + brief exist; write `task.jsonl` line 1 and the `day.jsonl` line; group `panels`); `finish-task` at the end with `"tokens": null`. A skill that misleads you gets one line in its `improvements.md` (`skill-improvement`).
- Timestamps from the clock. No names of people anywhere. Say "the owner".
- Two other minions are test-driving flex and grid in the browser in parallel (`../panel-flex/`, `../panel-grid/`) — you may read their `task.jsonl` logs near the end and cite a finding, but do not wait on them.
