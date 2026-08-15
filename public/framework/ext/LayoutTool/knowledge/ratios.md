# Ratios, not pixels

A threshold in pixels holds at exactly one viewport and one font scale. Every
rule here is expressed as a **dimensionless ratio** wherever one exists, which
is what lets a single number cover 400px and 3440px with no breakpoint.

The move is always: find the thing the measurement should be *relative to*, and
divide.

| What breaks | The pixel version | The ratio |
|---|---|---|
| Text butting a border | "padding < 8px" | **gap ÷ font-size** of the text that reaches the edge |
| Over-wide prose | "width > 800px" | **characters per line** |
| Content escaping a box | "overflow > 20px" | **overflow ÷ the parent's width** |
| Cramped lines | "line-height < 18px" | **line-height ÷ font-size** |
| Broken rhythm | "gap > 60px" | **largest gap ÷ median gap** in the same stack |
| Wasted widescreen | "600px of blank" | **content span ÷ viewport width** |

## The frame gap

The measurement that started the tool. *How close does the nearest text get to
a box that draws an edge, as a multiple of that text's own font size?*

- `≥ 0.35×` — fine. A 16px paragraph in a card padded 0.6em sits at ~0.6×.
- `< 0.35×` — tight; reported low.
- `< 0.12×` — the text is touching a line it can see; reported high.

Two things make it hold up where a padding check doesn't. It measures the
**text**, not the box, so the common shape — no padding on the card, a margin
on the paragraph inside — reads as fine, because it *is* fine. And it divides
by the font size of the text **at that edge**, so a 45px heading and a 13px
caption in the same card are each judged against themselves.

Reported alongside as **gap ÷ box width** (Mike's original phrasing: padding as
a percentage of width). Useful for reading, weaker as a rule — the same 1em pad
is 12% of a 130px chip and 1% of a 1200px page, and both are correct.

## Characters per line

45–85 is the readable band; this site documents 52em, which lands near 75.

- `> 95` high · `85–95` medium · `< 12 over 5+ lines` high (laddering)

Measured from **line boxes**, not estimated from an average character width: a
`Range` over the element reports one rect per rendered line, so `chars ÷ lines`
is the real measure for the real font. The *False positives* lesson explains why
those rects must be clustered by vertical centre rather than counted by distinct
top — an inline `<code>` sits on the same line at its own top.

## Why penalties diminish

Forty cramped cards are one mistake made once, not forty mistakes. Per-rule
penalty is `weight × (1 + log₂ n)`, so a repeated component costs about four
times a single instance rather than forty times — which is what keeps the score
comparable *between pages* instead of just marking every page with a card grid
as an F.
