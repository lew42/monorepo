# The corpus — every page the Router can reach, and how that number is arrived at

A search result is a promise: click it and you land on that page. So the corpus is not "every
directory on disk" and not "every link anybody wrote" — it is **every page the Router can
actually walk to**, and the only honest way to know that is to walk to it.

## Two steps, and the second one is the Router's own

**1. Which urls to try.** `/directory.json` is a listing of the whole `public/` tree that the
dev server writes on every change and the build ships. Every directory holding a `page.js` is
a candidate url. That is 907 of them today.

**2. Which of those are real.** `Router.load_segments()` resolves a url **one segment at a
time** — `/a/b/c/` is `root.child("a").child("b").child("c")` — so a page directory whose
parent has no `page.js` of its own is a url nothing can walk to. Dropping those leaves 838.
Then the five skipped prefixes go (below), leaving ~600 urls to try. Each is loaded with
`Page.load(url, 0)` — the exact call `Page.child()` makes when you navigate — and the ones that
come back a real `Page` are the corpus: **~560, and rising as pages are written.** The page
itself has the live number; every count on this page is what was measured on 2026-09-06.

The handful that fall out are page modules whose default export is not a `Page` plus two that
throw at import. A row you cannot open is worse than a row that is missing, so they are simply
not there.

## Counting it two ways

The two numbers that have to agree:

```js
// in the browser: what the Router actually resolved
app.omnibox.search.candidates   // urls tried
app.omnibox.search.rows.length  // pages in the corpus
```

The **Read the site now** button on [the module's page](/framework/core/Search/) prints both,
live, with the time it took.

They agree by construction — `rows` is the subset of `candidates` that `Page.load()` returned a
`Page` for — which is the point: there is no second list to drift.

## What is deliberately left out

- **`.md` pages.** A `.md` file beside a `page.js` IS a url (`Page.child()`'s last fallback),
  so `/framework/core/Page/doc/columns/` is a real page. Including them would mean fetching
  every markdown file on the site just to read its first `# ` line, and they carry no
  description and no tags. They are not in the corpus and it says so here rather than
  pretending.
- **`route()`-only urls.** A page can claim any undeclared child name at runtime
  (`core/Page/doc/declaring.md`). Nothing on disk describes those, so nothing can enumerate
  them. The AI day pages are the live example.
### The five skipped prefixes, each with its reason

They live in `Search.prototype.skip`, and each is a citation rather than a preference — delete
the line when the reason goes away.

- **`/framework/core/new/`** — 264 page.js files of prior art the `code` skill marks *read,
  never import*, one of which throws at import on purpose.
- **`/alex/`, `/castin/`, `/edric/`, `/arya/`** — four personal sandboxes that **restyle the
  whole site when their modules are imported**. See below; this is the important one.

## The hazard this found: importing a page changes the document

`View.stylesheet()` runs at **module scope**, so loading 600 page modules puts ~66 stylesheets
into `<head>`. That is harmless while every rule sits in one of the four layers `framework.css`
declares — and immediately visible when one does not:

| what it did | what happened |
|---|---|
| `/castin/main.css` opens `@layer theme_cm` | a layer nobody declared sorts **after** all of them; its `a { color: #212121 }` repainted every link on the site |
| `/alex/styles.css` + two more are unlayered | an unlayered rule beats every layered rule at any specificity; the body ground went `#ddd` |
| `/arya/lib/Page.js` runs `app.$body.ac("arya")` | one class on `<body>` re-themed the entire page — not CSS at all, a module touching the document |

Those four are skipped, and `Search.check()` is the guard for the fifth: it snapshots the
stylesheets and the `<html>`/`<body>` classes before the build, compares after, and
`console.warn`s with the file's url if anything arrived that outranks the framework. It cannot
fix the sheet; it refuses to let the site change colour silently.

Proof it is clean now: every computed style read off `body` and `.page-title` is identical
before and after a build (2026-09-06). Fix those five files and the four skip lines go.

## What it costs

~540 dynamic imports, measured at **~1s** and **21 MB** of heap on a warm local server, with
no effect on the page you are standing on (the probe checked: `.pages` innerHTML byte-identical
before and after — a page module builds no DOM at import). It runs the first time somebody
opens the box, never on a page load, and the wall fills in as the rows arrive rather than
holding a blank panel for a second.
