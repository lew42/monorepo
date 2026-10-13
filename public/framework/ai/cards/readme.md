# ai/cards: one card and what it shows

Moved here from `ai2/` on 2026-10-09 (the old paths are one-line shims). A card is a task or conversation; this folder draws it, small in the rail and whole on its page.

- `card.js`: `Card`, the card page and its tabs (the biggest file; start here).
- `CardChat.js`, `Compose.js`: the conversation and the box you talk into.
- `Outline.js`, `Activity.js`, `Tasks.js`, `Agents.js`, `workspace.js`, `real.js`: what a card shows (outline, news, tasks, agents, files, real pages).
- `faces.js`, `Meter.js`, `floating.js`: small shared parts (clocks, flags, progress bars, the floating panel).
- `Fold.js`, `Rules.js`: turn a card's `page.jsonl` lines into its current state; read/resolved rules.

The list that holds these cards is in [rail/](../rail/readme.md). Why it moved: [doc/ai2/ai2-vs-ai.md](../doc/ai2/ai2-vs-ai.md).

Comments pruned from `card.js`, verbatim: [doc/notes.md](./doc/notes.md).
