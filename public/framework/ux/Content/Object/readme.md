# Object — a card that shows an instance instead of explaining it

A [Content](/framework/ux/Content/) module, but a plain, stateless one: it reads nothing,
writes nothing, and draws once. Give it any real object — a class instance, a class
itself, or a plain object — and it shows the class name, the instance's own name when it
has one, its properties as `name = value`, and its methods by name.

## Use
```js
import { object } from "/framework/ux/Content/Object/Object.js";

object(somePage)                                       // an instance
object(Page, { doc: "/framework/core/Page/" })         // a class, names link to its doc pages
object(Page, { api: "/framework/core/Page/api/" })     // drawn ON that module's own API tab
object(plainThing, { inline: true })                    // the compact look
```
One call, like `new Question({...})` — everything it needs arrives as one data object.

## Watch out
- `doc` and `api` are the two ways a name becomes a link — this card cannot guess where
  a class's docs live, so pass one whenever you know it. `doc` points at a module's Docs
  tab (`<doc>doc/method/<name>/`), the usual choice; `api` points at that module's own
  API rail instead (`<api><name>/`, no `doc/method/` in the middle) — use it only for a
  card drawn ON that module's own API tab, so a member doesn't get two addresses on one
  screen. `api` wins when both are given.
- Properties skip functions and DOM/View nodes by default; pass `properties: [...]` to
  choose exactly which ones show.
- A long value is cut to one line; hover it for the full text (a `title` attribute).

## More
- [Live demo](/framework/ux/Content/Object/) · [shape](/framework/ux/Content/Object/doc/shape/)
- Used once already: the [`Page` API tab](/framework/core/Page/api/) opens with this
  card, so "what does a `Page` have?" is answered by looking, not reading.
