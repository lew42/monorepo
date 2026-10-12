# post-hello — the flagship blog post

## The ask (verbatim, from the blog program brief)

> write a blog post about the whole framework, try to introduce it better.
> keep the posts simple, visual, link to the things.

## Contract (fixed by the blog shell builder, running in parallel)

- slug `framework/hello-lew42`, title "Hello, lew42", description: the whole-framework introduction
- 3 parts, dir `public/blog/framework/hello-lew42/`
- `page.js` = `new Post({ meta: import.meta, parts: {...} })`, prose in one `.md` per part
- images in the post dir (they are content), `node public/blog/meta.mjs --write` at the end

## The post

Reader: a hiring engineer who has never seen this repo. First person, plain, zero marketing
words. Every claim clickable.

1. **No build step** — public/ runs as written; native ESM; a page.js IS a page; view-source
   honesty. The whole boot in a few short real snippets.
2. **Pages are navigation** — the Page tree, children, the Router, previews-as-nav, columns.
   This part LINKS instead of explaining.
3. **Built in the open** — the AI task board in a paragraph (link the deep post), the layered
   CSS in a paragraph, what's next.

2-4 real screenshots, 1920, cropped tight, optimized PNGs in the post dir, total < 1.5MB.

## Fence

`public/blog/framework/hello-lew42/**` only. Never edit posts.js, Post.js, blog.css — the
shell builder owns them. Never kill the :80 dev server, never drive owner tabs, never stash,
never commit. Never write the owner's name anywhere.
