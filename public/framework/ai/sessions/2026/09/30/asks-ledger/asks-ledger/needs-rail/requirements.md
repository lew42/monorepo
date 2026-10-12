# Minion: Needs you looks like the Inbox

Load the `minion` skill first, then `code`, `page`, `layout` and `css`. Parent: task-mastermind-asks-ledger. Parent brief (read it whole): `public/framework/ai/sessions/2026/09/30/asks-ledger/asks-ledger/requirements.md`, deliverable 3(a). What the last minion built: `public/framework/ai/sessions/2026/09/30/asks-ledger/asks-ledger/view/task.jsonl` and `public/framework/ai2/doc/needs-you.md`.

The owner (2026-09-30): **"Needs you should look like the Inbox."**

Today, Needs you (`/framework/ai2/`) is one long column. Every row has a big answer box and an Answer button under it. At 1920 it leaves 60% of the screen empty, and about 6 items fit on the first screen. The Inbox (`/framework/ai2/inbox/`) is a narrow **rail** of short rows on the left (icon, title, time, one quiet line), and the selected card fills the right. Open both headless at 1920 and compare before you start.

**Work ONLY in the worktree `C:\Code\lew42\worktrees\asks-ledger`** (server http://localhost:54060/). Commit after each finished piece, by exact path. Never touch the main tree. Never drive an owner browser tab; every look is headless (`mcp__site__shot` or `node Server/layout-check.mjs`).

## Deliverables

1. **Keep v1.** The current list stays reachable at `/framework/ai2/?v=1`. Following the rule "never destroy a viable version": make the list a class (or keep its function), and make the new rail a variant beside it. Put one small "list view" link in the new view that goes to `?v=1`.
2. **v2 is the default: the rail and a detail pane.** The left rail uses the Inbox rail's own classes and row function, where they fit (`row()` in `faces.js`, the rail markup in `page.js`, and `ai2.css`), so it has the same width, row height, padding and icon size as the Inbox. Each row shows: the kind icon, the **importance badge** (`.ai2-score`, already built), a short title, the age, and one quiet line (the kind, and for a stalled ask, its owner and "silent 2 h"). The rail is ranked by `importance()`, highest first. There are no answer boxes in the rail.
3. **The detail pane, routed.** Clicking a row opens the item on the right. The URL gets `?need=<card>/<ask>`, or `?need=ask:<ask id>` for a stalled ask, so a reload or the Back button lands on the same item. With nothing selected, the first row opens. The pane shows the full question, and its control: the option buttons for a decision (the existing `decision_control`), or the Answer box for a question (`reply_control`). It also links to the card. For a stalled ask it shows: the owner, why it stalled, how long it has been silent, a link to the card and a link to the words, and a link to `/framework/ai/asks/`.
4. **`from_live`.** `importance()` gives 70+ to a question whose asking agent is live (`item.from_live`), but nothing sets that field today. Set it in `needs.js` from Servex's agent list (use `servex_fetch(servex_base() + "/agents")` or the route `list_agents` reads; check it exists first). An agent that is `working`, `idle` or `dormant` counts as live. If Servex is down, leave it false.
5. **Screenshots.** Take `/framework/ai2/`, `/framework/ai2/?v=1` and `/framework/ai2/inbox/` at 400, 1200, 1920 and 3440 (`MSYS_NO_PATHCONV=1 node Server/layout-check.mjs <urls> --widths 400,1200,1920,3440`). At 400 the rail goes full width and the pane goes below it, or opens on its own, the same way the Inbox does. Read each shot top to bottom in horizontal bands, and write one line per band in your task.jsonl. The pages must load with zero console errors from your code.

The worktree's `public/framework/ai/asks.jsonl` already has one stalled test line (the `memory-dormant…` ask), so a stalled row shows. Leave that file as it is.

Fence: `public/framework/ai2/needs.js`, `faces.js` (only if a shared row needs a small option), `page.js` (only the Needs-you tab's mount), `ai2.css` (new rules prefixed `ai2-need`), and `doc/needs-you.md` (update it to match). Every node process you start sets `windowsHide: true`, and you kill it before you stop. Budget: about $6. End with a one-screen outcome that gives the 1920 shot paths and says what is left.


---

## COURSE CORRECTION (2026-09-30 ~14:50, from mastermind-servex-9, relaying the owner)

The owner's newer words (`public/framework/ai/sessions/2026/09/30/design-code/design-code/owner-words.md`, first paragraph): "the inbox and the needs you, that to me, that sounds like the same thing … I kind of like the inbox better. So let's maybe just forget the needs you page for now. And let's focus on the inbox."

**Everything above this line is cancelled.** Do not redraw Needs you. Instead:

1. `git revert --no-edit 415389de` (your rail commit). Never reset or rewrite history. Needs you goes back to exactly what it was.
2. **A stalled ask becomes an Inbox row.** In `inbox.js`, where the Inbox's list is built (`items()`), add one row per ask whose folded status is `stalled`. Read `/framework/ai/asks.jsonl` with `fold_asks` from `/framework/ai/asks/fold.js`. Give the row an id `ask:<ask id>`, the kind `stalled`, the ask's title, `at` = when it stalled, and its owner. Its link goes to its card (`/framework/ai2/<card>/`, which opens in the Inbox's side pane like every card) when it has one, and otherwise to `/framework/ai/asks/?status=stalled`. It draws with the same `row()` in `faces.js`, with one quiet line: "Stalled · <owner> · silent 2 h".
3. **The importance score decides where it goes.** Rows with a score of 60 or more (stalled asks, blockers, questions a live agent is waiting on) sit at the top, highest score first. Everything else stays newest first, as it is now. Use `importance()` from `needs-rule.js`. `score_for` in needs.js already gives a card row its score.
4. **Unread is bold, read is plain.** A stalled-ask row is bold until you open it once. Remember that it was opened with the Inbox's existing read state, if it has one. If it has none, use `localStorage`, with every read and write wrapped in try/catch.
5. **Auto-resolve, never delete.** The row leaves the Inbox by itself when the ask's status is no longer `stalled` (landed, dropped, building). The ledger keeps every line.
6. Screenshots at 400, 1200, 1920 and 3440 of `/framework/ai2/inbox/` and `/framework/ai2/` (Needs you must look unchanged). Write one line per band in your task.jsonl. There must be zero console errors.

New fence: `public/framework/ai2/inbox.js` (the row source), `faces.js` (only a small option on `row()`), `ai2.css` (new rules prefixed `ai2-row-` or `ai2-ask-`), and the `doc/` file that describes the Inbox (update it). `needs.js` and `page.js` only for the revert.
