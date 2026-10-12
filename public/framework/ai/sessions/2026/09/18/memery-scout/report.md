# Memery — what exists of "a topic page is a team you join, with chat"

**The topic system is called "topic" today and lives at [/imagine/platform/](/imagine/platform/).** The 2026-09-04 brief says it: *"the original working concept was called a 'meme,' but topic may be the better fundamental terminology."* Memery and the topic program are the same thing.

## What exists

- [/notes/each-meme-is-a-community/](/notes/each-meme-is-a-community/) — the note that started it: each meme is a community, voice chat, join teams, $10/mo unlimited. Its price card is real; its **Join** button does nothing on purpose.
- Five decision records in [/imagine/platform/decisions/](/imagine/platform/decisions/): topic-model (a topic is a page that says `is: "topic"`), identity (GitHub/Google OAuth + roles), data (where each kind of state lives), slice (the first real write, a like), local-dev (the offline multi-user harness).
- What the worker proves **live**, measured, never deployed: `/api/me` (a signed-in session), `/api/likes` (a D1 row per user per page), and `/api/room` — **a real live chat**: one Durable Object per page url, a WebSocket per open tab, a SQLite table of messages, every message broadcast to everyone connected; two browser tabs saw each other's message within 2 seconds ([the harness task](/framework/ai/2026-09-04/local-dev-harness/)). The one place to click it: [/imagine/platform/local/room/](/imagine/platform/local/room/), after `npm run dev`.

## Decided, never built

- **Real sign-in** — GitHub + Google OAuth is the decision; today a fake `?as=carol` switch.
- **A team a user can join** — no membership table anywhere; the six-role table is written, not wired.
- **Voice chat** — cut from the MVP: Cloudflare's voice service has no local emulator and a busy room's cost is unmeasured ([the verdict](/imagine/platform/research/realtime/)).
- **Levels and reputation** — the formula is decided (derive from an action log, never store a number); one local demo.
- **Deploying any of it** — every wrangler config here and in the owner's two prior Cloudflare projects has only ever shipped static files.

## The gap, in order

1. A membership table and a join route; wire the note's Join button — a few hours, no owner input.
2. The chat room on every topic page, not one demo page — a few hours.
3. Real sign-in — **needs you: register an OAuth app with GitHub and Google, ~15 min**, then a few hours of code.
4. Deploy — **needs you: a Cloudflare account with Workers Paid ($5/mo)**; the commands are known, about an hour once access exists. Unlocks 3 and 5.
5. Mute and ban — the code sits unused in `worker/room.js`; an hour or two once 4 is live.
6. Voice, if wanted — on the Durable Object room (native, one bill, least proven) or a linked Discord server (hours, moderation and mobile included, not on the site).

## The failure-to-launch meme

No page for it exists. Two passing mentions site-wide (a recording-plans note, a lyric idea); neither is a topic page.

*Scouted 2026-09-18 by a Sonnet minion, read-only; the log is beside this file.*
