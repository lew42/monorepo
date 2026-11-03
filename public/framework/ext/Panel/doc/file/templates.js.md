## templates.js

The `T` vocabulary as data: `name → { icon, tone?, focus?, draw($body, panel) }`.
Twenty-eight entries — eight hand-written scenes, fifteen generated from
`styles/sections`' own list, `space`, which draws a *generated* layout
([generate.js](/framework/ext/Panel/doc/generator/) owns the rest of it), three
pieces of page furniture, and `properties`, the inspector. Full roster, sizing
rules and the trap:
[Templates — the T vocabulary](/framework/ext/Panel/doc/templates/).

## `rail`, `toc` and `brand` exist because something asked for them

Every other entry here is a thing worth looking at. These three are the spec
parts `structure(seed)` had nowhere to send — `menu`, `toc` and `brand` — and the
fifteen marketing bands had nothing that fits, because spec parts are page
*furniture* and bands are page *content*. They are deliberately the smallest
honest stand-ins: a rail of six nav rows with the first one lit, a table of
contents, a wordmark. Their `TOPICS` are `styles/layouts/web.js`'s own topics, so
a translated panel says what the picture said.

⚠ **They had to land in the same breath as the map that names them.**
`workspace.js`'s `paint()` draws a blank body for a template name it does not
recognise, and logs nothing — a translator emitting `rail` before `rail` existed
would have produced silent empty panels.

## The lazy import is a promise resolving to a function

```js templates.js
draw($body, panel){
	const tone = tone_of(panel);
	$body.append(import("/framework/styles/sections/" + name + ".js").then(m => () => m.default(tone)));
}
```

Section modules build with bare `div.c(...)`, which auto-appends to whatever
the *current* captor is. Resolving the promise straight to a called view
would run that call whenever the microtask lands — an unpredictable captor.
Resolving to a **function** instead routes through `View`'s `append_fn`,
which re-establishes `$body` as the captor before calling it. This is the
whole reason the file has no `await` anywhere in it. `space` uses the same shape
for `./generate.js`, which is how a forty-line generator stays out of here.

## ⚠ An `icon` the font does not carry renders as the word

Material Icons is a ligature font, so a wrong name is not a missing glyph — it
is 150px of literal text sizing every column of the popover grid. `depth` ships
`layers` for exactly this reason (`deployed_code` was the entry that proved it);
the three furniture entries ship `list`, `toc` and `label`, each measured square
at 20×20 in the font rather than trusted.
`toolbar.css` clamps `.panel-bar .icon` to `1em` so a future mistake can only
look wrong rather than re-lay-out the bar; the entry here is still where it has
to be right.

## The fifteen section adapters are generated, not written out

```js templates.js
...Object.fromEntries(Object.keys(SECTIONS).map(name => [name, section(name)])),
```

`SECTIONS` is the one hand-typed list (name → icon); `section(name)` builds
the `{ icon, tone: true, draw }` shape once and the spread produces all
fifteen entries. Adding a sixteenth section band to the site means adding
one key to `SECTIONS` here — nothing else in the module changes.

## `focus: true` — an entry that reads outside its own panel

`properties` is the twenty-eighth entry and the second to earn its own file
([properties.js](/framework/ext/Panel/files/), the same lazy shape as `space`).
Its flag is the declaration `workspace.js` reads:

```js templates.js
properties: { icon: "tune", focus: true, draw($body, panel){ … } },
```

`tone: true` says the entry reads `panel.get("tone")`; `focus: true` says it
reads the *workspace's* focused panel — and so is never handed focus itself, or
it would be inspecting the controls you are clicking. One flag, one predicate in
`workspace.js`, no registry:
[Focus, and the panel that reads it](/framework/ext/Panel/doc/focus/).

## `clock` self-cancels — and writes only while seen

`paint()` re-arms its own `setTimeout` chain only while the element
`isConnected`, and stops the first time it finds itself no longer connected
after having been connected once (`live` flag). A closed panel leaves
nothing running. ⚠ It never stops if the element is drawn but somehow never
connects at all — see the known gaps in
[Templates — the T vocabulary](/framework/ext/Panel/doc/templates/).

⚠ Connected is not visible. An SPA page you navigate away from keeps its DOM,
so `/framework/`'s clock stayed connected — and ticking — on every page of the
site, and each unseen write made Chrome DevTools redraw its Styles pane, once a
second, wherever you were inspecting (found via the generator pages,
2026-08-28). `paint()` now writes only while `offsetParent` is non-null; the
timer keeps ticking so the first visible tick — at most a second later — shows
the right time.

## Improvements

1. **`tone_of()` and `content()`-style helpers live in `workspace.js`
   (`vocab`, `content`), not here** — a reader learning "what does `tone:
   true` mean" has to cross files to find `panel.get("tone")`'s caller. A
   one-line comment pointing at `workspace.js`'s `tone_of` would close the
   gap cheaply. *(simple, useful)*
2. **`STATS` (the `wall` template's four numbers) is hard-coded site
   trivia** — "3 npm deps", "0 build steps" — with no link back to what
   verifies those claims. If any of the four ever goes stale (a fourth
   dependency gets added) nothing here would notice. *(medium, speculative)*
