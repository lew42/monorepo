The design record for all fourteen Overview demos as one system — why a directory
per demo rather than an array of tree functions, why the printed source is the
tree function and not the whole file, why titles derive from names and every root
gets its own short name instead of all fourteen saying "Web".

## It is the record for a pattern, not for any one file

Nothing in this readme is specific to `wall/` or `deep/` — every decision here
(one directory per demo, hand-built trees over `ext/demo/sample.js`, the
Basics/Arrangements/Sites grouping) constrains all fourteen `overview/*/page.js`
files identically. Each of those fourteen doc/file entries cites this file rather
than repeating its reasoning.

## The Traps section is where the real gotchas for demo-tree authors live

Eight of them, and at least two are silent-failure classes worth knowing before
writing a fifteenth demo: half the section bands (`hero`, `features`) return
`undefined` and must not be chained on directly, and `--measure: none` on a
`.page.standard` retune silently drops the whole grid template.

## Improvements

1. **No `doc/file/overview/readme.md.md` existed.** *(simple, important — done
   in this pass.)*
