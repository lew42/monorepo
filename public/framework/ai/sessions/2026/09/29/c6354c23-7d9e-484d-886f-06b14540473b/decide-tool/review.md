verdict: fix (now landed — see task.jsonl outcome)

![the card's Decisions tab, ranked and nested](shots/live-card-1920.png)

1. **[fixed]** The five OpenRouter decisions weren't on the card's live `page.jsonl` yet. Re-seeded; now 5 lines, rendering on [the card](/framework/ai2/2026/09/29/openrouter-brain-a-knowledge-base-that-o/decisions/).
2. **[note, works]** The walk is create → options → caveats → then → recommend. Every call returns `next`; a missing part is refused with the reason ([Server/decide.mjs](/Server/doc/decide.md)). Rank 1 shows first, each child nested inside the option that leads to it.
3. **[note]** The review shots stop before the nested demo on [/framework/ux/Content/Decision/](/framework/ux/Content/Decision/) — worth a scrolled shot next time to prove that page too.
4. **[fixed]** A branch's child decisions now draw full width under the option row, not squeezed into a half-width column (`decision.css`, `.ux-content-branch`).
5. **[fixed]** `depends_on` is now the one source of truth for the tree; `then` no longer drifts from it.
6. **[declined]** `decide.mjs` still writes `ask`/`say`/`caveat` alongside `question`/`text`/`caveats` for older readers — kept for compatibility, not simplified.
7. **[declined]** No Servex tool yet — adding one needs a Servex restart, logged as the next step.
8. **[fixed]** A card click now writes `decided`/`decided_by` (was a separate `chose` line that could drift from `recommend --status`).

