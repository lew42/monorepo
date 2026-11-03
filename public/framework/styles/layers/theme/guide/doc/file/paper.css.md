## What this file is

One of the two demonstration themes: warm, serif, printed. 54 lines, tokens
only, `light-dark()` on every colour so both modes live in the one file.

## What it proves

Zero selectors name a component — every rule sets a `--token`, and the
comment at the top states the test explicitly: "if you had to write
`.tab-bar` here, the tab bar was missing a token." It is also the theme that
`styles/readme.md`'s legacy note references: `/styles.css`'s
`body.theme-1` (a real consumer in `alex/`) is described elsewhere as "the
look it describes is paper" — this file is what that name would formalize if
it were ever adopted site-wide.

## Improvements

1. **Nothing ranked.** A four-line header comment states the file's whole
   design in the space the six-artifact checklist asks for, and the file
   itself is short enough to read end to end in under a minute.
