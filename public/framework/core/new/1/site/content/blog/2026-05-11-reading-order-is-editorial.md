# Reading order is editorial

`children` is a `Map` in declaration order, and setting an existing key never
moves it, so a name keeps its declared position when it resolves. That gives
you an ordered list of siblings for free, and prev/next within one parent is
three lines.

It is also not what a reader wants.

## The order that matters crosses parents

A reading path is a sequence the author chose. It starts in one directory,
detours through a blog post, comes back, and ends somewhere else entirely:

```
/content/article/                     the simplest possible content page
/content/blog/2026-06-18-dates-are-data/       why urls can be data
/content/blog/2026-07-22-the-manifest-is-the-index/
/content/tags/                        the graph problem
/content/toc/                         navigation inside one document
/content/book/                        chapters and one long read
```

No `children` map contains that. Four different parents appear in it, one entry
is a `route()` claim with no file behind it, and the order is not the
declaration order of anything.

So it is a list:

```js
export const reading = [
    { url: "/content/article/", title: "A page whose content is a file" },
    { url: "/content/blog/2026-06-18-dates-are-data/", title: "Dates are data" },
];

export function neighbors(url){
    const i = reading.findIndex(step => step.url === url);
    return i === -1 ? [null, null] : [reading[i - 1] ?? null, reading[i + 1] ?? null];
}
```

Data again. The same module that holds the posts holds the sequence, because
they are the same kind of thing: editorial decisions that a page tree has no
opinion about.

## Why `title` is repeated in the list

It looks like duplication and it is the point. `reading` holds a title so that
rendering a prev/next link costs **zero imports** — the same argument as the
manifest, applied to a smaller list. If the entry only held a url, drawing
"Next: A page whose content is a file" would mean importing that page to ask it,
and prev/next appears at the bottom of every page in the sequence.

The cost is that renaming a page means editing two places, and nothing catches
it. That is a genuine drift risk, and the mitigation is that the list is seven
lines in one file rather than seven annotations scattered across seven modules.

## What a framework could offer instead

A `sequence` a page opts into by url, resolved once and shared:

```js
// PROPOSED, not implemented
new Page({ sequence: reading })
page.next()   // -> { url, title } | null
```

That is barely more than the function above, which is the argument against
adding it: prev/next over an author-supplied list is six lines of userland, and
a framework method would have to decide what happens when a page appears twice
in the list, or in two lists, or in none. The list is doing the work; the API
would only be a place to put it.

Where a framework *does* earn its keep is the part userland cannot reach: making
a cross-page anchor scroll. `Router.go()` pushes `link.pathname` and drops the
hash on the floor, so `/content/toc/#capture` from another page lands at the top
of the document. That one is a bug, not a design.
