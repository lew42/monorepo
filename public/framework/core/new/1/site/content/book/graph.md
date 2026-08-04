# Chapter two — one parent

The page tree gives you `chain()`, and `chain()` gives you breadcrumbs, active
ancestors, shared-prefix diffing and the entire question of where a page mounts.
It is four lines and it assumes one thing:

```js
chain(){
    const chain = [this];
    for (let page = this; page.parent; ) chain.unshift(page = page.parent);
    return chain;
}
```

Every page has exactly one `parent`. That is true of a filesystem, which is why
a filesystem router can exist at all, and it stops being true the first time an
editor asks for an article to appear under two headings.

## Tags are the ordinary case

An article carries three tags. A tag lists a dozen articles. Nothing exotic has
happened — this is what every blog on earth does — and the tree cannot hold it,
because a tree is a graph with the extra promise that every node has one way in.

There are exactly two shapes available, and the choice is not close.

**Tags list; articles live in one place.** `/tags/graph/` renders links to
canonical urls under `/blog/`. One node per article, breadcrumbs honest,
`.in-path` correct, no duplication anywhere. What you give up is browsing
*inside* a tag: there is no "next article in this tag", because the tag is not
in the article's chain.

**Tags contain; the article exists once per path.** `/tags/graph/x/` builds a
second `Page` for the same content. Now the tag can be a real context — prev and
next within the tag, a breadcrumb that says `tags › graph › x` and means it —
and the price is a second node with its own `parent`, its own `view`, and its own
identity.

## Paying the price honestly

The duplication is structural, not networked. `md.file` caches by resolved href,
so both nodes fetch the article once between them; what doubles is the parsed
DOM and the object identity.

Object identity is the one that bites. `blog_copy !== tag_copy`, so any code that
compares pages by reference — "am I the active page", "is this my ancestor" —
sees two different articles. `Router.mark()` is exactly that code, which is why
`/blog/` does not light up while you are reading the copy under `/tags/`.

The framework cannot fix this without changing `chain()` to take a path instead
of reading `parent`, and `chain()` is the method every layout calls. A change
there is a change to everything.

## The rule

Reach for *list* by default. Reach for *contain* only when the second context is
a genuine reading context — a series, a course, a tag someone works through in
order — and when you do, pick a canonical url and say so on the page, because
nothing else in the system will.

The next chapter is about where the titles came from.
