# Lew42 v3: layouts worth porting from Big Sloppy (shortlist, 2026-11-19)

**Source:** Big Sloppy (`hbolzQ3Xnc78rhxAPj8xK2`), page "Lew42 Design System" (`56:866`). Read only; nothing has been ported. The owner wants to be certain where things go before anything moves.

**Target page** follows the [content rule](./v3-content-map.md): a master lives on the page of the smallest width it works at. One column goes to Content, two columns to 1000 Default, three or more to 1920 Desktop, and mobile-only pieces to 500 Mobile.

| # | Layout | Seen in (screenshot) | Target in v3 |
|---|---|---|---|
| 1 | **Dark CTA card:** prime kicker, title, a line, primary and text buttons ("Ship it today") | [layouts.png](./v3-port-shortlist/layouts.png), masonry, middle | Content |
| 2 | **Prime offer card:** prime fill, kicker, big price, outline button ("€89") | [layouts.png](./v3-port-shortlist/layouts.png), masonry, right | Content |
| 3 | **Dark banner cards:** "Winter sale" and "Work with Maya" (dark fill, prime button) | [masonry-boards.png](./v3-port-shortlist/masonry-boards.png) | Content |
| 4 | **Stats row:** three big numbers with labels (128 / 24 / 6) | [layouts.png](./v3-port-shortlist/layouts.png) | Content |
| 5 | **Quote:** centred quote, avatar, name | [1600-sections.png](./v3-port-shortlist/1600-sections.png) | Content |
| 6 | **Hero split:** kicker, headline, line and buttons beside a photo | [1600-sections.png](./v3-port-shortlist/1600-sections.png), top | 1000 Default (stacks at 500) |
| 7 | **Features row:** four icon tiles, wrapping 2 × 2 | [1600-sections.png](./v3-port-shortlist/1600-sections.png) | 1000 Default as a wrap row |
| 8 | **Masonry, "Cards of any height":** three columns, photo and text cards | [1600-sections.png](./v3-port-shortlist/1600-sections.png) | 1920 Desktop |
| 9 | **Masonry boards:** dashboard, shop and profile boards of mixed widgets | [masonry-boards.png](./v3-port-shortlist/masonry-boards.png) | 1920 Desktop |
| 10 | **Footer:** dark band, logo plus three link columns | [1600-sections.png](./v3-port-shortlist/1600-sections.png), bottom | 1000 Default |
| 11 | **Phone screen:** app bar, segmented tabs, dark section headers, task rows, bottom nav | [apps-tasks.png](./v3-port-shortlist/apps-tasks.png) | 500 Mobile |
| 12 | **Bottom sheet:** a "New task" sheet with chips and a full-width button | [apps-tasks.png](./v3-port-shortlist/apps-tasks.png), middle | 500 Mobile |

**Also seen, not shortlisted:** the domain cards (weather, music player, ticket, delivery, booking: [domain-cards.png](./v3-port-shortlist/domain-cards.png)). They are good, but domain-specific, so they belong on an Explore page, not in the core. Also skipped: Pages ([pages.png](./v3-port-shortlist/pages.png)), which is v2's page-template demo.

**Porting notes:**
- Rebuild each item with v3's tokens (Scale, Color Mode, the text styles, Photo styles). Don't copy, because Big Sloppy's variables are a different library.
- Dark cards are Color Mode Dark on the card itself.
- The prime card uses Colors `prime` as its fill. Color Mode has no `accent` now, so check with the owner before adding a prime surface token.
