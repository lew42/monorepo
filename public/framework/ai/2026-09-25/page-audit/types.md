# Page types — the seven kinds of page this site has

Counts are rough, from `grep`/`find` over `public/` (1216 `page.js` files, 1109 `doc/*.md`, 186 `readme.md`).
Layout words come from [`core/Page/doc/words.md`](/framework/core/Page/doc/words.md): `navigation` (none tabs rail rail-right expand columns takeover), `width` (narrow reading wide full), `arrangement` (plain bar-top bar-bottom rail-left rail-right main-aside wall), `surface`, `background`, `type_size`.

| # | Type | Real example | About how many | Layout | Navigation | Content order (top to bottom) | Built by |
|---|---|---|---|---|---|---|---|
| 1 | **Module page** (`new Doc`) | `ext/Doc/page.js` → `/framework/ext/Doc/` | ~61 pages declare `new Doc(` | `navigation: tabs` (Overview, API, Docs, Files) + a left rail inside each tab; `width: reading` | Parent's `children:` line; tabs across the top; rail inside a tab | Title, the live overview (shown), then tabs to API, Docs, Files | `Doc` (ext/Doc), skill `new-page` |
| 2 | **Doc page** (a `.md`) | `core/Page/doc/words.md` → `/framework/core/Page/doc/words/` | ~1109 `.md` under `doc/` | Single reading column (`reading`), rail listing sibling docs | The module's Docs tab and rail; readmes link in | Heading, one bold plain sentence, table or example, links to deeper docs | Plain `.md` beside the module; skill `documentation` |
| 3 | **Index / catalog wall** | `layouts/page.js`, `/layouts/`; `catalog()` used by ~31 pages | ~31 catalog pages; walls in `layouts/`, `imagine/`, `core/Page` overview | `navigation: rail` (catalog split, `--rail` 19em) or `arrangement: wall` of previews; `wide` | Reached from a parent; each preview links one click down | Title, one line, wall of small previews (screenshots/live), no detail | `catalog()`, `browse()`, `Page` |
| 4 | **Demo page** | any `demo(` page, e.g. `core/Page/overview/columns` | ~110 pages call `demo(` | `standard` demo layout (five blocks), often `wide`/`full` so the live thing has room | Linked from its module's Overview; back via parent | The live demo first, then the code tab, then a line of words | `demo()` (unified demo system), `new-page` |
| 5 | **Board / inbox / card** | `ai2/card.js`, `ext/AITask/card.js`; the board at `/framework/ai/` | 2 `card.js` factories, many cards on the board | Multi-column: rail of groups beside a centred card, `columns`/`rail`; card = tabs (chat, outline, agents) | Click a card in the rail; every card has a URL | Header/status, latest note or chat, composer, tabs for detail | `ai2/card.js`, `ai2/faces.js`, `ext/AITask` |
| 6 | **Task / report page** | `ai/2026-09-24/<slug>/page.js` | ~101 dated task `page.js` | One screen, `reading` or `wide`, mostly above the fold | Linked from the day log and board; landing line links it | Headline outcome, picture/link to what was made, what was left | `finish-task`, `new-task` (page.js optional) |
| 7 | **Program world** | `imagine/` (255 `page.js`), `layouts/`, `blog/` (12), `notes/` (73) | ~340 pages across `imagine`+`layouts`+`notes`+`blog` | Own realm: `columns` / rail-left with a realm home wall; `full` for labs | Realm home wall → child worlds; each declares `children:` | Realm home = wall of previews, then a topic, then its labs/decisions | `Page` + `catalog()`; skill `new-page` |

Verified: 61 `new Doc(`, 31 `catalog(`, 110 `demo(`, 101 dated task pages, 45 `ext/*` pages, 26 `ui/*` pages, 2 `card.js` files.

## Which kind is this? Then do this

1. Documenting a module (its API, files, notes)? → **Module page**: `new Doc({...})` in `page.js`, add it to the parent's `children:`.
2. Explaining one topic in words? → **Doc page**: a `doc/<topic>.md` beside the module; open with one plain sentence, link out.
3. A list of many things? → **Wall**: `catalog()`/`browse()` of small previews; detail goes one click down.
4. Proving a widget works? → **Demo**: `demo()` with the live thing first, code second; nothing persists.
5. Live work with status, chat, or an inbox? → **Card/board**: reuse `ai2/card.js`; give every view its own URL.
6. Reporting a finished task to the owner? → **Report**: one screen via `finish-task`, links not detail.
7. A whole new topic with many parts? → **Program world**: a realm home wall plus `children:`; then per-child pages. A page not named by its parent's `children:` does not exist.
