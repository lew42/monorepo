# Homepage (W3c) — the front rebuilt for job prospecting

## The ask (verbatim)

> TASK W3c — the homepage, rebuilt for job prospecting.
>
> THE AUDIT VERDICT (`ai/2026-08-30/site-audit/`): `/` grades 2/2/2 — hero text + link cards,
> NO live demo above the fold, and the audit's whole-site headline is that entry pages tell
> instead of show. THE OWNER'S ASKS this week, all landing here: blog posts listed on the
> homepage; strong overview + navigation above the fold; a compact demo that shows something
> important; full-3440 utilization (never a narrow centered column).
>
> READ FIRST: `public/page.js` as it stands (the Sidebar + sections pattern, the deliberate
> no-$pages comment, `hides-nav` — keep those mechanics; a Blog entry was just added to
> `sections`); `/blog/posts.js` (the manifest — the homepage lists posts FROM it, never a
> second copy); the three audit best models; `core/Page/doc/findings.md` (the composition
> vocabulary: golden pairs, tone steps, content-kind map — a nav list gets a fixed track).
>
> THE FOLD at 1000px, all three widths, should hold: (a) the one-line thesis ("a web framework
> with no build step" — sharpened, not marketing), (b) ONE compact live demo that shows the
> framework being itself (your judgment: the column row, the generator, or the palette —
> embedded small via demo machinery, `min:` never `height:`), (c) the blog — latest 2-3 posts
> as real cards from the manifest, (d) the section nav (existing cards). At 3440 the fold earns
> the width per the decks findings (share out regions; the demo and blog can sit beside the
> hero, not under it). At 400 it stacks clean.
>
> FENCE — `public/page.js`, `public/styles.css` (only if the homepage needs a rule — check
> where its current CSS lives first), any new image asset in `public/` root scope. Nothing else.
>
> TRAPS: every CSS rule in a layer; one backtick inside css(`…`) kills every page; the homepage
> wears `hides-nav` and its own Sidebar — keep that contract; the root is an active-ancestor
> everywhere (don't leak homepage-only styles site-wide — scope by its own class); no DOM after
> `await`; headless Playwright global.
>
> VERIFY: above-fold crops at 400/1920/3440 before/after (the before is the audit's shot 02),
> the demo live and unclipped, blog cards linking to real posts, every link resolves, zero
> console errors, the sandboxes/notes line still present (it's the owner's), site pages
> unregressed (the root renders on every route as an ancestor — crawl 5 deep pages).
> Keepers + `links`. Report: the fold contents at each width, the demo chosen + why,
> before/after grades, cuts.

## Fence

`public/page.js`, `public/styles.css` (only if needed), new image assets in `public/` root
scope. Nothing else — not the demos, not the blog, not `core/Page`.

## Rules

Never kill/restart :80 (down — private `$env:PORT='8097'` node server, tear down after).
Never drive owner tabs. No stash, no commit. Never write the owner's name into anything.
Screenshots to the scratchpad (`home-*`); keepers here.
