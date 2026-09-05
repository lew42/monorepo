# paging-rightnav — build brief

Less is more · clarity is the exception · prioritize. Read [`../paging/requirements.md`](../paging/requirements.md) (the program: plan, vocabulary, the owner's ask) and [`../mastermind-platform/minion-rules.md`](../mastermind-platform/minion-rules.md) first; both are mandatory. Skills: `new-task` (this dir, group `paging`), `code`, `layout`, `new-page`, `css` + `new-css-class` (prefix `paging-`) only if a class is truly needed, `ui-test`, `documentation`, `finish-task`.

**The owner's ask, verbatim:** "work on a right column navigation system: it's like a right property sidebar, where the right sidebar remains persistent. when you click an item in this right column tree, it switches the main (center) content area to be the new page."

## Deliverable

`public/imagine/paging/rightnav/` — a demo tree: `page.js` is the system (a persistent tree on the right, a centre area that `swap`s to the clicked page; the tree never moves), with three or more real child pages of different content sizes (`s`, `m`, `xl`) so switching means something; nested children in the tree expand in place (`expand_more`), the current item is marked. A toolbar of chips switches the variants without more pages: tree width (narrow / wide), side (right / left), placement (`inside` the card / `outside` on the frame), and what happens at 400 (the tree collapses to a bar). Remembered with `store()`.

## Build from what exists

Read `public/framework/ext/drawer/readme.md` (the right rail), `ext/layout/readme.md` (push drawer, toolbar), `ext/Panel/readme.md` and `core/Page/doc/panels.md` (regions), `core/Page/doc/columns.md` (a `swap` is a page replacing its box's content — see how `demo.app()` and columns' `default` child do it), `ext/catalog/` (a rail of previews). Use the words the framework has; a new class only if the `new-css-class` census says nothing fits.

## Prove it

`ui-test`: click three tree items in turn → the centre's url and content change each time, the tree's rect does not; expand a nested item; the 400 collapse. Screenshots at 400, 1280, 3440 in your task links; zero console errors.

## Fences

Write only `public/imagine/paging/rightnav/` and this task dir (and `css-scopes.txt` via the skill if a class is born). The mastermind wires `rightnav` into the hub. Budget ~200k tokens.
