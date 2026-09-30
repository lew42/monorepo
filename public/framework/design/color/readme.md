# Color — colour and contrast: tokens, ratios, light and dark

Colour on this site is never a literal value. It is a small set of tokens (`--surface`, `--wash`, `--ink`, and lighten/darken steps), read through `light-dark()` so one rule serves both themes. This page holds the rules for using them; the vocabulary itself — what each token computes to, the theme file — is [/framework/styles/](/framework/styles/).

## Use

- **Colour is a token, never a literal.** `--surface`, `--wash`, `--ink`, `--lighten-1/2/3`, `--darken-1/2/3`. A component that writes a literal colour has usually reached for the wrong rung; the CSS strategy for this ladder is [/framework/code/css/](/framework/code/css/).
- **Contrast ratios: 4.5:1 for body text, 3:1 for large text and UI shapes.** Below that, nothing. You cannot see 4.2 from 4.6 by eye — measure it.
- **Dark mode is a mode of one theme, not a second theme.** Write `light-dark(a, b)` on the token; never duplicate a stylesheet.
- **Muted text is the `.muted` class**, never `var(--muted)` used as a colour — `--muted` is a percentage (how much a colour fades toward transparent), not a colour value.
- **A box that must read as a box needs a ground that differs from its parent's.** `--wash` IS the page's own ground, so painting `--wash` on a card paints nothing — it disappears into the page behind it.

## Watch out

- `--wash` is the page ground: a card built from it is invisible against the page, not subtly wrong. [doc/rules.md](./doc/rules.md)
- `--muted` is a percentage fed to `color-mix()`, not a colour — `color: var(--muted)` is silently invalid CSS and renders at full strength. [doc/rules.md](./doc/rules.md)
- The accent colour is the pair most likely to fail its ratio, and the full "say the ratio out loud" rule — plus how two grounds read when they meet — lives with the layout rules that wrote it: [/framework/design/layout/doc/rules.md](/framework/design/layout/doc/rules.md#color-meets-color).
- Icons and buttons: their pressable states (hover, active, disabled, `aria-pressed`) are [ui](/framework/design/ui/)'s, not colour's.

## More

- [doc/rules.md](./doc/rules.md) — the tokens and traps, verbatim from the old `css` skill.
- [questions.md](./questions.md) — review questions for this system.
- [/framework/styles/](/framework/styles/) — the theme file, the token definitions themselves.
