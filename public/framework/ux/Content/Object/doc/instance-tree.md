# InstanceTree — the live instance hierarchy (built 2026-10-13)

`InstanceTree extends View` (`../InstanceTree.js`): root = `App`, each node = class icon + class name + `title`, children = `page.children`, the current page highlighted, a `view` button opens that instance's `DefaultView`. Demo: `/framework/ux/Content/Object/instance-tree/`. Also the dev bar `page` tab (section "instances").

**What updates live:** a child mounted with `page.add()` (the one hook: `InstanceTree.install()` wraps `Page.prototype.add` to fire a window event), a field change on any page shown (`page.on("change")`), and every route change (`install(app)` wraps `app.navigated` once per app, never per tree). Redraws are batched to one per frame.

**Not live yet:** a plain `page.title = x` on a page built from a config is an own property and fires nothing (the demo then calls `page.emit("change", "title", x)`; `Item.set()` on a data-backed field announces itself); a quiet child load (`children.set`, stubs becoming pages via `load_all_children`) fires no event, so it shows on the next redraw. The property panel (`view`) is a snapshot, redrawn with the tree. `Property.of` is not on `michael/dev` (4 commits sit on `michael/property-of`), so change events come from `Item`'s own `"change"`; switch when that branch lands.
