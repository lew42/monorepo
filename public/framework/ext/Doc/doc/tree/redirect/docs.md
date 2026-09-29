# `/docs/` resolves to `/doc/`

The convention on this site is `doc/`, singular — 75 modules use it — but someone will
type `docs` out of habit anyway. `Doc.child("docs")` catches that one url segment and
resolves it exactly as `child("doc")` would, so a whole url like `docs/method/foo/`
keeps working, not just the bare `docs/`.

A real page actually named `docs` (there are two on this site, both unrelated demo
pages, neither a child of a `Doc`) always wins — this only ever fires when nothing real
already claims the name.
