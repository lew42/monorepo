# Layout — space: sizing, wrapping, spacing, flow, the approved layouts, 400 to 3440

Every awkward page got awkward the same way: markup written before its **size** was decided. Answer these before the first line of markup — and again after you look at it, because the second pass is where it gets right.

## Use

**Choose the layout first (C1–C5):** how much room is there → how much content → is it outlined yet → how does it fill the width → which approved layout fits (Standard, Split, Columns, Tile wall, Rail + content, Docs three-region). Live: [/layouts/decide/](/layouts/decide/).

**Then the five sizing questions, one line each:**
1. What container is this going in? (`main`, `wide`, `bleed`, or a card/rail/panel)
2. How big will it be, at 400 / 1280 / 1920 / 3440?
3. What is its own layout? (`.flow` for prose, `flex gap` for a row, `.grid.auto` for tiles)
4. How many containers can the page have? (usually two or three regions)
5. What is its preview on the parent?

**Strong defaults:** a main page works at 3440 as well as 1280 (several columns, or nav beside a centred main); reach for an approved layout before inventing one; rounded corners and gaps go together; screenshot at 1280/1920/2560/3440 before you merge.

**Spacing is one knob, never a constant:** `--pad` / `--gap` / `--flow`, with four rungs under the gap (`--gap-70/50/35/25`). A region takes `.pad`, a framed box takes `.card`, a control keeps its own `em`. `bleed` is for paint only — a framed box or text never bleeds.

Full version, with every warning and measured number: [doc/rules.md](./doc/rules.md). What has bitten before, one line each: [doc/caveats.md](./doc/caveats.md).

## Watch out

- **Sprawl** — a wall of big sections that balances its own columns by real height, never mid-scroll. [`ext/sprawl`](/framework/ext/sprawl/), first used by [`/framework/`](/framework/) itself.
- A wall's column count comes from `auto-fit`, not `auto-fill`, unless the count is fixed and written out as container-query divisors. [doc/rules.md](./doc/rules.md)
- Text never sits at 0 from any edge — the viewport, a rail, a ToC column, or any box with its own ground. [doc/rules.md](./doc/rules.md)
- A layout never jumps: a live list waits behind an "N new" pill; a selected item opens in its own column. [doc/rules.md](./doc/rules.md)
- The colour-and-contrast rules that were written as part of this skill (ratios, how two grounds meet) stay here; [color](/framework/design/color/) links back to them.

## More

- [doc/rules.md](./doc/rules.md) — the full rules, verbatim from the old `layout` skill.
- [doc/caveats.md](./doc/caveats.md) — what has bitten, one line each.
- [doc/space.md](./doc/space.md) — using the space: fluid first, no voids, no clipping, equal heights, masonry, simplest layouts first (suggestions; web and Figma alike).
- [questions.md](./questions.md) — review questions for this system (Layout, Sizing, Wrapping, Flow, Spacing and padding).
- [/layouts/browse/](/layouts/browse/) and [/framework/ext/DesignTool/library/](/framework/ext/DesignTool/library/) — the approved layouts and arrangements, live.
- Templates: [/framework/ui/](/framework/ui/)

## Notes from your asks

- Layout adjustments should be substantial, not two-pixel nudges. ([your words](/framework/ai/sessions/87bec773-d6dd-421c-92cc-fdd8a9eb5103/?tab=coverage#p11077), 2026-10-12)
- Hold off on a major overhaul: once the layout system works, revisit the broken pages for better layouts. ([your words](/framework/ai/sessions/87bec773-d6dd-421c-92cc-fdd8a9eb5103/?tab=coverage#p10902), 2026-10-12)
- A new in-between layout token is added only when the minimal set truly cannot express the need. ([your words](/framework/ai/sessions/f155ecbd-2911-4f55-bc4c-c1cf9d7b7026/?tab=coverage#p560), 2026-10-12)
- On a phone, previews stack in a single column instead of using multi-column navigation. ([your words](/framework/ai/sessions/f155ecbd-2911-4f55-bc4c-c1cf9d7b7026/?tab=coverage#p560), 2026-10-12)
- Everything fills its width and is responsive unless its height is auto or set explicitly. ([your words](/framework/ai/sessions/f155ecbd-2911-4f55-bc4c-c1cf9d7b7026/?tab=coverage#p6258), 2026-10-14)
