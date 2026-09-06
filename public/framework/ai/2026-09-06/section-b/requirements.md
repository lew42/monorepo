# section-b — `core/Section`: a sub page that starts empty and picks an approved layout (Opus)

Three laws: less is more (ASAP) — a Section is a Page with one extra idea; clear beats brief, by far; prioritize. Length budget: the module's page is one screen with the thing itself on it; the report is 8 lines.

Read first: the repo's `CLAUDE.md`; the owner's brief `../mastermind-graduate/layout-brief.md` — deliverables 5 and 6 verbatim ("it starts as a default div, min height of 2 or 3 em, and has a minimal overlay on hover, when editing is enabled… for demo pages, docs, we turn editing on via code… maybe we just have pre-approved layout schemes. yes, this is It.") and the calls under the addenda; `../../2026-09-04/mastermind-platform/minion-rules.md`; **the plan `../layout-study/plan.md`** §5 (`core/Section`) and §6 (templates — read it, build none of it); **`core/Layout/`** as landed (`../layout-a/task.jsonl`; `Layout.js`, `layouts.js` — the thirty ids and their `widths`, `grows`, `slots`); `core/Page/Page.class.js` and `Frame.js` (what a Page already gives a Section: storage, children, the six words, the frame); `ext/drawer` and `ext/Dropdown` (the picker is one of these — import, do not copy). Skills: `new-task` (this dir, group `layout`), `code`, `css`, `new-css-class`, `layout`, `new-page`, `documentation`, `finish-task`.

## What to build

`public/framework/core/Section/` — `Section.js` (`Section extends Page`; every View part named `PageSection*`), `Section.css`, `page.js` (show, don't tell), `readme.md`, `doc/`.

- **Starts as a default div**: a Section with nothing in it renders a box of `min-height: 2.5em` and nothing else. No layout, no padding, no chrome.
- **Editing is off by default and turned on by code**: `section.edit()` (or the `editing: true` prop) — a demo or doc page turns it on; a real page never shows it. When on, hovering the section shows a minimal overlay: a hairline outline and one small control in a corner.
- **The one control picks an approved layout.** It lists `core/Layout`'s approved layouts that FIT this section (the checker's first rule: the section's current width is inside the layout's proven range — read the width live; a layout whose floor is above the box is greyed with the reason). Picking one applies the layout to the section: its slots become the section's regions, the section's children mount into them by name (the way `Page.Frame` fills `regions`). No padding schemes — the owner decided.
- **A Section gets everything a Page has** because it is one: storage (`ext/Saver` through Page), children, the six words, `Page.from(json)`. Show that on the page: a Section made from a `page.json` with `layout: "<id>"`.
- **Demos never persist.** The picker's choice lives in memory; a reload resets it. Say so on the page in one line.

## The page (`/framework/core/Section/`)

One screen: an empty Section with editing on (hover it — the overlay appears, pick a layout, watch the slots appear); the same Section with two children mounted into a picked layout's slots; the JSON form. Register `"Section"` in `core/page.js` `children:` — read that file fresh immediately before the edit; two other minions touch it today.

## Prove it

`ui-test`: hover shows the overlay; the picker lists only fitting layouts at 400 and 3440 (counts differ — say them); pick one, the slots appear, a child mounts; reload, the choice is gone. The page at 400 / 1280 / 1920 / 3440, zero console errors, no sideways scroll; screenshots in the task dir. A crawl of `/framework/core/`, `/framework/core/Page/`, `/framework/core/Layout/` at 1280 — zero new errors (a new Page subclass must not disturb its parent). The empty Section measures 2.5em tall by `getBoundingClientRect`.

## Fences and budget

Write: `core/Section/**`, one name in `core/page.js`, `styles/css-scopes.txt` (`page-section-`), this task dir. Never `core/Page/**`, `core/Layout/**` (read them; if Layout needs a `fits(width)` helper for the picker, write it in `Section.js` and log that Layout should own it), never `ext/**`. Shared server `http://localhost:8123/` — start none, kill none. Never `find /`; never spawn agents; never `git stash`/commit. Budget ~350k tokens. Report in ≤ 8 plain lines: what a reader does on the page in three sentences, the fitting counts at 400 and 3440, what a Section inherits that you did not have to write, what you doubted.
