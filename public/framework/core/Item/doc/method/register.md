`Item.register(Class, name = Class.name)` — the last line of every module that
defines a block type: `Item.register(Widget)` or, to rename the wire form,
`Item.register(Widget, "widget-v2")`.

Writes **two** maps: `Item.types` (name → class, for `hydrate` to look up) and
`Item.names` (class → name, for [`wire()`](wire.md) to look up). Both are
populated, always, because hydrate needs one direction and serialization needs
the other.

**⚠ `Item.names` exists *because* a static on the class would be inherited.**
A `static type = "widget"` on `Widget` would be visible on any unregistered
subclass of `Widget` too (`class Sticky extends Widget {}` inherits the static),
so that subclass would silently serialize under its parent's wire name and
hydrate back as the wrong class. The inverse `Map` sidesteps inheritance
entirely — a lookup by the exact constructor, not by a property that JS's
prototype chain would happily forward.

**An unregistered type is an unimported one** by convention: a document's owner
imports its block types explicitly (`import "./blocks.js"` for its side effect
of calling `register`), so an app that never imports a type will never resolve
it — and that's fine, because unknown types [hydrate safely](hydrate.md).
