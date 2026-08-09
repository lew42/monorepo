An optional hook: claim a url segment no `children` list could hold.

```js
route(name){
    const entry = catalogue[name];
    return entry && { title: entry.title, content(){ … } };
}
```

**Usage** — read in one place, `child()` (`Page.class.js:74`), guarded by
`is.fn(this.route)`. Defined by three pages: `framework/styles/sections/page.js:19`
(nine urls from one object, no directories), `framework/styles/layouts/full.js:8`
and `michael/previews/page.js:67`.

**Necessity** — yes, for anything catalogue-shaped. When your children come from
data rather than from decisions, `children` is the wrong tool and this is the right
one.

**Simplicity** — right-sized, and the *placement in the lookup* is what makes it
safe:

> **It runs for undeclared names only** (`known === undefined`), so a greedy route
> can never shadow a `page.js`. And it runs **before** the filesystem probe, so a
> dynamic name costs no doomed request.

Whatever it returns goes straight to `add()`, so all four `add()` shapes work — a
string, a function, an options object, or a real Page. A falsy return means "not
mine", and the probe continues.

Duck-typed, not declared: nothing on `Page` mentions `route` except that one guard.

