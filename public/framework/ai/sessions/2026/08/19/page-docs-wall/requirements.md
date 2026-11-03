# page-docs-wall — `/framework/core/Page/` Overview becomes a browsable wall: navigation band, recipes, JS last

**Laws first** (CLAUDE.md): less is more — ASAP; clarity is the one exception; prioritize; show, don't tell. **Length budget:** the wall and its cards ARE the deliverable; the Overview's prose is ≤ 3 lines above the wall; each NEW demo page ≤ 80 lines; report ≤ 8 log lines + one headless png of the wall at 1280. Load `code` before JS, `new-page` once.

## The owner's words (2026-08-19)

> focus the core/Page (overview) on a visual, browsable grid(s) of page examples. look at the styles/layouts/? … pages ARE navigation. you navigate children. these are all core concepts… i want to be able to find everything page related when i come to this core/Page page. i'm less concerned with js code examples… the problem is the CSS and layout.

## The design (from [`../page-layout-audit/proposal.md`](../page-layout-audit/proposal.md) §6 — read it)

Overview = `this.browse(BANDS, tokens)` — the `styles/layouts/` model (`styles/layouts/page.js:10-17, 47`; `ext/catalog/browse.js` header). **Not** `catalog()`. Bands, in reading order, one grid each:

```js
const BANDS = {
    "Pages are navigation": "page children mounts replace route",
    "The box":              "shell measure inset region full",      // built by a sibling agent — list them, don't build them
    "Recipes":              "wall catalog dashboard strip columns landing docs site",
    "JS, last":             "labels render",
};
```

## Fences

You own: `core/Page/page.js`, `core/Page/old/page.js` (one line), `core/Page/old/intro/` (new), `core/Page/overview/` EXCEPT `overview/{shell,measure,inset,region,full}/` (a sibling Opus agent is building those five RIGHT NOW — never create or edit them; your wall lists them and their cards 404 until it lands, which is expected). Never `core/Page/Page.class.js`, `Page.css`, `ext/**`, `ext/Panel/**`. Edit tool outside `core/Page/`.

## Steps

1. **Preserve the intro.** The Doc's current `content()` (the "Save that as /docs/intro/page.js…" prose, Children, cards, titles, dormant) moves verbatim into a new `core/Page/old/intro/page.js` (a plain Page, title "Intro", `content()` = that body; `import` what it uses from `/app.js`); add `intro` FIRST in `old/page.js` `children:`.
2. **Copy the keepers.** `cp -r core/Page/old/overview/{page,children,route,labels,wall,catalog,dashboard,strip,columns,landing,docs,site} core/Page/overview/` (create `overview/` — the dir is new; the Doc's Overview SECTION already has the url `/framework/core/Page/overview/`, so `overview/<name>/page.js` is exactly where `overview:` looks). Each is `demo.tree({ meta: import.meta, group, tree })` — `meta` re-derives the url, so copies just work; leave `old/overview/*` untouched. Fix any relative links inside the copies that pointed at `../../` (they are one level shallower now).
3. **Two new demos, band 1.** Same `demo.tree()` shape as `overview/page/page.js` (read it and `ext/demo/readme.md` first):
   - `overview/mounts/` — *where a child mounts*: ONE tree (`parent → child`) shown three ways side by side: the child in `app.$pages` (a sibling of the parent's view), in the parent's own `$pages` (parent sets `this.$pages` in `render()`), in a `tabs()` region. Each column labels its claim — `Page.container()` is `regions → nearest $pages → app.$pages` (`core/Page/Page.class.js:160-168`). Live, not a picture: navigate each mini-app to the child and watch where it lands.
   - `overview/replace/` — *replace vs keep*: the same two-page tree twice; left mounts the child beside the parent (parent disappears — "replace"), right mounts it inside (parent stays — "keep"), with the two classes the Router writes (`.active-page`, `.active-ancestor`) and the one CSS line that decides (`Page.css:8`) shown under it. A `demo.app()` per side; click between parent and child.
4. **One new page, band 4.** `overview/render/` — the `render()` override: the three things an override owes (set `this.view`, carry `.page`, never nest a second `.page` — `core/Page/readme.md`) as one ≤ 40-line demo with one correct and one broken override, the broken one labelled.
5. **`core/Page/page.js`.** Restore `overview:` as the BANDS-derived list (`Object.values(BANDS).flatMap(b => b.split(" ")).join(" ")`); the `overview_section()` override the restructure added renders `this.content()` plain — keep that, and make `content()` = ≤ 3 lines of `md` ("A page is a url, some content, and children — and **pages are navigation**: you navigate children. Every example below is live.") then `this.browse(BANDS, { "--column": "22em", "--gap": "2em", "--stage-max": "14em" })` — the exact tokens `styles/layouts/page.js:47` uses; lower `--column` only if the wall reads cramped at 1280. `files:` — add the `overview/*/page.js` you created/copied AND the sibling's five (`overview/shell/page.js` …) so the Files tab is honest when both land. Keep `children: "old"`.
6. **Verify headless** (Playwright from the scratchpad, `page-docs-wall-probe.mjs`, import path `file:///C:/...`; never the owner's live tabs). `/framework/core/Page/`: zero console errors except the five expected 404s for the sibling's band; four band headings in order; card count = 15 of yours + whatever of the sibling's five exist; `/framework/core/Page/overview/mounts/` and `/replace/` render with zero errors; `/framework/core/Page/old/intro/` renders the preserved prose. Png of the wall at 1280 → your task dir. **Two numbers:** cards drawn vs names in BANDS.
7. `documentation` for `core/Page/readme.md` (the Overview line in More; the `overview/readme.md` — write a three-line one: what the wall is, bands are declared in `page.js`, add a card = a dir + its name in BANDS). `skill-improvement` if misled. `finish-task`; `links` = the wall url, the png, the two new demo urls.
