# The capture boundary

Every page in this section fetches something. That single fact makes the content
tier the worst-affected corner of the whole framework, because `View.captor` is
one global variable with a push/pop stack, and `append_fn` restores it the
instant your callback *returns* — which for an `async` function is at its first
`await`, not when it finishes.

Nothing throws. The elements simply appear somewhere else in the document.

## The shape that fails

```js
// WRONG — the div is built after an await, so it lands wherever the captor now is
async content(){
    const text = await fetch(url).then(r => r.text());
    return div.c("article", () => md(text));
}
```

By the time `fetch` settles, the router has finished activating the page, the
captor has been popped back to `app.$pages`, and `div.c("article")` auto-appends
itself as a sibling of every page on the site. It renders. It is visible. It is
in the wrong parent, and it never leaves.

## The shape that works

Place the container while the captor is still yours, then name the target when
the data arrives.

```js
content(){
    return div.c("article", $article => {
        $article.append(md.file(import.meta, "post.md", { h1: false }));
    });
}
```

Two things are load-bearing here and both are easy to miss.

First, `div.c(...)` runs **synchronously**, inside `render()`, inside the capture
callback that `Page.render()` opened. So it lands in the page. Second, the
callback receives the new view as its argument, so `$article.append(...)` names
its target explicitly instead of trusting an ambient global that is about to
change under it.

## Why a promise is the blessed form

`md.file()` returns a promise on purpose, and `View.append` dispatches on it:

| you return | `append` does | where it lands |
| --- | --- | --- |
| a view | `el.appendChild` | the captor, now |
| a function | `append_fn` — push captor, run, pop | the captor, now |
| a **promise** | `append_promise` — await, then append to `this` | `this`, later |

`this` in that last row is a view that was placed synchronously. That is the
entire trick. The promise does not need to know where it goes, because the view
it resolves into was already parented before the fetch started.

So the minimal correct content page is one line:

```js
content(){ return md.file(import.meta, "article.md", { h1: false }); }
```

`Page.render()` captures a `div.page`, calls `content()`, gets a promise back,
and `append_promise` puts the parsed markdown inside the page whenever it lands.
No await appears in any file the author wrote.

## The part that is still sharp

A promise resolving *later* means the DOM changes after `Router.mark()` has
already run its link pass. Any anchor inside fetched markdown misses `.active`
and `.in-path` entirely. The tab bar hit this first and the fix generalises:
`mark_links()` takes no argument and defaults to the active page's url, so
anything that renders links late can simply re-run the pass.

```js
this.app?.router?.mark_links();   // after the markdown lands
```

Call it, or accept that links inside your prose never light up. There is no
third option, and nothing warns you.

See also: [One fetch, two urls](/content/blog/2026-05-30-one-fetch-two-urls/).
