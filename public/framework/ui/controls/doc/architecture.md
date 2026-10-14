# controls architecture — one box for every control

`ui/controls` is the page that shows the control grammar: a button, a `.btn` link, a select, a text field, a textarea, a disclosure `summary` and a tab are one rectangle. The rules are not in this folder. They live in one block of [`framework.css`](/framework/framework.css), marked **THE CONTROL GRAMMAR**, and `ext/tabs` and `ext/Dropdown` read the same numbers. The page ([`page.js`](../page.js)) renders one row of every control, so the rule you read is the row you see. Styles: [`controls.css`](../controls.css).

## One box, written once

**Decided:** every control takes its box from one shared rule in `framework.css`, with no per-control box rules.
**Why:** four separate boxes and a fifth in `ext/tabs` stood 34.6 to 43.7px tall in the same row at 1280px.
**Instead:** a rule per control (what the site had before); each fix then had to be made five times.
**Detail:** [grammar.md, the numbers](./grammar.md#the-numbers)

## The height is a `min-height`, not padding

**Decided:** the box is `min-height: 2.4em`, and its padding is deliberately smaller than the height needs.
**Why:** `box-sizing: border-box` is on everywhere, so `min-height` includes the 1px border and scales with the em. Padding-sized boxes left the border unscaled, so `.size-small` landed at 0.79x, not 0.75x.
**Instead:** height from padding (rejected for the border reason above).
**Detail:** [grammar.md, the box](./grammar.md#the-box)

## `--size` is one declaration

**Decided:** `font-size: calc(1em * var(--size, 1))` is the only place the size knob is applied. Every other length in the rule is an `em` of the control's own font size.
**Why:** a second multiplication would need a second token to keep in step. The default (1) is exactly the base font size.
**Instead:** a size token per length (rejected: more tokens, same result).
**Detail:** [grammar.md, one declaration](./grammar.md#the-box)

## The hairline is `--fill-a32`

**Decided:** every control's border is `--fill-a32`.
**Why:** `--line` (0.15 alpha) measured 1.15:1 against a card and was not visible on a 3440 screen. `--subtle` is a text colour, which made fields look twice as heavy as buttons.
**Instead:** `--line` or `--subtle` (both measured and rejected).
**Detail:** [grammar.md, the hairline](./grammar.md#the-box)

## Hover is an inset shadow

**Decided:** hover and active paint `inset 0 0 0 999px var(--ctl-lift)`, with `--ctl-lift` set to `--fill-a08` (hover) or `--fill-a16` (active).
**Why:** a background swap cannot serve both the translucent default fill and the solid `.prim` and `.bg` fills. An inset shadow sits on top of whatever fill exists, so one rule works for all of them.
**Instead:** background swaps with three rules, one of them only restoring `color: white`.
**Detail:** [grammar.md, hover](./grammar.md#the-box)

## Two variants, both filled

**Decided:** the only variants are `.prim` (the accent) and `.bg` (the dark neutral). There is no `ghost` or `danger`.
**Why:** no caller asks for another; a word with no caller is shelf-ware.
**Instead:** a full variant set (not built).

## ⚠ The site skin no longer overrules the button

The grammar doc ([grammar.md](./grammar.md)), the `THE SKIN STILL OVERRULES THE BUTTON` note in `framework.css`, the `Watch out` line in the [readme](../readme.md) and the page text all say the skin's `button` and `.btn` rule still wins. It does not: that rule is gone, and `styles/layers/theme/lew42/lew42.css` now says "No button rule here on purpose". A button on this site takes the grammar like every other control. The stale text is a documentation fix, not a code fix, and is outside this minion's fence.
