# Layout — the layout system: how pages sit among pages, how a page divides its room, and how things sit inside it

Layout is not one class or one file here. It is a system spread over several modules, and
this folder is its index. Read it top down, in the order a page is built: first where the
page sits (navigation, its parent), then how the page divides its own room, then how the
things inside it are laid out.

The rendered page is designed from this file: this is the text version, the page shows the
same things as tiles ([why both](/framework/core/Page/make/readme-page/)).

## Core concepts, top down

**1. Around the page — navigation and the parent structure**
- [Navigation](/framework/core/Page/navigation/) — persistent vs switching; start every layout here.
- [Column pages](/framework/core/Page/overview/columns/) — each open page is a column beside its parent.
- [Previews on the parent](/framework/core/Page/doc/previews.md) — how a child looks on its parent's page.
- [Nested or full](/framework/core/Page/doc/layout.md) — a child draws inside its parent, or takes the screen.

**2. The page's own room — how one page divides the screen**
- [The page grid](/framework/styles/doc/layout-system.md) — three tracks: `main`, `wide`, `bleed`.
- [The approved five](/layouts/doc/studies/approved/) — the closed set a new page picks from.
- [Width words](/framework/core/Page/overview/width/) — how wide a column is, in six words.
- [Floating page](/framework/core/Page/layout/floating/) — an inner left sidebar beside a page that scrolls on its own.
- [Switcher](/framework/core/Page/layout/switcher/) — a routed list switches the content beside it (vertical tabs, a file tree, a left nav are its three skins); collapses to a mobile dropdown with no active-class rewrite.

**3. Inside the page — sections, cards, padding, spacing, gap**
- [Sections](/framework/styles/sections/) — content bands inside one page: hero, stats, pricing, faq.
- [Cards and padding](/framework/ai/2026-09-19/card-word/) — a region gets `.pad`, a framed box gets `.card`.
- [Spacing and gap](/framework/styles/system/) — one clamp knob, four gap rungs, `--flow` between blocks.
- [Named arrangements](/framework/core/Layout/) — 30 ways to arrange things in a box, proven at seven widths.

## Every kind of layout, indexed

[core/Layout](/framework/core/Layout/) — named arrangements: the live component, 30 of them
[/layouts/](/layouts/) — the encyclopedia: every way a page divides its room, named and drawn
[Approved five](/layouts/doc/studies/approved/) — the closed set, with the library of pages the owner approved
[Browse](/layouts/browse/) — every layout on the site as a picture card, with Approve / Improve
[Explorer](/layouts/explorer/) — the same layouts as one tree, in three columns
[Columns](/framework/core/Page/overview/columns/) — `page.columns()`, Miller-column pages
[Width words](/framework/core/Page/doc/columns.md) — a column's own width inside a `columns()` row
[styles/layouts](/framework/styles/layouts/) — whole-page layouts as class strings, one filterable wall
[Labs](/layouts/labs/) — six shape experiments: shells, screens, sections, blog, magazine, decks
[DesignTool](/framework/ext/DesignTool/) — measures a layout: what is broken, how good it is
**Vertical split (mobile)** — not built — the owner's idea, 2026-09-29: two stacked areas, content above and chat below, each scrolling on its own; a grip on the separator drags it up and down, and a tap may collapse one side or merge the two. Today only columns resize — this would be the same idea, stacked.

## Deciding a layout

The five questions, drawn live with demos: [/layouts/decide/](/layouts/decide/). The `layout`
skill asks the same five, plus five sizing questions once the shape is picked. In short:
room · amount of content · outline first · how to fill the width · which approved layout.
The detail, and how the two lists fit together: [doc/decide.md](/framework/core/Page/layout/doc/decide.md).

## Research worth keeping — the rule each one decided

- Spacing is a clamp, never a constant — [spacing-clamp](/framework/ai/2026-09-01/spacing-clamp/)
- Bleed is for paint; cards and text never bleed — [spacing-clamp](/framework/ai/2026-09-01/spacing-clamp/)
- The page gutter is padding, so no grid template can delete it — [padding-law](/framework/ai/2026-09-22/padding-law/)
- A region takes `.pad`, a framed box takes `.card` — [card-word](/framework/ai/2026-09-19/card-word/)
- A spacing ramp is space between things, never the size of a control — [nav-fat](/framework/ai/2026-09-06/nav-fat/)
- An open column freezes its width when a sibling opens — [core-columns](/framework/ai/2026-09-24/core-columns/)
- Navigation never moves: persistent, or a whole-screen switch — [Navigation](/framework/core/Page/navigation/)
- Layouts have names, not numbers; variations are tags — [naming](/layouts/doc/naming.md)
- The approved set is closed; a sixth is a proposal — [approved](/layouts/doc/studies/approved/)
- One panel open at a time; multi-panel was rejected with measurements — [column-pages-2](/framework/ai/2026-08-27/column-pages-2/)
- The five questions are judgements, never rules — [/layouts/decide/](/layouts/decide/)

Every row the three inventories found, de-duplicated: [doc/prior-work.md](/framework/core/Page/layout/doc/prior-work.md).
Each rule in a paragraph, with the measurement behind it: [doc/research.md](/framework/core/Page/layout/doc/research.md).

## Look-alike names

Five things are called "layout" and two are called "sections". Which is which, and where
each one sits in this system: [doc/names.md](/framework/core/Page/layout/doc/names.md).

## Earlier versions

[v2](/framework/core/Page/layout/v2/) — the layout hub as module-experts left it (2026-09-29) · [v1](/framework/core/Page/layout/v1/) — the first hub
