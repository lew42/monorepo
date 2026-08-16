This module's own page, rewritten today onto `Doc`. `subject: code` is the
one unusual line here — see `readme.md`'s Decisions for why it names the
patched *element factory*, not a class this module owns, and what that
choice costs on the API tab.

## The FILENAME demos

Two demos exist only because of today's change: `code.js(src, "/app.js")`
showing the label drawn from JS, and a fenced ```` ```js /path ```` block
showing the identical label drawn from markdown's info string. They sit
side by side on purpose — same attribute, two emitters, one rule in
`highlight.css`.

## Improvements

1. **No `overview:` rail.** Every demo lives directly in `content()`, the
   same shape as `core/View/page.js` — appropriate for a module this size,
   but if languages or the editor grow this page past a screen, the rail is
   the documented escape hatch (`ext/doc/readme.md`'s "rail" section), not a
   longer scroll. *(medium, speculative — not needed yet.)*
