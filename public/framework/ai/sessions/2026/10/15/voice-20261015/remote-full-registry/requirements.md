# lew42-remote serves the full servex tool registry

Owner decision: voice 89b525b6, logged in [../task.jsonl](../task.jsonl). **This overrides live_post.** Top priority, fastest turnaround.

> Expose the full internal servex MCP tool set through the tunnel, one registry, the same tools every local Claude session and mastermind gets. No second tool set, no duplicates to maintain. [The owner] trusts this voice session as much as any local session and accepts the unauthenticated-tunnel risk for now (git rollback if it is ever abused, auth later). Keep the voice agent / voice mastermind handoff working as a role structure; ask_mastermind stays as one tool among many.

## Do
1. **Revert live_post** with `git revert` of its merge 33e17cdc3 (or the commits inside it). Never reset. Keep `doc/mcp-unify.md`, but update it: the owner chose one registry, fully exposed; the local/remote split is shelved.
2. **Make `/mcp/remote` serve the servex registry.** Read `Servex/MCP.js`, `Servex/agents/tools.js`, `Servex/ext/remote/RemoteMCP.js`, and `Server/Tunnel.mjs` (the gateway passes only `/mcp/remote` and `/mcp/remote/<key>`). Pick the smallest change. Either RemoteMCP registers every servex tool from the same registry, with ask_mastermind added on top, or the remote route hands off to the servex MCP's HTTP transport. Never copy tool definitions. Keep the per-key identity (`/mcp/remote/<key>`) so calls are attributed to the voice app (the "from"/caller on send_to_agent, by= on page writes).
3. **Keep the tunnel URL.** The tunnel is its own process (`node Server/Tunnel.mjs`), and the gateway forwards to Servex on loopback. Confirm whether a Servex restart leaves the tunnel and its URL alone, and say so plainly.
4. Update RemoteMCP's INSTRUCTIONS, the voice-agent directives (they live only there): the app now has every tool. It should still fire ask_mastermind for anything needing judgment or repo reading, and may write /live itself with page_add path "/live/". Warn it never to call restart_servex mid-call (it would drop its own tunnel).
5. Tests: extend `RemoteMCP.test.mjs` so tools/list on the remote route returns the full set, including ask_mastermind and page_add.

## Rules
- Sonnet. Work in your own worktree, run the tests, merge into michael/dev, commit each step. **Do not restart Servex**: the voice call runs through it, and the owner picks the time.
- Report ASAP to mastermind-voice-20261015, and post a card on /live/ (page_add), with:
  - the merged commit
  - what the owner must do (Servex restart: yes or no; reconnect the connector or reinstall it; new URL: yes or no)
  - anything blocking
  - the final tool count on the remote route
