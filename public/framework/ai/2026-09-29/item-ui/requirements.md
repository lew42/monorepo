# Item UI and object views: requirements

The owner's words are in `owner-words.md`; read them in full. Two phases, one task, because object views are built FROM items.

## Phase 1: the item (icon item)
1. **One line: an optional icon, then a name.** It fills the row by default; an inline (span) variant also exists. Padding is roughly a button's standard padding (check it against ui/button; tighten if needed).
2. **Optional parts:** a right-side icon (a ⋯ menu button, or an arrow when it's a link); expandable (built on native summary/details, so an item can be a summary that opens); nesting and indentation, so items make a TREE, the way a file tree does.
3. **A class word:** put `item` on an element and the system configures it (layout, expandability). Relation to core/Item (persistence): study it, then propose merge vs. keeping them separate, with the reasons. Don't break core/Item.
4. Reuse ux/Content/Concepts (icon tiles), Disclosure (and the summary-styles variants being built now) and the file explorer's tree. Unify where it's cheap; don't build a fourth tree.

## Phase 2: object views (every instance can be a card)
5. **Study all the modules** in framework/: which classes are object-like, and which already have a view (ux/Content/Object is the object card built 09-28). A table: class, has a view?, is worth one?
6. **A default view, automatically:** a view that walks an instance's own properties and renders a best guess as nested items. Property names show with a leading dot (`.children`, `.nav`); the instance shows as "a Page". It can be overridden with the owner's pattern `Thing.View` (`class Thing { static View = class extends View {…} }`, as `thing.view`).
7. **Instance tracking, opt-in:** `Class.track(this)` in the constructor, so a doc page can show live instances.
8. **First uses:** a live Page object on /framework/core/Page/ (name, "instance of Page", children, nav, files…), and the App (current route and settings).
9. **Write the pattern into the `code` skill** (an OOP section: `Thing.View`, `track`, the default view), briefly.

## Rules
Keep v1 of anything you restyle reachable. Use a pool worktree, the smoke test, merge.mjs, a fresh-eyes review, and screenshots at 1920 and 400. At most 3 minions; budget about $12. Post progress on card 2026/09/29/item-ui-and-object-views-icon-items-tree. task-mastermind-page-system owns core/Page content, so coordinate before adding the Page object there.

