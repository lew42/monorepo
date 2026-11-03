`ui.keys(...names)` renders a row of `<kbd>` chips for a keyboard shortcut —
`keys("Ctrl", "K")`.

## What a caller must know

The `+` between keys is a real `<span>`, **interleaved** between separate
`<kbd>` elements rather than baked into one string. `keys("Ctrl", "K")` is not
`kbd("Ctrl+K")`: a screen reader reads two real keys either way, and the
separator can be styled `--subtle` without dimming the keys themselves. That
interleave loop is the one piece of logic that earns this a function instead
of a template — see [Keys](/framework/ui/kbd/) for the two components it
replaced (`key()`, `shortcut()`), which were markup wrapped for no reason.

The box (`.ui-key`, `padding` + `border-bottom-width: 2px` + `0.85em`) is what
makes a `<kbd>` look like a chip instead of inheriting the base theme's plain
mono word — `framework.css` puts `kbd` in the mono list *by meaning* and stops
there deliberately, so the look is this component's to own.

## Improvements

Nothing ranked: the function is nine lines, has real call sites
(`dev/DevBar`, several `ai/*` task pages), and its one piece of logic — the
interleave — is exactly why it survived the review that demoted sixteen of
its siblings.
