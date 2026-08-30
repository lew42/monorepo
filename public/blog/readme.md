# Blog

Posts at `/blog/<section>/<post>/`, in three sections — `framework`, `systems`, `ai`.
Each post is a directory: a two-line `page.js`, one entry in [`posts.js`](/blog/posts.js),
and its prose as `.md` files. A post can be in parts, and each part is a real page at its
own url.

Three things here are not like the rest of the site: `/blog/` is a **magazine front**,
every post also ships a **static `index.html`** so a link unfurls with its own meta tags,
and a post uses its own **reading layout** — the measure hard left, everything wide beside
it.

## Use

Adding a post — four steps, one of them optional:

1. an entry in `posts.js`: `section`, `name`, `title`, `date`, `description`, optional
   `image`, optional `parts`
2. `<section>/<name>/page.js` — `export default new Post({ meta: import.meta })`, the
   whole file
3. `<section>/<name>/post.md`, or one `.md` per key in `parts`
4. `node public/blog/meta.mjs --write` to stamp `index.html`

Writing a post: anything wider than prose goes in `<figure class="blog-exhibit">`, which
takes the space to the right of the reading column.

## Watch out

- **A factory callback with a block body must `return`.** `() => { this.head();
  this.read(); }` dropped the promise `md.file()` returns and every single-part post
  rendered an empty column — no error, no 404. [File structure](/blog/doc/structure/)
- **The trailing slash is load-bearing.** `/blog/x/y/` gets the post's static shell;
  `/blog/x/y` falls through to the SPA and loses its meta tags. Every framework-generated
  link already ends in `/`. [Meta tags](/blog/doc/meta-tags/)
- **`image:` is the social card, not the picture at the top.** Add `lead: true` for that,
  and only when the picture is not one the prose already shows in context. The front's
  featured flag is `featured:`, deliberately not `lead:`.
- **`meta.mjs` is not a build step** — you run it, the output is committed, and a stale
  or missing `index.html` costs a social card, never a page. It never creates a post's
  directory: an entry in the manifest *commissions* a post, and it reports the ones
  nobody has written yet.
- **Posts are not declared as `children`.** The front would have to import every post
  module to print a list of titles. The route walk finds them anyway; `posts.js` is what
  links them. Sections *are* declared — they import nothing but the manifest.
- The exhibit column is a `float`, not a grid column. A grid made a ~300px hole in the
  reading column at every figure. [Reading page](/blog/doc/reading-page/)

## More

- [The front](/blog/doc/front/) — the magazine, the site shell it borrows, the addressing, the measurements
- [File structure](/blog/doc/structure/) — files on disk, the manifest, multi-part posts
- [Meta tags](/blog/doc/meta-tags/) — the hybrid, what the dev server and Cloudflare each do, the evidence
- [Reading page](/blog/doc/reading-page/) — the un-centered layout, measured at 400 / 1280 / 1920 / 3440
- Files: `page.js` (the shell **and** the front), `posts.js` (the manifest), `Post.js`
  (the reading page + the card and hero every index draws), `Section.js`, `blog.css`
- Where it came from: `framework/ai/2026-08-30/blog-arch/` (the architecture),
  [`/imagine/blogx/`](/imagine/blogx/) (eight shells, judged at 3440),
  `framework/ai/2026-08-30/blog-build/` (this build)
