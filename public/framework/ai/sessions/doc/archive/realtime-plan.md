# Going realtime — using the stream the rest of the site already has

The owner's ask (2026-10-07): this page and its cost data must update live, low latency,
using **core/Page's existing jsonl stream** — never a second streaming system. Full
investigation: [`/framework/ai/sessions/2026/10/08/token-accounting/token-accounting/findings.md`](/framework/ai/sessions/2026/10/08/token-accounting/token-accounting/findings.md).

## What the stream already is (checked, not assumed)

One mechanism, already used by every live `page.jsonl` on the site: a WebSocket
(`dev/Socket/Socket.js`), with a tiny wire protocol — `subscribe(path, offset)` from the
browser, `jsonl(path, lines, offset)` back from the dev server the moment new bytes land
(`Server/plugins/SocketServer/Tail.js` on the write side, `ext/JSONL/live.js` on the read
side). It tails ANY `.jsonl` file under `public/`, byte-offset only, never a replay of
old lines. **Localhost only** — off the dev server (the real deployed site) a page just
fetches once; that's fine here, since this tab is only ever opened on localhost.

## What this tab does TODAY — not this stream at all

Checked directly in `page.js`: every cost number on this page comes from a plain
one-shot `fetch()` of a **snapshot file** someone has to re-run a script to refresh —
`sessions.json` (from `sessions.mjs`), `week.json` (from `week-cost.mjs`), `spend-
tree.json` (from `spend-tree.mjs`). The one place that DOES already use the live jsonl
stream on this site, `page.jsonl` itself (a session's own cost lines, appended by the
Stop hook), is still only read here with a one-shot `get_jsonl()` — never `JSONL.live()`.
So this page has never used the fast path at all; it isn't a second stream to replace,
it's the FIRST real use of the one that already exists.

## Who writes a cost line, and how fast it could really be

- **A VS Code tab / plain CLI run:** only the `.claude/settings.json` Stop hook
  (`session-cost.mjs --append-stdin`) ever writes a cost line, and only once per WHOLE
  TURN (it re-reads the entire transcript after the turn ends). Fastest this can ever be:
  "the moment the turn finishes" — there is no sub-turn signal available outside the
  running CLI process.
- **A Servex-spawned agent:** `Agents.js` already SEES every SDK message the instant it
  arrives, live, in-process (`assistant(message)`, `result(message)` — it's already
  reading `message.usage` per message to drive the OpenRouter per-call pricing). Nothing
  stops it from appending a cost line **per message**, not per turn — genuinely
  real-time, sub-turn granularity, for every Servex row. This is the one real asymmetry:
  Servex rows CAN be truly live; VS Code/CLI rows can only ever be "live per turn."

## The shape: `session.jsonl` beside `page.jsonl`, not instead of it

The owner's instinct is right and matches how every other module here already splits
data: `page.jsonl` is the PAGE's own log (what a reader of the tab sees written there —
chat, nav, cost summaries already shown); a new `<session-dir>/session.jsonl` would hold
the SESSION's own raw facts (per-message usage, per-tool cost, which sub-agents it
spawned) — the detail a cost dashboard needs but a page's own narrative doesn't. Same
split `ai/sessions/doc/decisions.md` already describes for `task.jsonl` vs a task's
`page.jsonl`. **A session probably HAS a page** (`session.page` / `page.session`), the
same relationship a task already has to its own page — not a new concept, an existing one
applied here.

## The open question: how the two display — recommendation + tradeoff + alternative

**Recommendation:** keep them as two files, two `JSONL` subclasses
(`SessionJSONL extends JSONL`, same pattern `TaskJSONL` already is), and let the Sessions
grid/detail page subscribe to BOTH live, merging them client-side the same way `page.js`
already merges Servex rows + snapshot rows today — `session.jsonl`'s lines feed the cost
numbers and the per-message trace; `page.jsonl`'s lines feed anything narrative (a chat
line, a note). Nothing new to invent: `JSONL.live()` already supports two instances on
one page.

- **Tradeoff:** two files per session instead of one means two subscriptions, two small
  files to keep straight — slightly more plumbing than a single merged file, but it keeps
  "data lives with its page" (CLAUDE.md law, `page.jsonl` stays the page's own narrative)
  separate from "raw session facts" (which a cost dashboard, not a human, mostly reads) —
  the same separation of concerns `task.jsonl` vs `page.jsonl` already proved out.
- **Alternative considered:** one file, `page.jsonl`, with cost/usage lines mixed in the
  same stream (what the Stop hook already does today, in miniature — it appends `{"cost":
  {...}}` onto `page.jsonl` directly). Simpler — one file, one subscription — but it's
  already showing the cost: a session with thousands of tool calls (the real
  `session-trace` test case had 4,225) would flood the page's own narrative log with
  machine-only facts no human reading that file wants mixed into their chat history. Not
  recommended for that reason, though it is the smaller change.

## Migration from `sessions.json` to a streamed `session.jsonl` — staged, not a rewrite

1. **Servex writes `session.jsonl` live, for its own rows first** (the easy half — no
   polling script to retire yet). `Agents.js`'s `result()`/`assistant()` already see
   every message; add one `append_log`-style write per message/turn to
   `<session's page dir>/session.jsonl`. Needs a session → page-dir mapping that already
   mostly exists (`find_page_jsonl`-style lookup).
2. **The Stop hook writes the SAME shape for VS Code/CLI rows**, once per turn (its real
   ceiling) — `session-cost.mjs --append-stdin` already computes everything needed; it
   just appends to `session.jsonl` instead of (or alongside) `page.jsonl`.
3. **The grid subscribes live** (`JSONL.live()`) to every open session's `session.jsonl`
   instead of polling `sessions.json`/`spend-tree.json`. The two existing stale-snapshot
   scripts (`sessions.mjs`, `spend-tree.mjs`) stay as the ALL-SESSIONS-AT-ONCE rollup (one
   request, one history) — streaming only makes sense for sessions the reader has open
   RIGHT NOW, not a scan of years of history on every load.
4. **Retire the polling** once (3) is proven on a few real sessions — not a flag day;
   both can run side by side until the live numbers are trusted.

Not started — this is the plan, not the build. First real step is (1), scoped small:
one write call added to `Agents.js`, proven against one live agent before touching the
browser side at all.
