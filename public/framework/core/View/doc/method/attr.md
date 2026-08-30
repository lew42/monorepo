**Usage** — ~147 call sites, the third-busiest member. `href()` is a one-line
wrapper over it (`View.js:243`), `stylesheet()` sets `rel` and `href` with it
(`View.js:383`), and every `input().attr("type", "checkbox")` on the site is one.

```js
view.attr("href", "/docs/");   // set, chainable
view.attr("href");             // GET — returns a string or null
view.attr("href", undefined);  // WRITE NOTHING, still chainable
```

**Necessity** — yes. It is the escape hatch that stops the framework needing a
method per attribute.

**Simplicity** — right-sized. Same getter/setter rule as `text()`: **the branch is
decided by whether a value was passed**, never by whether it differs. The `!==`
inside the setter skips the write only, which matters for `contenteditable` — a
re-set moves the caret.

⚠ **`arguments.length`, not `is.def(value)` (fixed 2026-08-29).** Those read the same
until the value you pass *is* `undefined` — an optional url, a label a page did not
declare. The old test called that a question and returned the attribute, so
`.href(nav.url).attr("aria-label", …)` died two calls later on `null` (`ext/demo`'s
preview override, `exhibit.js:143`). One argument reads; two write, and a nullish
value writes nothing and returns `this`. Audited before the change — every `.attr(`
in `public/`: **two** in the getter form (both single-argument, both untouched),
none passing a literal `null` / `undefined`, and **none anywhere** using the return
value as anything but `this`. The blast radius is the bug and nothing else.

There is no `removeAttr` — `attr(name, null)` now writes nothing at all, so removing
an attribute means `view.el.removeAttribute(name)`. Nothing in `public/` needs it.

