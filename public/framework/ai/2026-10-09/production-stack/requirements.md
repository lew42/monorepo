# Production stack: what already exists for Cloudflare, users, auth, payments, and what can be demoed now

The owner, 2026-10-09 ~17:30 (VS Code tab 7efd07d5): production is a static site with no file writes and no Servex, Whisper or Claude SDK. Many systems write to the file system and must adapt; a hybrid (create locally, push up) works for the owner but not for other users. Remote use by the owner (via IP or a tunnel) would lack Whisper and Servex unless routed through cloud APIs or through the owner's own Claude plan. Cloudflare when possible, simple: Workers, D1 (SQLite) for user auth, Durable Objects, maybe Containers. "Gets complicated really quick; don't spend a ton of time building it now." First find the past work and what can be demoed right now.

## Do (research and inventory; build nothing beyond a tiny demo)
1. **Find the past work by script**, not by reading everything: grep the repo (task dirs `ai/2026-*`, `/imagine/platform/`, research logs, readmes, `Server/`, branches) for cloudflare, wrangler, worker, D1, durable, KV, R2, auth, login, user, payment, stripe, tunnel. Known starts: `ai/2026-09-04/mastermind-platform/`, `research-cloudflare`, `prior-cloudflare`, `research-users`, `research-security`, `ai/2026-09-06/platform-slice/`, `ai/2026-08-30/cloudflare-mcp/`, the 2026-10-08 task audit (`ai/2026-10-08/task-audit/`). Note any step that waits on the owner (a Cloudflare login / API key).
2. **One screen** at `ai/2026-10-09/production-stack/` (page + `doc/inventory.md`): what was decided, what was built (link each), what was never wired in, what can be demoed today (and demo it if it takes under 15 minutes), the owner's blockers (keys, logins) as a short list.
3. **Which of our systems break in production** (writes files, needs Servex/Whisper/SDK): a table, one line each, with the cheapest path (static-export, a Worker + D1, cloud API, or "owner only, local").
4. A recommendation for the **first slice** (one feature live on Cloudflare), not built.

## Rules
Sonnet; Haiku helpers only for big reading, each under 60k tokens, never for decisions. Commit each step. Land with finish-task and a `Note:` card linking the page. Put the owner's blockers on the card.
