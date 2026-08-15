**Usage** — ~147 call sites, the third-busiest member. `href()` is a one-line
wrapper over it (`View.js:232`), `stylesheet()` sets `rel` and `href` with it
(`View.js:370`), and every `input().attr("type", "checkbox")` on the site is one.

```js
view.attr("href", "/docs/");   // set, chainable
view.attr("href");             // GET — returns a string or null
```

**Necessity** — yes. It is the escape hatch that stops the framework needing a
method per attribute.

**Simplicity** — right-sized. Same getter/setter rule as `text()`: **the branch is
decided by whether a value was passed**, never by whether it differs. The `!==`
inside the setter skips the write only, which matters for `contenteditable` — a
re-set moves the caret.

There is no `removeAttr`. `attr(name, null)` sets the string `"null"`, so removing
an attribute means `view.el.removeAttribute(name)`. Nothing in `public/` needs it.

