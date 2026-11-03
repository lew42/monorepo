# Navigation: one model — four questions about the site's navigation, one rule each, shown live

[Live page](/framework/core/Page/navigation/model/). The owner asked four questions on 2026-10-14 ([the dictation](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-12.md), asks 4 to 6):

1. Is the left sidebar a table of contents, or a list of sub pages?
2. Nest one sidebar per level, or swap one sidebar out?
3. When you click a link, which ancestor does it open at?
4. How do workspace pages differ from document pages?

Two words first. A **section** is a top area of the site with its own left tree (Framework, Layouts, Imagine, Web, Blog); its top page is the **section root**. A page's **kind** is `document` (padded, flows down) or `workspace` (fills the screen, split into panes).

## The model, one line each

- **Left sidebar:** one tree of sub pages, opened along the path you are on, rooted at the section root. Headings go in the right column ([`ext/toc`](/framework/ext/toc/)).
- **Depth:** the tree is swapped only when you cross into another section; there is never a second rail.
- **Links:** a link opens in its target's own section; `?in=<section>` keeps the reader's, e.g. `/framework/core/Router/?in=/web/`.
- **Page kind:** `kind: "workspace"` fills with zero padding and its parts are panes; every other page is a document.

## Files

- [`NavModel.js`](NavModel.js) — the rules as a class (`section_of`, `opens`, `room`, `label`, `kind`); the list of section roots is its `SECTIONS`.
- [`NavModelPage.js`](NavModelPage.js) — the page (`class NavModelPage extends Page`) and its four demos; `page.js` instantiates it.
- [`workspace/`](/framework/core/Page/navigation/model/workspace/) — a real workspace page, the kind shown live.
- [`model.css`](model.css) — the demos' boxes, class prefix `page-navm-`.

## Watch out

- None of the four rules is in core yet; until they land, `NavModel.SECTIONS` lists the section roots by hand. The exact edits: [`doc/core-changes.md`](doc/core-changes.md).
- The page's layout counts (81 before, 25 kept, 56 retired) come from [`retire.mjs`](/layouts/archive/retire.mjs) `--plan`; rerun it rather than editing the numbers by hand.

## More

- [`doc/core-changes.md`](doc/core-changes.md) — the four small edits to core and ext, written down and not made.
- [The archive](/layouts/archive/) — the retired layouts, and [its readme](/layouts/archive/readme.md).
- [`../readme.md`](../readme.md) — Navigation, the older study: persistent vs switching.
