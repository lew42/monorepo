# Home page: the blog posts as a sidebar: requirements

The owner, 2026-10-01: "let's also bring in all the blog posts to the home page for now just to have some content there. Maybe make it a sidebar or something." Verbatim in [owner-words.md](owner-words.md).

## Ask
- On the site's home page (`public/page.js`), add a **sidebar of the blog posts**, newest first: title, date, one-line description, linked. Read them from `public/blog/posts.js` (the manifest; it's data only, no post modules imported). Reuse the blog's existing card or rail pieces (`public/blog/`); don't build new ones.
- It sits beside the home content and doesn't push it down. On mobile it goes below the main content, or becomes a short list.
- Keep it small: only the home page changes.

## Rules
Use a pool worktree, then `merge.mjs` (smoke test). Screenshots at 400 and 1920 (it's a page layout). Model: Sonnet, no minions. Land it and stop.

