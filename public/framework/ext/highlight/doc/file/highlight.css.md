Token colours only — no `background`, no `pre`/`code` box model, because
`framework.css` already owns that box and a second opinion here would win or
lose by import order (`readme.md`'s "Own the token CSS" decision). Everything
in this file is one `@layer theme` block.

## Every `--syn-*` token is paired with `light-dark()`

Not optional: a token defined in only one mode falls back to `--code-bg` /
`--wash`, and a light-only palette put dark-mode keywords on a dark box with
no contrast. The pairing is what the comment at the top of the file warns
about, and it is the one thing to check before adding a token here.

## `pre[data-file]` — the label this session added docs for

Styled by a bare attribute selector, not a class, because the label has two
emitters that don't share a class name: `code.lang(src, file)` here in JS, and
a fence's info string (```` ```js /app.js ````) in `ext/markdown`. Both just
set `data-file`, so one rule catches both. Two paired ⚠s worth reading
together:

- `position: sticky; left: 0` — the `<pre>` is `overflow-x: auto`, so an
  `absolute` label would scroll away from its own block on a long line.
- The negative inline margins (`margin: 0 -1em 0.75em`) undo
  `framework.css`'s `pre { padding: 0.75em 1em }` so the label reads
  full-bleed. **The two values are a pair** — changing one without the other
  reintroduces a gap or an overrun on the label's edges.

## Grouped by meaning, not by grammar

One list of `.hljs-*` selectors maps every one of the five languages onto ten
`--syn-*` tokens — `.hljs-string` and `.hljs-selector-attr` share a colour on
purpose, because "a quoted thing" reads the same regardless of which grammar
quoted it. `.hljs-tag` only colours the punctuation (brackets, slash) because
it wraps the whole element and its children repaint the parts inside — the
comment beside it explains why colouring it directly would be wrong, not just
different.

## Improvements

1. **No dark-mode screenshot check exists for this file.** Every token is
   `light-dark()`-paired by inspection, but nothing has rendered a highlighted
   block in dark mode and compared it against the light one since the last
   edit. Cheap to add as a demo variant; not done because no highlighted block
   has visibly broken yet. *(medium, useful)*
