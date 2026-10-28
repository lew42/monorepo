# InstanceTree — spec for the live instance hierarchy (built 2026-10-13)

> **Old way (deprecated 2026-10-28):** this page teaches or uses `page.children`; the replacement is `page.pages` (a List). Guide: [migration-children-to-pages.md](/framework/core/Page/doc/migration-children-to-pages.md).

**Built:** [`InstanceTree.js`](/framework/ux/Content/Object/InstanceTree.js), page [/framework/ux/Content/Object/instance-tree/](/framework/ux/Content/Object/instance-tree/), doc [ux/Content/Object/doc/instance-tree.md](../../ux/Content/Object/doc/instance-tree.md); toggle in the dev bar `page` tab. Below is the original spec.

The ask (dictation 3, 2026-10-13): while we build an object-oriented system, show on screen its live instance hierarchy, beside the demo.

**What exists:** `view(thing)` in `ux/Content/Object/DefaultView.js` draws any object as an open-able item tree, and `Page.track(this)` makes every Page findable ([the Page object](/framework/ux/Content/Object/page/), [the App object](/framework/ux/Content/Object/app/)). Both show one instance you open by hand.

**What is missing:** a view that starts at the running App and follows the router, so the tree always shows the page you are on, its children, and their classes, and updates when one changes.

- Name: `InstanceTree extends View`, in `ux/Content/Object/InstanceTree.js`.
- Renders: root = `App`; each node = class icon + class name + `title`; children = `page.children`; the current page highlighted; click opens its `view()`.
- Reuses: `track()` for the instances, `DefaultView` for a node's properties, `Property.of` (core/Property) to redraw on change. No new store.
- Where it shows: a toggle in the dev bar and one panel on each class demo, beside the rendered view.
