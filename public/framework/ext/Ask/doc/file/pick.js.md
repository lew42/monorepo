The picker and the context it gathers. Four exports that matter: `pick()`
(crosshair mode, as a promise), `context(el)` (everything a turn should be told
about one element), `describe(about)` (that object turned into the plain
sentences a turn reads), and `where(el)` / `label(el)` (the element as a full CSS
selector, and as a short one that fits in a chip).

It imports **only** `View`. That is deliberate: `Ask.js` imports `describe` from
here, and `chat.js` imports both, so the dependency runs one way — `pick.js` →
`Ask.js` → `chat.js`. A parent/child import cycle in this repo breaks only on a
deep reload, which is the worst kind of bug to introduce, and it is why `mount()`
ships from `chat.js` rather than being re-exported from `Ask.js`.

## The overlay is built with `capture: false`

```js
this.$ui = new View({ capture: false }).ac("ask-pick-ui").append(() => { … })
	.append_to(document.body);
```

A `View` built while a captor is set appends itself to whatever is rendering. The
picker's overlay belongs to the document, not to whichever page happened to call
`pick()`, so it opts out of capture and attaches to `document.body` itself. It is
removed in `stop()`, so nothing outlives the gesture.

## The outline is an inline style, and that is correct

`frame()` writes `top` / `left` / `width` / `height` straight onto the box. Those
are **measured** numbers — the box IS the hovered element's rectangle — which is
the one case the house rule allows. Everything about how it looks (the colour,
the tint, the radius) lives in `ask.css`.

## `text()` treats an HTML content type as a 404

```js
if (!res.ok || (res.headers.get("content-type") ?? "").includes("html")) return null;
```

The SPA fallback answers a miss with `index.html` and a 200, so the content type
is the real 404. The dev server happens to return a true 404 for a missing `.md`,
but a static host will not, and the same code has to work on both.

⚠ A pick logs one console 404 for every readme url it tried and did not find —
usually one or two. That is the probe working, not a defect.

## `scopes()` caches the whole file, once

`css-scopes.txt` is fetched on the first pick of the page's life and kept in a
module-level `cached` map. Every later pick is a map lookup. The parse keeps only
lines whose first token ends in a dash (that is what makes a line a namespace
reservation) and whose second token looks like a path — every other line in that
file is prose.
