# Hosting, tunnels and cloud files: the owner's idea (2026-10-29)

Status: **idea, not started.** Owner said not to launch build work on this until the overall direction is clearer. Research questions below can run first.

## The goal

Reach the monorepo's live website (pages, JSONL streaming, AI sessions, tasks) from anywhere, not only on the home PC.

## Three ways to get there

**A. Local PC + tunnel.** Keep everything running on the PC (Servex, file system, page.jsonl streaming) and expose it at a stable subdomain of lew42.com through a Cloudflare Tunnel. A tunnel already exists for the voice agent's Servex MCP connection. Cheapest and simplest; only works while the PC is on.

**B. Fully in the cloud.** Static site on Cloudflare, with live data through **one Durable Object per page in front of R2**:
- The Durable Object holds the live log, stamps sequence numbers, streams changes to connected clients, and batches writes to R2.
- Clients load the latest snapshot from R2, then subscribe from that sequence number.
- Durable Objects sleep when nobody is connected (WebSocket hibernation), so idle cost is near zero.
- Alternative: Cloudflare Containers for a real file system. Needs a cost check for 24/7 running.

**C. Both.** Some things local-only (heavy agent work, code, voice), some hosted (pages, tasks, chat with AIs).

## Risks the owner flagged

- **Stale or glitchy data during handoff** between the Durable Object and clients (load snapshot → subscribe gap). Needs sequence numbers and catch-up so no client ever shows a state that never existed. Each case gets a failing test first.
- **Code needs a file system.** Agents writing code need real files and git. Durable Objects and R2 can't run `git push` on their own.

## The bigger idea: git without GitHub?

If pages, tasks and agent chat live in R2 + Durable Objects, GitHub matters less for that data. Two sources of truth today (local PC, cloud sessions) make branch/merge coordination hard; one cloud store could remove that. Open question: can R2 back git itself (git objects are content-addressed files, a good fit for object storage), or push to GitHub from a Worker?

## Research questions (not yet assigned)

1. Cloudflare Containers pricing for always-on vs on-demand; cold start; disk persistence.
2. Worker and Durable Object memory limits (128 MB per isolate as of the research notes), and what that means for loading big files.
3. Git on object storage: isomorphic-git in a Worker with R2/DO storage, any Cloudflare git-compatible storage product, and pushing to GitHub from a Worker.
4. Tunnel setup: GitHub webhook → lew42.com subdomain → Servex (also solves the "notify agents of pushes" problem without a relay).
5. Cost model for B vs A at the owner's usage.

## Related

- Durable Object + R2 pattern and costs: `persistence-sync/notes/cloudflare_vs_postgres_platforms.md`
- Store adapter interface proposal: `persistence-sync/lessons/storage-compaction.md`
- Git strategy for many agents: `agent-ops/` (in progress)
