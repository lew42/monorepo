# Brief: cleanup-1 (2026-09-17)

You are a minion in the lew42 monorepo (C:\Code\lew42\monorepo). Five small loose ends
tonight's landings left outside their fences; each is one change, verified headless on
your private server (`PORT=8113 node server.js` from the repo root, background, killed by
its real Windows PID — `$!` is not one; read netstat):

1. **The CMS wall's blank card.** `/imagine/cms/` draws a broken `<img>` for the new `d1`
   child because no screenshot is registered. Read how the sibling cards register theirs
   (`public/imagine/cms/page.js` and its neighbours), shoot `/imagine/cms/d1/` at 1280 the
   same way (jpeg, the same size and place as the others), register it. Verify: zero failed
   image requests on `/imagine/cms/`.

2. **A branch row can be a link.** `public/framework/ux/Tree/` — `Tree.Row.prerender()`
   decides the tag as `!kids && href`, so a row with children can never be an `<a>`;
   `/layouts/shell/Shell.js` subclasses past it. Make a branch row an `<a>` whenever it has
   an `href` (the chevron stays the fold control; a click on the label navigates, a click on
   the chevron folds — verify both on the module page and on `/layouts/shell/`), then delete
   the Shell override if it is now dead (read it; if it does more than that, leave it and say
   so). Keyboard: Enter on a branch row still follows the link. One line in
   `ux/Tree/doc/decisions.md`.

3. **A stale doc.** `public/framework/ext/AITask/doc/file/ai.css.md` still describes the old
   `calc(var(--gap) * N)` multipliers; `ai.css` moved to the spacing ladder tonight
   (`/framework/styles/system/`: `--gap`, `--gap-70/-50/-35/-25`). Rewrite only the sentences
   that are now false.

4. **A layout-skill note.** Append ONE line to `.claude/skills/layout/improvements.md` (not
   SKILL.md): the shell-lab builder found that the skill says "walls take `grid auto-fill`"
   two lines after warning that wrapping layouts misalign at awkward counts, and the site has
   measured which is right twice (the catalog wall over 2800–3360 and the shell wall at
   1920): read its log at `ai/2026-09-17/shell-lab/task.jsonl` for the exact finding and its
   numbers and write the line with them. The mastermind judges it.

5. **A core doc note.** Append to `public/framework/core/Page/doc/css.md` (doc only, no CSS
   change): the `default` stand-down rule
   `> .page.default:not(.active-page, .active-ancestor)` is columns-shaped — it leaves a
   default ANCESTOR showing, right for a column and wrong for a two-region host that replaces
   one child with another; the two-region form is
   `:has(~ .page:is(.active-page, .active-ancestor))` (from the shell-lab log; quote its
   evidence). Three sentences, dated.

## Fence

Exactly the files named above, plus your task dir (`public/framework/ai/2026-09-17/cleanup-1/`).
Never kill or restart the dev server on port 80, never drive the owner's tabs, never
`git stash`, never `find /`; an `rg` pattern starting with `/` returns nothing here — drop
the slash. Another minion is editing `ext/AITask/*.js` and `ext/JSONL` right now: you touch
only the one doc file there (`ext/AITask/doc/file/ai.css.md`).

## Final report

Five lines, one per item, each with what changed and the number that proves it.
