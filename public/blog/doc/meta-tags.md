# Meta tags that actually work

**The question.** "Blog posts should probably have their own index.html, so we can add
meta tags that actually work?" — the owner, 2026-08-30.

**The answer: yes, and it costs one generated file per post.** A post's directory holds
a real `index.html` carrying the meta tags as bytes; its last line is the site's own
`<script type="module" src="/app.js">`, so the same url renders the real page. Both
halves were built and proved before this was written.

## Why the SPA cannot do it alone

`public/index.html` is the only HTML the site has. A crawler or a social-card fetcher
asks for a url, reads the bytes and looks for `<meta property="og:title">` — it does not
run JavaScript, so it sees the site's title on every url. `Router.activate()` writes the
real `document.title` a moment later, which is correct for a reader and invisible to a
fetcher. Server-side rendering is the usual fix and is off the table: production is
static assets on Cloudflare, and no build step may pre-process `public/`.

`public/index.html` carries its own card now — written by hand, not stamped. It is one
page with one description, and a stamper for a single file would be more moving parts
than the file. Everything under `/blog/` is stamped; the root is the exception, and the
only one.

## The hybrid, and why it boots

Three properties of the framework, all of them already true, are what make a nested
shell work with nothing changed:

- **`/app.js` is root-absolute**, and so is `framework.css`. A document three
  directories deep loads exactly the files `/` loads.
- **Every module resolves its neighbours against `import.meta`**, never the document —
  the rule CLAUDE.md lists under traps. Nothing shifts when the document url moves.
- **The router reads `location.pathname` and walks it.** `App.load()` calls
  `Page.load("/")` and then `router.load(location.pathname)`; the walk asks
  `root.child("blog")`, then `.child("how-this-blog-works")`. `Page.child()` falls
  through to a filesystem probe for an undeclared name, so nothing has to declare the
  post for the url to resolve.

## The evidence

**Half one — the bytes, no JS.** `curl http://localhost/blog/framework/how-this-blog-works/`
returns `200 text/html; charset=utf-8` and:

```html
<title>How this blog works — lew42</title>
<meta name="description" content="A static index.html for the crawlers, …">
<link rel="canonical" href="https://lew42.com/blog/framework/how-this-blog-works/">
<meta property="og:type" content="article">
<meta property="og:title" content="How this blog works">
<meta property="og:description" content="A static index.html for the crawlers, …">
<meta property="og:url" content="https://lew42.com/blog/framework/how-this-blog-works/">
<meta property="og:image" content="https://lew42.com/blog/framework/how-this-blog-works/card.png">
<meta property="og:image:width" content="1566">
<meta property="og:image:height" content="820">
<meta property="og:image:alt" content="The reading page at 3440px: prose held at its measure…">
<meta name="twitter:card" content="summary_large_image">
```

**Half two — the page.** Headless Chromium at 400 / 1280 / 1920 / 3440 on the same url:
the post renders, both parts route (`/blog/framework/how-this-blog-works/reading-page/` marks the
second part `active-page` and stands the first one down), and the console is empty at
every width. The transcript is in the task dir.

## What each server does

**Dev** (`Server/Server.js`) — `express.static("public", { redirect: false })`. A
request ending in `/` is a directory request and `serve-static` answers it with that
directory's `index.html` before anything else runs. Without the trailing slash,
`redirect: false` means no redirect is issued, so the request falls through to the SPA
fallback and gets the generic shell. **This is the exact behaviour `/fly/` has relied on
since 2026-08-17** — the note at `public/page.js:10` is about this same line.

**Production** (`wrangler.jsonc`) — Cloudflare Workers static assets, default
`html_handling` plus `not_found_handling: "single-page-application"`. A directory's
`index.html` is served at its url, and anything with no matching asset falls back to
`/index.html`. `/fly/` is the proof already deployed.

**No `Server/` change is needed.** This was checked before anything was built.

## Where the strings live

Once, in [`posts.js`](/blog/posts.js). `Post` looks itself up there by its own
`<section>/<name>`, so the page's title, byline and standfirst come from the manifest;
`meta.mjs` stamps the same strings into `index.html`.

**`image:` is the social card.** It is what a link unfurls into, and nothing more by
default — because every post's picture is a screenshot its own prose already shows in
context, and drawing it at the top of the page as well is the same picture twice, once
without the sentence that explains it. A post that has a picture made FOR the top says
`lead: true` beside it, and then the two cannot disagree. (`lead: true` is why the
front's featured flag is called `featured:` — one word meaning two things is also how a
boolean ends up shadowing the `lead()` method it was named after.)

**A card is 1.91:1, and `image:` usually is not.** A 4:1 screenshot letterboxes inside
one to an illegible strip, so a post whose picture is the wrong SHAPE adds
`card_image:` — a crop committed beside it, used for the card only. `image:` goes on
doing its other job, which matters because `how-this-blog-works` draws its at the top
of the page: one field per job is what keeps the crop from changing the post.

**A post with no `image:` still gets a card**: `meta.mjs` falls back to the first `.png`
in the post's own directory. A fallback, never the rule — it exists so a post full of
screenshots does not ship a text-only card because nobody wrote the field.

**The front and the section indexes borrow one.** A list has no picture of its own, so
the front takes the featured post's and a section its newest post's (`card_post()` in
the manifest). Derived rather than named: every path still has exactly one copy, and a
new post refreshes the card its section unfurls into.

**`og:image:width` and `og:image:height` are read out of the PNG's own IHDR** by
`meta.mjs`, never typed. A card renderer that has them reserves the right box before
the picture arrives, and one that is lied to reserves the wrong one — which is what
hand-written numbers become the first time a picture is recropped. An unreadable file
drops the two tags rather than guessing. `og:image:alt` describes the picture; it comes
from `alt:` in the manifest, defaulting to "Screenshot from “&lt;title&gt;”".

**A post that is commissioned but not written yet is skipped.** An entry in the manifest
is what commissions a post, so `meta.mjs` reports `pending` for a directory that does not
exist and never creates one — a directory holding an `index.html` and no `page.js` would
serve a url with a perfect social card and a blank page.

`node public/blog/meta.mjs` reports drift and exits non-zero; `--write` fixes it. The
output is committed, so `public/` still runs exactly as it sits on disk and the deploy
runs no tooling.

## The failure modes, and how bad each one is

| what | what happens |
|---|---|
| no `index.html` in the post dir | SPA fallback answers, post renders, generic meta tags |
| `index.html` stale vs `posts.js` | post renders correctly, the card is out of date; `meta.mjs` (no flag) catches it |
| link written without the trailing slash | post renders, generic meta tags |
| `posts.js` entry missing | post renders untitled with a console warning (`Post.unlisted`) |

Every one of them is a missing social card. None of them is a broken page — which is
the property that made this worth doing rather than a pre-render pipeline.

## Open

- **`og:image` per post is a real picture that has to exist** — a screenshot committed
  beside the post, chosen in the manifest or fallen back to alphabetically. The ASPECT
  is settled (1.91:1, cropped into `card_image:` when the screenshot is not that shape)
  and nothing else is: no minimum size, no rule about where the picture comes from, and
  `how-this-blog-works/lead.png` is still a picture of an older draft of its own page.
- **`site` is hard-coded** as `https://lew42.com` in `posts.js`. Branch previews deploy
  to `*.workers.dev`, so `og:url` and `canonical` on a preview point at production.
  Correct for the live site, wrong for a preview — nobody unfurls preview links today.
- **The rest of the site still has no per-page meta.** The same trick would work for
  `/resume/`, which is the other url anyone will paste. Not this task's call.
