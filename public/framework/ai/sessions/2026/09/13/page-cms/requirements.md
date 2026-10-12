# page-cms — one CMS screen for making pages

Run: `ai/2026-09-13/mastermind-page-cms/` (the mastermind). This brief is yours alone. Group: `paging`.

## The three laws, and your length budget

1. **Less is more.** Fastest working version first, then improve. Delete before you add.
2. **Clear beats brief.** A newcomer opening this screen says what it is for in ten seconds, without reading a paragraph. Full plain sentences where a sentence is needed; no sentence where the screen already shows it.
3. **Prioritize.** The five numbered deliverables below, in order. Ship 1–3 working before polishing 4–5.

Budget: the screen itself is the deliverable. Prose on the screen: one lede sentence, and one line under each pane at most. Your landing report: one screen, links and pngs, numbers in your `task.jsonl`.

## The owner's words, verbatim

> this imagine/paging/make/ demo sucks. it barely works. i click buttons, nothing happens. i have no idea what this is. it's mildy functional (i can create nested things), but are they rendered somewhere? were they supposed to be? imagine a fully functional, enterprise grade application. this is not it...

> be a mastermind, fix this shit. i want a full CMS-like page creation experience, what is this little malfunctional tree? i shouldn't need UP and DOWn buttons if drag and drop sorting works. these are allegedly pages, but i want to see a little demo so i know what i'm creating, what it looks like

> when the imagine/paging/make/ page gets 3440, the (owl-based?) spacing (gap?) becomes huge (%?). the text is restrained to --measure? so... we have like 8em padding, looks bad, wastes space

## What is there now (read these first, in this order)

- `public/imagine/paging/make/page.js` — the list of made pages, chips, a form, a JSON textarea. `made.js` is the store: one `page.json` per page under `public/imagine/paging/made/`, written over the dev socket by `FileSaver`; localStorage off localhost. `tabs.js` is the row acts (rename · up · down · star · add · delete). `apply(tree)` is the ONE write seam: regrow the Page children, redraw, save the diff.
- `public/imagine/paging/build/page.js` + `stage.js` + `words.js` + `draw.js` — the page BUILDER: controls left, the live page in the middle under the realm's seven-word bar, `page.json` and `page.js` underneath. `BuildStage` draws any node. Build has the live preview Make lacks; Make has the tree Build lacks. **Two screens for one job is the defect.**
- `public/imagine/paging/stage.js` — `stage_props(node, …)` is the one translation from a saved node to what the stage draws.
- `public/imagine/paging/blocks.js` — the seven words (`CONTROLS`, `config_of`, `mode_for`, `title_of`, `DEFAULT`).
- `public/framework/ext/Draggable/Sortable.js` + `readme.md` + `doc/sortable.md` — grab a row, drop it before another row or into another container; `locate(e)` → `{ list, before }`; nesting on the same code path. Its own demo at `/framework/ext/Draggable/`.
- `public/framework/core/Page/Page.class.js:242` — `Page.from(source)` takes a page.json OBJECT as well as a url.
- Skills: `code` (load first), `layout`, `css`, `new-css-class`, `ui-test`, `documentation`, `finish-task`, `skill-improvement`.

Headless look, 2026-09-13 (mastermind): at 1600 the list works and writes files (five owner edits are already on disk under `made/`), but a chip click changes only a chip label, and a made page opens as a SEPARATE screen with canned sample prose. At 3440 the Make page is a 3027px-wide prose column: body 18px, lede capped at 648px, `--flow` 54px, the `h3` margin-top 104px, the list 1024px wide in a 3027px middle. It is an article layout wearing a tool's job.

## Deliverables — each is ticked against the owner's sentence at harvest

