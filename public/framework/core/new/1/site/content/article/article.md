# A page whose content is a file

You are reading `article.md`. It was fetched over the network after this page
had already been placed in the document, parsed by `marked`, and appended into a
container that existed before the request started. The page module that produced
it is nine lines long, and one of them does all of this:

```js
content(){ return md.file(import.meta, "article.md", { h1: false }); }
```

## Why `import.meta` and not the document

`md.file` resolves the path against the **module's** url, never the document's.
That is not a stylistic preference; a document-relative fetch is simply wrong on
this site and fails in a way that looks like nothing happening.

The SPA fallback serves `index.html` for every path with no file extension, so
the document url is the *route* — `/content/article/` — and it has no
relationship to where `article.md` sits on disk. Resolve against the document
and you request `/content/article/article.md`, which the fallback answers with
`index.html`, which `marked` parses into a page of escaped HTML. No error, no
404, just the wrong words.

Resolve against `import.meta.url` and you get the directory the module was
loaded from, which is exactly where its sibling files are.

| resolved against | request | result |
| --- | --- | --- |
| `import.meta.url` | `/content/article/article.md` | the file |
| `document` at `/content/article/` | `/content/article/article.md` | the file, by luck |
| `document` at `/content/article` | `/content/article.md` | 404 → fallback → HTML |

The middle row is the trap. It works during development, at exactly the urls a
developer types, and breaks at the ones a reader arrives on.

## What `{ h1: false }` does

A markdown file opens with its own title. A `Page` renders `title` as an `h1`.
Put them together untouched and the reader sees the heading twice, one directly
under the other, in the same size, with no explanation.

```js
if (options.h1 === false && view.el.firstElementChild?.tagName === "H1")
    view.el.firstElementChild.remove();
```

Three lines, and it only removes a **leading** `h1` — an `h1` in the middle of a
document is content and stays. The option is opt-in rather than default because
`md.file` is also used for readmes shown inside `<details>`, where the file's own
title is the only title there is.

## The promise contract

`md.file` returns a promise, not a view that fills itself in later. That choice
is what makes the one-liner above work without any support from `Page`:

- `View.append` sees a promise and routes it to `append_promise`
- `append_promise` awaits it and appends the result to `this`
- `this` is the `div.page` that was captured synchronously

So the fetch cannot land in the wrong parent, because the parent was decided
before the fetch began. Compare the failure mode of an `async content()`, which
returns a promise of a view built *after* the captor moved on — the view lands
in whatever is capturing at that moment, usually `app.$pages`, as a sibling of
every page on the site.

Read the source of the module that rendered this file at the bottom of the page.
It is shorter than this paragraph.

See also: [the capture boundary](/content/blog/2026-08-03-the-capture-boundary/).
