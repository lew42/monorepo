# controls — one box for every control

A button, a link that acts like one, a select, a text field, a textarea, a
disclosure summary and a tab are the same rectangle: one height, one padding, one
hairline, one corner, one fill, one hover. The rules live in `framework.css`, in the
block marked **THE CONTROL GRAMMAR** — this directory is the page that shows them.

## Use

- Type nothing. A bare `button`, `input`, `select`, `textarea`, `summary` or
  `.tab` already wears it; `.btn` puts it on an `<a>`.
- Two variants, both filled: `.prim` (the accent) and `.bg` (the dark neutral).
- One size word on the *container*: `.size-small` (0.75), `.size-regular` (1),
  `.size-large` (1.5). It moves the controls inside and leaves the prose alone —
  and (size-apply, 2026-09-06) the same three classes now also carry every box's
  `--pad`/`--gap`/`--flow`: [`/imagine/design/size/`](/imagine/design/size/).

## Watch out

- **The site's skin still overrules the button.** `.theme-lew42 :is(button, .btn)`
  in `styles/layers/theme/lew42/lew42.css` sets its own font-size, weight, case,
  padding and corner at a specificity a flat selector cannot reach — so on this site
  a button is 0.8em and uppercase while the field beside it is 1em. Five declarations;
  deleting them is the whole fix. The page shows the two rows side by side.
- **The height is a `min-height`, not padding.** That is what makes `.size-small`
  exactly 0.75× — see [./doc/grammar.md](./doc/grammar.md).
- `--size` is read by controls only. It is not a zoom and not a spacing level.

## More

- [./doc/grammar.md](./doc/grammar.md) — how the box is built, and every before/after number.
- [/imagine/design/controls/](/imagine/design/controls/) — the 2026-09-01 survey that
  counted 305 clickables into nine accidental families.
- [/imagine/design/size/](/imagine/design/size/) — where `--size` came from.
