# ai/cards: one card and what it shows

Moved here from `ai2/` on 2026-10-09 (the old paths are one-line shims). A card is a task or conversation; this folder draws it, small in the rail and whole on its page.

- `card.js`: `Card`, the card page and its tabs (the biggest file; start here).
- `chat.js`, `compose.js`: the conversation and the box you talk into.
- `outline.js`, `activity.js`, `tasks.js`, `agents.js`, `workspace.js`, `real.js`: what a card shows (outline, news, tasks, agents, files, real pages).
- `faces.js`, `meter.js`, `floating.js`: small shared parts (clocks, flags, progress bars, the floating panel).
- `fold.js`, `rules.js`: turn a card's `page.jsonl` lines into its current state; read/resolved rules.

The list that holds these cards is in [rail/](../rail/readme.md). Why it moved: [doc/ai2-and-date-layout-2026-10-08.md](../doc/ai2-and-date-layout-2026-10-08.md).
