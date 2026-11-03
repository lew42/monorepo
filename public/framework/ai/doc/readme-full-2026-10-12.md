# ai — the page tabs, in full (moved from the readme)

<!-- moved verbatim from readme.md lines 5-13, 2026-10-12 readme audit -->
The page has three tabs:

- **Inbox** (the default): a rail of what needs you, only rows scoring 90 and up. The card you pick opens beside it, at its own address (`/framework/ai/2026/09/30/<card>/`).
- **Log**: the same rail, showing everything (`?min=0`). Every task by day is at [all-tasks/](all-tasks/).
- **System**: the whole AI system explained, full width — the map, [Skills](skills.json) (rerun `node public/framework/ai/skills.mjs` after a skill changes), [Readmes](readmes/), how data is written and how a page saves, Objects ([objects.js](objects.js)), Authoring, Models and CLAUDE.md. Concept text: [concepts.js](concepts.js); tabs: [overview.js](overview.js).

A tab after Inbox is **detected, not hand-listed**: any folder whose own `page.jsonl` (or `settings.jsonl`, beside a `page.js`) has `{"settings":{"tab":true,"weight":5}}` joins the strip there, ordered by `weight` (`overview.js`'s `detect_tabs()`; more on the System tab).

The rail is `AIRail` ([ai/rail/rail.js](/framework/ai/rail/rail.js)), the same one AI 2 draws; how it works is at [/framework/ux/Inbox/](/framework/ux/Inbox/). The old board is at [/framework/ai/v/3/](/framework/ai/v/3/) (and `?v1`).
