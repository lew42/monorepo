What the page is: a function, a value, a promise, or a #List.

```js
content(){ md("Body copy."); }                              // captured
content(){ return md.file(import.meta, "readme.md"); }      // a promise
// Or lazily a List when a content delta arrives:
page.content ??= new List({ owner: page, name: "content" }); // a List
```

**Usage** — read by `render_content()` (`Page.class.js`):
- `this.content instanceof List` → `this.render_content_list()`: draws the list's rows as `.page-content-row.card` blocks, with opt-in drag-to-reorder (`{"sortable": true}`) and reference rows (`{"ref": "/url/"}`) drawn as dark class cards (`#Mention`).
- `is_address(this.content)` → loads remote `page.json`.
- `is.str(this.content)` → wraps in `p(this.content)`.
- `is.fn(this.content)` → calls `this.content()` as a synchronous view capture.

**Necessity** — the page's visible body.

**Simplicity** — right-sized: string, function, promise, or #List.
The function form runs **as a capture**, so everything it builds lands in the page
with nothing declared; the promise form works because `append_promise` fills a view
that was placed synchronously.

**The trap is the same one as everywhere else:** a `content()` that is `async`
returns at its first `await`, and every factory call after that appends somewhere
else. Capture the container synchronously and fill it in a callback.

Note that `add("name", fn)` and `add("name", "text")` both mean `content` — that is
where the shorthand lands. Live list: [`/framework/core/Item/live/`](/framework/core/Item/live/).

