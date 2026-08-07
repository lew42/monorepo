# The manifest is the index

There is a bug that keeps being rediscovered, one seat at a time, in a different
costume each round. The sidebar is hand-typed because building it from
`app.root`'s children would import every one of them. `previews()` prints a url
segment instead of a title for the same reason. `tabs()` labels every tab but
the first with its declared *name*, and the readme spends a page defending it. A
command palette cannot list what it has not imported.

Every one of those is the same sentence: **a page's title lives inside the page.**

## Why that is unfixable from the page side

Laziness is the feature. `children: "intro guide api"` is three strings and zero
network requests until the router walks to one of them. The moment an index
wants real titles it has to open every door it was trying not to open:

```js
// this is what the honest version costs
async previews(){
    const children = await Promise.all(names.map(name => this.child(name)));
    // ...and you have now imported the entire site to draw six cards
}
```

Measured on a cold load of `/`: the async version fetched all four child
modules. The sync version fetched none. Neither is wrong; they are answers to
different questions, and the framework picked the cheap one and told the truth
about it.

## Content has the escape

A post's title does not live inside the post. It lives in a manifest:

```js
export const posts = [
    { slug: "2026-08-03-the-capture-boundary", date: "2026-08-03",
      title: "The capture boundary", tags: ["capture", "async", "lazy"] },
];
```

Sixty lines of data, no imports, one module fetch. From it you get, for free:

| you want | you write | cost |
| --- | --- | --- |
| reverse-chron index | `chronological()` | 0 extra fetches |
| tag cloud | `tags()` | 0 |
| prev / next | `neighbors(url)` | 0 |
| search over titles | `posts.filter(...)` | 0 |
| the article body | `md.file(meta, slug + ".md")` | 1, on demand |

Only the last row costs anything, and the last row is the only thing that is
actually big. The manifest is roughly two kilobytes; the six bodies it describes
are thirty.

## The trade, stated plainly

You now have two sources of truth: the manifest and the files. Add a `.md`
without adding a manifest entry and it is invisible — nothing crawls the
filesystem, and nothing can, because production is static hosting with no
directory listing. Add an entry without the file and the page renders
`Error loading …`, visibly, in red.

A build step would generate the manifest from front matter and remove the drift.
This repo has no build step, deliberately, so the manifest is hand-maintained
and the drift is real. It is one line per post in one file — cheap to keep
correct, and the failure is loud in both directions.

The general rule falls out of it:

> **If the thing you are indexing is content, put the metadata in data.
> If it is code, accept the lazy title.**

A page is code. Its title cannot be read without running it. A post is data with
a body attached, and data can be read without being run.
