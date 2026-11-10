# Step 1: five card styles in the library, and arrow keys

Budget: $4. Load the `minion` skill first, then `page` and `css`. Card (the owner's words): `public/framework/ai/sessions/2026/11/09/cards/ui-kit-one-small-set-of-parts-every-page/`. Plan: [/live/plan/ui-kit/](/live/plan/ui-kit/) (`public/live/plan/ui-kit/page.jsonl`), cards 1 and 2.

Work in a worktree (`take_worktree`, use its `path` and `url`). Commit by exact path after each working piece. Never kill or restart the dev server, never drive the owner's tabs, never `git stash`.

## A. Five card styles as variants of `ui/card`

File: `public/framework/ui/card/page.js`. It already declares variants as `children: [demo.page("linked", linked, {...}), ...]` (around line 88). Add five, compact to large, each a `demo.page(name, fn, {note})` whose fn composes `.card`, `ui/row`, `ui/item`, `ui/tree` classes:

- `titled`: one card with an H3 title over body text (what /live/ cards are: title .9rem over .85rem body today, see `public/live/LivePage.css` `.live-card-*`).
- `stack`: three cards stacked with zero gap (the `.flush-stack` pattern already exists; grep `flush-stack` in `public/framework/styles/`).
- `tree-rows`: icon-and-name rows like a file tree (use `ui/item` and `ui/tree`; read their readmes).
- `compact`: a compact list in one card (the existing `list` variant may already be this: reuse or rename it, don't duplicate).
- `large`: today's large card (the top `card` specimen; reuse it).

Starting point: the unmerged draft `git show draft/card-styles:public/live/demos/cards/page.js` (and `cards.css`). Take its markup ideas; do not copy its CSS file.

**Rule: no page CSS.** The variants add no `<style>`, no `.css` file and no inline `style()` beyond what the existing variants already do. If a look truly needs CSS, add it once to the component's own css (`ui/row/row.js`, `ui/item/item.js`, or `public/framework/framework.css`'s card rule) in its layer, and say so in the variant's `note`.

Check: `/framework/library/?at=ui/card` shows the five in the right rail; each opens full size in the middle. Shoot 400 and 1200 of `?at=ui/card/tree-rows` headless (`mcp__site__shot`) and read the shots yourself.

## B. Arrow keys in the library

File: `public/framework/library/Library.js` (and `Rail.js` if the step belongs there). No key handling exists today (`grep keydown public/framework/library/` is empty).

- Left / Right: previous / next item in the siblings rail (left column).
- Up / Down: previous / next variant in the right rail.
- Each step updates the url (`?at=...`) the same way a click does, so back and reload work.
- Ignore keys while focus is in an input, textarea or contenteditable.

Prove it with a headless Playwright run (`ui-test` skill): load `?at=ui/card`, press ArrowDown twice, read `location.search`; write the two urls into your log.

## Docs, test, landing

- Update `public/framework/library/readme.md` (one line on the keys) and `public/framework/ui/card/readme.md` (the five variants), in the same commit.
- `node Server/smoke.mjs <worktree path>` must show no FAIL.
- Log findings as `log` lines in your task log; any gap in the kit you hit as `ui-kit gap: ...`.
- Stop when done with one reply: branch, commits, the two urls from the key test, the shot paths. Do not merge; the mastermind reviews and merges.
