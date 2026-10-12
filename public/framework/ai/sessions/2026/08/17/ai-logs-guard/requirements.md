# ai-logs-guard

Dispatched by the mastermind run `mastermind-layout`, as a minion task, verbatim:

> The last dev-server route that answers the LAN, and its fence is not a fence.
> `GET /ai-logs/:id` (`Server/plugins/AILogs.js`) answers the LAN and streams
> `~/.claude/projects/…` transcripts, fenced only by a UUID-shaped id. The
> mastermind checked: 33 `session_id` values are written in plain text into
> `public/framework/ai/*/*/task.jsonl` — by the repo's own `new-task`
> convention — and those files are served as static assets to the same LAN.
> Verify the chain, apply the guard reusing `MCP.js`'s exported `loopback()`,
> prove the dashboard still works and a LAN caller is refused, survey for
> anything else, record it in `Server/README.md`.

**This is a retry.** A previous attempt died on an API connection error and
made no changes — verified clean before starting (`git status Server/` showed
only the unrelated socket fix; `AILogs.js` was untouched; no task dir existed).

## Fence

Write only: files under `Server/`, and this task dir. Do not touch `public/`
outside this dir. Do not remove `session_id` from task logs. Nothing under
`public/framework/ext/Panel/`.

## Proposal / steps

1. Verify the chain: route exists, reads outside the repo, an unguarded
   `task.jsonl` carries a `session_id`, the id is all the route requires.
2. Apply the `loopback()` guard to `Server/plugins/AILogs.js`, same shape as
   `SocketServer.js`'s fix.
3. Syntax-check the edit.
4. Spin up a throwaway `PORT=8081` instance (never touch the shared `:80`).
5. Prove a loopback caller still gets the transcript (dashboard replay path).
6. Prove a simulated non-loopback caller is refused.
7. Survey the rest of `Server/plugins/` for any other route reading outside
   `public/` and answering the network.
8. Record the finding and the fix in `Server/README.md`.
9. Kill the throwaway instance, land the task.
