# Production stack: inventory (2026-10-09)

Built by grepping the repo (task dirs, `/imagine/platform/`, `worker/`, `wrangler*.jsonc`, the remote-access task). Nothing here was run against Cloudflare: wrangler is not installed in `node_modules` and no login was found.

## What is live today
- The static site. Root `wrangler.jsonc` is assets-only (`./public`, no `main`); Cloudflare builds from git, so `main` is at monorepo.lew42.workers.dev and each branch gets a preview URL (root `readme.md`).

## What was decided (all paper, in `/imagine/platform/`)
- [Identity](/imagine/platform/decisions/identity.md): stateless HMAC cookie, GitHub + Google OAuth with state and PKCE, a `users` row in D1, a ban is one KV key, one `can()` function, no vendor, no dependency.
- [Data](/imagine/platform/decisions/data.md): D1 for rows, one Durable Object per room.
- [Local dev](/imagine/platform/decisions/local-dev.md), [slice](/imagine/platform/decisions/slice.md), [topic model](/imagine/platform/decisions/topic-model.md); nine research verdicts incl. [users](/imagine/platform/research/users/verdict/) and [security](/imagine/platform/research/security/verdict/); [prior Cloudflare work](/imagine/platform/prior/).
- [Auth design record](/notes/auth/): "the site is static, the API is not; every page must render with the API returning 500".
- [Cloudflare services mock + MCP/wrangler steps](/imagine/cms/services/) (2026-08-30) and [D1 notes](/imagine/cms/d1/).
- [Remote access](/framework/ai/sessions/2026/10/01/remote-access/requirements.md): Cloudflare Tunnel + Access (lew42.com DNS is already on Cloudflare) to reach the PC dev server and Servex from outside.

## What was built (runs locally only)
- `worker/` (about 520 lines): `index.js` router, `session.js`, `can.js`, `me.js`, `likes.js`, `pages.js`, `room.js` (Durable Object), `schema.sql`, `seed.sql`, `dev.js` (dev login, absent from the production entry).
- `wrangler.dev.jsonc` (D1 `DB`, DO `ROOM`, `DEV_LOGIN`) and `dev.mjs`. Run recipe: [platform-slice/run.md](/framework/ai/sessions/2026/09/06/platform-slice/run.md): a like that is a row in real SQLite, in 14 seconds, offline.
- [Topic demo](/imagine/platform/topic/), `like.js` beside it.

## Never wired in
- No Worker has ever been deployed (`wrangler.jsonc` has no `main`, no D1 id, no KV).
- OAuth apps (GitHub/Google), `SESSION_SECRET`, KV ban namespace: none exist. `index.js` has no OAuth callback route, only the dev login.
- Payments: nothing built or decided (Stripe appears only in the websites corpus).
- The tunnel from remote-access: decided, not confirmed installed.

## Owner blockers (all need you)
1. `npx wrangler login` on the PC (an agent should not hold an account-wide token), then `npx wrangler d1 create`.
2. A GitHub OAuth app (client id and secret) for the first provider; Google later.
3. `npx wrangler secret put SESSION_SECRET`.
4. For remote use: install `cloudflared` and set up Cloudflare Access (Zero Trust, free).
5. For payments, later: a Stripe account. Not needed for the first slice.

## Demo today
The slice demo needs one `npx wrangler` download, so I did not run it (the 15-minute bar assumed it was installed). The recipe above is the demo. Live with no setup: the static site at workers.dev.

## Which systems break in production (static host, no file writes, no Servex/Whisper/SDK)

| System | Breaks because | Cheapest path |
|---|---|---|
| Pages, docs, readmes, demos | nothing, it is static | works as is |
| JSONL streams and `live()` tail (task board, logs) | appends to files, needs `Server/` | static-export a snapshot; live only locally |
| Servex, agents, sessions, MCP | spawns Claude processes, owns port 80 | owner only, local; reach it by Tunnel + Access |
| Dictate / Whisper | local whisper-server | owner only, local; a cloud transcription API later |
| Refine / Echo / Ask | headless claude via Servex or SDK | owner only, local |
| Saver, Make/CMS, page editors (`rpc:` file writes) | write repo files | owner only: author locally, commit, push (the hybrid) |
| ErrorLog, health, board writes | file appends | owner only, local; snapshot to static |
| Likes, comments, profiles, rooms | need a database | Worker + D1 (+ Durable Object for live rooms) |
| Login | needs server logic | Worker + D1, per identity.md |
| Payments | no code yet | Stripe Checkout link first, webhook Worker later |
| Cost/usage dashboards | read local usage files | static-export a snapshot |

## Recommended first slice (not built)
**Sign in with GitHub + one like, live on Cloudflare.** It is the slice already running locally: deploy `worker/index.js` (not `dev.js`) with a real D1 and `SESSION_SECRET`, `run_worker_first: ["/api/*"]`, on a preview branch URL, one OAuth app. Everything else stays static. Cost $0. Missing code: the OAuth callback route, and a production wrangler config on a branch (never on `main` until it works).

## The owner's own asks, found by the topic scan
`node topic-scan.mjs doc/topic-scan.md cloudflare wrangler "durable object" D1 authentication login stripe payment tunnel ...` (arguments are the topic keywords; reads all session transcripts by script, nothing enters a model's context). Result: [doc/topic-scan.md](topic-scan.md), 47 sentences from 21 sessions, with date, session link and path tags. Limits: tags are the module paths named anywhere in that prompt (preamble paths add noise), and a few agent briefs slip through. Cross-checked against what exists:

| Owner ask (date, session) | Built? |
|---|---|
| Cloudflare auth, database, storage, payments as local simulated services (09-08, 080bcce3) | Auth + D1 + Durable Object: yes, locally via wrangler dev ([slice](/framework/ai/sessions/2026/09/06/platform-slice/run.md)). Storage (R2) and payments: no |
| Password reset, social-login avatars/Gravatar, study the sign-up UX (09-18, 0d555c50) | Partly: `ux/Auth` and `ux/MagicAuth` classes exist as UI; no avatar/Gravatar, no real reset, no backend wired |
| "Cloudflare API setup, 5 min" as the owner item (09-18) | Never done; it is blocker 1 above |
| Payments: "did we build any modules?" (09-05) | No code; only the research answer |
| Cloudflare Tunnel so the PC serves the site remotely (10-01, 10-05) | Decided ([remote-access](/framework/ai/sessions/2026/10/01/remote-access/requirements.md)), not installed |
| Cloudflare page-to-markdown API for agent web search (10-01) | Not built, not researched beyond the ask |
| Keep auth from shutting everything down; refresh on a timer (10-05) | Not built |
| Find past Cloudflare/auth/payment/user work, scan prompts by keyword (10-09) | This task |
