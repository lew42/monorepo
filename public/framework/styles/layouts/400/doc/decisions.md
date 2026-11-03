# 400 — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

Curation, not construction: five class strings, one column at 400, each unstacking
on its own past it. Every card renders `../web.js`'s `site` — no new copy, no new
CSS, no stylesheet in this directory.

## The shape

```
page.js     the index — catalog() rail, the five below, this page as intro
entry.js    spec → a twin-card layout page, wired for /full/ (ext/DesignTool's seam)
specs.js    the five class strings themselves, and nothing else
```

## The five

| entry | class string | cites | vs |
|---|---|---|---|
| Column | `page full fill flex v` | — | **is** `library/bad/stacked-forever` |
| Wrap | `flex gap wrap` + `basis` + `flex: 1 1 24em` | `library/rail-content` | `bad/rail-that-never-wraps` |
| Wall | `grid gap auto`, `--column: 14em` | `library/tile-wall` | `bad/fixed-track-wall` |
| Rows | `flex gap wrap`, `20em` basis inside the row | `library/dashboard-row` | `bad/stacked-forever` |
| Bands | `pad` shell around a `measure flow` column | `library/section-band` | `bad/band-with-no-gutter` |

## Measured — `frame(fullUrl, w, { root: ".layout-full" })`, four widths

[`ext/DesignTool/widths/`](/framework/ext/DesignTool/widths/) is the live meter that
produced this table — it derives the five urls from `specs.js` via `Page.slug()`
rather than hand-listing slugs, so a renamed entry here needs no edit there.

| entry | 400 | 1280 | 1920 | 3440 |
|---|---|---|---|---|
| Column | B 84 | **C 75** | B 87 | B 87 |
| Wrap | B 85 | A 97 | A 92 | A 91 |
| Wall | B 85 | B 89 | B 89 | B 89 |
| Rows | B 85 | A 94 | A 100 | A 100 |
| Bands | B 80 | A 94 | A 94 | A 94 |

**19 of 20 cells: zero `high` findings.** The one exception is Column at 1280,
and it is a tool artifact, not a design one — `gutter` reports "text reaches
within -2px of `div.flex-1`'s edge," but every real text node in that box sits
15–30px off every edge (checked by hand). At 1280 the region's content is just
tall enough to grow a vertical scrollbar inside the `overflow-y: auto` band,
and the rule's edge math catches the scrollbar gutter, not the content. Per
fences, recorded here rather than chased with more code.

**Column's own `med measure` at 1920/3440 (~117 characters a line) is the
demonstration, not a bug.** It is the one entry with no `.measure` anywhere —
that omission *is* `bad/stacked-forever`, kept live so Wrap, Wall, Rows and
Bands have something to answer. Adding `.measure` would clear the finding and
erase the point.

**The shared `med heading-offset` at 400, on all five,** is `site.topbar()`'s
own icon-plus-wordmark lockup in `../web.js` — inherited content, not this
tier's arrangement, and outside this task's file ownership to touch.

## Traps

- ⚠ **The exact `route()` full.js's own docstring and `direction.md` quote —
  `full(this, () => this.layout())` — ships a hidden page.** `layout()` returns
  a second, un-Router-marked `.page`, and `Page.css`'s arrangement contract
  sets `display: none` on any `.page` nobody marked — nothing throws, the
  `/full/` url just renders empty (`ext/DesignTool` reported "5 characters of
  text" — the close icon, and nothing else). `demo.layout`'s own `frame()`
  method already does the fix (`this.layout().ac("default")`); `entry.js`
  does the same one-line thing by hand, since `frame()` also carries
  stage-only `height`/`background` this route doesn't want.
- ⚠ **`site.hero()`'s `h1` is sized for the full page, not a reading column.**
  Nesting it inside a narrow `.measure` (as an early draft of Bands did)
  laddered it to five ~10-character lines at 400 — a real `high measure`
  finding, not a false one. Bands renders `hero()` at full width, `.ac("wash")`,
  matching `landing.js`'s own precedent; only `sections()` sits inside the
  `measure flow` column.
- ⚠ **`pad` stacks.** `hero()` sets its own `--pad` inline, so wrapping it in
  another `pad` box doubles the inset and can squeeze its `h1` the same way.
  Column keeps `hero()` unwrapped and adds `pad` only around the plain
  `sections()` call, which has no padding of its own.

## Open

- No `parts:`/toggle chips on any of the five — each stays one clean class
  string end to end (RULE#6); direction.md's own recipes didn't ask for them.
- Wrap's own citation calls out the fix `library/rail-content`'s caption
  already names: the article needs its own `measure start`, or 1920/3440 run
  to 160–260 characters a line. Built in from the start here.
