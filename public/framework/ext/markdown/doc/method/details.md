`md.details(meta, url, text)` is [`md.file`](/framework/ext/markdown/api/file/),
collapsed — the batteries-included version for the one place almost every page
wants it: a design record folded at the bottom.

```js
md.details(import.meta, "readme.md", "Design record — the sections, and what was rejected");
```

## Nothing is awaited

It builds a `<details><summary>` synchronously and hands the body a `div.md`
that fills in later — `div.c("md-details-body").append(md.file(meta, url, { h1: false }))` —
so the collapsed control exists immediately and the readme streams in once the
fetch resolves, whether or not the reader ever opens it.

## Always `{ h1: false }`

Unlike `md.file()`, this one has no options parameter — the leading `<h1>` is
always dropped, because the point of `md.details()` is a design record folded
under a `<summary>` line, and a readme's own title would be redundant right
next to that line.

## Default text

`text = "Design notes"` unless you pass a third argument — every real call site
in this repo passes one, usually naming what's inside ("Design record — the
sections, and what was rejected").
