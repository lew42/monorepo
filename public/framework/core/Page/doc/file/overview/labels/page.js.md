Fourth in the rail, and the one whose subject the CSS record calls out by name:
the `guide` tree's three children each declare a different combination of
`label`/`icon`, and the rail beside the render is hand-built from `nav_for()`
rather than borrowed from a harness flag.

## Why this file specifically got rewritten (per `../readme.md`)

It used to render a rail via a `rail: true` harness option while its printed
source said nothing about rails at all — "every displayed source must contain the
thing the card promises" names this file as the violation. The rail is now built
in the tree itself, with a code comment (`// the rail: one link per child`) that
prints because it is *inside* the tree function.

## Improvements

1. **No `doc/file/overview/labels/page.js.md` existed.** *(simple, important —
   done in this pass.)*
