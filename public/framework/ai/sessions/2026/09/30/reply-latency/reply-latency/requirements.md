# Reply latency — measure-first, budget ~$3

Verbatim ask (from the mastermind, card 2026/09/29/mobile-nav-back-an-ai-rail-at-the-bottom,
sent to task-mastermind-voice-sessions):

> The owner, on the phone: tap ✦, say "can you hear me?", and the reply "yes, I can hear you"
> takes about 3 seconds. The fast assistant should answer that almost instantly.
>
> Trace and time EVERY hop for one message, from the ✦ sheet (ext/drawer/rail.js, and the send
> path in tabs/ai.js or ai2/chat.js) → the dev server's /servex proxy → Servex's page-ai route →
> the agent (is it SPAWNED fresh per message? resumed? which model and effort? how long is its
> opening prompt; is the readme chain loaded every time?) → the first token → the reply back to
> the sheet. Use timestamps in the Servex logs, plus a headless run against
> http://10.0.0.135:8137 sending "can you hear me?" 5 times (first, then warm).
>
> Deliver ONE table: hop, ms (cold / warm), and the cause. Then the 2–3 biggest fixes, e.g. keep
> a warm fast assistant per session, stream the reply, a smaller opening prompt, low effort.
> Apply any fix that's a one-line config change (effort, model) through a pool worktree and
> merge.mjs, and re-measure. Post the table on card
> 2026/09/29/mobile-nav-back-an-ai-rail-at-the-bottom via POST
> http://127.0.0.1:8090/card/append?id=…, using node fetch, and send it to
> task-mastermind-voice-sessions.

## Deliverables (numbered, checked at harvest)

1. One table: hop → ms (cold) → ms (warm) → cause, covering every hop from tap to first token
   back at the sheet.
2. 2–3 biggest fixes named, ranked by impact.
3. Any fix that is a one-line config change (effort/model) applied via a pool worktree +
   `Server/merge.mjs`, then re-measured (before/after numbers in the table or right below it).
4. The table posted to card `2026/09/29/mobile-nav-back-an-ai-rail-at-the-bottom` via
   `POST http://127.0.0.1:8090/card/append?id=...` using node fetch.
5. Sent to `task-mastermind-voice-sessions` (send_to_agent or card mention).

## Scope / fence

Read-only tracing across: `public/framework/ext/drawer/rail.js`, the send path (`tabs/ai.js` or
`ai2/chat.js`), `Server/` proxy code for `/servex`, Servex's page-ai route, agent spawn/resume
code, Servex logs. Any config-only edit (effort/model) for a fast-assistant agent definition goes
through a pool worktree (`take_worktree`) + `Server/merge.mjs`, never a direct edit to the main
tree or to `Server/` (which would restart the live supervisor — read `Server/` code freely, edit
only via the worktree if a `Server/`-side change turns out to be the fix, and prefer touching an
agent-definition/config file over `Server/` itself).

Do not touch `voice-sessions/` slice work (a-slice1, b-slice2, c-roles, d-directory) — that is a
sibling task already in flight under `task-mastermind-voice-sessions`; this task only measures
and reports.

