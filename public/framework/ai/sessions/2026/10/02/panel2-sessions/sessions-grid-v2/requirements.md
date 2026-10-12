# Sessions grid v2 — the owner's ask

From @vscode-mastermind, "More for Sessions and Panel 2," arriving right after
the /framework/ai/2026-10-02/panel2-sessions task landed:

1. **The Sessions tab is a data grid of EVERY session:** the start time, the
   source tag, the agent or tab name, the model, the state and the cost. A
   click opens the session's own page at `/framework/ai/sessions/<session-id>/`,
   routed, so it reloads to the same view. Use a side peek in the drawer
   (master-detail, like Notion) on wide screens.
2. **No HTML `<table>`.** Use a CSS grid where each column's width is one
   token (`--col-<name>`), with a minimum width per column so no column
   collapses into tall, empty rows. Resizing a column changes the one token.
3. **Three preview levels for any class view; write them down as the house
   rule in Panel 2's readme:**
   - inline: an icon and the name;
   - card: the icon, the title, a ⋯ menu of quick actions, and most of the
     card is a link, with a corner arrow on touch screens (no hover there);
   - detail: the full page.

"Don't wait on the owner."

## A second, related note (from @task-mastermind-prompt-refine, FYI, same day)

- **The route's real shape:** `/framework/ai/sessions/<id>/` should filter
  the prompt log (`.claude/prompts/<date>.jsonl`), not copy `session.jsonl`.
  Today's landed route reads `sessions.json` + `transcripts/<id>.json`
  instead — the wrong shape.
- **Why it's still the wrong shape:** the correct data (a `refined` line
  per prompt, keyed by `{session_id, at}`) is written by a new echo
  assistant still building in `worktree/prompt-refine`, not landed yet.
- **Decision:** build the grid, route and drawer now against today's data,
  and isolate the prompt-loading call behind one named function — so
  swapping in prompt-refine's data later is a one-function change. Logged
  here so the shapes agree when it lands; not blocking this task.

## Scope

- `public/framework/ai/sessions/` — rebuild `row_view()` + the list as a CSS
  grid with `--col-*` tokens (min-width per column, resize writes one token).
  Keep `route(id)` (already a real, reload-stable route per the survey) but
  isolate the prompt-loading call behind one named function.
- Master-detail / side-peek: on wide screens, clicking a row opens the detail
  in a side drawer next to the grid (Notion-style) instead of a full nav: a
  route (same url) renders whether or not the peek is open, so reload still
  works.
- `public/framework/ext/panel2/readme.md` — add the three preview levels
  (inline / card / detail) as a named house rule, pointing at any further
  detail in `doc/`.

## Not in scope

- The prompt-refine data source swap itself (that lands when prompt-refine
  does — tracked as a follow-up, not re-done here).
- Any change to Panel2.Side's own mechanics beyond what the grid's peek needs.
