# Object — show a real object instead of explaining it

Two ways in, both from one real object, a class, or a class instance:

- **`object()`** (`Object.js`) — one small card: class name, `name = value` for
  each property, method names. Reads nothing, writes nothing, draws once.
- **`view()`** (`DefaultView.js`) — a tree of [`ui/item`](/framework/ui/item/)
  rows instead: a header row, then one row per property, and a property that is
  itself an object opens (lazily — nothing under it is read until you click) to
  show its own properties the same way, as deep as you keep going. Best guess by
  default; a class overrides it with its own `Thing.View`.

## Use
```js
import { object } from "/framework/ux/Content/Object/Object.js";
import { view } from "/framework/ux/Content/Object/DefaultView.js";

object(somePage)                                       // the small card
object(Page, { doc: "/framework/core/Page/" })         // a class, names link to its doc pages
view(somePage)                                          // the tree — Page has no Thing.View, so this is DefaultView
```
One call, like `new Question({...})` — everything it needs arrives as one data object.

**Opt a class's instances into being findable at all** with `core/track/track.js`:
call `track(MyClass)` once per class, then `MyClass.track(this)` — one line, in
that class's own constructor. `Page` already does this, which is what makes the
two live pages below possible.

## Watch out
- `object()`'s `doc` and `api` are the two ways a name becomes a link — this card
  cannot guess where a class's docs live, so pass one whenever you know it. `api`
  wins when both are given (`shape.md`).
- Both skip functions and DOM/View nodes by default; `object()` also takes
  `properties: [...]` to choose exactly which ones show.
- A long value is cut to one line; hover it for the full text (a `title` attribute).
- Most classes should NOT call `track()` — it's for the handful where "see every
  one of these" is actually useful, not a default every class pays for.

## More
- [Live demo](/framework/ux/Content/Object/) · [shape](/framework/ux/Content/Object/doc/shape/)
  (the small card) · [how DefaultView reads a tree](/framework/ux/Content/Object/doc/default-view/)
- Two real, live trees: [the Page object](/framework/ux/Content/Object/page/) and
  [the App object](/framework/ux/Content/Object/app/).
- Used once already: the [`Page` API tab](/framework/core/Page/api/) opens with
  `object()`'s card, so "what does a `Page` have?" is answered by looking, not
  reading.
