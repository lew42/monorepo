# Step 4: the kit as a tree, from H1 up

Budget: $6. Load the `minion` skill first, then `make`, `page`, `css` and `layout`. Card (the owner's words): `public/framework/ai/sessions/2026/11/09/cards/ui-kit-one-small-set-of-parts-every-page/`. Plan: [/live/plan/ui-kit/](/live/plan/ui-kit/) (`public/live/plan/ui-kit/page.jsonl`), card 4. Step 1 (landed, ccac21926) is your model: `public/framework/ui/card/page.js` variants, `public/framework/library/Library.js`.

Work in a worktree (`take_worktree`, use its `path` and `url`). Commit by exact path after each working piece. Never kill or restart the dev server, never drive the owner's tabs, never `git stash` (diff, don't stash). Log as you go on your task's `session.jsonl` with the `mcp__servex__log` tool (hand appends to .jsonl are blocked).

The owner's words: "starting from H1s, H2s, Ps, LIs, then cards, pages, menus… a tree of templates… a file tree is really an item tree." The library's `ui` collection should read as that tree: elements first, then the parts built from them.

## A. An elements page: `ui/text`

New page `public/framework/ui/text/` (`page.js` + `readme.md`), the same shape as `ui/card/page.js`: one specimen on top, variants as `demo.page(name, fn, {note})` children: `h1`, `h2`, `h3`, `h4`, `p`, `li` (a ul and an ol), `link`, and `flow` (h2, p, a card, h2, p, a list, in one column: the rhythm between them). Use the framework's own elements and classes; **no page CSS** (no `<style>`, no `.css`, no `style()`). Run the `make` skill first: if a page for headings already exists (check `public/framework/styles/` and `public/framework/ui/words/`), extend it and say why in your log instead.

## B. The tree order in the library

`public/framework/ui/page.js` `BANDS` (line 10) groups the ui collection today as Surfaces · Data · Forms · Marks. Regroup it as the tree, elements first:

```
Elements   text icon badge kbd avatar
Parts      row item tree controls field tags
Cards      card panel stats accordion decision alert
Menus      menu toolbar crumbs pagination tooltip dialog
Data       table timeline progress datagrid
```

Adjust the membership if a component does not exist or fits better elsewhere (log it). Read the comments around line 25–45 first: the browse() wall's grid math expects certain band sizes, and `background`, `section`, `scale`, `item` are appended outside BANDS on purpose. Make the wall and `/framework/library/?at=ui` still work; the Library reads `BANDS` at `Library.js:35`. Update `ui/readme.md`'s index to the new order, in the same commit.

## C. Heading spacing after a card

Found on /live/session/ by another mastermind: at 400 px wide, an `h2` that follows a `.card` sits about 7 px under it, while after a `p` it gets its normal top space. Fix it once in `public/framework/framework.css` (in the layer the flow rules already live in; read the file's flow / `> * + *` rules first), so the `flow` variant from A shows the same space above an h2 whether a card or a p is before it. Measure the gap before and after (getBoundingClientRect in a headless run) and log both numbers.

## D. The library at phone width

`node Server/LayoutCheck.mjs <your worktree url> /framework/library/?at=ui/card --widths 400 --json` reports 27 BROKEN at 400 on compliance/dev (keys in `Server/layout-baseline.jsonl`). Two known causes:
- "Rendered too small to read" on the rail's scaled-down previews: that is by design (a preview is a thumbnail). Teach `Server/LayoutCheck.mjs` to skip findings inside a scaled preview (find how the rail scales them in `public/framework/library/Rail.js`), and add a case to its test if one exists (`Server/LayoutCheck.test.mjs`).
- Tap targets under 24 px (the crumb links on demo pages, the inbox dots).

Fix what is real, in the component's own file. The deliverable is two numbers: BROKEN at 400 before and after. Under 10 after is the target; if it is not, log what is left and why.

## Proof, docs, landing

- Shots (headless, `Server/Browser.mjs` as `Server/smoke.mjs:34` does) into the MAIN tree's `step-4/shots/`: `?at=ui/text/flow` at 400 and 1200, `/framework/library/?at=ui&view=wall` at 1920. Read them yourself.
- Update `ui/readme.md`, `ui/text/readme.md` and `library/readme.md` if the order changes what it says.
- `node Server/smoke.mjs <worktree path> /framework/ui/text/ /framework/library/` must show no FAIL. If a FAIL comes from a page you did not touch, check it on compliance/dev (`--base http://monorepo.localhost`) and log it as pre-existing.
- Any gap in the kit you hit: a `ui-kit gap: ...` log line.
- Stop with one reply: branch, commits, the gap numbers from C, the BROKEN numbers from D, the shot paths. Do not merge; the mastermind reviews and merges.
