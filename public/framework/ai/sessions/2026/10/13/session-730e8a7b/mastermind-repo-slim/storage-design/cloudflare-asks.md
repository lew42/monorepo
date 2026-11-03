# Cloudflare work inventory

- **Prior Cloudflare audit** — 2026-09-04 — Scouted prior work across three projects; found no Worker ever shipped, all wrangler configs assets-only, no main key anywhere; compiled reuse/do-not-copy verdicts per project — status: done — link: `public/framework/ai/sessions/2026/09/04/prior-cloudflare/`

- **Research Cloudflare cost and shape** — 2026-09-04 — Answered whether one Durable Object per topic is right; cost at 100/10k/1M users ($0/$20/$150-200/mo); 43 research entries, all contested items resolved — status: done — link: `public/framework/ai/sessions/2026/09/04/research-cloudflare/`

- **Cloudflare MCP availability** — 2026-08-30 — Confirmed official Cloudflare MCP exists (mcp.cloudflare.com + bindings server); documented on /imagine/cms/services/ page; OAuth auth, can create D1/KV/R2 autonomously — status: done — link: `public/framework/ai/sessions/2026/08/30/cloudflare-mcp/`

- **Decision: Durable Object key shape** — 2026-09-04 — Ruled on where state lives: one DO per URL (not per topic); settled architecture with D1 for identity, DO for live surfaces, R2 for media — status: done — link: `public/framework/ai/sessions/2026/09/04/decision-data/`

- **Local multi-user dev harness** — 2026-09-04 — Built wrangler.dev.jsonc, worker/ code (schema, seed, session, auth, room, index, dev entry), dev.mjs, room-test with Playwright screenshots; verified three assumptions (wrangler/node coexist, dev socket, cookies cross-port) — status: done — link: `public/framework/ai/sessions/2026/09/04/local-dev-harness/`

- **SQLite working proof** — 2026-09-17 — Scouted D1 readiness; proved local wrangler dev boots and serves real routes; identified owner blocker (Cloudflare login for `wrangler d1 list`); planned six-step pages-in-D1 slice — status: done — link: `public/framework/ai/sessions/2026/09/17/sqlite-scout/`

- **Pages stored in D1** — 2026-09-17 — Built pages table in D1, GET/PUT /api/pages route, public/imagine/cms/d1/ page with three children from database rows; proven end-to-end locally — status: done — link: `public/framework/ai/sessions/2026/09/17/pages-in-d1/`

- **Production stack inventory** — 2026-10-09 — Current state: production is static site on Cloudflare (no Worker deployed); login + database Worker designed locally but never shipped; first recommended slice is GitHub sign-in plus one like on preview URL — status: partly — link: `public/framework/ai/sessions/2026/10/09/session-54d56780/production-stack/`

- **Deploy file count cap** — 2026-10-13 — Phase 1 task: track and reduce deployed files (19,619 of 20,000 limit on Cloudflare Workers Free); .assetsignore rules pending, 2,725 screenshots to untrack — status: not done — link: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/deploy-cap/`

## Facts found

- **Production config:** `wrangler.jsonc` (line 6-7) — assets directory is `./public`, `not_found_handling: "single-page-application"`, no `main` key, no bindings
- **Dev config:** `wrangler.dev.jsonc` (lines 8, 17-22) — `main: "worker/dev.js"`, D1 binding `DB` to `local-dev`, Durable Object binding `ROOM` to class `Room`
- **Worker code:** `worker/` directory with `index.js` (routes), `dev.js` (entry), `schema.sql`, `seed.sql`, `session.js`, `auth/can.js`, `room.js` (DO)
- **Durable Objects design:** `public/imagine/stream/doc/durable-objects.md` — hibernation API, WebSocket batching, per-page instance, SQLite storage per DO, $0 at 100 users on free tier
- **Cost model:** Free: 100k requests/day, 13k GB-s/day, 5GB storage; 1M+ users: ~$150-200/month with DO+D1+R2
- **Deploy limit:** Cloudflare Workers Free tier file limit is 20,000; currently deployed 19,619 files (97% capacity)
- **Owner blocking item:** `npx wrangler login` and `wrangler d1 create` needed to deploy to production (from sqlite-scout task)
