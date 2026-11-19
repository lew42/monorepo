# A Claude Code cloud session on the monorepo: what works (checked 2026-11-19)

A cloud session (claude.ai/code) clones the repo into a container on Anthropic's side. This is what the first one with network access found. Source: the owner's dictation of 2026-11-19, session `7a77cde7-f97f-5692-8707-44c0a4669d15`.

## What works

- **The Servex connector works from the cloud.** `shell`, `updates`, `read_file` and the rest reach the PC through `servex.lew42.com/mcp/remote/<token>`. So a cloud session can read and change the PC's checkout.
- **`npm install`** works (3 packages).
- **The site renders in the container** from a plain static file server over `public/` with a fallback to `index.html` (what Cloudflare does in production). Checked with a headless screenshot of `/framework/` and `/framework/ext/Figma/`. The dev-only routes (`/servex`, `/whisper`, the socket) are absent, so about 1,200 requests 404 and nothing is live.
- **Fal and Figma connectors** are present in the session.

## What does not work, and why

- **The clone is stale.** The session clones `main`. On 2026-11-19 `main` was 1,848 commits behind the PC's `compliance/dev`, and `compliance/dev` itself had 393 commits never pushed. Pushed that day; the session then worked in a worktree made from `origin/compliance/dev`.
- **The repo's hooks block the cloud session.** `.claude/hooks/server-guard.mjs` refuses `node server.js`, and `git-guard.mjs` refuses `git merge` in the main checkout. Both were written for the shared PC tree. Neither has a case for a cloud container, where the tree belongs to one session and Servex is not there to start a server.
- **The owner cannot open the container's site.** `127.0.0.1:8080` in the container is not reachable from a phone. A cloud session can only show screenshots.

## How to see a cloud session's work live

1. **Cloudflare branch preview** (root `readme.md`, "Cloudflare Previews"): push the branch, open `<branch-with-dashes>-monorepo.lew42.workers.dev`. Static only.
2. **Edit the PC through Servex** and watch `monorepo.lew42.com` or the LAN address. Live, but the work is then on the PC, not in the cloud clone.

## Open decisions (the owner's)

- Let the two guard hooks pass when `CLAUDE_CODE_REMOTE=true`, so a cloud session can run the real dev server and merge. Not done: editing a guard is the owner's call.
- Keep GitHub current automatically: a push of the PC's working branch after every Servex log sweep or merge, so a cloud clone is never stale. `merge.mjs` already pushes `michael/dev`; the PC is now on `compliance/dev`, which nothing pushes.
- Point the cloud environment at the working branch instead of `main`, or fast-forward `main` on each landing.

## Is the tunnel a security hole? (checked from outside, 2026-11-19)

Short answer: not open, but it is one password away from full control of the PC.

- `monorepo.lew42.com`: every path tried without the key (`/`, `/framework/`, `/rpc`, `/mcp`) answered 401 "Locked". The design is in [tunnel.md](./tunnel.md).
- `servex.lew42.com`: `/` and `/agents` answered 404; only `/mcp/remote/<token>` passes.
- **The real risk is the token.** One secret (`remote.token`) is both the site key and the MCP URL token. The MCP URL gives `shell` on the PC: whoever has that URL can run any command. It is long and random, so guessing is not the threat; leaking is (a pasted URL, a screenshot, a connector config, browser history).
- Hostnames: both are covered by Cloudflare's wildcard certificate, so they are not listed one by one in certificate logs, but `monorepo` and `servex` are guessable names. Treat the hostnames as public.
- Fixes, in order of value: (1) turn on Cloudflare Access (free plan) in front of both hosts, as tunnel.md already plans; (2) give the site and the MCP separate secrets; (3) rotate `remote.token` now if the URL was ever pasted into a chat or a doc.
