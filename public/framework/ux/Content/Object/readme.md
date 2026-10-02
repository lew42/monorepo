# Object — show a real object instead of explaining it

Three ways in, all from one real object, a class, or a class instance:

- **`object()`** (`Object.js`) — one small card: icon, class name, `name = value` for
  each property, method names. Reads nothing, writes nothing, draws once.
- **`view()`** (`DefaultView.js`) — a tree of [`ui/item`](/framework/ui/item/)
  rows instead: a header row, then one row per property, and a property that is
  itself an object opens (lazily — nothing under it is read until you click) to
  show its own properties the same way, as deep as you keep going. Best guess by
  default; a class overrides it with its own `Thing.View`.
- **`inspect()`** (`Inspect.js`) — the debug/inspector view, separate from a class's
  own `render()` (it exists even when a class has no `render()` at all). Bigger than
  `object()`'s card, and a property whose value is itself an object nests its own
  `inspect()` card instead of a one-line `Array(3)`. A class gets the SAME icon in a
  heavier frame, listing properties and methods together.

Any class may carry `static icon = "material-symbol-name"` — all three views read it
the same way, falling back to `"data_object"` when a class says nothing.

## Use
```js
import { object } from "/framework/ux/Content/Object/Object.js";
import { view } from "/framework/ux/Content/Object/DefaultView.js";
import { inspect } from "/framework/ux/Content/Object/Inspect.js";

object(somePage)                                       // the small card
object(Page, { doc: "/framework/core/Page/" })         // a class, names link to its doc pages
view(somePage)                                          // the tree — Page has no Thing.View, so this is DefaultView
inspect(somePage)                                       // the debug view — icon, name, properties, nested
inspect(Page)                                           // the SAME debug view, as a class card
```
One call, like `new Question({...})` — everything it needs arrives as one data object.

**Opt a class's instances into being findable at all** with `core/track/track.js`:
call `track(MyClass)` once per class, then `MyClass.track(this)` — one line, in
that class's own constructor. `Page` already does this, which is what makes the
two live pages below possible.

## Watch out
- `object()`'s `doc` and `api` are the two ways a name becomes a link — this card
  cannot guess where a class's docs live, so pass one whenever you know it. `api`
  wins when both are given (`shape.md`). `inspect()` takes the same two.
- All three skip functions and DOM/View nodes by default; `object()`/`inspect()`
  also take `properties: [...]` (and `methods: [...]`) to choose exactly which
  ones show, in order — the way to put "core API" members first.
- A long value is cut to one line; hover it for the full text (a `title` attribute).
- `inspect()`'s `variant: "full"` renders identically to `"card"` today — the owner
  hasn't decided yet what more it should add; see the comment in `Inspect.js`.
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
