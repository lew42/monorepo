# Meta tags that actually work

This site is a single-page app with no build step. One `index.html` loads `/app.js`,
the router walks the url, and the page you asked for imports itself. That is lovely
until you paste a link into Slack.

## What a crawler sees

A social-card fetcher does not run JavaScript. It asks for the url, reads the bytes,
and looks for `<meta property="og:title">`. On an SPA there is exactly one HTML file,
so every url on the site returns the same title, the same description and the same
picture — the site's, never the page's.

<figure class="blog-exhibit">

```html /index.html
<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>lew42</title>
	<script type="module" src="/app.js"></script>
</head>
<body></body>
</html>
```

<figcaption>The whole SPA shell. Correct for a reader, useless for a crawler: there is
nothing in it that could say which page you linked to.</figcaption>
</figure>

Server-side rendering is the usual answer, and it is not available here — production is
static files on a CDN, and the no-build rule means nothing may pre-process `public/`.

## The hybrid

A post gets its own real `index.html`, sitting on disk at its own url. That file carries
the meta tags as bytes, and its last line boots the same app everyone else gets.

<figure class="blog-exhibit">

```html /blog/how-this-blog-works/index.html
<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<title>How this blog works — lew42</title>
	<meta name="description" content="A static index.html for the crawlers…">
	<link rel="canonical" href="https://lew42.com/blog/how-this-blog-works/">

	<meta property="og:type" content="article">
	<meta property="og:title" content="How this blog works">
	<meta property="og:description" content="A static index.html for the crawlers…">
	<meta property="og:url" content="https://lew42.com/blog/how-this-blog-works/">
	<meta name="twitter:card" content="summary_large_image">

	<script type="module" src="/app.js"></script>
</head>
<body></body>
</html>
```

<figcaption>Static bytes above, the ordinary app below. Nothing about it is a special
case: it is the site's own shell with four extra lines and a title.</figcaption>
</figure>

Both halves work because of one detail that was already true. `app.js` resolves
everything from the site root, and every module resolves its neighbours against
`import.meta` rather than against the document, so a page booted from three
directories down loads exactly the files a page booted from `/` does. The router then
reads `location.pathname` — `/blog/how-this-blog-works/` — and walks it: root, then
`blog`, then the post. It lands on the post because that is the url, not because the
shell told it to.

## Two rules and a fallback

**The trailing slash is load-bearing.** The dev server runs `express.static` with
`redirect: false`, so `/blog/my-post` is not redirected onto the directory — it falls
through to the SPA shell and renders the post with the site's generic meta tags. Every
link the framework generates already ends in `/`, because a `Page`'s url always does.

**Nothing is duplicated by hand.** The title and description exist once, in
`posts.js`. `node public/blog/meta.mjs --write` stamps them into each post's
`index.html`; `--check` fails loudly if a post's shell has drifted from the manifest.
The output is committed, so the site is still exactly what is in the repo.

And if you forget to run it, the post still works. With no `index.html` in the post
directory, the request falls through to the SPA fallback — dev and Cloudflare both do
this — and the post renders normally, with the site's meta tags instead of its own.
Missing meta is a missing card, never a broken page.
