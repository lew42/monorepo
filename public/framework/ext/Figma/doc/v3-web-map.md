# Lew42 v3 (Figma) and the web: one design system, mapped (2026-11-25, proposal)

**The conclusion: the two already share most of the system (Montserrat, one orange accent, white cards, the same heading ratios for h1 and h3, the same status colours). They disagree in three places: the orange's exact value, how big text gets on a desktop, and how roomy padding and gaps are. Each is a one-value decision, listed at the bottom; nothing is renamed and no token was changed.**

Measured, not recalled: [measure.md](/framework/ai/sessions/2026/11/25/spawned/mastermind-forms/measure/measure.md) (Figma variables read from [Lew42 v3](https://www.figma.com/design/JYGQX0WaBO4HcGMZTkL2rx/Lew42-v3); the site read with `getComputedStyle` at 400, 1000 and 1920 inside the lew42 theme). Older bridge for the Sept-2026 file: [token-sync.md](./token-sync.md) (its `--fig-*` tokens are superseded by this page).

## Which name is which

| Figma v3 | Web | Same? |
|---|---|---|
| text style `h1` `h2` `h3` `h4` | elements `h1`–`h4` (or `.h1`–`.h4` on any element) | h1 3× and h3 1.5× match; h2 is 2× in Figma, 2.25× on the web; h4 0.75× vs 0.875× |
| `body` | `p` and body text | same family; Figma Medium 500 with 180% line height |
| `label` | `label` | Figma Bold, web Medium |
| `small` | `small` | 0.75× vs 0.83× |
| `code` (JetBrains Mono 14) | `code`, `pre` (`--mono`: Consolas) | different typeface |
| Color Mode `text` | `--ink` | near: Figma black at 80%, web #3f3f3f |
| Color Mode `muted` | `--subtle` | near: 55% black vs #6a6a6a |
| Color Mode `fill` | `--surface` | white in light; dark mode differs |
| Color Mode `lighten` / `darken` | `--lighten-1` / `--darken-1` | same idea, different steps |
| Colors `prime` | `--prime` | **no**: Figma #FF7950, web theme #FF8F60 (framework base #FF6157) |
| Colors `light` / `dark` | `--light` / `--dark` | near |
| Colors `error` `ok` `warn` | `--error` `--ok` `--warn` | yes in light; the web also has dark values |
| Colors `tint` | `--tint` | near (5% vs 3.5%) |
| Scale `size/1` | the body font-size | 14 / 16 / 20 in Figma; the web is fluid, 14 / 14.6 / 16 |
| Scale `pad` / `gap` | `--pad` / `--gap` | Figma is roomier: pad 42 / 64 / 80 vs 14 / 15 / 32; gap 28 / 32 / 60 vs 14 / 15 / 24 |
| Scale `text-gap` | `--flow` | different meanings (Figma: between text items; web: between flowing blocks) |
| Scale modes 500 / 1000 / 1920 | viewport width (the clamps bend at 1920) | the web has no steps, it slides |

Only on the web: `--line` (borders), `--radius`, the control box (button, input, select share one height). Only in Figma: `master` (the purple that marks masters; a Figma tool, not needed on the web).

## How the forms kit uses it

The kit (`/framework/ux/Form/`) uses only the web names above (`--ink --subtle --surface --line --prime --radius --pad --gap`, the control grammar) and sizes everything in `em`. Whatever is chosen below, the kit follows with no edit.

## The three decisions (smallest change first; nothing done until the owner picks)

1. **One orange.** Three values exist. Recommended: the web theme takes Figma's `#FF7950` (one line in `styles/layers/theme/lew42/lew42.css`). Alternative: Figma takes `#FF8F60`. Either way the framework's own `#FF6157` stays the un-themed default.
2. **Text size on a desktop.** Figma's body is 20 at 1920, the web's 16 (25% smaller); at 1000 it is 16 vs 14.6. Recommended: leave both until a page is compared side by side at 1920, because raising the web's clamp changes every page. Alternatives: the web clamp re-anchored to 14 / 16 / 20 (one line in `framework.css`), or Figma Desktop `size/1` to 18 (the alternative already named in [v3-scale.md](./v3-scale.md)).
3. **Room.** Figma's pad and gap are two to four times the web's. Most of that is meaning, not value: Figma `pad` is a whole frame's padding, the web's `--pad` is a page margin and `--pad-card` a card's. Recommended: no change; match a card to a card when one is compared.

Small additive proposals for Figma (ask first): a `line` colour and a `radius` number, so borders and corners stop being literals. For the web: h2 at 2× and small at 0.75× to match the Figma ratios (two lines in the theme).
