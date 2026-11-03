# R1 — blog architecture

Wave 1 of the blog program (`../blog-program/requirements.md` holds the owner's words verbatim).
The line this task exists to answer:

> blog posts should probably have their own index.html, so we can add meta tags that actually work?

…plus two unknowns the mastermind attached to it: **file structure** and **the un-centered 3440
reading layout** ("I don't like the narrow center column of text centered on my 3440 monitor,
it feels like a waste").

## The three questions, each answered by working code at `/blog/`

1. **Meta tags that actually work.** The site is a no-build SPA and production is static, so a
   crawler that does not run JS sees only `public/index.html`. Prototype the hybrid: a per-post
   `index.html` that carries real static meta tags **and** boots the framework so the post renders
   as a real Page at its own url. Prove both halves — `curl` showing the `og:` tags in raw HTML,
   and a headless load showing the framework page. A refutation with a working fallback is a
   first-class result.
2. **File structure.** How posts live on disk, where post metadata lives, how dates/ordering work,
   how a multi-part post nests. One real test post with two parts proves it. As simple as a person
   hand-adding a post would want.
3. **The un-centered 3440 reading layout.** Left-anchored measure with the freed right side
   earning its keep, degrading cleanly to 1920 and 400. Measure ink-to-edge at 3440 against a
   centered baseline.

## Fence

- Owns `public/blog/**` (new).
- `public/page.js` gets the homepage listing line — **not this task's**; report what it needs.
- No `Server/` edits. If the dev server blocks the hybrid, document exactly what is needed.
- Standing rules: never kill/restart the :80 dev server, never drive owner tabs, never stash,
  never commit. Probe screenshots to the session scratchpad; keepers here.
