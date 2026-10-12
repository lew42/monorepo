# graduate-plan — how the paging vocabulary becomes core Page (Opus, read-only)

Three laws: less is more (ASAP); clear beats brief, by far — explain it like I'm five; prioritize. Length budget: `plan.md` may breathe (it is the working document for two more waves), the `page.js` summary is ONE screen.

Read first: the repo's `CLAUDE.md`; `../mastermind-graduate/requirements.md` (the calls already made — do not reopen them); `../../2026-09-04/mastermind-platform/minion-rules.md`. Skills: `new-task` (this dir, group `paging`), `code`, `layout`, `css` (read, you write no CSS), `finish-task`.

## The question

`/imagine/paging/` is a lab where a page is built from six words — **navigation, content, room, arrangement, colour, type** — over one renderer (`stage.js` `PagingStage`), one vocabulary (`blocks.js` `CONTROLS`), one translation from a saved file (`stage_props(node)` in `config.js`), and Make (`make/`, writes `made/<slug>/page.json` through `ext/Saver`'s FileSaver). It reached the owner's bar yesterday (`../../2026-09-05/paging-audit-8/task.jsonl`, 6/6 at 5). It only works inside the lab. **Write the plan that makes those six words the way ANY page on this site is configured**, so the lab can delete its own copy and import core's.

## What the plan must contain

1. **The map.** For each of the six words: what core already has (read it, cite file:line) — *room* ↔ the column width words `small/hug/large/fill/full` in `core/Page/Page.css`; *colour* ↔ the theme surfaces (`styles/`); *type* ↔ the type-size tokens; *arrangement* ↔ the five layout words `page rail wall stage solo` (`styles/doc/layout-system.md`) plus `/imagine/sections/` bands and `/imagine/layouts/` numbered layouts; *navigation* ↔ `/imagine/paging/navigation/` (stable vs dynamic) and `ext/tabs`; *content* ↔ `.md` files, urls, nested pages. What is missing. Where the lab's word and core's word disagree, which wins and why (alias the loser).
2. **The seam.** The smallest ADDITIVE change to `core/Page/Page.class.js` and `Page.css` that lets a page say `new Page({ navigation: "rail", room: "fill", … })` and get what the lab renders — and `Page.from(json)` (or the name you argue for) so a `page.json` is a page. Say what `PagingStage` becomes (a method on Page? a part class `Page.Stage`? — the `code` skill's §3) and what dies.
3. **Three slices, each leaving the site green**, written so a COLD Sonnet can execute each from the text alone: file:line for every edit, the proof for each (crawl at 400/1280/1920/3440 with zero console errors; the paging realm's 108 pages; `ext/Doc`, `ext/Research`, the blog and the imagine realms unchanged in screenshots). Slice 1 is core gaining the words with nobody using them. Slice 2 is the lab importing them and deleting its copy. Slice 3 is sections and layouts under *arrangement*.
4. **Risks, named.** `Page.css` is layered and large; `classify()` mints a class from every constructor name; `fill` yields to an open child (a 09-05 decision in core); the columns host has no page grid; hidden tabs do not lay out; one backtick in `css(\`…\`)` kills every page. What each slice must NOT touch.
5. **What you would delete.** Files in the lab that become redundant, with the reason. Deleting beats adding.

## Deliverables

- `plan.md` in this dir (the plan, sections 1–5, as long as it needs).
- `page.js` in this dir — the owner's one-screen summary: what changes for a page author, in plain sentences, shown with the before/after of ONE page file; then a link to the plan. Register it: add `"graduate-plan"` to `../page.js` `children:` — ⚠ only because this dir has a `page.js`; the `new-task` skill explains why.
- Your `task.jsonl` carries the rest as `log` lines.

## Fences and budget

Read anything. Write ONLY this dir and `../page.js` (one name in `children:`). No server unless you need to look — then a private port (`PORT=8095 node server.js` from the repo root; kill the pid you started; never port 80; never the owner's tabs). Never `find /`; never spawn agents; never `git stash`/commit. Budget ~250k tokens. Report in ≤ 10 plain lines: the seam in one sentence, the three slices in one line each, the biggest risk, what you would delete.
