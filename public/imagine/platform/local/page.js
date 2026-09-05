import { Page, md, p } from "/app.js";

/* Container: /imagine/platform/'s columns host (the mastermind wires this url
   into the hub's `children:` — this file does not touch platform/page.js).
   Size: `large` — prose, three assumption verdicts and two screenshots side
   by side want more than the 40em default. Own layout: prose, then
   `previews()` for the one child. Regions: one. Preview: default card. */

export default new Page({
	meta: import.meta,
	title: "Local",
	description: "npm run dev: a real Durable Object room.",
	width: "large",

	children: "room",
	index: true,

	content(){
		md(`**Every decision in [\`decisions/local-dev.md\`](/imagine/platform/decisions/local-dev.md) tested, then built.**
One command runs a whole multi-user platform locally: fake logins, a role-checked API, and a
live chat room backed by a real Cloudflare Durable Object — no account, no deploy, no proxy.

## Start it

\`\`\`
npm run dev
\`\`\`

Spawns \`node server.js\` (the existing UI loop, unchanged) and \`wrangler dev\` on one new
origin, \`:8787\` — assets, the \`/api/*\` router and the room's Durable Object, all from one
process, all local (\`.wrangler/state/\`). Switch identity with a url:

\`\`\`
http://localhost:8787/api/dev/login?as=alice   (alice bob carol dave eve; ?as=none clears it)
\`\`\`

## What it proves

- **Identity** — a signed session cookie (HMAC-SHA256, WebCrypto, [\`/notes/auth/\`](/notes/auth/) §3),
  minted by a dev-only login route that does not exist in the production entry at all
  (identity.md ruling 3) — a build-time absence, not a flag that disables it.
- **Authorization** — \`can(user, action)\`, called by the router before every handler
  (identity.md ruling 4) — the six-role table, nothing more.
- **A real room** — \`worker/room.js\`, one Durable Object per url, hibernatable WebSockets,
  one SQLite table of deltas, resume by row id — the exact shape
  [\`durable-objects.md\`](/imagine/stream/doc/durable-objects.md) describes, running for real
  on \`workerd\`, not a simulation.
- **A ban that lands instantly** — the room itself refuses a banned user at connect
  (identity.md ruling 2), before \`can()\` is ever consulted.
- **Anonymous reads, never writes** — every page still renders with no cookie
  ([\`/notes/auth/\`](/notes/auth/) §1); the room composer just disables itself.

## The room test

Two Playwright contexts, one Durable Object: alice sends, bob's DOM shows it inside 2 seconds
— asserted, not eyeballed. Eve (seeded banned) never gets past connect. An anonymous context
reads the same transcript with no way to post.

![alice's tab, after sending](/framework/ai/2026-09-04/local-dev-harness/room-test-alice.png)
![bob's tab, a moment later — the same message, arrived](/framework/ai/2026-09-04/local-dev-harness/room-test-bob.png)

Full script, output and both screenshots: [the task log](/framework/ai/2026-09-04/local-dev-harness/).

## The three assumptions — tested before anything was built on them

[\`local-dev.md\`](/imagine/platform/decisions/local-dev.md) named three things nobody had
verified. All three held; testing them also caught a real bug.`);

		p("1. Verified — wrangler dev -c wrangler.dev.jsonc --port 8787 and PORT=8092 node server.js run side by side on Windows with no port conflict and no file-lock contention, both serving public/ concurrently.");
		p("2. Verified (noise only) — the framework's own dev Socket (ws://localhost:8787/) hits no route the worker owns, falls through to the assets binding, and gets back a plain 200 page instead of a 101. A real WebSocket treats that as a failed handshake — error, then close — which is exactly Socket.js's existing backoff-and-reconnect path. Console noise, nothing else.");
		p("3. Verified — a session cookie set at :8787 IS carried on a WebSocket handshake opened from a page whose own origin is :8092 (cookies are not port-scoped, RFC 6265 §8.5), confirmed in a real Chromium context, not asserted from the RFC alone. The harness still keeps everything on one origin (the design local-dev.md already recommended) — this just confirms the fallback would also work.");

		md(`**A fourth thing broke that nobody had named as a risk.** \`wrangler 4.129\` accepts
\`run_worker_first\` at the config's top level with no error — but silently ignores it there,
and a plain navigation (\`Sec-Fetch-Dest: document\` — exactly what \`<a href>\` and
\`page.goto()\` send) to \`/api/dev/login\` fell through to the SPA fallback instead of the
worker. \`curl\` alone never caught it, because curl doesn't send that header. The fix: nest it
under \`assets\` — \`assets.run_worker_first: ["/api/*"]\` — which routes navigations correctly
with no warning. Every dev-login link is exactly this gesture; this would have shipped broken.

## What was cut

- **Role and ban are not D1 columns.** [\`identity.md\`](/imagine/platform/decisions/identity.md)
  ruling 7 keeps the \`users\` table exactly [\`/notes/auth/\`](/notes/auth/) §4's seven columns —
  no email, no role. For five fake logins, the dev-only login route signs the role and the ban
  flag straight into the session payload from a small handle → role map (matching
  \`worker/seed.sql\`); \`can()\` and \`worker/room.js\` only ever read what the cookie already
  says. A real login would derive the same fields from D1's topic/founder rows instead.
- **No mute mid-room, no KV ban key.** The closed list for this harness was the two-context
  message, the banned refusal, and the anonymous read — in that priority order. A moderator
  muting someone live, and the KV-backed ≤60s ban propagation identity.md describes for
  production, are both real but not this task's.
- **One quirk, not fixed.** Loading the room page against plain \`node server.js\`
  with wrangler *not* running (no worker at all) shows "reading…" instead of "offline" —
  the dev server's own loopback WebSocket accepts any path indiscriminately and the
  room page mistakes it for an open connection. Harmless (nothing throws, no message
  ever arrives), and it never happens in the real flow: \`npm run dev\` always starts
  both, so the room's own socket is the only one ever listening on \`:8787\`.
- **No compaction alarm.** \`worker/room.js\`'s SQLite table just grows; folding it into a
  snapshot is [\`durable-objects.md\`](/imagine/stream/doc/durable-objects.md)'s alarm-based
  idea, worth building the day a room's history is actually long.`);

		this.previews();
	},
});
