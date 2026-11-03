# The record — `site/<name>.json`, field by field

One file per site. It is the whole truth about that site: the pages render it and nothing
else. `<name>` is a short slug you pick — `stripe`, `mdn-css`, `wikipedia-css` — and it is
the site's url (`/websites/stripe/`) and the name of its picture directory.

**The file has two halves and they never touch each other.**

- **A machine writes** `url`, `title`, `captured_at`, `embed`, `embed_note`, `shots` and the
  whole of `scan`. Re-running a tool replaces them.
- **A person writes** `category`, `layout`, `sections`, `tags`, `responsive.strategy`,
  `responsive.breakpoints`, `notes` and `wire` — after looking at the pictures.

`tools/lib.mjs`'s `write_record()` merges by whole top-level key, which is what makes this
split safe: you can re-shoot a site a year later and your tags survive.

## A whole record, trimmed

```json
{
  "name": "stripe",
  "url": "https://stripe.com/",
  "title": "Stripe | Financial Infrastructure to Grow Your Revenue",
  "category": "marketing",
  "captured_at": "2026-09-08T05:15:02.113Z",
  "embed": "blocked",
  "embed_note": "x-frame-options: SAMEORIGIN",
  "shots": {
    "400": "site/stripe/400.jpg", "1280": "…", "1920": "…", "3440": "…",
    "long": "site/stripe/long.jpg"
  },
  "layout": { "3440": "1-centered", "1920": "1-centered", "1280": "1-flow", "400": "1-flow" },
  "sections": [
    { "name": "hero", "layout": "1-flow", "css": "block over a bleeding image",
      "note": "the copy sits on the centred 1232px measure; the gradient behind it runs off the right edge at every width." }
  ],
  "tags": ["1-centered", "3-equal", "cards", "4-1", "full-bleed", "hamburger", "max-width", "marketing"],
  "responsive": {
    "strategy": "Bands that bleed, content that does not. …",
    "breakpoints": [600, 640, 940],
    "queries": ["(max-width: 939px)", "(min-width: 940px)", "…"]
  },
  "scan": { "…": "machine-written, never hand-edited — see below" },
  "notes": "A marketing front page, and the opposite arrangement to the two documentation sites …"
}
```

## The fields

| field | who | what |
|---|---|---|
| `name` | tool | the slug; also the url and the picture dir |
| `url` | tool | the page that was photographed — one page, not the site |
| `title` | tool | `document.title`, as captured |
| `category` | you | one word: `marketing`, `documentation`, `reference`, `app`, `portfolio` … |
| `captured_at` | tool | when the shots were taken, ISO |
| `embed` | tool | `allowed`, `blocked` or `unknown` — read from the response headers, not tried |
| `embed_note` | tool | the header that decided it, verbatim |
| `shots` | tool | five paths, relative to `/websites/` |
| `layout` | **you** | the global layout id at each of the four widths |
| `sections` | **you** | the parts of the page worth naming, in reading order |
| `tags` | **you** | flat, free text — everything clickable on the site comes from here |
| `responsive.strategy` | **you** | one paragraph a newcomer can read |
| `responsive.breakpoints` | **you** | the two to four widths that actually move something |
| `responsive.queries` | tool | every `@media` string found in the CSS, deduplicated and sorted |
| `scan` | tool | the measurements — see [`tools.md`](./tools.md) |
| `notes` | **you** | the paragraph that explains the page like the reader is five |
| `wire` | **you** | optional — this page's global layout, redrawn with the content taken out |

## `layout` — the global arrangement, one id per width

An id is `N-name`: **N is how many columns the widest screen shows**, and the name says how
the room is divided. The names are CSS-agnostic on purpose — a two-column row is `2-equal`
whether flex or grid produced it, and the technique is a separate tag.

The seed words, defined in full at [`/layouts/`](/layouts/):

