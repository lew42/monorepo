# A readme as the page

This whole block of text — every word of it — is `readme.md`. The page's own code just
points at this file and asks it to be the content:

```js
content(){ return md.file(import.meta, "readme.md"); }
```

That's the whole pattern: one file, `readme.md`, is both the page's documentation *and* the
page's content. Whatever an AI reads here is exactly what a person sees when they open this
page. No copy can drift out of sync, because there is only one copy.

Under this text is one thing built in JavaScript instead of markdown: a row of icon links.
Markdown can't build that kind of widget on its own — for that, the page's `content()` calls a
little JS after `md.file()` returns. Mixing the two, readme first and JS second, is the normal
shape: the readme carries the words, the JS carries anything that needs a class, a click
handler, or live data.
