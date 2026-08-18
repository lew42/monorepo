My **declared** children as a preview wall, with the sections I derived subtracted.

```js
content(){ this.wall(); }
```

**Why it exists.** `sections()` adds Overview, API, Docs and Files to `this.children`
like any other page, because they *are* pages — that is what gives a member a real url
and a real back button. The consequence is that a Doc calling `previews()` in its own
Overview draws four extra cards: **the page previewing its own tab strip back at
itself.** `/framework/ui/` shipped that way and nothing threw — a wall of nineteen
components with Overview · API · Docs · Files tacked on the end reads as nineteen
components and four odd ones.

`Doc.SECTIONS` is the one list both readers share: `bar()` orders the strip by it, this
subtracts it. Adding a fifth section means adding it there and both follow.

**Necessity** — yes, for any Doc whose Overview shows its children. A module with three
or four children usually shows them as top tabs instead and never calls this; a module
with nineteen ([`ui/`](/framework/ui/)) overrides `bar()` to keep the strip to the four
sections and shows the children here.

⚠ **`wall()` is not `previews()` with a filter argument.** It hands `previews()` a
`Map`, which is the parameter that method grew for exactly this — so there is one wall
mechanism on the site, not two. Anything that wants a different *subset* passes its own
Map rather than adding a second option here.

⚠ **A child named `overview`, `api`, `docs` or `files` is invisible to this method.**
Those four names are reserved by `sections()` — a declared child using one already
collides in `bar()` and in the url, so this is a symptom rather than a new rule.

**Simplicity** — one line. It exists as a method rather than as three lines at a call
site because it encodes *which children are chrome*, and only this class knows that.