- `1-flow` — one column, rows following each other, each the full width
- `1-centered` — one column of limited width, with margins either side
- `1-bands` — a stack of full-width sections, each painting its own background edge to edge
- `2-equal` · `2-sidebar` (a narrow column beside a wide one; `left`/`right` is a tag)
- `3-equal` · `3-holy-grail` (narrow, wide, narrow)
- `n-wall` — the layout names a column *width* and the room decides how many fit
- `4-1` — a mosaic: a fixed grid whose tiles are different sizes

⚠ **There is no `N-cards` id.** A card is a visible background with padding — that is *paint*,
not a division of the room, so `cards` is a TAG that `2-equal`, `3-equal` and `n-wall` all
carry. The corpus once wrote `3-cards` and `4-equal`; the standard folded them into `3-equal`
and `n-wall`, and the records were rewritten to match.

**Say what you SEE at that width**, not what the CSS intends. Stripe's records read `1-flow`
at 1280 and `1-centered` at 1920 because that is where its cap starts to bite — the two
entries are the responsive story, and flattening them to one would throw it away.

## `sections` — the parts, named

```json
{ "name": "product bento", "layout": "3-cards", "css": "grid",
  "note": "rows of two and three cards, each a rounded surface with its own padding. One card per row below 940." }
```

`layout` takes the same ids (a modifier is allowed — `2-sidebar right`). `css` is the
technique in plain words (`grid`, `flex`, `float`, `flex at 400, grid at 1920`) — the
screenshot cannot tell you this and the scan can. `note` is one sentence: what it does, and
what it does when the window shrinks.

## `tags` — flat and free

Every tag gets its own page at `/websites/tag/<slug>/` listing every site that carries it.
**The whole vocabulary the corpus actually uses — all fifty-two words, grouped, with the
rule for writing a new one — is [`tags.md`](./tags.md).** Five kinds are worth writing:

- **layout ids** — `3-holy-grail`, `1-flow`. These also link to the standard.
- **techniques** — `2 column grid`, `3 column flex`, `float`
- **traits** — `max-width`, `full-bleed`, `cards`, `rail`, `measure`, `left` / `right`
- **behaviour** — `hamburger`, `sticky header`, `drawer`, `toc`
- **kind** — the site's own `category` word: `marketing`, `documentation`, `shop`

**No numbers in a tag.** `max-width 1232` and `hamburger at 896` can only ever match the one
site that has them, so clicking one is a link to the page you are already on. Write the plain
word and leave the number in `responsive.breakpoints` and in `notes`, where it is read.

**No capture notes either.** `bot wall`, `cookie modal` — true of that afternoon, not of the
site. They go in `notes`, in a sentence.

**A tag two sites share is worth more than a tag one site has**, because the whole point is
walking sideways. The front's filter row shows only tags that actually narrow the wall —
carried by more than one site and by fewer than four fifths of them.

## `wire` — the recreation, content removed

Optional. When a record carries a `wire` object, `Site.js` draws it under the four real
shots at the standard's own three widths — 400, 1920, 3440 — captioned "the same page with
the content taken out: only the boxes that decide the layout." When it does not, nothing is
drawn and nothing says so; this is evidence added once someone has looked, never a promise
every record makes.

**Who writes it, and when.** A person, after looking at the 1920 and 400 shots — the same
two that decide `layout`. Write the boxes that would produce the same picture with the words,
pictures and colours taken out; compare the drawing against both shots and adjust until a
stranger would match them. The field, field by field, with the fixed list of roles a box may
be: [`/layouts/doc/wire/`](/layouts/doc/wire/).

```json
"wire": {
  "role": "page",
  "kids": [
    { "role": "header", "h": "4em" },
    { "role": "hero", "h": "22em" },
    { "role": "footer", "h": "6em" }
  ]
}
```

## `scan` — never hand-edit

Written by `scan.mjs`; a re-run replaces the whole key. What is in it, and what
`side_by_side` means, is [`tools.md`](./tools.md).
