## What this file is

The one theme this site actually wears, demoed live: the sidebar built from
two tokens, the icon ligature-font trap, both light and dark side by side.
The comment at the top of the file records a real bug this page used to
ship — a duplicate `<link>` from calling `View.stylesheet()` a second time
when `lew42.js` already loads the CSS at module scope.

## The import is the loading edge

```js
import "./lew42.js";
```

Not a stylesheet call — `lew42.js` already does `View.stylesheet(import.meta,
"lew42.css")` at module scope, so importing the module that owns the CSS is
the correct way to guarantee it loads once. This is the same rule
`doc/ownership.md` states generally ("if your CSS styles a class you don't
emit, import the module that does"), applied to a theme rather than a
component.

## No font call on this page

Worth flagging for anyone who remembers an earlier version: `app.font(…)`
used to live here and moved to `app.js`'s `config()` when the theme went
site-wide, because 166KB on every route for a theme one page used was a bad
trade once every route wore it.

## Improvements

1. **Nothing ranked.** The file's own comment already documents the
   double-`<link>` bug it fixed, which is exactly the kind of trap this
   audit would otherwise be writing down for the first time.
