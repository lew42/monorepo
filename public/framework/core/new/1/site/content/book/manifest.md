# Chapter three — data, not doors

Three separate parts of this framework print a url segment where a title should
be, and all three are apologising for the same thing.

`previews()` draws a card per declared child and labels the unresolved ones with
their name, because reading a title would mean importing the module. `tabs()`
labels every tab but the first with its declared name, for the same reason, and
defends it at length in the readme. The sidebar is hand-typed in `site/app.js`
with a comment explaining that building it from the tree would import the tree.

Every one of those is the sentence **a page's title lives inside the page**, and
none of them is a bug. Laziness is the feature; the label is the bill.

## Content does not have to pay it

A post is data with a body attached. The data can be read without running
anything:

```js
export const posts = [
    { slug: "2026-08-03-the-capture-boundary", date: "2026-08-03",
      title: "The capture boundary", tags: ["capture", "async", "lazy"] },
];
```

One module fetch, and from it: a reverse-chronological index with real titles, a
tag cloud with counts, a prev/next with real labels, and a search box that can
actually search — none of which costs a single extra request. The bodies stay
lazy, and the bodies are the only large thing.

That is the escape, and it is worth naming as a rule rather than a trick:

> If the thing you are indexing is **content**, put its metadata in data and the
> lazy-title problem disappears. If it is **code**, accept the lazy title — the
> alternative is importing the site to draw a list.

## Where the seam is

Two sources of truth, hand-maintained, no build step. A `.md` with no manifest
entry is invisible; nothing crawls the filesystem, and on static hosting nothing
can. A manifest entry with no file renders a visible red error.

Both failures are loud, which is the best you get without a generator. A build
step reading front matter would remove the drift and would also be the first
build step in a repository whose defining constraint is not having one.

## Search, and the thing it proves

A command palette over the page tree can only offer what has been imported,
which is the same wall in a third costume. A search over the manifest offers
everything, instantly, from data that was already loaded — and full-text search
is available too, at the honest price of fetching every body once.

That contrast is the argument of this book in one screen. The tree is lazy and
therefore blind; the manifest is eager about the small part and lazy about the
large one, and it can see.
