# Widths — design record

The meter for `styles/layouts/400/`. Ten urls — the five width-tier entries,
`styles/sections/full/` (the band they render), and the four `library/`
arrangements they cite — each read by `frame()` in a real viewport, never a
`zoom`d stage. No new measurement code: `measured()`/`finding()` come from
`../library/entry.js`, exactly as they run for the library's own catalog.

## The shape

```
page.js   four width buttons → measured(url, width, root), sequential, into a table
urls.js   the ten { label, url, root } rows — derives the five from ../../../styles/layouts/400/specs.js
readme.md this file
```

`urls.js` does not hand-list the five width-tier slugs: it maps `specs.js`
through `Page.slug()`, the same function `Page.declare()` uses to name a
POJO child. Renaming an entry there needs no edit here.

## The seam

A `demo.layout` page can't be measured directly — the stage fakes width with
`zoom`, and `.demo-screen` is in `probe.IGNORE`. Every width-tier entry wires
`route(name){ return name === "full" && full(this, () => this.layout()); }`
for a bare url `frame()` can load with no stage in the way. **The nested
`.page` `layout()` returns must carry `.ac("default")`**, or `Page.css`'s
arrangement contract hides it and the url renders empty with nothing thrown —
P1 hit this once; `entry.js` already carries the fix.

The four `library/` rows measure their own page directly, root `.lt-case-body`
— no `/full/` needed, since `root` already scopes past the code block, prose
and live rail that surround the specimen there.

## Measured (2026-08-15, live)

| entry | 400 | 1280 | 1920 | 3440 |
|---|---|---|---|---|
| Column | B | C | B | B |
| Wrap | B | A | A | A |
| Wall | B | B | B | B |
| Rows | B | A | A | A |
| Bands | B | A | A | A |
| Sections | F | D | D | D |
| Rail and content | A | A | A | A |
| Tile wall | A | A | A | A |
| Dashboard row | A | A | A | A |
| Section band | A | A | A | A |

The five width-tier rows and the four library rows match `styles/layouts/400/readme.md`
and the library's own numbers. **Sections was the one surprise, and it is settled: F/D
is real, A100 never was.** `direction.md` recorded "400 → A 100, zero findings … 3440 →
A 99, one low" the night this tier was first measured. `ai/2026-08-15/layout-overnight/forensics.md`
ruled out the analyzer — `rules.js`'s uncommitted diff predates both measurements by 4+
hours and the rule that fires here (`cramped`) scans `blockquote`/`div.section-band`
identically under the committed and working-tree versions. The cause is `frame()`'s own
350ms `settle` racing the iframe's boot in one already-connected browser tab: `root`
silently fell back to measuring `doc.body` instead of `.layout-full` and reported a
vacuous, contentless clean pass. Every fresh `chromium.launch()` run — the only kind
this meter runs — reproduces the real F/56 with `high cramped` on `blockquote` (×3) and
`div.section-band`, every time. `styles/sections/` itself hasn't changed since
2026-08-12, so nothing regressed; the earlier pass just measured too early, once.

## Traps

- ⚠ **`frame()`'s `root` can silently measure the wrong document.** `LayoutTool.js`'s
  `frame()` waits a flat 350ms `settle` after `onload`, then reads
  `doc.querySelector(root) ?? doc.body` — on a slow app boot the target element isn't
  in the iframe's DOM yet, the `?? doc.body` fallback fires, and the row reports a
  clean, vacuous pass instead of throwing. This meter's own Sections row hit it once
  (see Measured, above): trust a row only when its `used`/`measure` columns hold real
  numbers, not a suspiciously perfect score with nothing under it. Not this module's
  file to fix — `frame()` ships in `../LayoutTool.js` — named here because this is the
  page that would show you the false clean.
- A row whose url 404s or times out shows its `error` in its own cell —
  `measured()` already catches per `library/entry.js`; nothing here throws.
- Ten sequential `frame()` loads, never parallel — the library's own reason:
  a dozen iframes laying out at once compete for one main thread and the
  numbers drift.
