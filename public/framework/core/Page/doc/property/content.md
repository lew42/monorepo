What the page is. A function, a value, or a promise.

```js
content(){ md("Body copy."); }                              // captured
content(){ return md.file(import.meta, "readme.md"); }      // a promise
```

**Usage** — read once, by `render()` (`Page.class.js:138`):
`is.fn(this.content) ? this.content() : this.content`. Written by every page on the
site, and by `add()` when a string or function is passed as the whole child
(`Page.class.js:50`).

**Necessity** — the class.

**Simplicity** — right-sized, and the three accepted shapes cost one ternary because
`View.append()` already dispatches on type. The function form runs **as a capture**,
so everything it builds lands in the page with nothing declared; the promise form
works because `append_promise` fills a view that was placed synchronously.

**The trap is the same one as everywhere else:** a `content()` that is `async`
returns at its first `await`, and every factory call after that appends somewhere
else. Capture the container synchronously and fill it in a callback.

Note that `add("name", fn)` and `add("name", "text")` both mean `content` — that is
where the shorthand lands.

