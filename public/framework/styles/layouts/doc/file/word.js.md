## What this file is

`word(child)` — one class string as an inline child page: a card showing the
shape, a full-size stage with the layout panel wired to it, and the source
template underneath. This is what turns each of Flex's nine words and Grid's
three into a real url instead of a row in a table.

## Overrides the tokens a class string reads, automatically

`TOKENS` maps each word (`gap`, `auto`, `basis`, `measure`, `flow`, …) to the
custom property it reads, so a page built from `word({ words: "flex gap
auto" })` prints "Overrides: `--gap`, `--column`" without anyone hand-writing
that list per word — it falls out of which words were used.

## Improvements

1. **Nothing ranked.** The file is under 70 lines and every one of its four
   functions (`word`, `overrides`, `boxes`, `template`) does exactly one
   small job with no overlap between them.
