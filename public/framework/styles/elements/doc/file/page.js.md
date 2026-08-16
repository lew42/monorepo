## What this file is

The index for the seven-page element reference: what's actually styled
(~30 declarations in `framework.css`, no reset library), how to read the
third pane (every `demo()` shows source, result, and the live DOM — not just
a picture), and the routing table to all seven children.

## Why seven pages and not one

The readme's own decision record: grouped by *what you are doing* (writing
prose, showing code, building a form) rather than by spec category, because
that's how a reader arrives. The cost — no `Ctrl+F` across the set — is
named and accepted, with a stated fallback (a flat "all elements" page *in
addition*, not a merge) if it ever bites.

## Became a `Doc` in this pass

`files:` lists this page plus its own readme and the seven children's single
file each, by relative path — the children stay routed as before via
`children:` for their live demo tabs; `files:` adds a second, parallel way
to reach the same seven files' source and a `doc/file/*.md` about each one.

## Improvements

1. **Nothing ranked.** The routing table, the "cover the unstyled elements
   too" principle, and the third-pane argument are all stated once here and
   never contradicted by any of the seven children.
