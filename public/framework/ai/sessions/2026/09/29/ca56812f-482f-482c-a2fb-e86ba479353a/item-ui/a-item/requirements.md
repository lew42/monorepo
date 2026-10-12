# Minion A — the icon item (`ui/item`)

Load the `minion` skill first, then `code`, `css`, `new-css-class`, `new-page`, `page`.
The owner's words: `public/framework/ai/sessions/2026/09/29/ca56812f-482f-482c-a2fb-e86ba479353a/item-ui/owner-words.md` (read the "icon items" part in full). The task brief: `../requirements.md` (Phase 1 is yours). Card: `2026/09/29/item-ui-and-object-views-icon-items-tree`.

**Work only in the worktree:** `C:\Code\lew42\worktrees\item-ui` (branch `worktree/item-ui`, its own server at http://localhost:49318/). Commit there, by exact path. Never edit the main tree's copy of these files. Log in your own `task.jsonl` beside this file (main tree path, append with `node .claude/hooks/append.mjs`).

## What to build

The owner: "it's just a single line, an icon, and a name. Usually that would fill a full row, although you could have inline variants … The padding should be roughly the button's padding … could have a right side icon like a menu button or an arrow for a link. Could be expandable … summary in detail … like the file tree … each file in a file tree often has an icon and it's a nested or indented tree of items. … If you put a class of item on something, then here's a whole system for configuring the layout, the expandability."

1. **`public/framework/ui/item/`** — the class word `.item` (names are decided: folder `ui/item`, factory `item()`, CSS class `item`; the owner chose `item`, so it takes no `ui-` prefix — record that in `styles/css-scopes.txt`). One row: optional icon, then a name; fills the row by default; an inline variant (`.item.inline` or a span) exists. Padding ≈ a `.btn`'s (read framework.css `.btn` and the button padding tokens; match or tighten, and say which).
2. **Optional parts:** a right-side icon (a ⋯ menu button, or → when the item is a link); expandable when it has children, built on native `<details>`/`<summary>` (the summary IS the item row); nesting with indentation, so items make a tree like a file tree.
3. **The factory**: `item({ icon?, name, href?, end?, open?, children? })` → one element; `children` an array of the same shape (or a function that draws). Keep it one small file plus its CSS; house style from the `code` skill (parts reached through `this.constructor` if you make a class).
4. **Reuse, don't add a fourth tree.** Study `ux/Tree` (rows `.ui-tree-*`), `ux/Content/Concepts` (icon tiles, `.btn.ux-content-tile`), `ux/Content/Disclosure` (details stacks + its `variants/` page), and `ext/files` (the file explorer tree). Where one of them could simply wear `.item` for its row at low risk, say so in `ui/item/doc/reuse.md`; do NOT restyle them in this pass (keep v1 of anything reachable).
5. **core/Item** (persistence): read `core/Item/readme.md` and `Item.js`. Write `ui/item/doc/core-item.md`: merge vs. keep separate, with reasons, and one recommendation. Don't change core/Item.
6. **Page** `ui/item/page.js` (show, don't tell): at the top, one live tree of items (a folder tree, some with ⋯ and → ends) at full width; below it the variants side by side (plain, with icon, inline, link with arrow, menu end, expandable, nested three deep). Append `item` to the `children:` string in `ui/page.js` the way `background scale section` are appended (NOT into BANDS; the band sizes are load-bearing). `readme.md` (index shape: what · Use · Watch out · More) and `doc/`.

## Done means
- [ ] http://localhost:49318/framework/ui/item/ loads with zero console errors and zero failed requests.
- [ ] Screenshots at 1920 and 400 (Playwright headless; probe script in the scratchpad, named `item-ui-a-*.mjs`), saved beside this file as `shot-1920.png`, `shot-400.png`, and you have looked at them.
- [ ] Committed in the worktree. Reply to your parent with: files changed, the two screenshot paths, the padding you chose, and the core/Item recommendation in one line.

Never: touch the main tree's copies, restart any server, open windows (`windowsHide: true` on every spawn), edit core/Item, ux/Tree, ext/files. Budget: about $4.

