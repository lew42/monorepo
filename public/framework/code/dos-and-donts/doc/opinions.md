# Before you add anything — the house opinions

No npm dependency (`npx`/global tools fine). No black magic — a file that names a class
constructs it. Propose major surgery before doing it. Comments near zero.

**Try** to keep a file under ~100 lines — a signal to look, not a rule. Past it, ask whether a
logical piece wants to be its own class (see [patterns](/framework/code/patterns/) §3 — parts are
classes); split only when the seam is real. Never halve a file to hit a number, and 500 lines that
belong together are fine — the old hard 100 is why modules here carry 5–20 sub-files where another
class in the same file was the answer.

Demos use the five blocks (Page, `previews()`, `ext/demo`, `ext/layout`, utilities) — a sixth is a
proposal. A new module isn't done until it has a `page.js` its parent's `children:` names.
`core/new/1/` is prior art with measurements — read, never import.
