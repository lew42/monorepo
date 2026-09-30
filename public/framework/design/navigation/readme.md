# Navigation — the path: how links look, persistent or switching, transitions

Navigation is how a reader gets anywhere on the site and finds their way back: tabs, a rail, a sidebar, a sheet, a modal, full screen. Moved here from the old `page` skill's Navigation questions.

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
- A page's **inbox** — a note left for coordination — is a Servex fact, not a navigation one: [/framework/ai/inboxes/](/framework/ai/inboxes/).

## More

- [doc/looks.md](./doc/looks.md) — how links look, persistent or switching navigation, and transitions.
- [questions.md](./questions.md) — review questions for this system.
- [new-page skill](/framework/ai/skills/new-page/) — the mechanics: `children:`, routing, `swap_link`.
- [design/layout](/framework/design/layout/) — the layout never jumps, persistent navigation and work areas.
