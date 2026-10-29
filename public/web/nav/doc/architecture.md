# Nav architecture — show each pattern as a real site, never a screenshot

> **Old way (deprecated 2026-10-28):** this page teaches or uses `page.children`; the replacement is `page.pages` (a List). Guide: [migration-children-to-pages.md](/framework/core/Page/doc/migration-children-to-pages.md).

`/web/nav/` is a set of navigation patterns, each one a live, clickable fake site. The section is a plain page whose `children:` names the patterns; the rail beside its text is the section itself. Entry: [`page.js`](../page.js). Each pattern is one folder with one `page.js`; demo sites are built there, not in shared code.

## The rail is built from `initialize()`, never `content()`

**Decided:** the section calls `this.catalog()` from `initialize()`, so its children exist before they get their URLs.
**Why:** a child added at render time has no url, so the rail's links would not work.
**Instead:** building the rail in `content()` (fails: no urls) or hand-writing the rail links (drifts from `children:`).
**Detail:** [`page.js`](../page.js) .

## Each pattern file writes its own shell

**Decided:** a pattern with a persistent shell writes it out in its own `render()`: `div.c("page full flex …")`, its chrome, and `this.$pages`.
**Why:** the shell is the pattern. A reader who opens `bar/page.js` should see the bar, not a call to a helper.
**Instead:** a shared `shell()` helper, which removes the repetition but hides the pattern in another file.
**Detail:** [`readme.md` § Decisions](./readme.md#decisions).

## Demos use `ext/tabs` markup by hand

**Decided:** `tabs/page.js` and the other comparison pages build the tab bar's markup themselves, instead of calling the `tabs()` ext.
**Why:** these pages teach the pattern (a bar of links and the region it swaps), not the ext that ships it. `tabs()` also pushes onto `this.app.loaders`, which a demo app lacks; the ext now reads `loaders?.` (`ext/tabs/tabs.js`), so the hand-built markup is a choice, not a workaround.
**Instead:** calling `tabs()` directly (works now, but hides the pattern behind the ext).
**Detail:** [`readme.md` § Decisions](./readme.md#decisions).

## `aria-current` is the selected mark inside a demo app

**Decided:** inside a demo app, a link is selected when it carries `aria-current`; no other mark is used.
**Why:** a demo app has no `Router`, so `.active` never gets set, and each component's "nothing selected yet" fallback lights its first entry. Without a mark, two tabs read as selected at once.
**Instead:** a set of rules in this folder to re-mark the links (removed; the ext stylesheets now count `[aria-current]` themselves).
**Detail:** [`ext/demo/app.css`](/framework/ext/demo/app.css) and [`ext/catalog/catalog.css`](/framework/ext/catalog/catalog.css).

## Every demo opens on a real page, not its root

**Decided:** each tree function ends by walking to a real child, `.children.get("…")`, so the demo starts on content.
**Why:** a shell whose region is empty demonstrates nothing, and the rail card shows exactly that.
**Instead:** opening on the root (an empty region, nothing to see).
**Detail:** [`bar/page.js`](../bar/page.js), [`drill/page.js`](../drill/page.js).

## Three comparison previews render at `zoom-25`

**Decided:** `tabs`, `jumps` and `drill` render their preview at `zoom-25 pad`; the other five use the default.
**Why:** each of those three compares two or three sites at once. At the usual 50% the comparison crops to one box, and the card's `h4` label reads as a rail group heading. At 25% the whole comparison fits.
**Instead:** a larger zoom (crops) or a single-site preview (loses the comparison).
⚠ The readme still says the rail's thumb ceiling is `10em`. `ext/catalog/catalog.css` now sets `--thumb-max: 4em` on `.page-catalog > .page-previews` (line 164), so the reason is stale even though the choice holds.
**Detail:** [`readme.md` § Decisions](./readme.md#decisions).

## Each demo root gets its own title

**Decided:** every demo tree sets a distinct root title, so eleven trees do not look identical.
**Why:** eleven roots titled `Web` give eleven identical thumbnails and crumb strips.
⚠ The readme says `web()`'s default root title is now the url of this section. `styles/layouts/web.js` has no such default; its site title is `"Aurora"`. Verify before relying on it.
**Instead:** one shared title (identical cards, which is the problem above).
**Detail:** [`readme.md` § Decisions](./readme.md#decisions).

## A tree is a function, not a `Page`

**Decided:** a demo tree is a plain function that returns a root, so it can render in two places (the card and the stage) without sharing one DOM node.
**Why:** a `Page` caches its `view` (`this.view ??=`). The card's copy and the stage's copy would fight over one node.
**Instead:** a `Page` per copy (works, but duplicates the tree's declared children).
**Detail:** [`readme.md` § Traps](./readme.md#traps).

## A demo's links must match its own root

**Decided:** every url in a demo's prose sits under that demo's own `root.url`.
**Why:** `demo.app` only intercepts paths under `root.url`. A stale url navigates the real site away from the demo.
**Instead:** no interception (the demo leaves its own frame on any link).
**Detail:** [`readme.md` § Traps](./readme.md#traps).

## Nav links read the parent, so they work only from a child page

**Decided:** `links(page)` (in `jumps`) and `footer` read the sibling links from `page.parent`, so they only work on a child page.
**Why:** the sibling list is the parent's `children`; a section page has no siblings to list.
**Instead:** reading `page.children` (lists the page's own children, the wrong set for a section page).
**Detail:** [`readme.md` § Traps](./readme.md#traps).

## Nav demos are not a design system

**Decided:** this folder ships no stylesheet. Its look comes from the `ext/demo`, `ext/tabs` and `ext/catalog` stylesheets it uses.
**Why:** one set of rules per look; a local copy would drift from the ext it demonstrates.
**Instead:** a local `nav.css` (drifts, and the reader sees two sources of truth).
**Detail:** [`readme.md`](./readme.md).
