# Vision remeasure — note
**Totals:** 57 page-level shots (19 pages × 3 widths), $4.81 of $6. Broken findings 78 → 83; total findings 247 → 245.

| page | before b/t | after b/t | Δ broken |
|---|---|---|---|
| DesignTool/vision (pilot browse) | 5/15 | 8/18 | +3 |
| styles/elements/ | 2/12 | 5/11 | +3 |
| / (framework root) | 2/13 | 4/12 | +2 |
| core/ | 3/9 | 5/12 | +2 |
| ext/Doc/ | 3/10 | 5/13 | +2 |
| mastermind-shots/ | 6/13 | 7/13 | +1 |
| ext/DesignTool/ | 3/11 | 4/13 | +1 |
| ext/Panel/ | 4/13 | 5/13 | +1 |
| notes/ | 4/12 | 5/13 | +1 |
| styles/layouts/ | 5/13 | 4/12 | −1 |
| ai/2026-08-17/ | 5/19 | 3/14 | −2 |
| ui/ | 7/18 | 3/13 | −4 |
| web/ | 5/12 | 1/13 | −4 |
*Unchanged (Δ0):* `ai/`, `layout-primitives/`, `core/Page/`, `core/Page/doc/`, `ext/`, `styles/`.
**Top 5 remaining (rules, not pages):**
1. **3440 content column doesn't expand** — 12 of 19 pages, still the biggest cluster; this is the `thru` fix that hasn't landed.
2. **Tabs/labels clip at the viewport edge** — 5 mentions, mostly `core/Page/` and its `doc/`.
3. **Low-contrast text** — 6 mentions, down hard from ~34 in the first sweep (`.muted`/`--subtle` held).
4. **Cards/panels floating with no surface** — 4 mentions, new instances outside the card-frame fix's original scope.
5. **`mastermind-shots`' own table: no header, truncated cells** — 6 mentions on one page; exactly what the `wide` before/after targets.
