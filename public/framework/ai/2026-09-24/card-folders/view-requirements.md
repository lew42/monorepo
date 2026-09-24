# Minion brief — AI 2 reads and writes card folders

Load the `minion` skill first, then `code`. You work in the worktree
`C:\Code\lew42\worktrees\page-cards`. Do not commit; I do.

## The owner's words

> "what we absolutely need: the ability to add sub cards, anywhere on the card. to convert any
> card into any other content type (Question, Request, ask a sub question, etc)"
> "we want the agent to have a card.js or similar, that's basically like a page.js, where it can import, etc."

Background: `C:\Code\lew42\monorepo\public\framework\ai\handoff2.md` items 5–7. The AI 2 page:
`public/framework/ai2/readme.md` (read its Watch out list — every item there bit someone).

## What exists now

- **Module A** (core/Page, not yours): a folder with a `page.jsonl` is a page. Line 1 names the class
  (`{"class": "/framework/ai2/Card.js", ...}`); every later line is `page.set(line)` — a method is
  called with the value, anything else assigned. `import { Page } from "/framework/core/Page/Page.class.js";`
  `await Page.jsonl("/framework/ai/2026/09/24/slug/")` loads one; on localhost it streams new lines
  live. `page.unknown` is the Set of keys that were neither method nor property. A's demo page: see
  `public/framework/core/Page/` in this worktree (ask me if you cannot find it).
- **The card store** (`Servex/cards/Cards.js`, read its readme): cards live at
  `public/framework/ai/2026/MM/DD/<slug>/page.jsonl`; id = path under `ai/`. Lines: `{"type"}`,
  `{"tags"}`, `{"status"}`, `{"message": {by, text, at, kind}}`, `{"attach"}`, `{"legacy": "<old id>"}`.
  Routes on Servex (`servex_base()` in inbox.js): `GET /cards?view=today|open|all|<tag>`,
  `GET /card?id=`, `POST /card/create` `{parent, title, type}`, `POST /card/append?id=` (the owner's
  sentence goes here; Servex forwards it to the agents attached to the card).

## Deliverables

1. `public/framework/ai2/Card.js` — `export default class Card extends Page`. Methods for every card
   line: `message(m)` (pushes onto its list and redraws the chat), `type(t)`, `tags(t)`, `status(s)`,
   `attach(a)`, `detach(a)`, `legacy(id)`. It draws itself the way a card's page draws today
   (`card.js`'s `full()` and the pinned transcript footer), including its sub-cards (its `file` lines)
   as the table of contents.
2. The rail and the overview list cards from `GET /cards?view=all` (views as url words if cheap:
   today, open, a tag). Fall back to `board.jsonl` when Servex is down, as today.
3. A card's url on AI 2: `/framework/ai2/2026/09/24/<slug>/`, sub-cards one segment deeper, any depth.
   An old url `/framework/ai2/<old-id>/` still opens the card (Servex resolves legacy ids).
4. `+ New card` calls `POST /card/create`; `+ sub-card` on an open card creates one under it; a
   type picker on the card appends `{"type": …}` (question, request, sub-question, note, task).
5. Speaking or typing into a card posts ONE first-class prompt record to `POST /card/append?id=`:
   `{"prompt": {"raw": <verbatim words>, "text": <same until cleaned>, "via": "whisper"|"typed", "on": <card id>, "url": location.pathname}}`
   (Servex stamps `id` and `at`; the shape is defined in `Servex/cards/readme.md`). The owner: "Every
   prompt that I make is very tangible. It's a quotation... We want to do a very good job of record
   keeping." Keep the existing `/log/prompts` post too — the fast assistant reads that. `Card.prompt(p)`
   merges by `id` (a later line with the same id is the cleaned reading).
6. The Live card (`live.js`, `/framework/ai2/live/`) is NOT yours — another agent edits it. Leave it on its old log.

## Proof

Run the worktree's dev server on a free port in the background (read `Server/readme.md`; e.g.
`PORT=<free> node server.js` from the worktree root). Point AI 2 at a test Servex-card writer if the
real Servex does not have the routes yet — ask me which. Open `/framework/ai2/` headless with Playwright
(the `ui-test` skill), zero console errors and zero failed requests; one screenshot at 1920 of a card
with a sub-card and its chat, saved in `C:\Code\lew42\monorepo\public\framework\ai\2026-09-24\card-folders\`.

## Fence

`public/framework/ai2/` except `live.js`. Nothing in `core/`, `Servex/`, `Server/`.

## Update from the mastermind (read this before starting)

- **Order.** Module A's loader (`Page.jsonl`, the class named on line 1, live lines) is still being
  built in `core/Page` — do NOT edit or wait on it. Build deliverables 2–5 first. I will message you
  the moment A's loader is committed; then build `Card.js` on it (deliverable 1). If you finish 2–5
  first, make `Card.js` a plain module that reads `GET /card?id=` and draws, shaped so switching it
  to `extends Page` later is small.
- **Page names you must NOT use as data or methods on Card** (they are Page's own): card, name, url,
  parent, children, content, file, place, gone, set, get, open, close, link, nav, store, rows, preview,
  log, reset, load. `title`, `icon` and `description` are Page's label properties — use them as labels.
- **Test data.** Run `node Servex/cards/migrate.mjs` in the worktree (default out is the worktree's
  `public/framework/ai/`). It writes about 327 files under `public/framework/ai/2026/`. They are test
  data: NEVER `git add` them; I delete them before committing.
- **A test Servex for the card routes.** The running Servex (port 8090) does not have the card
  routes yet, and must not be restarted. Write a scratch harness in the scratchpad (see `proof.mjs`
  there, from the wiring minion, for how to mount `Cards.routes()` on an express router) that serves
  the card routes with `root` = the worktree's `public/framework/ai`, and proxies every other path to
  `http://127.0.0.1:8090` (the real Servex: `/api/stream`, `/log/*`, `/api/agents`). AI 2 already
  reads `?servex=http://127.0.0.1:<port>` (`servex_base()` in inbox.js), so open
  `/framework/ai2/?servex=…`. The harness must SWALLOW every POST (`/log/prompts`, `/log/cards/*`): answer 200 and write it to a scratch file, never forward it — the owner is using the real board. GETs and the stream proxy through.
  Card writes go to the worktree test data only.
