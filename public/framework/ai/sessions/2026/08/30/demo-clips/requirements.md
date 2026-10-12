# demo-clips — kill the 17 fixed-height demo clips

Step 1 of the demo-merge proposal (`ai/2026-08-30/demo-merge/proposal.md`). Two independent
audits ranked this the highest-value single fix on the site.

## The ask, verbatim

> Read `public/framework/ai/2026-08-30/demo-merge/proposal.md` — its step 1 lists the 17
> `height:` call sites (16 config keys + 1 inline) and the mechanism (`ext/demo/app.css`
> `.demo-app-pages { overflow: auto }` turns any short height into a clip). The prototype's
> answer: `min` is a floor, never a ceiling. Read `ext/demo/shell.js` for how `min` is meant
> to work, and how the existing `demo.app()`/`demo.tree()` config consumes `height:` today
> (`ext/demo/app.js`/`exhibit.js`).
>
> THE WORK: (1) Add `min:` support to the existing config path if it isn't already consumed
> there. (2) Convert the 17 call sites. (3) Verify each affected page: render height ≥
> content height, before/after screenshot for the worst one (`core/Page/overview/landing`
> — was hiding 74%). (4) Fix `framework.css`'s zoom-rung comment to state the truth
> (zoom-75/175/200 have zero call sites) — do not delete the rules.

## Fence

`ext/demo/**` (the config path), the 17 call-site files, the one comment line in
`framework/framework.css`. Nothing else.

## The 17 call sites

16 `demo.tree()` config keys:
1. `framework/ai/2026-08-12/apps/columns/page.js`
2. `framework/core/Page/old/overview/landing/page.js`
3. `framework/core/Page/old/overview/shapes/page.js`
4. `framework/core/Page/old/overview/site/page.js`
5. `framework/core/Page/overview/columns/page.js`
6. `framework/core/Page/overview/landing/page.js`
7. `framework/core/Page/overview/site/page.js`
8. `web/layout/screens/page.js`
9. `web/nav/bar/page.js`
10. `web/nav/crumbs/page.js`
11. `web/nav/drawer/page.js`
12. `web/nav/footer/page.js`
13. `web/nav/links/page.js`
14. `web/nav/rail/page.js`
15. `web/nav/sidebar/page.js`
16. `web/nav/wall/page.js`

Plus 1 inline: `framework/ai/2026-08-12/apps/navigation/page.js` (`demo.app(...).style({ height })`).

## Found, out of fence

Three more raw `demo.app(...).style({ height: "26em" })` sites exist at
`imagine/vary/colstyles/{cards,finder,ink}/page.js` — identical shape to the counted inline
site, but not in the proposal's 17 and not touched here.
