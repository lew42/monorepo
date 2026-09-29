# core/Page/ai/ — the page-based AI system

**What.** How a page (mostly a card — a path under `ai/<date>/<slug>/`) gets its own
Claude agents: a fast assistant that answers right away, and a manager or mastermind that
does the work and remembers the whole card's history. [Servex](/framework/servex/)
documents the agents themselves; this page documents the PAGE-shaped half — which
context each agent belongs to, and how a page reads them back live.

**Use.** Open the page at `/framework/core/Page/ai/` — five tiles: Dictation, Fast
assistant, Manager/mastermind, Sessions & the SDK, and the agents list rendered live from
whatever Servex is actually holding right now. `doc/where.md` is the research trail (file,
class, route) for the next agent who extends this.

**Watch out**
- The drawer's per-page AI route (`POST /api/page-ai`) does not exist yet — only a card
  has a real assistant today; a plain page falls back to the dev bar's Ask bridge.
- **The chat room is deliberate, not a bug**: a card's assistant AND its
  mastermind/manager both receive every single message the owner sends on that card,
  through two separate paths (`doc/assistant.md` names both). It stays this way until
  prompt routing is sorted out (the owner, 2026-09-29).
- The live widgets (`agents/page.js`) fail soft: with Servex not running, they show one
  plain sentence, never a console error.
- `ObjectView.js` here is a stand-in for item-ui's real default instance view
  (`/framework/ux/Content/Object/DefaultView.js`, not landed yet) — same `view(thing)`
  call, so swapping it in later is a one-line import change.

**More.** `doc/where.md` (the file-by-file map), `doc/sessions.md` (session ids and the
SDK's own classes), `doc/dictation.md`, `doc/assistant.md`, `doc/manager.md`.
