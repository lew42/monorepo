# Sessions layout, 2026-10-13: the grid gets the screen

The owner's complaint: the first row sat halfway down the page and a 200 px footer cut the grid to a third. Measured at 1200 wide (1000 tall): first row y=464 before, y=267 after; the footer was two stacked lines of chips (open tasks, "Inbox · 1, 1 new") that came from the ancestor AI page, now one 36 px status line.

- **Which module draws the tab:** `ai/AISession/AISessionsPage.js` (`sessions/page.js` only instantiates it). Styles: `sessions/sessions.css`.
- **Status line:** counts, plan meters and an open-tasks chip (`PageWork.line`, opens upward as a popover) sit in one sticky `.sessions-status`. The ancestor page's own chips are hidden only while a `.sessions-page` is inside (`:has`), so no other page changes.
- **Scope:** the breadcrumb `2026 / October / 13` with step arrows is `?scope=2026`, `2026-10` or `2026-10-13` (month is the default). Query params, not `/2026/10/`, because those paths already belong to `StoreFolder` (the store browsed by path). The dates feed the same server query as before.
- **Left rail:** a plain link list (Sessions, Priorities, Readme, dashboard versions); no existing vertical nav fit. Below 40em it becomes a row.
- **Not done:** editing a date by hand does not update the breadcrumb (the picker inputs are hidden now).
- **Review, 2026-10-13** ([review.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/review-ai-pages/review.md)): the panel's own "Sessions" header is hidden (the tab names the page) and its "updated" time sits in the status line; cells are .3em; below 40em the status line drops the meters and each chip row is one swipeable line. First row 33% → 26% down at 1920, 42% → 29% at 3440. Open items: [../next.md](../next.md).
