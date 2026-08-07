# What a tree cannot say

A page tree is a beautiful abstraction. `chain()` walks `parent` to the root and
hands you breadcrumbs, `.in-path` marks the ancestors, `container()` finds the
nearest region — and all of it rests on one assumption written into a single
line:

```js
chain(){
    const chain = [this];
    for (let page = this; page.parent; ) chain.unshift(page = page.parent);
    return chain;
}
```

`page.parent`. Singular. One.

## The day it stops being true

An article belongs to three tags. A tag lists a dozen articles. That is a
many-to-many relation, and there is no assignment of `parent` that expresses it.
Ask the concrete question — *what is `parent` for an article reachable at both
`/blog/x/` and `/tags/graph/x/`?* — and every answer is wrong in a different way:

- **The blog page.** Then breadcrumbs at the tag url say `content › blog › x`,
  which is a lie about the url you are looking at.
- **The tag page.** Same problem mirrored, and now the canonical path lies.
- **Whichever adopted last.** `add()` assigns `parent` unconditionally, so two
  adoptions of one instance mean the second silently rewrites the first. Two
  urls that render correctly in isolation and wrongly in sequence.

The third one is the dangerous answer, because it is what happens by accident if
you reuse the instance.

## What actually works

Stop trying to share the node. Share the *content* and give every path its own
node:

```js
route(name){
    const p = post(name);
    return p && { title: p.title, content(){ return md.file(meta, p.slug + ".md", { h1: false }); } };
}
```

Both the blog page and each tag page can define that. Two `Page` objects, one
`.md` file, and `md.cache` means one network request no matter how many nodes
point at it. Each node has its own `parent`, its own `url`, its own `view`, and
therefore its own honest breadcrumb.

## What it costs, item by item

| what | cost |
| --- | --- |
| identity | `blog_copy !== tag_copy`. Anything comparing pages by reference sees two articles. |
| `parent` | means *"my parent on the path you arrived by"*, not *"who owns this article"*. |
| `.in-path` | lights the path you took. `/content/blog/` stays dark at the tag url. |
| DOM | two `view`s, both built, both retained — `render()` caches per instance. |
| canonical | undecidable by the framework. The author picks, and says so on the page. |
| network | one fetch. `md.cache` is keyed by href, not by page. |

The last row is the reason this is acceptable at all. The duplication is
structural, not transferred over the wire.

## The alternative that was not built

One page, several urls:

```js
// PROPOSED, not implemented
new Page({ url: "/content/blog/x/", also: ["/content/tags/graph/x/"] })
```

It needs the Router to resolve a second address to an existing node, and it
needs `chain()` to take the path as an argument rather than reading `parent` —
because with two addresses there is no longer *a* chain, there is a chain *per
url*. That is a change to the one method every layout in the framework calls.

The honest summary is that a tree can express a graph only by flattening it into
one node per path, and the flattening is where the information goes. Everything
above is bookkeeping about which information, and how loudly it is lost.
