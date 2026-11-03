verdict: fix
1. [fix] `Servex/ext/remote/doc/tunnel.md:48` says "see *Measured through the tunnel* below", but there is no such section (grep finds only line 48 itself). Either measure the load through the tunnel and add the numbers, or cut the pointer and say that measurement is still to do.
2. [fix] The design change that replaced asks 1 and 2 ("Plan A, 13:25 change from vscode-mastermind", `session.jsonl:9`) isn't recorded anywhere a fresh agent can read it: it's not in `inbox.jsonl` or `requirements.md`, and it has no link to its source. Add the instruction, or a link to it, to the task folder so the reason it's no longer the owner's brief can be traced.
3. [fix] The `B` follow-up (an import map to versioned `immutable` URLs, `tunnel.md:48`) and "restart the gateway (found down, 502)" exist only as "Next:" in a log line (`session.jsonl:9`). File them as tasks on the session (law 10, "file each ask") so they survive if this agent stops before it merges.
4. [note] The test now proves the clear really evicts a stuck copy, but it uses `/stale.png` as a stand-in (`Server/SiteGateway.cache.test.mjs:20`). A stuck `.js` can't be seeded through the gateway any more, since it sends `no-store`. That's a fair proxy for ask 3, but the test's header comment should say the png stands in for the phone's stuck `Recite.js`. Step 1's label still says "seed", even though nothing is cached at that step.
5. [note] `no-store` on HTML keeps every page out of Chrome's back/forward cache, and every phone load downloads the whole module tree again (873 requests, `tunnel.md:48`). That's acceptable for a dev-tunnel site, but it's the cost to weigh when deciding on B.
6. [note] `CACHE_V = "2"` (`Server/SiteGateway.mjs:40`) is still bumped by hand, the failure the brief opened with. The new comment says when to bump it, which is enough now that code goes out `no-store`.

## Requirements
- 1 "Make CACHE_V the deploy version automatically" — no — replaced on purpose by `no-store` plus a hand-bumped `CACHE_V = "2"`. The reason is in `tunnel.md:46`, and the built version is kept in `70770dd3f`.
- 2 "A self-heal for pages loaded from cache … log 'stale code healed'" — no — not built on purpose ("with no-store there is nothing to heal", `tunnel.md:46`). So the phone's log won't show a trace line.
- 3 "Test headless … cover both the cookie path and the self-heal path" — partly — I ran `node Server/SiteGateway.cache.test.mjs` in the worktree and it printed ALL PASS (8 checks). The cookie path is proven by evicting a stuck png (3b). The no-store path is proven by step 2. There is no self-heal path to test.
- 4 "Document it in tunnel.md (the cache section); localhost untouched" — yes, apart from the broken pointer in finding 1 — `tunnel.md:44-48`. The gateway is the only code changed.
- Fences: worktree branch `worktree/cache-version` (`1758ecbd3`), not merged yet — yes.
- New class? — n/a

## Words
- The doc paragraphs are plain and full sentences — yes — `tunnel.md:44`
- No dangling references — no — finding 1
- The test step names say what they prove — mostly — step 1's "seed" is stale (finding 4)
