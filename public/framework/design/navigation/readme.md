# Navigation — the path: how links look, persistent or switching, transitions

Navigation is how a reader gets anywhere on the site and finds their way back: tabs, a rail, a sidebar, a sheet, a modal, full screen. Moved here from the old `page` skill's Navigation questions.

## The one rule: previews, then a full detail view

**A page shows its children as a list of preview cards. Clicking a card opens that child's full page in place of the list.** The child has its own address, so the back button returns to the list. Nothing splits the screen into side-by-side panes. This is the owner's call of 2026-10-23: Miller columns did not work (on a task page the first column was cut off), so previews plus full detail views replace them as the default.

A page that has its own navigation (tabs, a sidebar, a rail) keeps it on screen, and the card list or the detail opens inside it; a page without navigation is replaced by its child. A linked markdown page follows the same rule and never brings navigation of its own (the `md/` explorer's file list is the one exception).

Seen on the real pages: a task with tasks inside it has a **Tasks** tab of preview cards ([deputy at 1920](../../core/Page/tasks/page-mastermind/nav-rule/deputy-1920-after.png), [at 400](../../core/Page/tasks/page-mastermind/nav-rule/deputy-400-after.png)); clicking a card opens that task's own page ([roles at 1920](../../core/Page/tasks/page-mastermind/nav-rule/roles-1920-after.png), [at 400](../../core/Page/tasks/page-mastermind/nav-rule/roles-400-after.png)). Before, the same page was a row of columns that scrolled the first ones out of sight ([roles before at 1920](../../core/Page/tasks/page-mastermind/nav-rule/roles-1920-before.png)).

**Miller columns are kept as code, opt-in only:** a page gets them by calling `columns()` itself, like [/framework/core/Page/overview/columns/](/framework/core/Page/overview/columns/). The even-columns default was tried and dropped on 2026-10-23 ([shots at 1920 and 3440](../../core/Page/tasks/page-mastermind/nav-rule/columns-1920-after.png)).

The seven ways a page can navigate today (shots live in [core/Page/tasks/page-mastermind/](/framework/core/Page/tasks/page-mastermind/)):

| Way | What stays on screen | What changes | Shot |
|---|---|---|---|
| **Top tabs** | the tab strip | the one panel under it | [tabs at 1920](../../core/Page/tasks/page-mastermind/nav-tabs-1920.png) |
| **Left sidebar** | the site's page tree | the content area beside it | the same shot, left side |
| **Rail** | a list on the left or right | the panel beside it | no real page uses it (only the `/imagine/paging/` labs) |
| **List and detail** (`ux/Browse`) | the list | the detail pane | [md/ explorer at 1400](../../core/Page/tasks/page-mastermind/md-explorer-1400.png) |
| **Miller columns** (`Page.columns()`, opt-in) | every open column | a new column opens to the right | [even at 3440](../../core/Page/tasks/page-mastermind/nav-columns-even-3440.png), [measured at 3440](../../core/Page/tasks/page-mastermind/nav-columns-measured-3440.png) |
| **No navigation** | nothing of the page | the child replaces the page | [at 1920](../../core/Page/tasks/page-mastermind/nav-takeover-1920.png) |
| **Expand** | the row | the row grows in place; the address does not change | [expand at 1920](../../core/Page/tasks/page-mastermind/nav-expand-1920.png) |

**Expand is for things that are not pages**, like an FAQ answer: it changes no address, so whatever it opens cannot be linked to. Never use it for a child page.

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
