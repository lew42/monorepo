The `keys()` exhibit (a shortcut list) plus two variants: `keys` (three raw
rows) and `bare` (the same words as plain `<kbd>` versus the styled
`.ui-key`, to show what the six declarations in `kbd.js` actually buy).

## Why `key()` and `shortcut()` didn't survive, and `keys()` did

The interleave loop — a `+` **span** between real `<kbd>` elements rather
than baked into the text — is real logic: it's what keeps a screen reader
reading discrete keys instead of one string, and it's the one thing a
template genuinely can't express as cleanly. `key()` wrapped two class names
and `shortcut()` was a flex row; both are now `flex gap v-center split` and
`kbd.c("ui-key surface", name)` written directly, no wrapper needed.

## Improvements

Nothing ranked: the `bare` variant is an unusually direct before/after —
plain inherited mono versus the six declarations in `kbd.js` — and needs no
extra prose to make its point.
