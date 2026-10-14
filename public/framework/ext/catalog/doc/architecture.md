# catalog architecture — two arrangements of `previews()`, patched onto `Page`

`catalog()` and `browse()` are two ways to arrange the same cards for any index page: a rail beside the routed child, or a filterable wall of bands. The main code is [`catalog.js`](../catalog.js) (the rail, which the page's own `content()` feeds) and [`browse.js`](../browse.js) (the wall). Both are `Page.prototype` methods, not classes, and they reuse each child's own `preview()` card. The one question that picks between them: is the reader choosing from the set, or reading it in order?

## Declared in `initialize()`, not `content()`

**Decided:** `catalog()` is called from `initialize()`, so the intro child exists before the router walks.
**Why:** a child only has a url once the router has walked it. `render()`, where `content()` runs, is too late; a card made there links to a 404.
**Instead:** calling it from `content()` builds an unroutable intro. A config key such as `intro:` would add API surface that `content()` already says.
**Detail:** [decisions.md](./decisions.md#the-call-moved-from-content-to-initialize)

## The page's own `content()` becomes the first rail card

**Decided:** `catalog()` moves `content` into a new first child, `intro`, that takes the page's title, label and icon.
**Why:** the intro then gets a card, a deep link and marking like every other entry. The moved function keeps its original `this`.
**Instead:** a separate prose slot above the rail. That makes every converting page place its prose by hand.
**Detail:** [decisions.md](./decisions.md#where-does-the-pages-own-prose-go)

## The rail is `previews()` in one column

**Decided:** the rail is the same `.page-previews` wall, set to one `1fr` column, and it turns into a horizontal strip below `64em`.
**Why:** one card style, so a child styles its card once and it is right on a wall, a rail and a strip.
**Instead:** a second card shape for the rail. A span on a wall card would invent a track in the rail, so the rail drops it.
**Detail:** [file/catalog.css.md](./file/catalog.css.md)

## The rail is pinned and has a height ceiling

**Decided:** the rail and the region beside it are a flex row with a definite height, so each scrolls itself.
**Why:** the outer `.pages` scroller reset to the top on every navigation, throwing a scrolled rail back up.
**Instead:** a `calc(100dvh - chrome)` guess, which breaks when the nav bar wraps.
**Detail:** [decisions.md](./decisions.md#the-ceiling-had-to-stop-at-the-pages-boundary)
⚠ The ceiling is scoped to a routed child, but `/framework/ai/<day>/` still clips below `64em` while routed. The fix belongs in `ai.css` ([decisions.md](./decisions.md#open)).

## `browse()` is the wall, for choosing

**Decided:** a set that a reader chooses from gets `browse()`: a sticky rail of band counts and a search, beside one grid per band.
**Why:** on a rail, twenty-three layout cards showed six at a time, so the reader could not see the choices.
**Instead:** a rail for a set read in order. The layouts page moved from a rail to this wall for this reason.
**Detail:** [method/browse.md](./method/browse.md)

## One grid per band, with the heading outside it

**Decided:** `browse()` draws one `auto-fit` grid per band, and each band's heading sits outside its grid.
**Why:** `previews()` emits one flat run, so a band of one drew a row holding one card. A heading inside the grid stopped `auto-fit` from collapsing the empty tracks.
**Instead:** `auto-fill` keeps the empty tracks, and a fixed-length track maximum changes the column count it measures.
**Detail:** [decisions.md](./decisions.md#browsebands-tokens--the-wall-2026-08-17)

## Band sizes are load-bearing, and a card caps at `28em`

**Decided:** a band stretches its cards to fill its row, but a card never grows past `28em`.
**Why:** a short band on a 3440 screen spread to about 3000px. The cap goes on the card (`min(28em, 1fr)` on the track broke the `auto-fit` count).
**Instead:** no cap, which lets short bands spread.
**Detail:** [decisions.md](./decisions.md)

## `browse`, never `browser`

**Decided:** the wall method is named `browse`, because `Doc.browser()` is the Files tab.
**Why:** on a `Doc`, `this.browser(BANDS)` silently draws a file tree where the wall should be, with no console error.
**Instead:** none; the name is the registry key.
**Detail:** [decisions.md](./decisions.md#browsebands-tokens--the-wall-2026-08-17)

## `ext`, not core, and a method, not a recipe

**Decided:** `catalog()` and `browse()` live in `ext/`, and `app.js` imports them once for the whole site.
**Why:** core owns what a page is; arrangements are opt-in. Three real users had pasted the same recipe, so it became a method.
**Instead:** each page hand-builds its rail, which repeats the same fill and link-marking fixes.
**Detail:** [decisions.md](./decisions.md#decisions)

## A `Doc` Overview is this method

**Decided:** `ext/Doc` calls `this.catalog()` from its Overview section, so every `Doc` Overview tab is a catalog.
**Why:** the Overview needs the same intro-plus-rail arrangement as any index, with no second copy.
**Instead:** a separate Overview renderer inside `Doc`, which was the duplicate this method replaced.
**Detail:** [decisions.md](./decisions.md#who-calls-it)

---

Entry files: [`catalog.js`](../catalog.js) · [`browse.js`](../browse.js) · [`catalog.css`](../catalog.css) · [`browse.css`](../browse.css). Full history and traps: [decisions.md](./decisions.md).
