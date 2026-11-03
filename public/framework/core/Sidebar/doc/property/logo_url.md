Where the logo points. Defaults to `/`.

## Usage

`Sidebar.js:51` — `header()`: `.href(this.logo_url ?? "/")`. One read. **No caller
in the repo sets it.**

## Necessity

Keep, on one argument, and it is a rule rather than a preference:

> **The logo always goes home; the text goes wherever the page that asked for it
> says.**

That is the same split `app.js:39` makes in `app.brand(text, href)` — the mark is
the site, the wordmark is the context. Two urls, two properties, and neither is
derivable from the other.

## Simplicity

Right-sized — one `??` on a line that exists anyway.

**Four properties for a two-element header** (`brand`, `brand_url`, `logo`,
`logo_url`) is the widest surface on this class, and two of them have never been
set. The readme weighs collapsing them against the fact that `header` already
replaces the whole thing: a site with an opinion about either url is a site that
should be passing `header`.
