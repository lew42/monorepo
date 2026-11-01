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

## Writing files on the hosted site (the owner, 2026-11-01)

Not started; recorded so the questions aren't lost. Context: [doc/git.md](/framework/doc/git.md) (how this repo deploys).

- **Today the hosted site can't write.** Cloudflare serves `public/` as files uploaded at each deploy (Workers static assets); they're read-only until the next deploy. Every change goes through git.
- **The wish:** on any copy of the site, append to a JSONL file or upload an image into the site's own folders (`site.com/path/image.png`), the way the dev server does on the PC. Appends would be debounced (one write every few seconds, not one per keystroke).
- **What it would take:** a Worker script in front of the files, plus storage it can write: R2 (Cloudflare's S3-like buckets; S3 came first, in 2006, and R2 copies its interface without fees for downloads). Paths in the bucket can mirror the site's folders.
- **Catch: R2 and S3 objects can't be appended to.** Each write replaces the whole object. Appending a line means rewriting the file, or one small object per batch of lines, or a Durable Object that holds the open log and flushes it.
- **Catch: the data leaves git.** Files written on the hosted site aren't committed, so the PC and the site drift apart. Something has to sync them back (or the hosted copy becomes the source for that data).
- **Catch: each address needs its own data.** localhost, staging (`monorepo.lew42.workers.dev`) and production (`lew42.com`) shouldn't write into the same place. Browsers already keep localStorage apart per address; server-side storage needs the same split (a bucket or prefix per environment).
- **Catch: rollbacks don't roll data back.** Moving production to an older commit serves older code against newer data ([doc/git.md](/framework/doc/git.md#moving-production-and-moving-it-back)).
