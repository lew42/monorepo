# paging-fix-4 — the fix pass after audit 4 (Opus)

Read first: the repo's `CLAUDE.md` (law 2, the Presentation section), `../mastermind-day/requirements.md`, `../../2026-09-04/mastermind-platform/minion-rules.md`, the two fourth audits — `../paging-audit-4/task.jsonl` (the newcomer: scores 4/5/5/4/5/3, the five-step use test passed, nine items) and `../paging-audit-4b/task.jsonl` (the designer: six items with file:line) — and `../paging-fix-3/task.jsonl`. Skills: `new-task` (this dir, group `paging`), `code`, `layout`, `css`, `ui-test`, `documentation`, `finish-task`. You own `public/imagine/paging/`.

## The merged list, in order

1. **The drawer's code boxes show one line of nineteen.** `pre.code-block` is a flex child of `.drawer-body flex v` with no `min-height` — 22px tall holding 352px; same for the JSON box (and it scrolls sideways inside 280px). `flex: none` and let each scroll itself; measure both boxes' heights after, at 1280 and 3440, on both the Code and More buttons.
2. **A page you made draws its own children.** `make/page.js:71` never hands the stage the page's children: `/imagine/paging/make/notes/` has Today and Later and its tab strip reads Overview/Pricing/Docs/Contact with zero links to them. Hand the stage `pages:` from `node.children`, falling back to the canned set only when a page has none. Prove on `make/notes/`.
3. **"Make this a page" names the new page, not the page you stood on.** It took the hub's title/icon/description (a second page called "Paging") and linked Make's list. Add a title field to the drawer form, derive the slug, and link `/imagine/paging/make/<slug>/` on success.
4. **Build's step 7 prints the seven words, and Build's blocks reach the page.** Step 7 printed only title/icon/description/`width: "large"`/children (and `width` is a word the realm calls Room) — print the seven the way `code_for_config` does. Blocks are collected and saved into `mode.blocks` and drawn by nothing: either Make hands them to the stage's `draw` seam (the doc's own proposal 4) or `PIECES` and step 5 come out. Decide, do it, and record why in `doc/builder.md`.
5. **Make's rows at 3440.** `.paging-make-title` grows to 2299px so a page's name sits 2300px from its chips; cap the row at the reading measure.
6. **One name per thing, rail → bar → address.** The rail says six blocks, the bar says seven labels (Skin is three, Stage is none), the url says `surface`/`background`/`type`. One SKIN group in the bar (surface · background · type under one label); url keys equal the label words a reader sees; the Navigation block page gets the bar (it is the one block page where you cannot change the word).
7. **Nest takes any page.** `?nest=` takes a preset id, so a page you made cannot go inside anything; take a url (a preset id or a made page's path), and "any page inside any other" becomes true. Taking a nest out must be sendable: `url.js:108` writes `nest` only when there is one, so clicking it off leaves the address and a refresh restores it — write `nest=` empty or delete the key and push.
8. **Cross with two dropdowns**: which word crosses which (7 × 7 possible), default navigation × arrangement.
9. **The builder's middle column at 1280.** The card is 957px under its 64rem floor so the live stage sits 2,100px down; lower the stacking floor so the stage is on the first screen at 1280; fix the stale layout note ("1238px at 1280").
10. **Small:** one stable/dynamic list (`stage.js:164` re-types what `blocks.js:33` flags; `navigation/findings.js:17` names it a third time); the bar's alignment (centred at 3440, left at 1280 — pick one).
11. **If budget remains after 1–10:** `BuildStage` renders a `PagingStage` (the four steps in `doc/builder.md`; item 4 decided its seam). The merge deletes 232 lines + 43 of CSS.

## Prove it

`ui-test`: the code boxes' heights; `make/notes/`'s tabs are Today and Later and link; "Make this a page" with a typed title lands on the new page; Build step 7's printout after two dropdown changes; a nest with a made page's url, cold; nest off, refresh, still off. Screenshots at 1280 and 3440 of the drawer (Code and More), Make, Build, cross. Zero console errors at 400/1280/1920/3440 across the realm (34 pages last time; match it).

## Fences and budget

Write only under `public/imagine/paging/`; this task dir. Never `core/`, `ext/`. Private server (kill by the pid you started); never `find /`; never spawn agents; never `git stash`/commit. Budget ~450k tokens. Report in ≤ 10 plain lines: which of the eleven landed, the proofs for 1–4, what you left and why.
