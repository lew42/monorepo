# small-wins-sweep — requirements (verbatim)

Repo: c:\Code\lew42\monorepo. Laws: 1. Less is more. 2. Clarity is the one exception. 3. Prioritize. Final report ≤10 lines. Read CLAUDE.md. HARD RULES: never kill/restart the :80 dev server (private `$env:PORT='8099'; node server.js`, torn down after); never drive owner tabs; never stash; never commit. Run `new-task` first (slug `small-wins-sweep`, group `pages`).

TASK — five XS/S items from the 08-31 improvers' ranked roadmaps, each independent; land what proves clean, skip (and say so) anything that grows:

1. **/blog/ sitemap.xml** — static file beside feed.xml listing every published post url + the blog root + the site root, generated the same way meta.mjs works (a small .mjs run by hand, output committed — no runtime server). Validate the xml parses; every url in it returns 200 on the private port.
2. **/blog/ prev/next in multi-part posts** — hello-lew42 is 3 parts; each part should link its neighbors at the bottom (the posts.js manifest knows the order). Match the existing next_up() styling; no new css if the existing classes serve.
3. **/blog/ section labels on the index** — the blog index lists posts; posts belong to sections (framework/systems/ai). If the index doesn't already show the section, add a quiet label per card from the manifest — data it already has.
4. **/imagine/decks/ position numeral** — an N/M readout in each deck's footer chrome (the shared deck.js chrome, once — never per cut). Updates on keyboard paging (the Space/arrows mixin just landed).
5. **/imagine/mag/ previous hop** — the mag improver left "previous hop" ranked top: whatever forward hop exists, add its mirror. Read `/imagine/mag/` first to see the mechanic.

FENCE — `public/blog/**`, `public/imagine/decks/**`, `public/imagine/mag/**`. Warning: posts.js is the single source — labels/ordering read it, never duplicate it.

VERIFY: each item headless-proven (sitemap urls 200 ×all; prev/next click-through both directions; a screenshot each for labels/numeral/hop), zero console errors on touched pages, 400/1920/3440 where layout changed. Keepers + `links`. Report: 5 lines, one per item — landed+proof or skipped+why; cuts.
