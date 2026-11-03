# websites — real sites, shot at four widths and tagged by the layout they use

The corpus. One json per site under `site/`, five jpegs beside it, and pages that render
them. `/layouts/` is the standard that names each arrangement; this is the evidence that
cites it.

## Use

Add a site — three commands from the repo root, then look at the shots and write the half a
machine cannot:

```sh
node public/websites/tools/shoot.mjs https://stripe.com/ stripe   # five jpegs + the record
node public/websites/tools/scan.mjs  https://stripe.com/ stripe   # the DOM + CSS measurements
node public/websites/tools/index.mjs                              # the manifest the pages read
```

Then open `site/stripe.json` and fill `layout`, `sections`, `tags`, `responsive.strategy` and
`notes` **after looking at the pictures** — [`doc/schema.md`](./doc/schema.md) is the field-by-field
contract. Re-run `index.mjs`. The site is live at `/websites/stripe/`.

Add one more field, `wire`, and the site's own page draws the recreation — the same page with
the content taken out — under the four real shots: [`doc/schema.md`](./doc/schema.md), the
drawing spec at [`/layouts/doc/wire/`](/layouts/doc/wire/).

## Watch out

- **Look at the shots with your own eyes before you tag.** The scan says a box is a grid of
  three tracks; only a reader can say the three are cards and that they stack at 940.
- **`scan` is machine-owned and never hand-edited** — a re-run replaces it. Everything above it
  in the file is yours, and a re-run leaves it alone: [`doc/schema.md`](./doc/schema.md)
- **A tag is a control, so a number never goes in one.** `max-width 1232` matches exactly one
  site and clicking it is a link to the page you are on; the px stays in the record's prose.
  The whole vocabulary, and what was folded into what: [`doc/tags.md`](./doc/tags.md)
- **Inline `<style>` text is half the CSS on a modern site** and is not a network response —
  a Framer-built page scanned as 0 stylesheets and 0 media queries until `scan.mjs` read it:
  [`doc/tools.md`](./doc/tools.md)
- Roughly half the web refuses to be framed, so the screenshots are the primary evidence and
  the live viewer is the bonus: [`doc/decisions.md`](./doc/decisions.md)
- **Opening a site page must not fetch that site.** The live frame is built only when the
  reader presses "Load the live site" — an `<iframe src>` written into the markup is a request
  the instant it parses, so a page view used to be a visit to somebody else's server. Proved
  headless, with the hosts before and after: [`doc/decisions.md`](./doc/decisions.md)
- The pages read `site/index.json`, never the directory — production is static and nothing
  crawls. Forget `index.mjs` and a new site is invisible: [`doc/decisions.md`](./doc/decisions.md)
- framework.css caps every iframe at `max-width: 100%`, which silently rendered a "3440" frame
  at 1766px with the right label on it: [`doc/decisions.md`](./doc/decisions.md)
- A `sections[].layout` id is clickable too, on its own list, "as a section, on:" —
  `/websites/tag/<id>/` and `/layouts/<id>/` both draw it from `index.mjs`'s `sections` key, kept
  separate from a site's *global* `tags`: [`doc/decisions.md`](./doc/decisions.md)

## More

- [The corpus](/websites/) — the wall · [every tag](/websites/tag/)
- [`doc/schema.md`](./doc/schema.md) — what a record holds, field by field, and who writes each half
- [`doc/tags.md`](./doc/tags.md) — all fifty-two tags, grouped, and the one rule for writing one
- [`doc/tools.md`](./doc/tools.md) — what the three Node scripts measure and how they behave
- [`doc/decisions.md`](./doc/decisions.md) — why a manifest, why jpeg, why not the CSSOM, why the viewer scales
- [`tools/readme.md`](./tools/readme.md) — one line per tool
- Files that matter: `Site.js` (one record, and the shared wall), `page.js` (the front),
  `tag/page.js` (one page per tag), `Site.css` (the strip, the viewer, the wall)
