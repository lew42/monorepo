# Framework — everything it offers is organized, visual, browsable: find any thing by clicking through previews, and every layout works from mobile to 3440

## Index

- [core](./core/) — the seven classes under every page (View, Page, Router, App, Sidebar, Item, List)
- [ext](./ext/) — opt-in addons; core never imports them
- [ui](./ui/) — the template tier: components, one page each
- [ux](./ux/) — the behavior tier: classes you can extend
- [styles](./styles/) — the CSS strategy: four layers, one vocabulary
- [web](/web/) — the guide tier, live (it lives at `public/web/`, not in this folder; no readme here)
- [start](./start/) — three files, no build step, a working site (no readme yet)
- [faq](./faq/) — short answers, code first (no readme yet)
- [versus](./versus/) — how this compares with other choices (no readme yet)
- [util](./util/) — small plain helper functions (no readme yet)
- [dev](./dev/) — local-only live reload and the dev bar
- [research](./research/) — research programs shown live (no readme yet)
- [ai](./ai/) — the daily working log and task board
- [ai2](./ai2/) — the dictation timeline: cards left, one card right
- [audit](./audit/) — the 2026-08-15 doc audit, a dated snapshot
- [doc](./doc/decisions.md) — framework-wide decisions and doc-system notes (docs only)

## Use
```js /path/page.js
import { p } from "/app.js";
p("Hello world.");
```

## Watch out
- Capturing is synchronous: a factory call textually after an `await` appends to the wrong captor — capture the container first, fill it in a callback: [`core/View/doc/capturing.md`](/framework/core/View/doc/capturing.md)
- Every stylesheet restates the full `@layer base, theme, site, util;` and every rule sits in a layer — one short list silently reorders the cascade: [`styles/doc/cascade.md`](/framework/styles/doc/cascade.md)
- `core/` and `core/new/` both ship — a typo'd import path resolves to a same-named *different* class; `instanceof` fails, nothing throws: [`doc/decisions.md`](./doc/decisions.md)
- A POJO page whose key collides with a `Page` method (`render`) shadows it and returns nothing — `content()` is the seam: [`doc/decisions.md`](./doc/decisions.md)
- `instantiate()` is unawaited in the App constructor — a throw outside `load()` is a silent unhandled rejection: [`doc/decisions.md`](./doc/decisions.md)
- Rename freely inside `framework/`, alias on the way out — the sandboxes' `lib/` are downstream packages: [`doc/decisions.md`](./doc/decisions.md)

## More
- [Overview](/framework/) — then [Start here](/framework/start/), [FAQ](/framework/faq/), [Versus](/framework/versus/)
- [`core/`](/framework/core/) — seven classes, every page
- [`ext/`](/framework/ext/) — opt-in addons; core never imports them
- [`styles/`](/framework/styles/) — four layers, one vocabulary
- [`ui/`](/framework/ui/) — nineteen components, four bands
- [`web/`](/web/) — the guide tier, live
- [`dev/`](/framework/dev/) — local-only live reload
- [`util/`](/framework/util/) — small plain helpers
- [`ai/`](/framework/ai/) — the working log, daily
- [`doc/decisions.md`](./doc/decisions.md) (the record) · [`doc/injection.md`](./doc/injection.md) (nothing reads `window.app`) · [`doc/theme-behaviour.md`](./doc/theme-behaviour.md) (a theme is CSS)
- [`doc/docs-system.md`](./doc/docs-system.md) (what a doc page is made of) · [`doc/reachability.md`](./doc/reachability.md) (the crawl + audit method)
- Files that matter: `/app.js` (the one import), `page.js` (sidebar + walls layout), `framework.css` (the utility vocabulary)
