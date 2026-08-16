# `Font.js` — a face, and a registry of them

```js
Font.fonts.Inter = { name: "Inter", url: "…", options: { weight: "100 900" } };
app.font("Inter");
```

## Members

**`constructor` / `assign`** — the house two-liner, identical to `View`, `Page`,
`App` and `Router`. A `Font` is `{ name, url, options }` and nothing else.

**`load()`** (instance, `Font.js:8`) — called only by `Font.load()`. Both halves
are required and neither is obvious: `FontFace.load()` fetches the file,
`document.fonts.add()` is what makes the family usable in CSS. Doing one without
the other fails silently in opposite directions.

**`static load(name)`** (`Font.js:15`) — the real entry point. Called by
`App.font()` (`App.js:74`), and by nothing else. **Memoized** on `Font.loading`, so
two pages asking for Montserrat share one fetch. Throws on an unknown name, which
is the right loudness: a typo'd font is a design bug you want at boot.

**`Font.fonts`** (`Font.js:24`) — name → descriptor. Two entries ship. A site adds
its own by assignment; there is no `register()`, and there does not need to be.

**`Font.loading`** (`Font.js:38`) — name → promise. The memo. Never cleared, which
is correct for a document-lifetime cache and would be wrong for anything else.

## Necessity

Keep, and keep it a class rather than moving it to `util/`: `util/`'s own pitch is
*"plain functions, no classes, no state"*, and this is a class with a registry.

The instance is thin — three properties and one method — and could collapse into a
single function. It stays a class because `Font.fonts` reads as data about *fonts*,
and because a face has an identity that outlives its load.

## The unresolved part

**Both registered faces are `fonts.gstatic.com` urls** — the one place in the
framework that breaks the "vendor the dependency" rule `ext/` is held to. Offline,
they silently fall back. Vendoring costs ~166KB in the repo for a look most sites
will never load. Stated, not settled.

## Two facts about the shipped faces

- **Montserrat's latin file is variable** — weights 100–900 in one 38KB file, which
  is why `weight: "100 900"` is honest. A static 400 file would have the browser
  fake the 900 the design leans on.
- **Material Icons is ligature-based.** `icon("dashboard")` renders the *word*
  `dashboard` and the font's `liga` feature swaps the glyph in. So an unloaded
  Material Icons shows the word rather than a blank — the friendlier failure, and
  how you notice you forgot to load it. It is also why `Sidebar.css` must never put
  an icon name in CSS `content`: there, the same legible failure reads as garbage
  down the margin.
