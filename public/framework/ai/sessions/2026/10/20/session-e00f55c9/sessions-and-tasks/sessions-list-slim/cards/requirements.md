# Sessions list: short session cards (step 3, pulled forward)

Budget: $6. Load the `minion` skill first, then `code`, `css`. Sonnet, medium effort.

The owner (2026-10-25, relayed, impatient): "land the sticky header ASAP: full width, ONE row of buttons, minimal filters, then the list of session cards. Cards stay short: title, cost (own · with children, from the deputy's one function), child sessions (direct and all descendants), state." Earlier passes: [../requirements.md](../requirements.md).

## What to build

On `/framework/ai/sessions/` (rail/card view and the default list a phone sees), each session card shows exactly four things:

1. **Title**: the session's name, one line on a phone, ellipsis; links to the session page.
2. **Cost**: `AICost.cost_line(...)` (`public/framework/ai/AITask/AICost.js` ~line 180), the one function, e.g. "$47 own · $120 with children". No other dollar figure on the card.
3. **Child sessions**: "3 child sessions · 11 in all" (direct children, then all descendants), computed from the parent links the page already has (`session_index` / `links.children`); one click opens the session page. Omit the line when there are none.
4. **State**: the existing state dot/word (running, idle, done), one small mark.

Everything else on the card today (role chips, model, folder list, file counts, `$$$` badges, flags, routine tags) leaves the card: it stays on the session page and in the Table view. Only root sessions get a card; a child appears only through its parent's count (if the list has no "root only" logic yet, filter rows whose parent is in the list).

Code: the card is `AISessionView` with `card: true` (made in `AISessionsPage.make_grid`, ~line 180). Change the card branch only; the Table view and the session page header keep their rows. CSS in `public/framework/ai/sessions/sessions.css`, existing `sessions-` prefix.

## Where

The same worktree as the header, `C:/Code/lew42/worktrees/sessions-header` (branch `worktree/sessions-header`), after the header is merged; merge `michael/dev` in first. Never kill or restart the dev server, never drive the owner's tabs, never `git stash`. Commit at every working step.

## Done means

- `before-390.png` (from the header landing, current main) and `after-390.png`, `after-1920.png` headless from the worktree, saved here. Log how many cards fit on the first 390 screen before and after (two numbers).
- Two numbers that must agree: cards drawn = root sessions in range (a separate count in your script).
- `node --check` edited files; `node Server/smoke.mjs` no FAIL; one sentence in `public/framework/ai/sessions/readme.md`.
- Last `log` line in `session.jsonl` here: branch, numbers, shots. Do not merge.

Cut first: the "in all" descendant count (keep direct).
