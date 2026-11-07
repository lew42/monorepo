# voice-app's children point at today's cloud voice record

Budget: $5. Load the `minion` skill first. Parent: mastermind-session-truth. The task is `children-link` in voice-app's own record (found by voice-app); close it THERE with outcome and evidence when merged.

## The bug (found by voice-app, 2026-11-06)
- The registry row for agent `voice-app` has `session_id: "voice-20261019-live-page"`, set on 2026-10-19 and never updated.
- `Agents.session_of()` (Servex/agents/Agents.js:66) reads it, and `Agents.js:92` / `:233` stamp it as `parent_session` on every agent voice-app spawns. So tonight's children hang under an October session.
- Today's cloud voice record is `public/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/`. Servex/ext/remote/RemoteMCP.js opens it and logs tool_call lines; docs: Servex/ext/remote/doc/cloud-voice-agent.md and voice-logging.md.

## The fix (small and additive; the owner: "we've messed this up before", no rewrites)
1. When RemoteMCP opens (or reuses) today's cloud voice session, it points voice-app's live and registry `session_id` at that session's id. Nothing else in the registry row changes.
2. Say in the doc (voice-logging.md or cloud-voice-agent.md, plus one line in the remote readme if there is one) how a SECOND cloud voice session on the same day gets its own id: read what the code does today; if two calls on one day share one record, write that down as the current behaviour and propose (do not build) the change in one paragraph with its alternative.
3. A test beside RemoteMCP's existing tests: open today's session, then `session_of("voice-app")` returns its id; a child spawned after gets that `parent_session`.
4. Do NOT re-parent existing children or edit old records. List tonight's misfiled children in a `log` line (agent id, current parent_session) so the owner can decide; a move is a separate, proposed step.

## How
- Worktree: `node Server/worktree-up.mjs children-link`; commit by exact path after each step (never `commit -a`: the worktree's dev server dirties the generated files lists).
- Servex changes need a restart: do not restart. Never git stash, never kill or restart servers, never drive the owner's tabs, never write the owner's name.
- Then `node Server/review.mjs <this dir> <worktree>` and answer each finding with `node .claude/hooks/append.mjs` on this folder's session record, as {"review":{"answer":{"n":N,"reply":"fixed: …"}}}. Do not merge; reply one line: ready + branch + commit.
