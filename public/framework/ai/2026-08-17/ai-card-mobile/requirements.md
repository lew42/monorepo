# AI dashboard card overflow at 390 (mastermind-layout dispatch)

## Ask, verbatim (from mastermind-layout dispatch)

The site's first ever mobile sweep (169 pages at 390 and 720; record in
`public/framework/ai/2026-08-17/mobile-sweep/task.jsonl`) found this as the
worst mobile-only regression:

> `/framework/ai/` scores 82/B at 1280 and 58/F at 390. A task card's
> title-and-tag row overflows 119px — 36% of its own width — past the card's
> right edge, on 15 of roughly 105 cards. Confirmed by eye in a screenshot,
> and stable at 350ms, 1500ms and 3000ms settle, so it is not a settle
> artifact.

Steps requested:
1. Reproduce at 390 with `analyze()`, read the finding (rule, selector,
   `:nth-child()` address, proposed declaration). Confirm by eye with
   `mcp__site__shot` at 390 and 720. If it does not reproduce, say so and
   stop.
2. Find the row (`ext/AITask` `card.js` / `ai.css` are the likely homes —
   confirm). Decide what the title+tag row should do on a phone: wrap,
   stack, or truncate. Use `layout-design`'s sizing questions.
3. Fix at the right rung (`css-strategy` ladder). Read `ext/AITask/readme.md`
   Traps first — `ai.css` was rescoped last night for a different mobile bug
   (routed/unrouted rail split); reuse that pattern if applicable, don't add
   a second mobile breakpoint.
4. Verify at 390, 720, 1280, 3440: overflow gone at narrow end, nothing
   changed at wide end, card still reads as a card. Before/after screenshots
   at 390 and 1280. Confirm via `analyze()` no new finding appeared.
5. Check a long task name specifically — one of the 15 overflowing cards,
   not just a median title.
6. Record it in `ext/AITask/readme.md` beside last night's mobile note.

## Scope / fence

May write only: files under `public/framework/ext/AITask/`, this task dir,
and the generated `public/framework/ai/usage.json`.

Do not touch: `framework.css`, `/styles.css`, `Page.css`,
`public/framework/ext/catalog/**`, `public/framework/ext/LayoutTool/**`,
`public/framework/ext/Panel/**`. If the correct fix lives outside the fence,
stop and report it with the exact declaration.

## Proposed steps (also the launch `steps` array)

1. Reproduce with analyze() + screenshots at 390/720
2. Read ext/AITask readme (traps) + card.js + ai.css
3. Decide phone behavior for title+tag row
4. Implement fix at correct CSS rung
5. Verify 390/720/1280/3440 + long-title card
6. Re-run analyze() to confirm no new finding
7. Document in readme.md
8. Land
