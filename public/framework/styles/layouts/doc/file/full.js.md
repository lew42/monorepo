## What this file is

`full(page, layout)` — one layout maximized to the whole window, at a `url`
(`route(name){ return name === "full" && full(this, layout); }`), not a
class toggle. `doc/full-view.md` has the full history: eight directories
became this one function, and the mechanism has been revised twice since.

## `render()`, not `content()`, on purpose

`Page.render()` draws an `h1` for whatever `title` a page has, and a
maximize view with a heading above it isn't maximized. The comment states
the three things any `render()` override owes: set `this.view`, carry
`.page`, never nest a second one.

## Still serves `sections/`

The last line of the file's own doc-comment says so directly: the sixteen
layout pages no longer call `route("full")` (each is its own layout at its
own plain url now), but `styles/sections/`'s fifteen bands compose into one
page that genuinely wants a maximized view, and that's this function's one
remaining caller.

## Improvements

1. **Nothing ranked.** 32 lines, one exported function, and the file's own
   comment already names its one caller — nothing here requires cross-file
   archaeology to understand.
