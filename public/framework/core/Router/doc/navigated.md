# `app.navigated?.()` — built. `page.entered?.()` — refused.

Six independent seats asked for "something that runs after a navigation." Three
wrote the line, and the three lines were **not compatible**:

```
this.app.navigated?.(page)   on Router — the SITE reacts
this.entered?.()             on Page   — the PAGE reacts
explicitly NOT on Page       because a page is display:none until mark() runs
```

**Verdict: build the App one, refuse to merge the Page one into it.** Crumbs,
prev/next, closing a drawer and moving focus all need this moment and none can be
written without it. The Page version is a *different subject* with a correct
objection against it, and merging them would produce one method with a flag
inside a year. **Two requests wearing one name is exactly the shape that produces
an option, and an option is API surface forever.**

`from` is passed as well as `page`, because the hook fires on first paint too and
two seats independently re-derived "is this the first navigation" — one from
`from.length`, one by counting. It was already computed on line one of
`activate()` and was being thrown away.

## What this site does with it

Two things, both in `/app.js`, and the second is why the hook earns its keep:

```js /app.js
navigated(page){
	this.socket.rpc("hello", page.url);
	devbar.refresh();
},
```

The dev server addresses a tab by the page it last announced, and an SPA
navigation changes the url with no new socket — so without a sender here, `pages`
and `eval --path` keep reporting where the tab *connected*. The announcement lives
in the site's own file, not in `Router`: **core knows nothing about sockets**, by
a decision that predates this hook, and `page.url` (not `location.pathname`) is
what gets announced because `go()` pushes history only *after* the load succeeds.
Protocol: [wire](/framework/dev/Socket/docs/wire/).
