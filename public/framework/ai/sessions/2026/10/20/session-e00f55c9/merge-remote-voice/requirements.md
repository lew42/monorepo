# Merge remote site and voice read-aloud

Goal: the owner uses both from the phone (the owner: "go ahead and merge them").

1. **Merge,** in this order:
   1. `node Server/merge.mjs C:/Code/lew42/worktrees/remote-site-tunnel`;
   2. `node Server/merge.mjs C:/Code/lew42/worktrees/voice-recite`.

   - If a test fails only because it ran against the live site, set `SITE_URL=http://<worktree>.localhost` on the merge command; `TestRunner` passes it to the tests.
   - Never use `--skip-*`.
   - Each merge pushes to GitHub by itself.
2. **The gateway and voice server must be supervised, never strays:**
   - **Find out** who runs the site gateway on port 8192 (Tunnel.mjs or TunnelKeeper) and the recite-server on 8177 after the merge.
   - **Each runs exactly once,** restarted by Servex if it dies, with no copy left over after a restart. If that's not the case, fix it in a worktree and merge it.
   - **The hand-started recite-server on 8177:** stop it only when the merged Servex is about to take it over.
3. **The key cookie renews itself:** each visit with a valid cookie resets its 30 days, so the owner signs in once. That's a small change in the gateway; do it in a worktree, then merge it.
4. **Restarts:** restart the monorepo dev server with the `restart_server` tool. **Don't restart Servex yourself:** it would end you. Say "Servex restart needed" in your final message, and the tab will do it.
5. **Check** `https://monorepo.lew42.com/` loads with the key, from a headless browser, and that the read-aloud bar appears.

**Fences:**
- Delete no record. No `python`. Commit by path.
- **Budget:** about $15.
