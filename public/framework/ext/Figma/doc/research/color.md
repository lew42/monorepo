# Colour: one Fill token, or a Bg + Surface split? (research + test, 2026-11-17)

Answers question C of [the brief](../brief-2026-11-17.md); the owner's reasoning is [section 2 of the owner's words](../owner-words-2026-11-17.md#2-other-ui-kits-properties-vs-variants-color-tokens-previews). Lew42 v2 was not touched; the test ran in the scratch file. **V** = verified by reading the source; **R** = reported by a secondary source.

## The answer

**Split it (option 4).** Each Scheme mode gets two fills: `bg` for sections and `surface` for cards. Then a card left on Auto always stands out from the section it sits in, and a group of cards dragged into a Dark section turns dark by itself. Every major system we checked does this, and in the test it took no extra clicks at all: one click on the section changes the section and all of its cards.

Its limit: it gives one step of contrast. A card inside a card is surface on surface again, so an inner box binds `bg` (a "well"), or gets its own mode.

## What the test showed

Page **[Lab · Surfaces](https://www.figma.com/design/woCZQDoXKJW3GcJPZukW7f?node-id=52-49)** in Claude November 2026, Root `52:57` (3128 × 1582, about 2:1). It has two local collections: `Surface test · one fill` (modes White, Light gray, Dark; `fill`, `text`) and `Surface test · bg + surface` (modes Light, Dark, Prime; `bg`, `surface`, `text`). The numbers below are the contrast between a card's fill and its section's fill, computed in the file (1.0 = identical).

| What | Node | Card vs section | What happened |
|---|---|---|---|
| Option 1, White section, cards Auto | `52:58` | **1.0** | the cards disappear; only their text is left |
| Option 1, Dark section, cards Auto | `52:70` | **1.0** | the same |
| Option 2, mode set on each card | `52:82` | 1.15 | works, at 3 clicks per group |
| Option 3, transparent wrapper set White | `52:94` | 1.15 | works, at 1 click per group plus one more layer |
| Option 4, Light section, cards Auto | `52:117` | 1.15 | white cards on a light gray section |
| Option 4, the same frame duplicated, section set Dark | `52:129` | 1.6 | **the section and all 3 cards flipped with one click** |
| Option 4, section set Prime | `52:141` | 1.51 | deeper prime ground, prime cards |
| Option 4, one card set Prime (an accent card) | `52:153` | 2.26 | an explicit mode still works for a single card |
| **Drag test**, option 1: the group moved into Dark | `52:178` | **1.0** | dark on dark; every card has to be fixed |
| **Drag test**, option 4: the same move | `52:192` | 1.6 | **the cards turned dark surface on their own** |
| Limit: a card inside a card, both Auto | `52:215`, `52:226` | 1.0 | surface on surface; an inner box bound to `bg` reads as a well (1.15 / 1.6) |

The drag was a real move of the same node (`appendChild` from a Light section into a Dark one), which is what dragging does on the canvas. The screenshot at 1:1 confirmed the numbers: option 4's dark cards are clearly separate from the section, and option 1's are not.

## The four options

| | 1 · one fill, Auto | 2 · mode on each card | 3 · transparent wrapper | 4 · bg + surface |
|---|---|---|---|---|
| Drag a group into a dark section | turns dark, but **same on same** | **doesn't flip**: the cards keep their own mode | **doesn't flip**: the wrapper keeps its mode | **flips, with contrast** |
| Card vs section contrast | 1.0 | as chosen | as chosen | 1.15 light, 1.6 dark, 1.51 prime, with no clicks |
| Tokens per mode | 2 (`fill`, `text`) | 2 | 2 | 3 (`bg`, `surface`, `text`) |
| Clicks to theme a section of 3 cards | 1, and it looks wrong | 1 + 3 | 1 + 1 | **1** |
| Extra layers | none | none | one wrapper per group (rule 12's "extra nesting" smell) | none |

## What real systems do

All of them separate the page or section ground from the card surface. None of them uses a single fill.

- **shadcn/ui:** pairs `background`/`foreground` (the page) with `card`/`card-foreground` (elevated surfaces) and `popover`. In light mode both are white, so it relies on a border; in dark mode `background` is `oklch(0.145)` and `card` is `oklch(0.205)`. [V, [theming](https://ui.shadcn.com/docs/theming)]
- **Shopify Polaris:** `bg` (#F1F1F1) is the admin page background and `bg-surface` (#FFFFFF) is cards. That is exactly option 4's Light mode. [R, [token source](https://github.com/Shopify/polaris-react/blob/main/polaris-tokens/src/themes/base/color.ts), [summary](https://www.codersy.com/blog/shopify-ui-ux-and-design/top-7-shopify-polaris-color-guidelines-explained)]
- **Material 3:** `surface` (the ground) plus five `surface-container` levels, from lowest to highest. Cards use `surfaceContainerLow` when elevated, `surfaceContainerHighest` when filled, and `surface` with an outline when outlined. Elevation is expressed as a tone step, not a shadow. [V for the values, [MDC Color.md](https://github.com/material-components/material-components-android/blob/master/docs/theming/Color.md); R for the card mapping, [summary](https://gist.github.com/Maxiviper117/3838e8028e5d210fe2a4603618c6848c)]
- **Atlassian:** `elevation.surface` (the default), `.sunken` (a well, "only on the default surface level"), `.raised` (cards, always with a raised shadow) and `.overlay`. "Don't use [raised] to group content when a border or white space would suffice." [V, [elevation](https://atlassian.design/foundations/elevation)]
- **Apple:** primary, secondary and tertiary system backgrounds, each "layered on" the one before, in a plain set and a grouped set. In dark mode there are base and elevated variants, because shadows don't read on dark. [R, [summary](https://mackuba.eu/notes/wwdc19/implementing-dark-mode-ios/); the HIG page didn't render for the fetcher]
- **Radix Themes:** steps 1–2 of each scale are backgrounds, and `--color-panel-solid` is "panel backgrounds, such as cards, tables, popovers". [V, [color](https://www.radix-ui.com/themes/docs/theme/color)]
- **Untitled UI:** ships semantic background variables (`bg-primary`, `bg-secondary`, …) for light and dark. Its roles page didn't render for the fetcher, so the exact mapping is unchecked. [R, [dark mode](https://www.untitledui.com/react/docs/dark-mode)]
- **Figma, mode inheritance:** a layer on Auto "take[s] on the mode of their parent container … until they reach a container with a specified mode", else the collection's default mode. [V, [Modes for variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)] This is the mechanism option 4 relies on, and it held in the test.

What's different about us: those systems theme the whole page (light or dark). We theme section by section, which is exactly where a single fill fails, so the split matters more for us than it does for them.

## What this means for Lew42 v2

**Recommendation: adopt option 4 in the Scheme collection, in one small change.**

1. Rename Scheme `fill` to `bg`. Bindings are stored by variable id, so every bound section keeps working (to be checked on one node right after the rename). Then add `surface` to every mode. Proposed values, by mode:

   | Mode | `bg` | `surface` |
   |---|---|---|
   | White | white | Colors `light` (cards go light gray, or keep them white and rely on a shadow) |
   | Light gray | Colors `light` | white |
   | Dark | a step darker than `dark` | Colors `dark` (#433E37) |
   | Prime | a deeper prime | Colors `prime` |

2. The Card master binds its fill to `surface`; section and band frames bind `bg`. Cards stay on Auto.
3. To make one card an accent, set its mode (Prime). That still works: the accent card measured 2.26 against its section.
4. A box inside a card binds `bg`, and reads as a well.

**Rule 4 in rules.md, if adopted:**

> **Colour by Scheme.** A section binds fill = Scheme `bg`; a Card binds fill = Scheme `surface`; text = Scheme `text`. Set the Scheme mode on the section, and its cards follow on Auto and still contrast with it. Set a mode on a single card only to make it an accent. A box inside a card binds `bg` (a well). No darken/transparent tokens.

The old line "a surface's scheme differs from its parent surface's (White card on Light gray section)" goes away: the token pair does that job now, so nobody has to set it.

**Alternatives a reader would ask about:**

- **Option 3 (a transparent wrapper)** needs no new token, but it adds a layer to every group and doesn't flip when the group is dragged. It would win only if no new token is allowed at all.
- **The Material 3 style, five container levels:** this handles any depth of nesting, but it is five tokens where one does the job. It would be worth it only if cards inside cards became common.

**Open:** white `text` on `surface` in Prime is the 2.59 the owner already accepted (white on #FF7950). The deeper-prime `bg` raises it. Muted text still needs a contrast check once the values are real.
