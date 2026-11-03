# Menu architecture — the template's state and listeners, owned by one class

`ux/Menu` is a `<details>` menu you can drive from code: it closes itself after a pick and closes on a click outside. Its main class is [`class Menu extends View`](../Menu.js), and it is the only file in the module. Its look is not here: every `.ui-menu-*` rule stays in the template, [`ui/menu`](/framework/ui/menu/), and this class wears those classes.

## The CSS stays in ui/, the state moves to ux/

**Decided:** `ui/menu` keeps every stylesheet rule and no JavaScript; `Menu.js` imports that stylesheet and adds the behaviour.
**Why:** the template's one line of logic (close after a pick) has to be per item, and the template could not own it without becoming a framework. Splitting keeps the two tiers from drifting, because both read the same classes.
**Instead:** moving the CSS into `ux/` (two copies to keep in step) or letting `ui/` import the class (an import cycle that breaks on deep reload).
**Detail:** [doc/decisions.md](./decisions.md#the-caller-census-and-why-the-split-was-simpler-than-trees)

## Click-outside listens only while open

**Decided:** a `toggle` listener adds a `document` click listener on open and removes it on close.
**Why:** `<details>` has no light dismiss, and a listener left on `document` after the panel is gone would fire on every later click for nothing.
**Instead:** one `document` listener from `render()`, which has to filter out the click that opened the menu. Attaching it on open avoids that check.
**Detail:** [doc/decisions.md](./decisions.md#click-outside-one-toggle-listener-not-a-click-listener-on-document-from-render)

## `pick(item)` is the seam, not `onPick` alone

**Decided:** every item click calls `pick(item)`, which closes the panel and then calls `onPick`. A subclass overrides `pick()`.
**Why:** a real menu item needs a confirm step or a second effect, and rebuilding the panel to add one is the cost the class exists to remove.
**Instead:** a plain `onPick` callback only. It cannot add a confirm step without rebuilding the panel.
**Detail:** [`Menu.js`](../Menu.js) (`pick`, lines near the end of the class)

## An item is a plain link, not a class

**Decided:** `item()` is a method that makes one `<a class="ui-menu-item">`. There is no `Menu.Item` part.
**Why:** every item runs the same code: prevent the jump when there is no real `href`, then `pick()`. Nothing branches per item, so a class would only wrap one element and one handler.
**Instead:** a static part, as `Tags.Chip` uses, which fits only when an item owns its own listener.
**Detail:** [doc/decisions.md](./decisions.md#no-part-an-item-is-a-plain-link-not-a-class)

## Prototype fields, not class fields

**Decided:** `tag`, `classes`, `label` and `items` are set on `Menu.prototype`, not as class fields.
**Why:** `View` renders inside its constructor, and a subclass class field is set only after that, so `render()` would never see it.
**Instead:** class fields, which fail silently here.
**Detail:** [`Menu.js`](../Menu.js) (the comment above the prototype assignments)

## Not shipped yet

- **Named variants.** None are shipped. Light dismiss is base behaviour, not an opt-in, and the Popover API would be a platform migration of the whole template, not a subclass.
- **Sections and ARIA.** Group labels stay a `ui/` variant, and no `role="menu"` is set, the same call [`ux/Tree`](/framework/ux/Tree/) made.
- ⚠ The doc says the outside listener is removed before the item click reaches `document`. It is not: `toggle` fires after the click, so the listener is still attached. The result is still correct, because `this.el.contains(e.target)` is true for an item click and nothing closes twice.

Related: [`ux/doc/system.md`](/framework/ux/doc/system/) (the tier and its import rule) · [`ui/menu`](/framework/ui/menu/) (the template half)