1. **A CMS-like page creation experience.** `/imagine/paging/make/` becomes ONE screen with three panes: the page tree (left), the live page (centre), the selected page's settings (right). A tool layout at `width: "full"` — Build's own three-track grid is the shape to copy (`build/page.js` lines 25–38: side tracks `min(24%, 26rem)` and `min(30%, 30rem)`, the stage takes the rest; stack under 54rem of card width). Selecting a row in the tree changes the centre and the right pane. Every action has a visible consequence in the centre within one frame. Nothing on the screen requires reading a paragraph to operate. `New page` is one obvious control at the top of the tree; a child is added from the row you are on.
2. **Drag-and-drop sorting.** Rows reorder among siblings and move into another page as its child by dragging, through `ext/Draggable`'s `Sortable` — one class, `drop_check` refusing a drop into your own descendant. **Up and down buttons are removed.** A drop calls `apply()` with the new tree; nothing else writes. Keyboard fallback is not required this pass; log it as left, with the reason.
3. **A little demo of what you are creating.** The centre pane is the selected page drawn for real — `BuildStage`/`stage_props`, the same thing the page shows at its own url — redrawn on every change (a word, a rename, a new child, a reorder). Above it, the page's real url as a link that opens it. The canned sample prose the content word draws stays (it is what the page shows), but the pane's one line says so: "This is your page. The text is the sample the content word draws until you add blocks."
4. **A better way to explore these UX.** The right pane is the seven words as labelled controls (the bar Build already has, or Build's control groups), plus title, description, icon, and Build's blocks control. Changing any word redraws the centre. Navigation keeps its six pictures (Build has them). The star (default child) stays, on the row.
5. **3440 spacing.** The screen keeps its shape at 1280, 1920 and 3440: tool rhythm (`--gap`) between panes and inside them, never prose `--flow`; no `--measure` cap on the tree or the settings pane; the stage takes what 3440 has spare. Shoot all three widths and put the pngs in your task dir.

**Build afterwards.** Fold Build's controls into the right pane. `/imagine/paging/build/` stays a live url (the rail and docs link it) but becomes a one-screen pointer: one sentence and a link to Make, its readme updated to say so. Deleting beats keeping two editors. If something in Build cannot move (say why in the log), keep it there and link it from the settings pane.

## Fences — files you own

- Own: `public/imagine/paging/make/**` (add `make.css`, loaded with `View.stylesheet(import.meta, "make.css")`), `public/imagine/paging/build/**`, `public/imagine/paging/doc/builder.md`.
- `public/imagine/paging/paging.css`: you may DELETE the `.paging-make-*` block (around lines 345–400) after moving those rules into `make.css`, and nothing else in that file.
- Do not edit `made.js`'s file format or `DIR`; do not edit `public/framework/**` (core, ext, styles). If `Sortable` needs a change, write the exact diff as a `log` line in your task.jsonl and work around it locally. Do not edit `paging/page.js` except the one `children:` string if a name changes (it should not).
- Class names: run `new-css-class` for every new class; prefix `paging-make-`.

## Rules every brief carries

- Open your task: `ai/2026-09-13/page-cms/task.jsonl` with the `new-task` skill (your own `session_id`, group `paging`, this brief's five deliverables as `steps`). Log findings as `log` lines there, never a findings.md. Land with `finish-task`.
- **Never kill or restart the dev server on port 80. Never drive the owner's tabs. Never `git stash`. Never commit.**
- Headless tests: the `ui-test` skill; start a PRIVATE server `PORT=809x node server.js` from the repo root (`netstat -ano | grep LISTENING | grep -E ":80(8|9)[0-9]\s"` shows taken ports), kill it by pid at landing. Plans and pngs in the session scratchpad under `page-cms-*`, keepers copied into your task dir.
- **The owner's made pages are data.** `made/notes`, `made/ideas`, `made/archive` and the owner's `new-tab` / `new-page` rows stay untouched. Test create / drag / delete with pages you name `probe-*` and delete them before landing. `git status public/imagine/paging/made/` before and after must show the same files.
- Resolve, don't park: a problem you find gets fixed the best way you can now, with its caveat beside it. "Left open" needs a reason a reader accepts.
- Every recipe above was checked against the files on 2026-09-13; if one is wrong, fix your course and add ONE evidence line to that skill's `improvements.md` (`skill-improvement`).
- Docs: `make/readme.md` and `build/readme.md` current and short (`documentation` skill). The page's takeaway in one sentence.

## Landing report (to the mastermind, in `task.jsonl`'s landing line)

One screen: the url, three pngs (1280 / 1920 / 3440), one drag proven with `ui-test` (before/after order from an `eval`), the up/down buttons gone, Build's state, what is left and why.
