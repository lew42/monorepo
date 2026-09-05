# page-builder-ux — judge + prototype brief (Opus)

Read first: the repo's `CLAUDE.md` (law 2), `../mastermind-night/requirements.md` (the night's rules + the owner's brief verbatim — your part is "how would I build this with a UI"), `../../2026-09-04/mastermind-platform/minion-rules.md`. Then: `public/imagine/paging/doc/persistence.md` (the persistence judge's rule, the pure-JSON page table, Make's fs backend — wait for it if it has not landed; check the file's date), `public/imagine/paging/make/`, `public/framework/core/Page/generator/` (specs, controls, export), `public/imagine/paging/templates/` (if landed: the families and what Make cannot say yet), `public/imagine/layouts/` (if landed: the numbered system). Skills: `new-task` (this dir, group `paging`), `code`, `layout`, `new-page`, `ui-test`, `documentation`, `finish-task`.

## The owner's words

> go through all the pages in this framework, and think, "how would i build this with a ui?" if we want to move pages to pure .json, how can the ui go from "new page" to any of the pages we have. top tabs? left sidebar tabs? column pages? header? footer? takeover? swap? color? etc... it needs to be better... simpler... more configurable.
> what's the ux for adding tabs to a page? what's the ux for configuring tabs?

## Deliverables (numbered)

1. **The census.** Every `page.js` under `public/` (about 160 — `rg -l "new Page\(|new Doc\(|new Program\(|extends Page" public --glob 'page.js'`), classified by what a UI would have to offer to build it: navigation (none · crumbs · top tabs · left rail · right rail · columns · footer · takeover · swap) · surface · layout number (from `/imagine/layouts/` if landed, else column count) · content kind (prose · wall · demo · form · media) · what needs CODE (a `content()` that computes, a class). Counts per class in the log; two numbers that must agree (files found vs rows classified). Then the headline: what fraction of the site's pages are pure configuration already, and what the top three things are that force code.
2. **The builder's spec, as a decision** (`public/imagine/paging/doc/builder.md`, §33 shape): the smallest UI that goes from "new page" to each class above — which controls, in what order, and what each writes into the page's JSON. Rule on: top tabs vs left tabs vs columns as ONE control ("navigation") with a preview; surface and layout as chips; content as "add a block" from the templates' families; where code is still needed, a "code" escape that shows the `content()` a hand would write.
3. **The prototype.** `/imagine/paging/build/` — the builder as a page: start from "new page", pick navigation, surface, layout, add two blocks (a prose block, a wall of the templates' cards), add two tabs and configure them (name, order, which is default), and SEE the page assemble live in a stage beside the controls, with its JSON beside that (the three-column card technique: controls left, the page centre, JSON right). Save through Make's backend (fs in dev, localStorage fallback — read persistence.md; do not write a second store). Prove: build a page with top tabs, save, reload, it is there; switch it to columns, the same content re-renders; reset.
4. **Tabs UX, answered.** On the build page and in `doc/builder.md`: adding a tab is adding a child and choosing "tabs" as the parent's navigation; configuring a tab is the child's name, order, default flag, and icon — the same four things every child has. Say it in plain words and show it.

## Prove it

`ui-test` the whole flow at 1280 and 3440 (the stage rect stays; the JSON changes with every control); zero console errors at four widths; the `layout` skill's three invariants.

## Fences and budget

Write only `public/imagine/paging/build/` (new), `public/imagine/paging/doc/builder.md`, this task dir. Make's store and `paging.js` belong to the persistence and mechanisms minions — import, never edit; a seam you need is a proposal with the diff. Budget ~450k tokens. Report in ≤ 15 lines: the census headline with its two numbers, the builder's controls in order, the prototype url and the proof, the tabs answer in two sentences, tokens, what you left open and why.
