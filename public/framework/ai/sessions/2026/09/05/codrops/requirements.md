# codrops — build brief (Sonnet, round 1 of several)

Read first: the repo's `CLAUDE.md` (law 2; no build step; no npm dependency; every CSS rule in a layer), `../mastermind-night/requirements.md` (the night's rules), `../../2026-09-04/mastermind-platform/minion-rules.md`. Skills: `new-task` (this dir, group `codrops`), `code`, `layout`, `new-page`, `css`, `new-css-class` (prefix `codrops-`), `ui-test`, `documentation`, `finish-task`.

## The owner's words

> can you spawn minions to try and integrate codrops (tympanus.net/codrops/) examples using the framework? create an imagine page for this, and keep this running at usage pace.

## Deliverables (numbered)

1. **`/imagine/codrops/`** — a new realm (the mastermind registers it). Its page opens with the plain sentence: *Codrops publishes free demos of web effects; these are a few of them rebuilt as pages on this framework, so you can see what carries over and what does not.* Then one card per ported demo (a still, the demo's name, a link to the original), and a table: demo · original url · licence · what it needed (CSS only / JS / a library we cannot take) · what changed to fit the framework.
2. **Port three demos in this round**, chosen for these rules: MIT-licensed (check the repo's LICENSE on github.com/codrops — say which file you read), vanilla CSS/JS or a dependency we can drop (no GSAP, no npm), visual and self-explaining (a hover effect, a page transition, a scroll effect, a menu, a grid). Good candidates to look at first: "Grid item hover effects", "Page transitions", "Scroll-based animations", "Menu hover effects". Fetch the original with WebFetch; read its CSS/JS; rebuild it as `codrops/<slug>/page.js` (+ its own `.css` in a layer, prefix `codrops-`; vendored JS only if it is the demo's own MIT code, with the licence header kept). Each page opens with what the effect is and how to trigger it, then the effect, then a short "what carried over" note.
3. **The framework's own words first.** Where the demo's layout is a grid or columns, use `framework.css`'s words (`.grid.auto`, `--column`, the spacing clamps) instead of the demo's CSS; where the effect needs its own CSS, keep it minimal and in `@layer site`. Note each substitution in the table.
4. **Docs:** `readme.md` (what this realm is, the porting rules, the table) — so the next round's minion continues from it.

## Prove it

`ui-test` each effect's trigger (hover/scroll/click) with a screenshot before and after; zero console errors at 400/1280/1920/3440; no horizontal overflow; `prefers-reduced-motion` respected where there is motion.

## Fences and budget

Write only `public/imagine/codrops/` (new), `css-scopes.txt` via the skill, this task dir. No npm, no CDN scripts (the site is static and self-contained), no images over 200KB. Budget ~250k tokens. Report in ≤ 12 lines: the realm url, the three demos with their original urls and licences, what could not be ported and why, the substitutions, tokens.
