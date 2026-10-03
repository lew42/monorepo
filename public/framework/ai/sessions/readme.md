# Sessions — every Claude session with an id, newest activity first

The owner's own words: "A time-based list, like the inbox view sorts itself, a preview card for
each session... for this VS Code tab I should be able to see that with a tag that says VS Code
on it." This tab is that list, covering all three kinds of session on this machine: a **VS Code**
tab (you, typing), a **Servex** agent (a mastermind or minion, spawned), or a standalone **CLI**
run. Click a card to see that session's own prompts, in order, at its own url — prompts live
inside their session, never a separate log page.

## Use

Visit [`/framework/ai/sessions/`](/framework/ai/sessions/). Each row shows: a coloured source tag
(Servex / VS Code / CLI), the agent id or a VS Code tab's folder name, its model, its state, the
last thing said into it, how long ago, and its cost when known.

## Where the data comes from

- **Servex rows are live.** The page polls Servex's own `GET /api/agents` every 20 seconds
  (paused while the tab is hidden — the same shape [`ai2/needs.js`](/framework/ai2/)'s
  `watch_needs()` already uses), so a card and a mastermind's state here is always current.
- **VS Code and CLI rows come from a snapshot**, `sessions.json`, written by
  [`sessions.mjs`](/framework/ai/2026-10-02/panel2-sessions/sessions.mjs) — a plain node script,
  not a live route. Re-run it to refresh those rows:
  ```
  node public/framework/ai/2026-10-02/panel2-sessions/sessions.mjs
  ```
  Why a script instead of Servex answering live: this task asked `mastermind-servex-9` for a real
  `GET /api/sessions` route (Servex/agents inbox, 2026-10-02) and none had landed when this was
  built; this task's own fence is `public/framework/ai/` only, so it cannot add a route under
  `Server/` itself. The full reasoning, and what a real route would fix, is in
  [`doc/decisions.md`](./doc/decisions.md).
- **`sessions.json` and every file under `transcripts/` are gitignored**, the same way
  `ai/usage.json` already is — machine state written by a script, not a record to keep, and in
  this case also the owner's own dictated prompt text, which has no business in `public/`, the
  folder this site deploys statically. Running `sessions.mjs` regenerates both locally; neither is
  ever committed.

## Watch out

- **"Session" means two different things on this site.** This tab is a *Claude Code* session
  (a VS Code tab, a Servex agent, a CLI run). [`ext/Session`](/framework/ext/Session/) is a
  *voice* session (one ✦ press, a dictated conversation) — unrelated, already named first. Don't
  confuse the two; this tab never touches `ext/Session`'s own `GET /api/sessions` route.
- A VS Code tab writes no title of its own into its transcript file, so this tab shows the
  session's working folder name instead (`tab_title`) — the real tab title isn't available from
  the data this reads.
- A Servex-sourced session's own page has no transcript yet (`GET /api/agents` carries no prompt
  text) — its detail page says so, with a link to why.

## More

- [`doc/decisions.md`](./doc/decisions.md) — the full data-source decision, the `css-scopes.txt`
  reservation note, and the VS-Code-vs-CLI heuristic, checked against a real session
- [`ext/panel2`](/framework/ext/panel2/) — the header/main chrome this tab is built from
- Files: `page.js` (the tab and its detail route), `sessions.css` (the row), `settings.jsonl`
  (`{"tab":true}`, how this folder joined the strip)
