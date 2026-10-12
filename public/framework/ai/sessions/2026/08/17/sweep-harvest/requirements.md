# sweep-harvest — 280 findings → the rules behind them → wave 3, ranked

Laws: less is more · clarity · prioritize. **Deliverable: `proposal.md` ≤ 70 lines — clusters with file:line, class, the one-line fix, what to delete; a wave-3 order. Read-only; fix nothing. Final message ≤ 30 lines.**

Input: [`../vision-sweep/vision.jsonl`](../vision-sweep/vision.jsonl) (66 shots, 280 findings, 86 broken; 19 template pages × 390/1280/3440; `../vision-sweep/note.md` has the top-5). Prior harvest of the same kind: [`../vision-after/proposal.md`](../vision-after/proposal.md) — reuse its clusters where they recur; the fixes from `layout-primitives`, `layout-wave-2`, `day-page-ux` are already in the CSS you will read. Mike: *"a finding across many independent pages usually means the RULE is wrong"* · *"Separate 'clearly broken' from 'might be better'"* · *"Do not monkey patch."*

## Do

1. **Cluster** all 280 by cause, not by page. For each cluster: mentions (pages × widths) · the causing rule (file:line — read `core/Page/Page.css`, `framework.css` tokens, `styles/`, `ext/tabs/tabs.css`, `ext/catalog/`, `ext/AITask/ai.css`, the module css a cluster names) · class **broken | maybe** · the fix in one line (CSS sketch, the rung on the css skill's ladder) · pages it heals · what it deletes. Two numbers that must agree: findings clustered + unclustered singles = 280.
2. **The known ones, verified against the current CSS**: `.muted` contrast (`color-mix(currentColor 65%)` — a different mechanism than `--subtle`, raised in wave 2 — one token?); tab bars clipping (wave 2 added a fade to `ext/tabs` — which tab bars are *not* `ext/tabs`? name them); missing surfaces / empty cells (which components; is it the preview call or the card CSS); the 3440 fill (this is the `wide` authoring pass — **maybe**, needs Mike's Before/After: pick the ONE page that best shows it and specify exactly which nodes would claim `wide`, so a builder can make the preview without deciding anything); the 390 nav gap (which rule; is it the app shell's `--page-pad`/`--pad-y` from day-page-ux's fix or the sidebar toggle bar).
3. **Wave 3, ranked** (≤ 10 items): value ÷ cost, broken first; each = cause → fix → heals → deletes → cost S/M/L. Flag anything needing a sixth layout word (stop, not fix). Name the 6 pages a builder should re-shoot to prove the wave.
4. **Prompt feedback** (≤ 5 lines): findings that were invented, taste-as-broken, or unreadable — for the prompt owner (`vision-fixes`).

## Rules

- Files: this dir only. Log in `task.jsonl` (bash `printf`; timestamps from `date -Iseconds`); bump step; land per `finish-task`. Never Mike's live tabs; no runner calls (the sweep is the data).
