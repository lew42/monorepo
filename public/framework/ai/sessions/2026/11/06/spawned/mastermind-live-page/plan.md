# LivePage.js: cleanup proposal (not built yet)

The owner's review (2026-11-06): LivePage.js reads as messy. The `parts/kinds.js` import is not object-oriented, and there are too many comments. This is the proposal, smallest change first. Nothing here is built until it is picked up as its own task.

## Now (582 lines, one file)

- One class with ~15 static View classes inside it (Head, Crumbs, Tabs, Settings, Files, Pages, Focus, Main, Card, Block, Children, Heading, Md, Foot), plus the nav rules (`meta_of`, `pages_of`, `tabs_of`) and the delta methods.
- `import "/framework/core/Page/parts/kinds.js"` runs for its side effect (it registers the part types), and `PART_TYPES` is a bare array from the same file.
- Comments run 2–5 lines above most members and repeat the readme.

## Proposal

1. **Part types as classes, not a side-effect import.** Ask the core Page owner (page-design) for `Page.parts` (a registry the part classes add themselves to with `Item.register`), and use `item instanceof PagePart` in place of `PART_TYPES.includes(item.wire())`. LivePage then imports only the classes it names. This touches core/Page, so it is a proposal to page-design.
2. **One file per view part**, in `public/live/parts/`: `LiveHead.js` (with Crumbs), `LiveTabs.js`, `LiveSettings.js` (with Files), `LivePages.js`, `LiveCard.js` (Card, Block, Children). LivePage keeps `static Head = LiveHead` etc., so `LivePage.Card` and `LivePage.Block` and their `{page, item}` args stay as they are for DesignPage.
3. **A `LiveNav` class** for the nav rules (`meta_of`, `title_of`, `pages_of`, `tabs_of`, `tab_skip`, `tab_max`, `on_url`): they are about folders and urls, not about one page.
4. **Comments: one line per member, at most.** The why moves to `public/live/doc/` and the readme; the code keeps the traps only (an await before a factory call, the listener that lets go).

Target: LivePage.js under 200 lines, each part file under 100, the tests (`LivePage.test.mjs`) unchanged and passing. Cost estimate: one Sonnet build session, about $3–5, plus a review.
