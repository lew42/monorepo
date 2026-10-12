# paging-templates — build brief (Opus)

Read first: the repo's `CLAUDE.md` (law 2), `../mastermind-night/requirements.md` (the night's rules + the owner's brief verbatim — your part is the one the owner said was missed: the magazine, blog, screens and shells INTO the paging UX system, and templates as pages), `../../2026-09-04/mastermind-platform/minion-rules.md`, then `public/imagine/paging/` (`paging.js`, `readme.md`, `doc/`, `make/`, `examples/`). Skills: `new-task` (this dir, group `paging`), `code`, `layout`, `new-page`, `css`, `new-css-class` (prefix `paging-`), `ui-test`, `documentation`, `finish-task`.

## The owner's words, the ones you deliver on

> i specifically asked for the magazine, blog, screens, shells, to be integrated into the paging ux system. spawn some minions to study this aspect, and make it better.
> one of the goals of this paging work, was to have all the templates available for pages. for example, we have framework/styles/layouts/, sections, ui, ux, all these things... we want to explore combining these with pages, with storage/persistence, with config.
> if pages are going to be sort of the basic universal building block, we can use them to organize all the templates (layouts, ui, ux, sections, pages, navigation, etc). when it comes to presentations, slides, shells, magazine, blog, page columns, all these things... we need simple, iconic examples of ideal usage for each template. we need to lean into theming (use of color, typography, hierarchy, etc).

## Read before building

`public/imagine/mag/` (page.js, issue.js, issue.json, Article.js, mag.css, readme), `public/blog/` (Post, Section, posts.js, readme), `public/imagine/screens/` (screen.js, every screen, readme + doc), `public/imagine/shells/` (every shell, readme), `public/imagine/decks/` (presentations/slides), `public/framework/styles/layouts/` (readme per arrangement), `public/framework/ui/readme.md` (nineteen components), `public/framework/ux/` (the ux tier), `public/framework/core/Page/generator/` (specs.js — the explorer already made mag a shape; read how), `public/imagine/paging/make/` (how a made page is declared from one line of text).

## Deliverables (numbered; tick each at the end)

1. **`/imagine/paging/templates/`** — the templates hub. It opens with the plain sentence: *a template is a whole page shape you can start from; pick one, and the page you make wears it.* Then one card per template FAMILY, each an ICONIC example (a small, real, themed picture of ideal usage, not a description): **Magazine** · **Blog** · **Screens** · **Shells** · **Decks (slides)** · **Columns** · **Layouts** (styles/layouts) · **Sections** · **UI** · **UX** · **Navigation**. A family card links to its family page.
2. **Magazine, Blog, Screens, Shells — integrated, not sampled.** For each of these four (the ones the owner named), a family page under `templates/<family>/` where: (a) the family's real machinery draws the example — a real `mag` issue front, a real blog `Section` of real posts, a real `screens` split, a real `shells` shell — using the family's own classes imported from where they live (read-only imports; never copy code); (b) the example is THEMED: the surface chips (plain/card/tint/prim/dark) and a typography/hierarchy chip (compact/regular/display) repaint the same example so the reader sees the template under five surfaces; (c) a "make a page from this" line shows the one-line spec that Make would need for this family — and if Make's vocabulary cannot say it yet, write the exact words it would need in `doc/templates.md` as the proposal for the persistence/Make work (do not change Make's storage). Each family page says in its first sentence what the template is for and when to use it.
3. **The other families** (Decks, Columns, Layouts, Sections, UI, UX, Navigation): one iconic example each on the hub card and a family page that lists the members with links to where they live; theming chips where the family has a surface. Smaller than the four, but present.
4. **Theming leaned into.** One page, `templates/theming/`, that shows the SAME template (the blog section) under the five surfaces and three type scales as a wall, so color × typography × hierarchy is visible in one screen, with the tokens named beside each.
5. **Docs:** `templates/readme.md` (the index) and `doc/templates.md` (which family's machinery is imported from where; what Make cannot express yet, as a proposal).

## Prove it

Each of the four named families renders its real machinery inside the templates realm (a screenshot of each at 1280 and 3440, zero console errors); the surface chips repaint without reload; the theming wall at 3440. The `layout` skill's three invariants.

## Fences and budget

Write only `public/imagine/paging/templates/` (new), `public/imagine/paging/doc/templates.md`, `css-scopes.txt` via the skill, this task dir. Never edit `mag/`, `blog/`, `screens/`, `shells/`, `styles/`, `ui/`, `ux/`, `core/`, `ext/` — import them; a change they need is a proposal with the diff. Coordinate by fence with `paging-mechanisms-v2` (it owns the rest of `paging/`): do not touch `paging.js`; if you need a seam there, write it in your log. The mastermind wires `templates` into the paging hub. Budget ~450k tokens; cut 3 and 4 before any of 2. Report in ≤ 15 lines: the hub url, the four named families each with the class it imports and its page url, the other seven, the theming wall, what Make cannot say yet, tokens.
