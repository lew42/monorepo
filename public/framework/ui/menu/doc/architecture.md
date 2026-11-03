# Menu architecture — a native disclosure, styled and nothing more

`ui/menu` is the template tier of the dropdown: one stylesheet ([`menu.js`](../menu.js)) for the `.ui-menu-*` classes, and one demo ([`page.js`](../page.js)). It has no class and no JavaScript of its own. Behaviour that needs JavaScript lives in [`ux/Menu`](/framework/ux/Menu/), which wears the same classes.

## No `ui.menu()` function

**Decided:** a menu is written as markup with the `.ui-menu-*` classes; there is no `menu()` helper in `ui/`.
**Why:** a helper's items could only be strings and urls, but a real menu's items run handlers, so the call site has to own them.
**Instead:** a `ui.menu()` helper (rejected: it could show only dead links). The name also collided with `ext/layout`'s `menu()`.
**Detail:** [`page.js`](../page.js) (the "There is no `ui.menu()`" note).

## A `<details>` is the disclosure

**Decided:** the open and closed state is the native `<details>` element, so the menu works with no script.
**Why:** a disclosure with zero JS is the template's whole point.
**Instead:** the Popover API gives light-dismiss and top-layer stacking for free, but needs JavaScript-free invokers plus more markup. It is not used here.
**Detail:** [`page.js`](../page.js) (the "Light dismiss" note).

## No light-dismiss here

**Decided:** an open menu stays open until something closes it. Two open menus stay open together.
**Why:** adding click-outside needs script, and this template has none.
**Instead:** [`ux/Menu`](/framework/ux/Menu/) adds close-on-pick and click-outside as overridable methods.
**Detail:** [`ux/Menu/doc/decisions.md`](/framework/ux/Menu/doc/decisions/).

## Only the panel gets a selector

**Decided:** the trigger is plain `.btn` with utility classes. The `.ui-menu-list` panel gets CSS rules; so does the `summary` marker removal.
**Why:** the panel is positioned against its summary and appears on open. A class list cannot express either relationship or state.
**Instead:** a utility-only panel (rejected for the same reason).
**Detail:** [`menu.js`](../menu.js) (the comment above the `css()` block).

## The close-on-pick line stays at the call site

**Decided:** a template item that should close the menu runs its own `removeAttribute("open")` in its click handler.
**Why:** it is one line, and it is the only logic in the template.
**Instead:** a shared handler inside the template (rejected: it would be the first JavaScript here). Subclassing [`ux/Menu`](/framework/ux/Menu/) is the way to share it.
**Detail:** [`page.js`](../page.js) (the `menu()` template).

## Known trap

⚠ The panel is `position: absolute`. An ancestor with `overflow: hidden` clips it, the same trap as [Tooltip](/framework/ui/tooltip/). The demo wraps each menu in a `pad` div so the panel has room.

## Code check

Checked against `menu.js` and `page.js` on 2026-10-13: the module has no JavaScript behaviour, no `ui.menu()` export, and the `.ui-menu-*` rules match the classes the demo uses. No mismatches found.
