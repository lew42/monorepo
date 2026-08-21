Third of the "Arrangements" group: the `admin` tree is five children with three
different `card:` claims (`two`, `tall`, and two with none) and two with an
overridden `preview()` drawing a live thumb — the one demo in the module that
shows `card:` and a custom `preview()` composing on the same wall at once.

## The comment at the top is load-bearing, not decorative

"A preview override builds fresh DOM per call: a cached render would be stolen
from the card the moment the page itself was shown" — the trap `previews/page.js`
and `doc/method/preview.md` both warn about, restated here because this is the
one demo where getting it wrong would be visible (two children reuse the same
render shape).

## Improvements

1. **No `doc/file/overview/dashboard/page.js.md` existed.** *(simple, important
   — done in this pass.)*
