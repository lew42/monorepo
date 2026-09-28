# Object — a card that shows an instance instead of explaining it

A [Content](/framework/ux/Content/) module, but a plain, stateless one: it reads nothing,
writes nothing, and draws once. Give it any real object — a class instance, a class
itself, or a plain object — and it shows the class name, the instance's own name when it
has one, its properties as `name = value`, and its methods by name.

## Use
```js
import { object } from "/framework/ux/Content/Object/Object.js";

object(somePage)                              // an instance
object(Page, { doc: "/framework/core/Page/" }) // a class, methods link to its doc pages
object(plainThing, { inline: true })           // the compact look
```
One call, like `new Question({...})` — everything it needs arrives as one data object.

## Watch out
- `doc` is the ONLY way a method name becomes a link (to `<doc>doc/method/<name>/`, the
  url every [`ext/Doc`](/framework/ext/Doc/) module already answers). This card cannot
  guess where a class's docs live, so pass it whenever you know it.
- Properties skip functions and DOM/View nodes by default; pass `properties: [...]` to
  choose exactly which ones show.
- A long value is cut to one line; hover it for the full text (a `title` attribute).

## More
- [Live demo](/framework/ux/Content/Object/) · [shape](/framework/ux/Content/Object/doc/shape/)
- Used once already: the [`Page` API tab](/framework/core/Page/api/) opens with this
  card, so "what does a `Page` have?" is answered by looking, not reading.
