# critique-fixes

Execute the critique wave's accepted fixes. Source detail: `../critique-blog/task.jsonl` and
`../critique-imagine/task.jsonl`. The eight items below are the mastermind's accepted subset —
the DO list. Anything else in either critique is out of scope.

## The list

1. **Root social meta** — `public/index.html` (the SPA shell) ships zero meta: add description,
   canonical (https://lew42.com/), og:title/description/type/image + twitter:card. Choose an
   existing committed image for og:image (e.g. a blog post PNG) — do not generate one. Keep the
   shell otherwise byte-minimal.
2. **Tooling post opener** — `public/blog/ai/claude-tooling/post.md` opens "Every page on this site
   was built by Claude": false ("every" fails testing) and mis-frames for hiring. Rewrite the
   opening paragraph to the true story: the owner designed and built the framework, and directs AI
   agents through briefs/verification/logs to build with it — the board is the proof of process.
   Keep the rest of the post.
3. **Homepage demo hrefs** — `public/page.js` `stage()`: the mini-app's four page links emit real
   hrefs (/web/html/ etc.) that 404 for middle-click/crawlers. Fix so no dead href is emitted
   (demo.app option, or hrefs that resolve — check what ext/demo's app.js emits and fix at the
   right level; if in ext/demo, keep it additive).
4. **`.demo-note` band** — ext/demo's note wears `max-width: var(--measure)`, so the tint stops at
   45% width at 3440 on the homepage centerpiece. Make the BAND paint full-width while the TEXT
   keeps its measure (wrapper vs text element).
5. **3440 post openers** — three posts open with ~2000px empty between a 700px column and the rail
   (first exhibit at y>1000). In `public/blog/blog.css`/`Post.js`: at wide container widths, let the
   first exhibit float beside the opening prose (above the fold) — the 1920 layout is a KEEPER, do
   not disturb it; container-query the wide case only. Verify on all six posts.
6. **og card gaps** — `public/blog/meta.mjs` + `posts.js`: give /blog/ and the three section
   indexes an image (reuse a post image); emit og:image:width/height + alt everywhere; the two
   letterboxed images (4.2:1, 4.45:1) get re-cropped to ~1.91:1 from their existing source shots if
   possible, else swapped for a better existing PNG from the same post. Re-stamp all shells;
   curl-verify 3.
7. **blogx post_card void** — `/imagine/blogx/` cards pin text to the bottom leaving an unmarked
   void: give the void an honest treatment (a tint block or the text top-aligned — smallest change
   that stops it reading broken) across the shells that share the card.
8. **colstyles hook 7** — the drag-seam demo box is 24em, under core's 32em mobile-paging floor, so
   the seam it demonstrates is display:none. Widen that one demo box past 32em (and confirm the
   seam shows).

## Fence

Exactly the files above (+ `ext/demo` where items 3/4 root there). Nothing else.

## Rules

- Never kill/restart the :80 dev server (it is DOWN — run a private `$env:PORT='8095'; node server.js`,
  tear it down after). Never drive owner tabs. Never stash. Never commit.
- Never write the owner's name into anything.
- Screenshots to the scratchpad (`critfix-*`); keepers to this task dir.

## Traps

- Every CSS rule inside a layer; one backtick inside `` css(`…`) `` kills every page;
  demo `min:` never `height:`.
- The homepage grid and the 1920 reading layout are KEEPERS — before/after shots must show them
  unchanged.
- Headless playwright global: `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`

## Verify

Per item, re-run the critique's own repro (curl for 1/6; middle-click href audit for 3; 3440 shots
for 4/5/7; the seam visible for 8), zero console errors site-wide spot-check (10 urls), keepers
unchanged.
