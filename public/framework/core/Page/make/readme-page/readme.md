# A readme as the page

This whole block of text — every word of it — is `readme.md`. When a page is nothing but its
readme, its whole `content()` is one line:

```js
content(){ return md.file(import.meta, "readme.md"); }
```

That's the whole pattern: one file, `readme.md`, is both the page's documentation *and* the
page's content. Whatever an AI reads here is exactly what a person sees when they open this
page. No copy can drift out of sync, because there is only one copy.

Under this text is one thing built in JavaScript instead of markdown: a row of icon links.
Markdown can't build that kind of widget on its own, so this page's `content()` runs a little
JS after `md.file()` too — and the moment JS follows, `content()` can no longer just return the
promise, so it appends it onto a real box instead:

```js
div().append(md.file(import.meta, "readme.md", { h1: false }));
```

Mixing the two, readme first and JS second, is the normal shape: the readme carries the words,
the JS carries anything that needs a class, a click handler, or live data.
