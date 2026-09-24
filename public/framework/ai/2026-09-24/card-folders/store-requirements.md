# Minion brief — the card store and create_card (Servex/cards/)

Load the `minion` skill first. Then `code`. You work in the worktree
`C:\Code\lew42\worktrees\page-cards` (branch worktree/page-cards). Do not commit; I do.

## The owner's words

> "what we absolutely need: the ability to add sub cards, anywhere on the card. to convert any
> card into any other content type (Question, Request, ask a sub question, etc)"
> "I'd rather have a create page skill that does it programmatically without error"

Background, read it: `C:\Code\lew42\monorepo\public\framework\ai\handoff2.md` items 5, 6, 7.
The existing card code to learn from: `Servex/Log.js`, `Servex/Servex.js` (lines 340–440: the
`cors` middleware, `/log/cards/:slug`, `tools()`), `Servex/agents/Assistant.js` (`card_reply`),
`Servex/agents/tools.js` (the tool shape).

## The layout (decided)

- Root: `<repo>/public/framework/ai/` (constructor option `root`, so tests can point at a scratch dir).
- A card: `2026/MM/DD/<slug>/page.jsonl`, dated by the day it was created (local time). A
  sub-card: `<card folder>/<slug>/page.jsonl`, any depth.
- The year, month and day folders are index pages too: each has a `page.jsonl`, created on
  first use with line 1 `{"title": "2026"}` / `{"title": "September 2026"}` / `{"title": "Thursday 24 September"}`.
- A card's **id** is its path under `ai/`, no slashes at the ends: `2026/09/24/my-card`,
  `2026/09/24/my-card/a-sub-card`.
- Line 1 of a card (the constructor): `{"class": "/framework/ai2/Card.js", "title", "type", "id", "created": ISO local, "by", "tags": []}`.
- Every later line is one object. The shapes: `{"type": "request"}` (the latest `type` wins),
  `{"tags": [...]}` (latest wins), `{"status": "open"|"done"}`, `{"message": {"by", "text", "at", "kind"}}`
  for anything said or that happened (kind = prompt, reply, update, task, …), `{"attach": "agent-id"}`,
  `{"detach": "agent-id"}`, `{"legacy": "topic-xyz"}` (an old id this card answers to).
- The parent gets one listing line per child: `{"file": "<slug>/page.jsonl"}`. (Module A may change this
  exact shape — keep it in ONE constant.) Repeating it is harmless.
- Slug: from the title, lowercase kebab, ≤ 40 chars; if taken in that parent, add `-2`, `-3`.

## Deliverables

1. `Servex/cards/Cards.js` — `class Cards` (house style: assign-based, every method a seam):
   - `create({parent, title, type, by, tags})` → `{ok, id, url, path}`. `parent` omitted or `"today"`
     = today's day folder; otherwise a card id (or a legacy id). Refuses a missing title or an
     unknown parent with `{ok:false, why}` — never throws to the caller.
   - `append(id, obj)` — one line, stamped `at` if a `message` has none. **One writer per file**:
     a per-path promise chain so two appends never interleave.
   - `read(id)` → the lines. `fold(id)` → the latest-wins state `{title, type, tags, status, messages: [...], attached: [...], children: [...]}`.
   - `resolve(id)` → folder path, or null; accepts a legacy id (build the legacy map once by walking, refresh on create/append of a `legacy` line).
   - `list({view, tag})` → summaries (`id, title, type, status, tags, created, last`) for `view` = `today`, `open` (status not done), `all`, or a `tag`. Walks the tree.
   - `attach(id, agentId)`, `attached(id)`.
   - `forward(id, message)`: when a message's `by` is the owner (look at what `compose.js`/`ux/Dictate`
     post today to find the owner's marker), call `this.agents.send(agentId, text, {from, reply_to})`
     for every attached agent that is live and whose role is not `minion`. Minions never hear chatter.
   - `routes(router, cors)` — `GET /cards?view=&tag=`, `GET /card?id=`, `POST /card/create`, `POST /card/append?id=` (append + forward). JSON in and out.
   - `tools()` — MCP tools in the `tools.js` shape: `create_card({parent, title, type})`,
     `read_card({card})` (the whole log, so an agent can read it at start), `attach_card({card, agent})`
     (appends the attach line AND sends the agent the card's whole log as one message), `list_cards({view, tag})`.
     `create_card`'s description says it is the ONLY way to make a card.
2. `Servex/cards/test.mjs` — a node script that runs every method against a scratch root and a fake
   `agents` (records sends), prints pass/fail per check, exits non-zero on failure. Include: a sub-card
   three deep, a type change, slug collision, a legacy id, two appends fired at once, forward skipping a minion.
3. `Servex/cards/readme.md` — the index shape: what it is, Use, Watch out, More. Short.

## Fence

Only `Servex/cards/`. Do NOT edit `Servex/Servex.js`, `Servex/agents/*`, `Servex/MCP.js`, anything in
`public/`. The wiring into Servex.js is mine.

## Done

`node Servex/cards/test.mjs` passes. Append one `log` line to
`C:\Code\lew42\monorepo\public\framework\ai\2026-09-24\card-folders\task.jsonl` with
`node .claude/hooks/append.mjs` (run from the main tree) saying what you built. Your last message:
the method list and anything you had to decide.
