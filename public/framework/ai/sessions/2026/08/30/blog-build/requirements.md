# B10 — build the real `/blog/`

The ask, verbatim from the mastermind:

> TASK B10 — build the REAL `/blog/` from the two landed verdicts. First: run `new-task`
> (slug `blog-build`, group `pages`).
>
> READ FIRST, both are law: `public/framework/ai/2026-08-30/blog-arch/task.jsonl` + the
> working prototype at `public/blog/` (R1's architecture: posts.js manifest, `Post extends
> Page` self-lookup, per-post index.html + `meta.mjs --write` stamper, reading layout = left
> 40em measure + floating exhibits + 15em right rail, trailing-slash urls); and
> `/imagine/blogx/` + its readme (E2's verdicts: the MAGAZINE FRONT is the chosen shell —
> lead + linked posts + topics above the fold at 3440, no measure over 42em; the two-level
> rail on archive/post pages with derived active/in-path; parts-as-columns on wide;
> `<section>/<post>/` addressing). Run `code`, `layout`, `css` skills; `new-css-class`
> (`blog-` is already reserved); `documentation` + `finish-task`.
>
> THE STRUCTURE (mastermind-decided — build exactly this):
> - `/blog/` — the Magazine front (E2's #1), drawing from `posts.js`.
> - Sections: `framework` · `systems` · `ai`. Posts (write ALL SIX entries into posts.js
>   with these slugs/titles/descriptions — sibling writers are filling the dirs in parallel
>   RIGHT NOW; their dirs may not exist when you build — the front must render gracefully
>   from the manifest even while a dir is mid-build):
>   1. framework/hello-lew42 — "Hello, lew42" — the whole-framework introduction (3 parts).
>   2. framework/how-this-blog-works — R1's existing test post: keep it, fold it into the
>      manifest as a real post.
>   3. systems/layout-generators — "Generators: layouts and pages" — the space layout
>      generator + core/Page/generator.
>   4. systems/panel-playground — "Panel and Playground" — the two wireframing tools.
>   5. ai/dashboard — "The AI dashboard" — the ai/ task board, live jsonl logs.
>   6. ai/claude-tooling — "MCP, Playwright, and skills" — how Claude drives this site.
> - Section index pages (`/blog/framework/` etc.) — thin: the rail + that section's posts.
> - Your files: `/blog/page.js`, `/blog/posts.js`, `/blog/blog.css`, `/blog/meta.mjs`
>   (extend R1's), section `page.js` files, and the shared `Post` class file. NOT the six
>   post dirs (writers own those — the manifest entry is the contract; each writer was given
>   the same slug/title/description verbatim). Move R1's how-this-blog-works under
>   `/blog/framework/` per the addressing law (update its index.html canonical/og:url too).
> - Every post gets its `index.html` stamped via meta.mjs once its dir exists — stamp what
>   exists at your end; note which dirs were still mid-build.
>
> FENCE — `public/blog/**` EXCEPT the five new post dirs (framework/hello-lew42,
> systems/layout-generators, systems/panel-playground, ai/dashboard, ai/claude-tooling).
> Not public/page.js (the mastermind wires the homepage).
>
> TRAPS: every CSS rule in a layer; one backtick inside css(`…`) kills every page; no DOM
> after `await`; the trailing slash is load-bearing on post urls; `[read-end]
> [exhibit-start]` adjacent line-name groups silently kill a grid track list (R1's trap);
> headless Playwright global:
> `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`.
>
> VERIFY: the front at 400/1920/3440 (above-the-fold crops — the E2 bar: lead + posts +
> topics, nothing scrolled at 3440); a section page; how-this-blog-works cold at its NEW url
> with curl-verified og: tags; rail active/in-path at 2 depths; zero console errors (missing
> sibling dirs excepted — list them). Keepers + `links`.

## Fence

- **Mine:** `public/blog/page.js`, `posts.js`, `Post.js`, `blog.css`, `meta.mjs`,
  `readme.md`, `doc/`, `index.html`, the three section `page.js` files, and the move of
  `how-this-blog-works/` under `framework/`.
- **Not mine:** the five new post dirs — `framework/hello-lew42/`,
  `systems/layout-generators/`, `systems/panel-playground/`, `ai/dashboard/`,
  `ai/claude-tooling/`. The manifest entry is the contract between us.
- **Not mine:** `public/page.js` — the mastermind wires the homepage.

## The contract the writers build against

A post directory at `public/blog/<section>/<slug>/` holds:

```js /blog/<section>/<slug>/page.js
import { Post } from "/blog/Post.js";
export default new Post({ meta: import.meta });
```

…plus one `.md` per part (named by the manifest's `parts` keys), and an `index.html`
stamped by `node public/blog/meta.mjs --write`. Everything a post says ABOUT itself —
title, date, description, parts, image — lives in `posts.js` and nowhere else.
