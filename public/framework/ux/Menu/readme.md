# Menu — a `<details>` menu you can extend: `ui/menu`'s one line, opened up

`ui/` still owns every `.ui-menu-*` rule; this owns the state, the listeners and the
lifecycle the template deliberately never had — close-on-pick, and click-outside.

## Use
```js
import Menu from "/framework/ux/Menu/Menu.js";

const m = new Menu({
	items: [{ text: "Rename" }, { text: "Duplicate" }, { text: "Delete", href: "/delete/" }],
	onPick(item){ … },
});
m.open();    // m.close() too — both toggle the native <details> open attribute
```
An item with `href` navigates like any link; every item closes the panel first, whether
it navigates or not. `label` sets the trigger text ("Actions" by default).

## Watch out
- **`pick(item)` is the seam**, not `onPick` alone — a subclass overrides the method to
  add a confirm step or a second effect, same as `Tree.selected_change`.
- **Click-outside adds and removes a `document` listener** on every open/close, driven
  off the native `toggle` event so it never depends on catching the click that opened it.
- **`ui/` must never import this.** Imports flow down, and that cycle breaks only on a
  deep reload — [`ux/doc/system.md`](/framework/ux/doc/system/)

## More
- [Overview](/framework/ux/Menu/) — a file-actions menu, live · [words](/framework/ux/Menu/words/) — the same picker under `ui-contrast ui-compact`
- [`doc/decisions.md`](/framework/ux/Menu/doc/decisions/) — the split argued, the click-outside design, why no named extension shipped
- [`ui/menu`](/framework/ui/menu/) — the template half · [`ux/`](/framework/ux/) — the tier
- Files: `Menu.js` (the class, no parts — every item is a plain link)
