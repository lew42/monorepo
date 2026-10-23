# Usage pace: spend against the clock

`ai/AITask/usage.js` (`usage_rail`) is today's meter and stays as it is. This page puts three pace-relative variants beside it, drawn from the same `ai/usage.json`:

- `UsagePace.js` — `UsagePace.of(limit)` computes used, clock, gap and ratio; `ratio`, `gap` and `chip` draw them.
- `UsagePage.js` — the page: the old meter, then variants A (used ÷ pace), B (gap in points), C (one word).
- `usage.css` — `.up-*` rules, inside the `theme` layer.

Why: early in a window the used share is a few pixels, so "ahead or behind" cannot be seen. The text line already says "At N% of pace" (`Server/usage-now.mjs`); these bars say the same thing visually. Brief: [usage-pace-meter](/framework/ai/sessions/2026/10/15/voice-opus/usage-pace-meter/requirements.md). Open: pick the winner and move it into `usage_rail` (the owner's call; today's meter is untouched until then).

## Notes from your asks

- Rules, preferences and ideas you said about this module: [doc/notes-from-asks.md](doc/notes-from-asks.md)
