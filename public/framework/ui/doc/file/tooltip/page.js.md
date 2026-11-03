The tooltip exhibit plus two variants: `shown` (the bubble held open via
`.shown`, for a screenshot) and `native` (the `title` attribute — rung 1 of
the CSS ladder, offered as the honest first answer).

## ⚠ The `pad` wrapper is part of the template, not decoration

The bubble is `position: absolute` and out of flow, so any ancestor with
`overflow: hidden` — a stage's screen, a `.demo` box, a card — clips it. The
wrapping `pad` div is what keeps a tooltip at the very top edge visible. The
card's own `preview()` deliberately never renders `.shown`, because a held-open
bubble on a cropped thumb renders as a meaningless sliver.

## Improvements

Nothing ranked: the clipping trap is stated as a ⚠ in the file's own header
comment and again in prose, and the `preview()` override's reasoning is
commented at the call site rather than left implicit.
