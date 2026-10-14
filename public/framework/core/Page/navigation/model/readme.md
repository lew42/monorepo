# Navigation: one model — the four navigation questions, one rule each, shown live

[Live page](/framework/core/Page/navigation/model/). The owner's questions (2026-10-14, [the dictation](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-12.md), asks 4 to 6): is the left sidebar a table of contents or sub pages; nest sidebars or swap them; which ancestor a link opens at; workspace vs document pages.

## The model, one line each

- **Left sidebar:** one tree of sub pages, opened along the path you are on, rooted at the nearest section root. Headings go in the right column ([`ext/toc`](/framework/ext/toc/)).
- **Depth:** the tree is swapped only when you cross into another section; it never nests a second rail.
- **Links:** a link opens in its target's own section; `?in=<section>` keeps the reader's.
- **Page kind:** `kind: "workspace"` fills with zero padding and its parts are panes; every other page is a document.

## Files

- `NavModel.js` — the rules as a class (`section_of`, `opens`, `room`, `label`, `kind`); the page's demos compute from it.
- `NavModelPage.js` — the page (`class NavModelPage extends Page`) and its four demos; `page.js` instantiates it.
- `workspace/` — a real workspace page, the kind shown live.
- `model.css` — the demos' boxes, prefix `page-navm-`.

## Watch out

- None of the four rules is in core yet. The exact edits are in [`doc/core-changes.md`](doc/core-changes.md); until they land, `NavModel.SECTIONS` lists the section roots by hand.
- The layouts keep list on the page is computed by [`/layouts/archive/retire.mjs`](/layouts/archive/) `--plan`; rerun it rather than editing the counts.
