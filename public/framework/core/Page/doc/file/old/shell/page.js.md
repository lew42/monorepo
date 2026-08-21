The "knobs, and the frame around all of it" guide — the catch-all fifth tab: menu
metadata (`title`/`label`/`icon`/`card`), the page-shape classes, and — the one
thing here that is not about `Page` at all — how to write your own `/app.js` and
compose a `Sidebar` inside it.

## It ends outside the class, on purpose

The "Your own shell" section prints this site's actual `/app.js`, minus the exts
it opts into, because every guide up to this point has been demonstrating `Page`
*inside* a shell someone else already built (`ext/demo`'s sample app). This is the
one page in the module that shows what has to exist above `Page` for any of it to
render at all — `$app`, `$pages`, `View.set_captor`.

## Two warnings, both about capture, both easy to miss

The captor is set to `$pages`, not `$app` — and a `Sidebar`'s `header`/`footer`
must be passed as arrow functions, never a pre-built `View`, or it gets captured
in the wrong place and then moved. Both are the same underlying trap
(`core/View/doc/capturing.md`) in two different call sites.

## Improvements

1. **No `doc/file/shell/page.js.md` existed.** *(simple, important — done in
   this pass.)*
2. **"Shell" is a slightly overloaded name** — it covers per-page metadata, page
   shape *and* the app-level chrome, three different altitudes under one tab.
   Splitting the app-shell section into its own guide would make each tab answer
   one question; not proposed as a rename without asking, per house rule.
   *(medium, speculative.)*
