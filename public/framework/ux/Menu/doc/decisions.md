# Menu — decisions

Landed 2026-08-21, wave 2 of the graduation (`ux/Tree` is wave 1 and the exemplar). Task
log: [`ai/2026-08-21/ux-graduations/`](/framework/ai/2026-08-21/ux-graduations/).

## The caller census, and why the split was simpler than Tree's

`ui/tree`'s `tree()` had a live caller (`ext/Playground`), so the function had to stay
byte-compatible beside the new class. `ui/menu/menu.js` exports **no function at all** —
it is a `css()` call and nothing else. Grepped every `.css`/`.js` under `public/` (`ai/`
excluded) for `ui-menu` and for an import of `menu.js`: the only hits are `ui/menu/page.js`
(its own demo) and `ui/ui.js:19` (the site-wide stylesheet import). Nothing depends on a
function, so there was no compatibility shim to write — the split is purely additive by
construction, not by care.

`ext/layout/controls.js:22` exports an unrelated `menu()` (a `<select>`-based multi-choice
widget, wearing `layout-pick`) that shares the English name and nothing else — the same
collision `ui/menu/page.js` already named. It is not a caller and shares no class.

## Class-name stamp check

`classify()` stamps `.menu` for every `class Menu` instance. Grepped every `.css`/`.js`
under `public/framework` (`ai/` excluded) for a bare `.menu` selector: zero hits. Plain
`Menu`, no `UxMenu` prefix needed.

## Click-outside: one `toggle` listener, not a click listener on `document` from render()

The obvious-looking approach — attach the outside-click listener once, in `render()`, and
check `this.el.open` inside it — has to also filter out the very click that OPENED the
menu (the summary click that flips `open` also bubbles to `document`). The class instead
attaches the listener only while open, driven by the native `toggle` event, which fires
for **either** direction (a summary click or a script writing `.open`):

```js
this.on("toggle", () => this.el.open ? this.opened() : this.closed());
opened(){ document.addEventListener("click", this.outside); }
closed(){ document.removeEventListener("click", this.outside); }
```

This sidesteps the race for free: the listener is added only AFTER the open toggle has
already happened, so the click that opened the menu is the click that fires it, and
`this.el.contains(e.target)` is true for that click (the target was the summary, inside
the element) — it does not close itself. A click on `pick()` (an item) closes the menu
synchronously, inside the SAME click's handler, before the event reaches `document`, so
the outside listener that would have fired on it is already removed by the time it gets
there. Verified with the headless interaction proof (open, pick, closed — one shot each).

## No named extension

`ui/menu/page.js`'s own doc names two open questions — no light dismiss (deliberate,
`<details>` needs zero JS to be a disclosure) and the Popover API as the eventual native
upgrade — but neither is "the module's own doc asks for a subclass," the bar this wave's
brief set. Popover is a platform migration of the WHOLE template, not a variant a subclass
would express; light-dismiss is what `class Menu` already added as base behavior, not an
opt-in. **Zero named extensions shipped.** Logged, not defaulted past.

## No part: an item is a plain link, not a class

`Tags.Chip` earned a static part because a chip owns its own listener (the ×). A menu
item does none of that — every item's behavior (`preventDefault` when there is no real
href, then `pick()`) is identical and centrally driven by `item()`; there is no per-item
branching the way `Tree.Row` branches on `href`/`kids`. A `Menu.Item` class would be
ceremony around one `<a>` and a click handler that already reads cleanly as a loop.

## Parked

- **Sections / group labels.** `ui/menu/page.js`'s `sections` variant (a `h4 muted` label
  sharing `.ui-menu-item`'s inset) is template-only content, not state — it needs no
  class and was left as a `ui/`-only variant, on purpose.
- **ARIA.** No `role="menu"` / `aria-haspopup`. Same call `ux/Tree` made: half a set of
  roles reads worse than none.
