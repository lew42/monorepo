Fifth in the rail: the `wiki` tree declares no `children` at all — three urls
(`/html/`, `/css/`, `/js/`) work anyway, because `route(name)` claims any
undeclared segment before the (in this demo, fictional) filesystem probe would.

## The one lesson this demo structurally cannot teach

The real payoff of `route()` — that an undeclared folder on disk still resolves
via `Page.load()` — cannot be shown in a demo tree at all, because a demo must not
touch the network. The module's own `readme.md` (Open section) names this as the
one variation with no live demonstration anywhere in the module.

## Improvements

1. **No `doc/file/overview/route/page.js.md` existed.** *(simple, important —
   done in this pass.)*
