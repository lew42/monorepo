# layout-study — every layout thing on the site, and the plan that makes ONE of them (Opus, read-only)

Three laws: less is more (ASAP); clear beats brief, by far — explain it like I'm five; prioritize. Length budget: `plan.md` may breathe; the `page.js` summary is ONE screen.

Read first: the repo's `CLAUDE.md`; **the owner's brief, `../mastermind-graduate/layout-brief.md`** (verbatim, the thirteen deliverables, the calls already made — do not reopen the calls); `../../2026-09-04/mastermind-platform/minion-rules.md`; `../graduate-plan/plan.md` §1 *arrangement* and §3 slice 3 (the arrangement word's catalogue will BE the layout tree you plan). Skills: `new-task` (this dir, group `layout`), `code`, `layout`, `css` (read only), `finish-task`.

## Study — read and RUN, do not skim

- `ext/layout/` (the owner calls it ext/Layout; one importer, `ai/2026-08-11/page.js` — confirm it is otherwise dead), `ext/Playground/`, `ext/Panel/` — compare them: what each is for, what each got right, what is duplicated.
- `ext/demo/` — `app demo exhibit mini pane sample shell stage` — the "unified demo system" (five blocks) as it stands; which of those are the viewport, the path bar / toolbar, the title, the footer.
- `styles/layouts/` — the catalogue of named layouts (`layouts.css`, `word.js`, `preview.js`, `full.js`, and ~40 named dirs), `styles/doc/layout-system.md` (the five words `page rail wall stage solo`), `styles/sections/`.
- `/imagine/layouts/` (18 numbered, `system.js`, `LayoutsCard`), `/imagine/sections/` (bands), `/imagine/paging/` `blocks.js` `ARRANGEMENT` + `LAYOUTS`, `/imagine/design/layout/approved/` (the closed set of five), `ext/DesignTool/library/` (eleven measured arrangements), `/imagine/design/vocabulary/` (29 tags, 4 axes — the filter facets).

## The plan must contain

1. **The census.** One table: every layout-ish thing above — name, where, importers (count by grep), alive or dead, what it would become. Two numbers that must agree: rows in the table = dirs you opened.
2. **One demo system, named demo.** Which module becomes it (`ext/demo` is the incumbent), its parts — viewport with a resize handle, path bar / toolbar, title, footer, optional section wrappers — which existing modules become consumers, which die, in file:line. Columns inside a demo are an option a demo page turns on, never the default.
3. **core/Layout.** `Layout extends Page`. What a layout page declares — the props a filter can read (columns 1/2/3/4; the room word; `widths: [min, max]` = the natural range it renders at, so a 1-col default-scale layout says 200–800 and the doc page opens its viewport there, never at 3440; tags from the vocabulary; `accepts` / `allowed_in` / `denies` for the rules), and how the tree browses: 1-column first (rows only, simplest and most useful first), then 2+, opening one shows variations and alternatives beneath it; filters default to *all*; paged so 10,000 never render at once. Where the first thirty layouts come from (the census — port, do not invent).
4. **LayoutRules.** Default *accepts any* / *allowed in any*; the deny list that matters (contrast: dark on dark, same-tone text; columns inside a narrow room; a full inside a full); how a dev-mode overlay shows a violation without blocking. Data on the page, one checker, one CSS class.
5. **core/Section.** `Section extends Page` so it gets storage and the rest. Starts as a default div, `min-height` 2–3em; a minimal overlay on hover when editing is enabled, and editing is enabled by code on demo and doc pages; the overlay's one control picks an approved layout (no padding schemes — the owner decided). What Section shares with `Page.Frame` from the graduation plan and what it must not duplicate.
6. **Templates.** How a layout page is importable with minimal config, re-renderable, tracks `.views[]`, can use another template, and stays linked to its instances — the mastermind's call is *update on re-render*: `instance.template`, `template.instances`, `template.update()`; no events, no state machine. Write the seam in ≤ 20 lines of code.
7. **Build slices**, three or four, each leaving the site green, each executable cold from the text (file:line, the proof). Slice A: core/Layout + the tree with the first thirty layouts rendered in the demo viewport at their natural width. Slice B: core/Section with the picker. Slice C: the demo consolidation + deletions. Slice D: templates linked. Say which can run in parallel (different files) and which cannot.
8. **What you would delete**, with line counts and the reason.

## Deliverables

`plan.md` here; `page.js` here — the owner's one screen: the census as a small table, the one-sentence answer to "what becomes core", one picture; register it by adding `"layout-study"` to `../page.js` `children:` (needed: `directory.json` has no entry for today, `../graduate-plan/task.jsonl` explains). Findings as `log` lines in your `task.jsonl`.

## Fences and budget

Read anything; run anything on a private server (`PORT=8098 node server.js` from the repo root; kill the pid you started; never port 80; never the owner's tabs). Write ONLY this dir and `../page.js` (one name). Never `find /`; never spawn agents; never `git stash`/commit. Another minion is editing `core/Page/Page.class.js` and `Page.css` right now — read them, expect them to move, do not measure the site's screenshots against yesterday. Budget ~350k tokens. Report in ≤ 10 plain lines: what becomes core in one sentence, the demo decision in one, the first thirty layouts' source, the slices one line each, what dies.
