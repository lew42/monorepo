# Servex: let peer masterminds message each other (fix brief)

**Seen 2026-10-12, three times:** @mastermind-ui-library, @mastermind-server-query and @mastermind-screenshot-system each reported that "Servex refused" their `send_to_agent` to another mastermind ("not parent/child"). Every brief tells masterminds to coordinate by `send_to_agent`, so coordination silently fails and they fall back to page notes.

CLAUDE.md: "No hard fences between roles: do not add rules or tool fences that stop a capable agent."

## Done when
- [ ] Find the refusal: `Servex/agents/tools.js` `send_to_agent`, the relay-2 change (`453ebb9eb`: owner/tab messages routed through the root assistant), and the relay-bypass check. Say why a peer is refused.
- [ ] Allow mastermind ↔ mastermind (and any team agent ↔ team agent) messages directly. Keep relay-2's owner-tab routing intact: only messages from the owner's tabs go through the assistant.
- [ ] Prove on a private port: two agents message each other both ways, and an owner-tab message still routes through the assistant. One Servex restart.
- [ ] Commit; merge; land. Tell the three masterminds above it's fixed (now you can).

Sonnet 5.5. Worktree; `STATE.md` here; one-sentence replies; land with `finish-task`.
