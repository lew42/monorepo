# self-evident-fixes-2 — round two's eleven findings, fixed

Run: `ai/2026-09-13/mastermind-page-cms/` (the mastermind). Two fixers, one per realm, same brief, different fences. Group: `ux`. Round one's fix brief, `ai/2026-09-13/self-evident-fixes/requirements.md`, is the shape; read it once for the method and the data rules.

## The three laws, and your length budget

1. **Less is more.** Fix the cause once. Two findings with one cause get one change, said so in the log.
2. **Clear beats brief.** The owner's test: a newcomer can say what every control does and sees what it did within one frame. Re-run the critic's exact gesture after each fix and shoot it.
3. **Prioritize.** The critic's rank order.

Budget: no new prose on either screen unless a sentence IS the fix. Landing report of one screen: each finding number → fixed / how / after-png, or left with a reason a reader accepts.

## The spec is the critic's log

`public/framework/ai/2026-09-13/self-evident-critique-2/task.jsonl` — the lines beginning `FINDING 1.` … `FINDING 11.` and `THE WAY IN`, with pngs `01-…png` … `09-…png` beside it. Read all of them before touching anything. The owner's rule, verbatim, is at the top of `self-evident-critique/requirements.md`.

## Split

**Fixer A — Make** (findings 1, 3, 4, 5, 6, 7, 8, 11, and the way in):
- 1 The sample eyebrow says "sample text … until you add a block" — then a block is added and it becomes "and the content word — Article", 300 words of Northwind no longer labelled a sample. One string in `stage.js` `sample()`: the eyebrow says it is a sample in both states.
- 3 Defect 8 (one orange chip, three meanings) was fixed in the right pane and not in the drawer `More` opens: orange means *selected* on seven word rows and *press me* on "Copy this link". The copy control takes `.paging-act`; the words take the select shape the pane uses. Files: `paging/config.js` (the drawer), `paging.css`.
- 4 The two armed destroyers (the site-wide clear and its second press) are the same green as the "saved" tick while the tree's delete is red. `.baseline-act.on` takes the warn colour. `baseline.js` / `paging.css`.
- 5 75 words under the tool explain what its panes show (the drag paragraph, "This is the whole page editor…") — defect 9 exactly, deleted from Importance and left here. Cut to the one sentence the panes cannot say, or nothing.
- 6 `ICON [description]` one line under DESCRIPTION reads as a broken copy of the field above. Name the icons for what they are (a picture, or a label that is not the field's name) — `settings.js`.
- 7 Three controls poke out of the settings card at 1280 (TYPE SIZE overruns by 14px). Read the critic's line; fix the container, not the items (`make.css`).
- 8 The two white circles before CONTENT COLOUR and PAGE COLOUR read as unchecked radios. Say what they are (a swatch) or drop them.
- 11 Rename a page and its address does not follow, with nothing said. The rule is deliberate (`made.js`: a rename never moves a file, so saved urls keep working) — so SAY it where the rename happens, one short line, the moment the title and the url disagree.
- **The way in (mastermind ruling, revisable by the owner):** the Build tile leaves the paging rail (`rail.js` line ~91) — `/imagine/paging/build/` stays as a url-only pointer for old links; the rail's "The editor (it saves)" section keeps Make alone. And `/imagine/paging/`'s hub body names Make near the top: one sentence with the link, where a newcomer reading the hub would look for "how do I make one". Fix the rail comment (lines ~79–86) so it no longer argues for the tile.
- Fence A: `public/imagine/paging/make/**`, `public/imagine/paging/stage.js`, `public/imagine/paging/config.js`, `public/imagine/paging/baseline.js`, `public/imagine/paging/rail.js`, `public/imagine/paging/page.js` (the hub body only), `public/imagine/paging/paging.css`, `public/imagine/paging/readme.md`, `public/imagine/paging/doc/**`. The owner's made pages are data — probe pages named `zzz-probe-*`, deleted before landing, `git status public/imagine/paging/made/` unchanged before/after; take a full copy of `made/` before the first gesture (the round-two critic renamed an owner page by accident when a reload reset the selection — restore from your copy if it happens to you, and say so).

**Fixer B — Importance, plus two small ones next door** (findings 2, 9, 10, and two findings the proposal writer made):
- 2 Type a name, press `2`: nothing is cast and the `2` lands in the name, which the next press writes to the committed jsonl as the judge. Swallow 1 / 2 / ← / → in the name and reason fields and cast the judgment; do not rely on an unstated Enter. `views.js` / `judge/page.js`.
- 9 The judgment rows a `Why?` toggle opens print under the caveat, not under the toggle that opened them. Put the rows where the reader's eye is.
- 10 The judge screen prints "Saved to disk…" and "Buying a used car" twice (once per column). Say each once.
- The proposal writer's two: `public/imagine/importance/page.js` overrides `activate()` in five lines to redraw on each visit — core already calls `activated?.()` at the end of `activate()` (`core/Page/Page.class.js`, grep `activated`), so it is one line. And `public/imagine/cms/json/json.js`'s `redraw()` never re-runs the Router's `mark_links()` after it rebuilds a box (Make's `redraw()` does: `this.app?.router?.mark_links()`), so a rebuilt link is never marked active — add the call.
- Fence B: `public/imagine/importance/**`, `public/imagine/cms/json/json.js` (that one call only). Data: `md5sum` the three importance files before and after, remove every test row by id, log both hashes. The live rules in `importance/doc/live.md` (controls never inside the streamed region; the writer does not apply its own line) must survive.

## Rules every brief carries

- Open your task with `new-task`: Fixer A at `ai/2026-09-13/self-evident-fixes-2/make/task.jsonl`, Fixer B at `ai/2026-09-13/self-evident-fixes-2/importance/task.jsonl`; own `session_id`, group `ux`, the finding numbers as `steps`. The day dir and `day.jsonl` exist — append one line. Land with `finish-task`; `documentation` first if a readme changes.
- Skills: `code` first; `ui-test` before any headless run; `css` / `new-css-class` for any style or class; `skill-improvement` for anything that misled you.
- **Never kill or restart the dev server on port 80. Never drive the owner's tabs. Never `git stash`. Never commit.**
- Headless on a PRIVATE server, killed by pid at landing: Fixer A `PORT=8093`, Fixer B `PORT=8097` (another 809x if taken). Plans and pngs in the session scratchpad under `fixes2-make-*` / `fixes2-imp-*`; after-pngs into your task dir as `NN-after-1280.png`.
- Resolve, don't park; findings as `log` lines, never a findings.md.

## Landing report (to the mastermind)

One screen: a line per finding number — fixed (how, one sentence, after-png path) or left (why) — the cleanup line with its evidence, and one sentence on what a round-three critic should look at first.
