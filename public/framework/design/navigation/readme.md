# Navigation — the path: how links look, persistent or switching, transitions

Navigation is how a reader gets anywhere on the site and finds their way back: tabs, a rail, a sidebar, a sheet, a modal, full screen. Moved here from the old `page` skill's Navigation questions.

## The one rule: which navigation stays, which is replaced

**A page with its own navigation keeps it, and its children open inside it. A page without navigation is replaced by its child.** Put another way: the nearest page above you that has navigation (tabs, a sidebar, a rail, a columns row) stays on screen, and everything below it swaps. Core already works this way: `container()` in [`Page.class.js`](/framework/core/Page/Page.class.js) mounts a child in its parent's tab or rail panel, else in the nearest ancestor's columns row, else where the parent was drawn, so it replaces the parent.

A linked markdown page (`<page>/md/<doc>/`) is an ordinary child, so the same rule decides: under a page with navigation it opens inside it (in a columns tree, as the next column), and under a page with none it replaces that page. A markdown page never brings navigation of its own. The one exception is the `md/` explorer, whose file list is the point of that page.

The seven ways a page can navigate today (shots live in [core/Page/tasks/page-mastermind/](/framework/core/Page/tasks/page-mastermind/)):

| Way | What stays on screen | What changes | Shot |
|---|---|---|---|
| **Top tabs** | the tab strip | the one panel under it | [tabs at 1920](../../core/Page/tasks/page-mastermind/nav-tabs-1920.png) |
| **Left sidebar** | the site's page tree | the content area beside it | the same shot, left side |
| **Rail** | a list on the left or right | the panel beside it | no real page uses it (only the `/imagine/paging/` labs) |
| **List and detail** (`ux/Browse`) | the list | the detail pane | [md/ explorer at 1400](../../core/Page/tasks/page-mastermind/md-explorer-1400.png) |
| **Miller columns** (`Page.columns()`) | every open column | a new column opens to the right | [even at 3440](../../core/Page/tasks/page-mastermind/nav-columns-even-3440.png), [measured at 3440](../../core/Page/tasks/page-mastermind/nav-columns-measured-3440.png) |
| **No navigation** | nothing of the page | the child replaces the page | [at 1920](../../core/Page/tasks/page-mastermind/nav-takeover-1920.png) |
| **Expand** | the row | the row grows in place; the address does not change | [expand at 1920](../../core/Page/tasks/page-mastermind/nav-expand-1920.png) |

**Expand is for things that are not pages**, like an FAQ answer: it changes no address, so whatever it opens cannot be linked to. Never use it for a child page. **Columns default to even:** the row is shared equally between as many columns as the recommended width fits, and a page opts out with `columns({ even: false })` ([doc/columns.md](/framework/core/Page/doc/columns.md)).

## Use

**Route everything.** Any view a click reaches — a tab, a selected item, an open panel — has its own URL, so a reload or the back button lands in the same place. This is the single rule everything else here checks.

For the page you're building, first identify which navigation techniques it uses (plain links don't count), then check only those:

- **Tabs** — fit on one row at 1920, at most two at 1200, three at 400; every tab has its own URL; too many tabs get grouped (sub-tabs, a rail) rather than stacked into more rows.
- **Rail or sidebar** — sits beside a centred main column at 3440; folds away or stacks cleanly at 400; the rail and the work area stay still — nothing the reader is looking at jumps when something arrives.
- **Bottom rail or any fixed overlay** — the page leaves it room; it never covers the last row of content.
- **Sheet or modal** — has its own URL; closing it returns to exactly where the reader was.
- **Full screen** — a visible way back out, and its own URL.

**A selected item opens in its own column or view, never by expanding in place and pushing the rest down.** The layout never jumps: see [design/layout](/framework/design/layout/).

## Watch out

- A view with no address loses the reader's place on reload — check by clicking every view, then the site nav, then Back, and watch the URL change each time.
- Each view is a plain link, never a button that flips a class: doing that once stopped a nav rail from switching pages at all.
- A page's **inbox** — a note left for coordination — is a Servex fact, not a navigation one: [PageInbox](/framework/core/Page/PageInbox.js).

## More

- [doc/looks.md](./doc/looks.md) — how links look, persistent or switching navigation, and transitions.
- [questions.md](./questions.md) — review questions for this system.
- new-page skill (`.claude/skills/new-page/SKILL.md`) — the mechanics: `children:`, routing, `swap_link`.
- [design/layout](/framework/design/layout/) — the layout never jumps, persistent navigation and work areas.
