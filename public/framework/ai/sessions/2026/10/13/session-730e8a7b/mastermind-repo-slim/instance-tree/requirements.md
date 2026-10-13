# InstanceTree: the live instance hierarchy of the running page, on screen beside the demo

Budget: $15. Load the `sub-mastermind`, `make`, `code` and `page` skills first. The owner has asked for this many times (the asks tally counts "class architecture" 19 times, last on 2026-10-13: "the class architecture to render a live view of the actual instance hierarchy… still haven't seen that yet", `../requirements-2.md` ask 1; and `../requirements-10.md` ask 2: "simple views to see the object-oriented classes updating in real time… asked a million times and still not seeing it done"). Your log is this dir's `task.jsonl`. CLAUDE.md "Show the class" (the rendered view and a debug view of the live instance side by side), classes not function bags, one of everything.

## The spec already written (build exactly this, then show it)

`public/framework/catalog/doc/instance-tree.md` (the catalog task, today): `InstanceTree extends View` in `ux/Content/Object/InstanceTree.js`; root = `App`; each node = class icon + class name + `title`; children = `page.children`; the current page highlighted; click opens its `view()`; reuses `Page.track()` for the instances, `DefaultView` for a node's properties, `Property.of` (`core/Property`; note `michael/property-of` holds 4 unmerged commits of Property.js: use what is on `michael/dev` today, and say in your log if the branch is needed) to redraw on change; no new store. Shown as a toggle in the dev bar and as one panel on each class demo beside the rendered view.

## Deliverable

1. **The class**, as specified, with its own page (`/framework/ux/Content/Object/InstanceTree/` or where the `make` skill places it): the live tree of the page you are on, updating when a child page mounts or a tracked property changes (prove with a demo that adds a child and changes a title; the tree follows without a reload).
2. **Shown in two places**: the dev bar toggle (find the dev bar: `dev/DevShell`, the dev bar module) and the `ext/System` class card / the catalog's class cards section gets a "live tree" link where a demo page exists. One page, one minion at a time.
3. **Four widths**, smoke clean, `merge.mjs`; a 1200 screenshot of the tree beside a real demo on the card; the catalog's `instance-tree.md` updated from "not built" to "built, here".
4. Report on your card: the link, the screenshot, what updates live and what does not yet.

Fence: `ux/Content/Object/InstanceTree.js` + its page and doc, one toggle in the dev bar module, one link line in the catalog and the `ext/System` card, this task dir. `core/Property` is read-only (the owner decides the property-of merge). Sonnet.
