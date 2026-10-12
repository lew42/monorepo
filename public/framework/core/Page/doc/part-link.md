# part-link: a block that points at a child page, and promote

A content item that needs its own url becomes a child page; the parent keeps a card that links to it. Live: [/framework/core/Page/jsonl/part-link-demo/](/framework/core/Page/jsonl/part-link-demo/) (three cards, the middle one promoted to [notes/](/framework/core/Page/jsonl/part-link-demo/notes/)). Why a link and not an embedded page: [content.md](content.md).

```
{"content":{"add":{"type":"part-link","id":"l1","path":"./notes/","title":"Notes"}}}
```

- **`part-link`** (`parts/PageLink.js`, an `Item` with a `View`): draws a card to `path`. It shows the child's own title and `description` (read from the child's first `page.jsonl` line), the link's `title` until that loads.
- **promote** (`Servex/agents/Promote.js`): moves a block's lines into `<name>/page.jsonl` and leaves a `part-link` in the same spot. Append-only: the parent gets a `remove` and an `add` line, a manifest line goes to `promoted.jsonl`, and `undo` appends the reverse and moves the child aside (never deleted).
  - Script: `node Servex/agents/Promote.js promote <parent-url> <block-id> [name] [--dry]` (`undo` likewise).
  - Page tool: `page_set(path, {"pages":{"promote":{"id":"c2","name":"notes"}}})`.
- **`#id`**: every content row carries `id=<item id>`, so `/page/#c3` scrolls to that block (`PageContent.View.scroll_to_hash`).

The child is drawn by the parent's own `"class"` (one more `../` on a relative path), so its part kinds register.
