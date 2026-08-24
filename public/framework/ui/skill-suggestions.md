# ui/ skill suggestions

For whoever writes `ui-design`. Six things that recurred today across `ux-cards`,
`ux-system-plan` and the five `ux/` builds — evidence, not opinion. These are suggestions
for the owner, minimal and not overly restrictive — not a checklist to enforce.

## Before writing a component

- **Default is zero new CSS.** A variant that composes existing utilities
  (`surface pad flex v gap`) needs no stylesheet — `card`'s four variants and `toolbar`'s
  four shipped with none. If the class would be styled by nothing, it's a second name for
  the utilities: `ui.card()` and `.ui-card` were both cut for exactly that reason —
  [`ui/card/page.js`](/framework/ui/card/) ·
  [`ai/2026-08-21/ux-cards/`](/framework/ai/2026-08-21/ux-cards/).
- **A variant is a different THING, not a different value.** A value belongs on a token —
  `avatar/sizes` became `--avatar`, `stats/summary` became `--column`, and `ui-compact`'s
  step is a `--density` number, not a `micro`/`mini` ladder — `ux/doc/decisions.md`.

## Wiring a new css-only component

- **`ui.js` is not optional.** A component's own `page.js` never imports its own
  `<name>.js` — the page loads only because `ui.js` imports it for the side effect, and
  `ui.js` is what `app.js` loads. Skip the line and the page renders unstyled, silently,
  with no console error. Hit again today: `words/words.js` needed the same line —
  [`ui/readme.md`](/framework/ui/).

## Config words (if the next one gets built)

- **A word replaces a token; it can never scale one.** `calc(var(--radius) * var(--density))`
  self-references and CSS drops the whole declaration — measured at 3.76px against the
  theme's own 3.76px, then removed. A word may only touch a token nothing else declares
  (`--pad`, `--gap`, `--flow`) — [`ux/doc/system.md`](/framework/ux/doc/system/).
- **An inline custom property inherits into whatever sits below it.** Hit three separate
  times today: the words demo itself found it, `ux/Auth` repeated the exact same trap, and
  `ux/card`'s words matrix cited both precedents to avoid it a third time. Read a computed
  value back — don't trust the screenshot — [`ux/doc/decisions.md`](/framework/ux/doc/decisions/).

## Layout at scale

- **Band arithmetic beats band semantics at 3440.** A band of three draws three ~1000px
  cards; `ui/`'s bands are sized 5 · 6 · 5 · 5 so none of them do that — the words demo
  moved Marks from four to five components for this reason alone —
  [`ui/readme.md`](/framework/ui/) ·
  [`ai/2026-08-21/ux-system-plan/`](/framework/ai/2026-08-21/ux-system-plan/).
