# Eager child-load: the cost, and the smallest lazy fix

**Verdict: overhead is real, not marginal.** On every url with a real tree under it, 60–85% of the page.js modules fetched draw nothing on screen. `/` and the small `/blog/` are fine as-is; `/framework/`, `/framework/core/Page/`, and `/imagine/` are not. Full numbers: `cost.json` (same dir).

| url | route page.js | needed | overhead | overhead KB | % of route modules |
|---|---:|---:|---:|---:|---:|
| `/` | 1 | 1 | 0 | 0 | 0% |
| `/blog/` | 6 | 2 | 4 | 3.4 KB | 67% |
| `/framework/` | 261 | 57 | 204 | 800 KB | 78% |
| `/framework/core/Page/` | 261 | 86 | 175 | 746 KB | 67% |
| `/imagine/` | 92 | 15 | 77 | 247 KB | 84% |

The two /framework/ rows are identical totals — that's the finding underneath the finding: **visiting ANY page under `/framework/*` pays the full 261-module, 1.08MB cascade**, because `framework/page.js`'s own construction (`load_all_children()`, Page.class.js:16) eagerly resolves its whole declared subtree before you ever pick a destination. Depth doesn't matter; the tax is flat and it's paid at `/framework/`, not at wherever you're going.

## Where it comes from (read, not guessed)

Three real render paths, three different "needed" shapes:

- **`/framework/`** — `walls()` shows a card wall two levels deep, but only for branches that aren't `leaf: true`. `ai`, `ui`, `ux`, `audit` opt out of the wall (Doc's own convention, so their internal Overview/API/Docs tabs don't spill into the site nav) — and Page.class.js doesn't know that when it eagerly loads their entire subtrees anyway. Their children (70 of the 204 overhead modules) load for a wall row that will never draw them.
- **`/imagine/`** — `Start`'s default column previews its 12 siblings' `nav()` (title/icon/description) as cards, one level deep. Every one of those siblings' own subtrees (team/game/gallery/… down to 3 levels) loads regardless, because `load_all_children()` doesn't stop at the depth `previews()` actually reads.
- **`/blog/`** — the sharpest case. `blog/page.js`'s own comment already names this exact problem — *"a declared child is imported eagerly, so declaring six posts would run six modules… just to print six titles"* — and solves it for posts via `posts.js`, a plain data manifest. But the four **section** children (`framework systems ai doc`) are still declared eagerly, and `front()`/`rail()`/`topics()` never touch the Page tree at all — they read `posts.js` exclusively. All 4 section loads are pure waste on this url.

## The fix: let a declared child stay data until it's opened

Page.class.js already has the concept of "declared but unresolved" — a bare string in `children:` sits in the Map as `null` until `child()` is called (Router activation, or a route miss). The gap is that `nav_for()` on an unresolved child has nothing to show but the raw name — no title, no icon, no description — so anything that wants to draw a card or a real sidebar label is forced to force the resolve, i.e. `load_all_children()`.

**Proposal:** let a `children:` entry carry a *nav stub* — `{ title, icon, description }` and nothing else (no `content`, no `children`) — and teach three read sites to use it without instantiating a Page:

1. `declare()` — a stub POJO (no `content`/`children` keys) is stored as-is in the Map, not passed through `add()`. No import, no construction.
2. `nav_for()` — `child?.nav ? child.nav() : child` — a stub already looks like a nav() result, so this is a one-line duck-type fallback.
3. `previews()` / `walls()` / `sections()` — already tolerant of a falsy child (`page ? page.preview(nav) : this.preview_card(nav)`); a stub just takes that same "unresolved" branch, using its own title/icon/description instead of the bare name.

The real import still happens exactly where it does today — `Page.child()` — the first time the url is actually walked into. Nothing about routing, activation, or `.md`-fallback probing changes; a stub is just a richer version of the `null` a bare string already produces.

## What breaks, honestly

- **A stub can never be a `default` column** (`default_column()` reads `.classes` off a live Page). Any child marked `classes: "default"` — imagine's `Start` today — has to stay eager. Not a new constraint; that's already how it works.
- **A wall/preview two levels deep** (`walls()` reading a grandchild's `.children.size`/`.leaf`) needs that grandchild *resolved*, not stubbed — so depth-2 lazy is a bigger step than depth-1. First cut should only stub the children of already-`leaf: true` branches (ai/ui/ux/audit) and `/imagine/`'s siblings' own subtrees — both are one level deeper than anything currently drawn, so nothing on screen changes.
- **Anyone reaching into `this.children.get(name)` expecting a live Page synchronously** (not just via `nav_for()`) breaks silently — this needs a real grep-and-check pass before landing, not just the three sites above. `load_all_children()` itself has exactly 2 call sites (both in Page.class.js), so the blast radius for *that* method is small; the risk is code elsewhere assuming resolution, not extra callers of it.
- **Authoring cost**: someone has to write the stub's title/icon/description by hand (or generate it) instead of it falling out of the real module. `blog/posts.js` is the existing proof this is a normal, accepted cost here — one manifest, hand-maintained, already true.

## Migration seam — smallest first

1. **`/blog/`'s 4 section children** — drop them from `children:` entirely. `front()` never reads the Page tree; `/blog/framework/` etc. already resolve fine through the existing undeclared-name path (`route()` → `Page.load()` → `.md` probe) the same way any other unlisted url does. Zero stub syntax needed — literally delete the line and confirm the section urls still load on click. This one has no downside to find.
2. **`ai`/`ui`/`ux`/`audit`'s own children** (70 of `/framework/`'s 204 overhead modules) — these branches are already `leaf: true`, i.e. already declared "I present myself, don't wall my children." Turn their `children: "..."` string lists into nav stubs. Nothing on screen changes (walls() was already skipping them); the only user-visible effect is these four sidebar-entries' sub-navigation still resolving correctly on click.
3. **`/imagine/`'s 12 siblings' own subtrees** — the biggest single win (77 of 92 modules). Needs the depth-1 stub on each sibling's *children*, not the sibling itself (the sibling itself must resolve, since its title/icon/description feed the visible card). Same shape as #2, applied everywhere the docs already say "a place made of column pages."

Each step is independently shippable and independently measurable — rerun the same CDP probe (`cdp-eager-probe.mjs` pattern, this task's scratch dir) before/after and the `needed`/`overhead` split should move without the on-screen previews count changing at all.
