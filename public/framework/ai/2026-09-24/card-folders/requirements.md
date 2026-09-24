# Card folders — module B of the page-cards pair

The owner's words (from [handoff2-owner-words.md](../../handoff2-owner-words.md)):

> "what we absolutely need: the ability to add sub cards, anywhere on the card. to convert any
> card into any other content type (Question, Request, ask a sub question, etc)"

> "I'd rather have a create page skill that does it programmatically without error"

> "i was thinking a ai/2026/MM/DD.jsonl could be the day's index, and then MM/DD/* could be used
> for sub cards, pages, whatever?"

The brief: [handoff2.md](../../handoff2.md) items 6 and 7, and the back-burner note "Card logs
live outside git".

## Deliverables

1. **One folder per card.** `public/framework/ai/2026/MM/DD/<slug>/page.jsonl`, dated by the day
   the card was made. Sub-cards are subfolders, to any depth.
2. **A card's type is a line in its log**, and the latest line wins.
3. **Views, not folders**: today, a project (a tag), open work.
4. **`create_card({parent, title, type})`** — the one Servex tool that makes cards.
5. **Item 7**: an agent attached to a card reads the card's whole log when it starts; Servex
   forwards each new owner message on the card to every attached agent. Minions stay isolated.
6. **Migration** of `%LOCALAPPDATA%\lew42\servex\logs\cards\*.jsonl` and `ai/board.jsonl` into
   the new layout. Old files kept. Run only once the new layout works.
7. **Proved on `/framework/ai2/`** from the worktree's own dev server, no console errors.

## Fence

Mine: `public/framework/ai2/` (card storage and view), a new `Servex/cards/`, Servex's card
routes and tools, the new `public/framework/ai/2026/` tree, the migration script.
Not mine: `core/Page` (module A, task-mastermind-page-jsonl). `Servex.js` (live-card also edits
it) and `Servex/agents`, `MCP.js` (concurrency) — ask first, keep changes small.

Worktree: `C:\Code\lew42\worktrees\page-cards`, branch `worktree/page-cards`, shared with A.
