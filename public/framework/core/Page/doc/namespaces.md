# Proposal: Page's methods in groups (not built; waits for the owner's yes)

**Status:** proposal, 2026-11-06. Nothing here is built. Improvement entry: [improvements.jsonl](../improvements.jsonl) ("Page namespace").

## The problem

A Page has about 150 methods in one flat namespace (Page 97, Item 30, Events 5, plus a subclass's own). About 50 of Page's are one-line forwarders left by the 2026-10-12 split of `Page.class.js` into helper classes (`Jsonl.js`, `Columns.js`, `Previews.js`, `Links.js`, `Prefs.js`…): `page.settle_columns()` only calls `this._helper("Columns").settle()`. Measured in the [method audit](/framework/ai/sessions/2026/11/06/spawned/mastermind-method-audit/audit.md).

What it costs: a reader (person or agent) cannot tell the page's own API from plumbing; a delta key can hit a plumbing method by accident (a key that names a method calls it); `Page.add` (a sub-page) shadows the list verb `add` (a card).

## The shape

The helpers already exist and are already made on first use (`_helper(name)`). Give each one a name on the page and drop the forwarders:

| Group | Was (examples) | Becomes |
|---|---|---|
| `page.columns` | `column_host`, `even_columns`, `reveal_column` | `page.columns.host()`, `.even()`, `.reveal()` |
| `page.previews` | `preview_card`, `preview_link`, `walls` | `page.previews.card()`, `.link()`, `.walls()` |
| `page.tabs` | `tab`, `tab_state`, `tab_order`, `nav_ready` | `page.tabs.set()`, `.state()`, `.order()` |
| `page.log` (Jsonl) | `log_view`, `log_draw`, `child_file`, `link_child` | `page.log.view()`, `.draw()`, … |
| `page.links`, `page.prefs` | `open_link`, `swap_url`, `prefs` | `page.links.open()`, … |

- **Made on demand:** a getter per group over the existing `_helper`, so a page that never uses columns never builds them.
- **A delta walks into a group like a child:** `{"tabs": {"set": {name}}}`. Each group class declares its own `static callable`.
- **Help stays small:** the item tool prints only the group names and one line each (`groups: {columns: "…"}`); `item({path, get: "help.columns"})` prints one group's verbs when asked. The page's own surface stays the 9 methods plus the `content` list.
- Delete the five dead ones (`settle_columns`, `column_slide`, `scroll_column`, `resize_column`, `in_doc`); rename `Page.add`/`Page.move` to `add_page`/`move_page`.

## Cost and risk

Call sites outside Page.class.js, by a text scan (over-counts generic names): log 394 (mostly `file(`), previews 350 (`preview_card` 140 and `previews` 171, used by hundreds of `page.js` files), columns 83, links/prefs 65, tabs 27. So the renames are a scripted move with a dry run and a manifest (CLAUDE.md), not hand edits. Suggested order: the dead five and the help groups first (cheap, no callers); `log`, `tabs`, `links` next (few callers); `previews()` and `columns()` stay as the two author shortcuts in `page.js`, since hundreds of pages call them.

Estimate: about $15–25 of Sonnet in a worktree, plus a review; the site-wide check is the smoke crawl.

## Alternatives

- **Leave the forwarders, hide them from the help (today).** Costs nothing; the help is already clean. The flat namespace and the `add` trap remain for people reading the code.
- **`Page.use(Columns)` plugins** (the audit's 5b.1): the same grouping, but a page also opts in. Better when most pages don't need a group; a larger change, since every page with columns would have to declare it.
