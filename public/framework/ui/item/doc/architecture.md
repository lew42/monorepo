# item architecture — one row, markup only, the browser holds the state

`ui/item` is one function and one CSS class. `item()` in [`item.js`](../item.js) draws a row: an optional icon, a name, and an optional right-side end. A row with `children` becomes a tree. It has no class of its own and no state, so there is nothing to save or sync.

## Trees are native details and summary

**Decided:** a node with `children` is a `<details class="item-node">`, and its `<summary class="item">` is the row. The browser opens and shuts it.
**Why:** the open state needs no script and no state to track. The owner asked for "a summary in a detail element that expands kind of automatically."
**Instead:** a click handler that toggles a class, as `ux/Tree` and `ext/files` do. That is more code to keep in step with the markup.
**Detail:** [the session that chose it](/framework/ai/sessions/2026/09/29/ca56812f-482f-482c-a2fb-e86ba479353a/item-ui/a-item/)

## A row is flat by default; `.boxed` is opt-in

**Decided:** `.item` resets the control box that `framework.css` gives a summary (background, border, inset shadow). Only `.item.boxed` brings the button look back.
**Why:** a tree of boxed rows read as a stack of buttons, with each branch a grey bar beside the flat leaves (owner, 2026-09-29).
**Instead:** keep every row boxed, the way every plain button on the site looks. A tree then reads as buttons, not as files.

## A leaf keeps the caret's column

**Decided:** an array child that has no children of its own still reserves the caret's width, so its icon lines up with a branch beside it.
**Why:** a file next to a folder, under the same parent, must put its name in the same column as the folder's name.
**Instead:** no reserved column. A leaf's icon then sits left of its siblings' icons.

## A row is a link or a branch, never both

**Decided:** when `children` is set, `href` is ignored.
**Why:** a `<summary>` row has no link to follow, so the `href` would never be read.
**Instead:** a branch that is also a link, which needs a second element on the row. Not built yet.

## Separate from core/Item

**Decided:** `ui/item` stays markup with no state. `core/Item` stays a persisted class. They are not merged.
**Why:** `core/Item` saves to a wire format. Merging would tie plain markup to persistence.
**Instead:** one merged class, rejected for that reason.
**Detail:** [doc/core-item.md](./core-item.md)

## The name: `ui/item` and `item()`

**Decided:** the module is `ui/item` and its factory is `item()`.
**Why:** it uses the owner's own word, `item`. The name clash with `core/Item` is only across folders, so it is accepted.
**Instead:** `ui/row` with `row()`, or `ux/Item`. Two of three naming seats picked `ui/item`.
**Detail:** [the naming session](/framework/ai/sessions/2026/09/29/ca56812f-482f-482c-a2fb-e86ba479353a/item-ui/)

## Padding is tighter than a control's

**Decided:** `.item` pads `0.3em 0.6em`.
**Why:** the control's `0.8em` side padding measured wider than the icon and name at 400px. Rows are read many at once, not alone.
**Instead:** the control's own `0.2em 0.8em`, which fits a button read alone.
⚠ `page.js` says the vertical padding stays at the control's `0.2em`. `item.js` sets `0.3em`. The code is right; the page prose is stale.
