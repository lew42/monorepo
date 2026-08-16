## What this file is

`shape()` and `preview()` — a frame with washed regions and no content,
scaled to thumbnail size via its own `--column` argument rather than the
real `14em`. This is the picture behind Flex's and Grid's word cards; the
real layout pages use `demo.layout()`'s own `zoom-25` thumbnail instead (see
`doc/previews.md` for why the two differ).

## `column` is a card argument only

The comment states it plainly: the frame is a few em wide, so the real
`14em` default would make every wall's preview look identical (one column).
It's an argument to `shape()` rather than a `.style()` call on the way out
because the box **declares** the token, and a declaration beats anything a
caller inherits down.

## Improvements

1. **Nothing ranked.** 45 lines, and the one non-obvious decision (why
   `column` is an argument and not an inherited style) is commented at the
   point it would otherwise look arbitrary.
