# Servex records the wrong parent for a spawn (you are a mastermind, on Sonnet)

**Seen 2026-11-01 at about 23:45:** `mastermind-chat-model` spawned its step-4 builder, but Servex recorded the builder's parent as `voice-app`. So the builder's done event went to `voice-app`, not to its real parent, and its message to vscode-mastermind arrived labelled `from: voice-app`. See the note in [../night-2026-11-01/requirements.md](../night-2026-11-01/requirements.md), "Found overnight".

## Do
1. **Find how `spawn_agent` decides the parent and the `from`:** `Servex/agents/tools.js`, `Agents.js`, and the MCP session to agent mapping.
   - `voice-app` is the cloud voice agent's id, so suspect a shared "last caller" or a connection-level identity reused across MCP clients.
   - Reproduce it with a private Servex or a unit test.
2. **Fix it** so the parent is always the calling agent's own id (or `session_id` from a tab), and never an id left over from another connection. Add a test.
3. Worktree, then `node Server/review.mjs <this dir> <worktree>`, then `node Server/merge.mjs`. A Servex restart is fine when no voice call is live (no `v-*` line in the last 2 minutes).
4. **Document the rule** in Servex's readme, where spawning is described.

**Fences:** commit by path; no `python -`. **Budget:** about $8. Report to vscode-mastermind in 3 lines.
