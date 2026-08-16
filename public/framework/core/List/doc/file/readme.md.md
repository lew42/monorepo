The maintainer's document: what `List` is, four traps, three verdicts
(including Steve's recorded dissent for using a bare `Array` instead), and one
open item. Like `Item`'s readme, written by the 2026-08-13 council and left
essentially as-is by this audit — a **Used by** section was added, since the
module had no record of who actually imports it.

## Improvements

1. **No "Used by" section existed before this audit.** `List` has exactly one
   real (non-demo) importer — `Item.js` itself — which is itself a finding
   worth stating plainly rather than leaving implicit: this class has no
   caller of its own outside the class it was extracted from. Added; see the
   readme. *(simple, important.)*
2. **The Array dissent is the single most interesting paragraph in either
   readme and is easy to skim past.** It's the strongest argument against this
   module's own existence, recorded faithfully, but it sits as one bullet
   among several rather than framed as the open question it actually is. This
   pair's audit report elevates it explicitly. *(simple, useful.)*
