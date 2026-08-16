The url → `Promise<string>` map behind `code.file()`. Not shown above because
an object literal has no honest one-line declaration — `Doc.declaration()`
returns nothing for an object-valued property, same as it would for any
plain `{}`, so this prose is the whole page.

**Usage** — read and written only inside `code.file()` (`highlight.js:167,176`):
populated on first fetch, deleted on failure so a broken link isn't cached
forever, never read anywhere else on the site.

**Necessity** — yes, for the same reason any per-url fetch cache is: a page
that calls `code.file()` on the same path twice (a demo and a Files tab
entry, say) pays for the network request once.

**Simplicity** — a bare object was the right call over a `Map`: keys are
always resolved `href` strings, nothing iterates it, and `??=` reads cleanly
against a plain object. It's public (`code.cache`, not a closure variable) on
purpose — worth being able to inspect or clear from a console while
debugging a stale fetch, unlike `code.ext`, which has no such argument for
being exposed.
