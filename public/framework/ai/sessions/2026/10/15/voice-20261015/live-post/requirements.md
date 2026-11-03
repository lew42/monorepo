# live_post: the voice app writes to /live directly

Owner ask: voice 37df13b7, logged in [../task.jsonl](../task.jsonl). Top priority, fastest turnaround.

## Build
- One new tool, `live_post`, on the tunnel MCP (`Servex/ext/remote/RemoteMCP.js`, the "lew42-remote" connector the Claude app uses). Inputs are `title` (required) and `text` (optional). It appends one card to `public/live/page.jsonl`, scoped to /live only, with no path parameter.
- **Reuse the existing page-tool writer**: whatever `page_add` runs in Servex, so the line has the same shape (`{"content":{"add":{type:"part-card",title,text,id,by:"voice-app",ts}}}`), with `ts` always set. One of everything: don't hand-roll a second JSONL writer.
- Add a test to `RemoteMCP.test.mjs`.
- Update the voice-agent directives in RemoteMCP's own MCP description: "post a short card with live_post before or while you ask the mastermind." The directives live only there.
- Say clearly whether the change needs a Servex restart to go live. **Do NOT restart Servex**: the voice tunnel runs through it, and the owner picks the time. Also say what the owner must do in the Claude app (reconnect the connector, or start a new conversation) for the tool to appear.

## Also: the record only, no code
Write `doc/mcp-unify.md` in `Servex/ext/remote/` (link it from the nearest readme). It's a proposal, not to be built. The mastermind's opinion: keep one tool registry, with each tool marked `local` or `remote`, and have the tunnel serve only the remote ones. Two separate tool sets was the mistake; one wide-open endpoint is the wrong fix, because the tunnel is internet-reachable and the internal set has spawn, kill, restart and writes. The earlier "keys to the castle" wording was about the Cloudflare token, not the tunnel's tool set (owner, 2026-10-15). List the ~70 servex tools you'd mark remote-safe as a first cut.

## Rules
- Sonnet. Work in a worktree, run the tests, then merge into michael/dev. Commit each step.
- Post a result card on /live/ through `page_add`, then message mastermind-voice-20261015 with: merged commit, restart needed or not, and the app-side step.
