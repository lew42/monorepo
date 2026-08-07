# Navigation inside one document

The router models urls. It has nothing at all to say about the inside of a
document, and a long document is exactly where a reader most needs to navigate.
This file has eight headings. None of them is a page, none of them is a route,
and none of them exists until a fetch completes.

## The router does not model this

`Router.load_segments` splits a pathname on `/` and walks `page.child(name)` per
segment. There is no segment for "the third heading of this article", and there
should not be: a heading is not a resource, it is a position in one.

What the browser already gives you is a fragment identifier, and what it costs
is that fragments are the one part of a url this router deliberately ignores.

### What `link_clicked()` does with a hash

```js
if (link.hash && link.pathname === location.pathname) return null;  // #section
```

Returning `null` means *not ours* — no `preventDefault`, no `go()`, and the
browser handles the click natively. So a same-page anchor scrolls, the hash
lands in the address bar, and Back works, all without the framework
participating at all. This is the right default and it is worth noticing that it
is achieved by doing nothing.

### The case that does not work

A link from another page to a heading in this one has a *different* pathname, so
the guard does not fire and the router takes the click:

```js
click(e){
    const link = this.link_clicked(e);
    if (!link) return;
    e.preventDefault();
    this.go(link.pathname);     // <- the hash is gone here
}
```

`link.pathname` excludes the hash. The navigation succeeds, the correct page
renders, and the reader arrives at the top of a two-thousand-word document with
no indication that they were supposed to land two thirds of the way down.

## Building the contents list

The headings arrive after an `await`, so a table of contents built during
`render()` finds nothing. There is no timing trick that fixes this — the fetch
genuinely has not happened — so the structure has to be the fix.

### Place first, fill later

The container is captured synchronously, while `View.captor` is still the page.
The markdown promise is chained, and the chain reads the parsed document *before*
returning it to `append_promise`:

```js
content(){
    return div.c("toc-layout", $layout => {
        const $toc = div.c("toc");
        div.c("toc-body").append(
            md.file(import.meta, "long.md", { h1: false })
                .then(view => this.contents(view, $toc)));
    });
}
```

Two things about `.then(...)`. It runs after the parse and before the append, so
the headings exist and are queryable on a detached element. And it must return
the view, because `append_promise` appends whatever the promise resolved to — a
`then` that forgets its return value silently renders nothing.

### Slugs are assigned, not inherited

`marked` in this vendored version does not add `id` attributes to headings, which
turns out to be convenient: the slug is ours to choose, so it can be derived the
same way in the anchor and in the heading, from one function, with no chance of
disagreeing.

```js
const slug = text => text.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
```

Idempotent, ASCII, and stable across reloads. The alternative — indexes — breaks
the moment a heading is inserted, and a shared link is a promise that a fragment
keeps meaning what it meant.

## Scroll containers, and why this one works

Every `.page` in this site sets `overflow-y: auto`, so the page is its own scroll
container and the document body never scrolls. Native fragment scrolling handles
that correctly: the browser scrolls the nearest scrollable ancestor of the
target, not the viewport.

It is worth stating because the manual version does not. `window.scrollTo` would
do nothing here, and `element.scrollIntoView()` is the API that works, which is
the one to reach for when the hash has to be applied by hand — as it does after a
cross-page navigation.

## What a highlighted state would cost

A table of contents that marks the heading you are currently reading needs an
`IntersectionObserver` per heading and a rule about which one wins when three are
on screen. It is perhaps twenty lines and it introduces the first thing on this
page that is not derivable from the url.

That is the real argument against it here: everything else in this section is a
pure function of the address bar, so a reload reproduces exactly what clicking
produced. Scroll-spy is state that the url does not contain, and the moment it
exists someone will ask why Back does not restore it.

## Summary

The router models documents, not positions inside them. Fragments are the
browser's answer, and they already work for same-page links because the router
declines to handle them. Everything else — the list, the slugs, the cross-page
scroll — is userland, and only the last of those wants help from the framework.
