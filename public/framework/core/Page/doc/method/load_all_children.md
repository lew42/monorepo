Import every declared child, and remember the promise.

**Usage** — two callers, both internal: the constructor when it has a url
(`Page.class.js:12`) and `add()` when adoption has just supplied one
(`Page.class.js:53`). The promise it stores is awaited by
`Router.load()` (`framework/core/Router/Router.js:68`) and by `ext/tabs`
(`framework/ext/tabs/tabs.js:40`).

**Necessity** — yes, since eager loading became the default. It is what makes a menu
draw **once**, with real titles and icons, instead of drawing names and redrawing.

**Simplicity** — right-sized, and the recursion depth is the subtle part:

> Awaiting each child's own `loading` makes this mean **"my subtree is ready"**, and
> it recurses exactly as far as each page's own `children` list goes. Full recursion
> — "import every descendant" — was rejected: an ancestor's one line would override a
> descendant's deliberate shallowness three files away.

The measured price on `/framework/`: 1 → 28 `page.js` fetches, **+51ms to first
paint**, flat with depth. Accepted deliberately; not free.

The name is long. It earns it by rarity — two call sites, both inside this file —
and by saying *all*, which is the word that distinguishes it from `child()`.

