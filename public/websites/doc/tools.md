# The tools — what they measure, and how they behave

Three Node scripts in `tools/`, run from the repo root. **They never run in the browser**:
they drive a headless Chromium, they write files, and the site is static. Playwright is a
global npm install, not a dependency of this repo — `lib.mjs` imports it by absolute path
(override with `PLAYWRIGHT_PATH`).

```sh
node public/websites/tools/shoot.mjs <url> <name>
node public/websites/tools/scan.mjs  <url> <name>
node public/websites/tools/index.mjs
```

`lib.mjs` holds what all three share: where records live, `read_record` / `write_record`,
`launch()`, and the four widths — written down in exactly one place.

## `shoot.mjs` — the pictures

Five jpegs into `site/<name>/`, and it creates or merges `site/<name>.json`.

| shot | viewport |
|---|---|
| `400.jpg` | 400 × 844 — a phone |
| `1280.jpg` | 1280 × 800 — a laptop |
| `1920.jpg` | 1920 × 1080 — a desktop |
| `3440.jpg` | 3440 × 1440 — an ultrawide |
| `long.jpg` | 1280 × 4000 — the whole page in one picture |

One load per width: `waitUntil: "load"` then a fixed 1.5 s settle. `networkidle` is never
used — it hangs forever on any site that long-polls or runs an analytics heartbeat.

It also reads the main response's headers and decides `embed`:

- `x-frame-options` present at all → **blocked**
- `content-security-policy` carrying `frame-ancestors` that is not `*` → **blocked**
- neither → **allowed**

That is a header read, not an experiment — the site's own answer, before we try to frame it.

## `scan.mjs` — the measurements

Loads the page once at each of the four widths and writes `scan` plus `responsive.queries`.

**Per width, it records two sets of boxes.** First every landmark — `header nav main aside
footer section article`, up to 20. Then `[role]` boxes that are not already caught, filtered
hard: not `svg img input button a li span path`, and bigger than 20,000px². Then the five
largest remaining boxes by area, which on a div-soup site with no landmarks at all *are* the
layout.

For each box: `display`, `grid-template-columns` / `-rows`, `flex-direction`, `flex-wrap`,
`position`, `columns`, `float`, its rect — and:

**`side_by_side` — the column count a person would count.** Group the box's own children by
the top of their rectangle (8px of slack absorbs baseline wobble) and take the biggest group.
One row of three cards reports 3; a stack of rows reports 1. It is the number that matters
because it is *technique-agnostic*: a flex row, a grid, floats and inline-blocks all report it
the same way, which is the whole point of naming layouts by what they look like.

**The CSS comes off the wire, not the CSSOM.** On any real site `styleSheet.cssRules` throws
for every cross-origin sheet — five of five on stripe.com — so a CSSOM read would report a
site with no breakpoints at all. `scan.mjs` collects every response whose `content-type` is
`text/css`, adds the inline `<style>` text, and regexes `@media` and `@container` out of that.
`getComputedStyle`, by contrast, works everywhere and *is* the result of the cascade.

**Inline `<style>` text is half the haystack, and it used to be missing.** A `<style>` block
is never a network response, so `page.on("response")` cannot see it. The first version of
this tool counted the inline BYTES and left the TEXT behind in the page, which meant any
site that ships its CSS inline — every Framer build does — reported **zero stylesheets and
zero media queries** while being fully responsive: privy.io scanned as 0 sheets against
286,241 bytes of inline CSS and no breakpoints at all. `measure()` now returns the inline
text itself, deduplicated across the four loads, and `scan.css` reports `inline_blocks`
beside `sheets` so the two halves are visible. Proved 2026-09-08 on a local page with one
inline `<style>` and no stylesheet: `0 sheets + 1 inline blocks / 549 bytes, 3 media
queries` and one `@container`. **A record scanned before that fix under-reports its
queries** — `css.sheets: 0` with a big `inline_bytes` is the signature.

It also writes `breakpoints_seen` — every px value any query mentions, most-used first. That
is a shortlist to pick `responsive.breakpoints` from, not a verdict: a site's real breakpoints
are the two or three of those that actually move something on screen.

**A defect worth knowing about, because it was in the first version.** The landmark selector
originally included a bare `[role]`, and on stripe.com that spent the entire budget on ten
identical 142 × 34 `<svg role="img">` customer logos while the page's actual sections fell off
the end of the list; on Wikipedia it filled up with absolutely-positioned menu checkboxes.
Landmarks now get their own pass first. **A scan that returns a full list is not the same as a
scan that returned the right list** — read the summary before you trust it.

## `index.mjs` — the manifest

Reads every `site/*.json` and writes `site/index.json`: one small entry per site (name, title,
url, category, `layout`, `tags`, one picture), `tags` — a map of tag → the names carrying it —
and `sections`, the same shape keyed by every layout id that shows up in a `sections[].layout`
somewhere on the page (a modifier like `2-sidebar right` is stripped to its bare id first). All
three are sorted, so a rebuild with no change produces a byte-identical file and a diff only
ever shows a real edit.

**Run it after every shoot, scan or hand-edit.** The pages read this file and never the
directory — see [`decisions.md`](./decisions.md).
