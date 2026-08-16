Where the wordmark points. Defaults to `/`.

## Usage

`Sidebar.js:54` — `header()`: `.href(this.brand_url ?? "/")`. One read, nothing
else.

**No caller in the repo sets it.** Every sidebar here either takes the `/` default
or replaces `header` entirely.

## Necessity

Keep, and the reason is the case the default gets wrong. A section sidebar wants
its wordmark to point at *the section*, not at the site root — which is exactly what
`framework/page.js:26` does, via a replaced header:
`this.app.brand(this.title, this.url)`.

So the need is real and demonstrated; this property is the cheap way to meet it
without replacing the header, and it has one read and a `??`.

**It is also the narrow-screen escape route.** Below 52em the panel is a bar, and
the brand is the only link that is always visible — pointing it at the section index
is what gives a phone *"somewhere else"* to go.
[narrow](/framework/core/Sidebar/docs/narrow/).

## Simplicity

Right-sized. Separate from `logo_url` on purpose: **the logo always goes home, the
text goes wherever the page that asked for it says** — the same split `app.brand()`
makes. Merging them into one `href` would lose that.

Zero callers is the honest status. It is one `??` on a line that has to exist
anyway, so the cost of keeping it is nil and the cost of removing it is a breaking
change for a case that will come.
