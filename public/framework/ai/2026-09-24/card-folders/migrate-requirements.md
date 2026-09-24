# Minion brief — migrate the old cards into folders

Load the `minion` skill first. You work in the worktree `C:\Code\lew42\worktrees\page-cards`.
Do not commit; I do.

## The owner's words

> "what we absolutely need: the ability to add sub cards, anywhere on the card. to convert any
> card into any other content type"

Background: `C:\Code\lew42\monorepo\public\framework\ai\handoff2.md` item 6 and the back-burner
note "Card logs live outside git". Read `public/framework/ai2/inbox.js` to learn how
`board.jsonl` merges cards by id (newest fields win) and what a card's own log looks like.

## Today

- `C:\Code\lew42\monorepo\public\framework\ai\board.jsonl` — `{"card": {...}}` lines, merged by `id`.
- `%LOCALAPPDATA%\lew42\servex\logs\cards\<slug>.jsonl` — 24 card logs (prompts, replies, updates…).
  `live.jsonl` and `state.jsonl` are NOT cards — skip them and say so.

## The new layout (decided — a sibling minion is writing `Servex/cards/Cards.js` for it)

- A card: `public/framework/ai/2026/MM/DD/<slug>/page.jsonl`, dated by the card's first `at` (local date).
- Year/month/day index pages: `2026/page.jsonl`, `2026/09/page.jsonl`, `2026/09/24/page.jsonl`, line 1
  `{"title": "2026"}` / `{"title": "September 2026"}` / `{"title": "Thursday 24 September"}`; each parent
  gets one listing line per child: `{"file": "<slug>/page.jsonl"}` (keep that shape in one constant).
- Card line 1: `{"class": "/framework/ai2/Card.js", "title", "type", "id": "2026/09/24/<slug>", "created", "by", "tags": []}`. `type`: the
  old card's own kind if it has one (route/kind), else `"card"`.
- Then `{"legacy": "<old id>"}`, then the old card's other fields as plain lines (`{"status": …}`,
  `{"text": …}`, `{"links": […]}`, `{"icon": …}`) — whatever the merged card has.
- Then every line of its old log, in order, as `{"message": {"by", "text", "at", "kind": <old type>, …rest}}`.
- Slug = the old id (they are already slugs). Old ids with characters a folder cannot hold: sanitize and keep the original in `legacy`.

## Deliverables

1. `Servex/cards/migrate.mjs` — `node Servex/cards/migrate.mjs --out <dir> [--dry]`. Reads the two
   sources, writes the tree under `<dir>` (default: the worktree's `public/framework/ai`). Refuses to
   write if a target card folder already exists (idempotent: re-running reports "already migrated"
   and writes nothing). Never deletes or edits the old files. Prints a one-screen summary: cards
   written, messages carried, days, anything skipped and why.
2. Run it ONLY into a scratch dir: `C:\Users\mike\AppData\Local\Temp\claude\C--Code-lew42-worktrees-page-cards\2a1fcc71-6ce1-4224-b379-eef0fe42020f\scratchpad\migrate-out`.
   Check: every board id became a folder; every old log line is present; every file re-parses as JSONL.
   Do NOT run it into the repo — I do that once the new layout works.

## Fence

Only `Servex/cards/migrate.mjs`. Nothing else in the repo.

## Done

Append one `log` line to `C:\Code\lew42\monorepo\public\framework\ai\2026-09-24\card-folders\task.jsonl`
with `node .claude/hooks/append.mjs` (run from the main tree). Your last message: the summary it printed.
