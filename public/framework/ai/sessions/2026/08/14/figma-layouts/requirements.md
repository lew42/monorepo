# Figma layouts

## The ask (Mike, verbatim)

> i want you to spawn a fresh opus agent, and get it to design some new layouts:
> https://www.figma.com/design/0rZv3Z6Hnqkxa2UQJ5xOOG/July-2026?node-id=80-2916&t=gsmz9RS9bRp328Os-4
> you should have access via MCP.

Spawned by the `layout-tool` task, which owns `ext/LayoutTool/**` and is creating
`styles/rules/**` concurrently.

## What the Figma holds

`80:2916` — **"Layout Documentation System"**, a 2128 x 8659 frame, four sections
by *breakpoint*, fourteen specimens:

| section | specimens |
|---|---|
| Full Width — 1920px | Hero — Full Bleed · Features Grid — 3 Column · Testimonial Carousel — Detailed · Structured Pricing Tables |
| Standard Width — 1440px | Navigation Bar · Content + Sidebar (70/30) · Footer — Multi-column |
| Tablet Breakpoint — 800px | Stacked Hero · Card Grid — 2 Column · Accordion FAQ |
| Mobile — 400px | Mobile Hero Sizing · Hamburger Menu Expanded · Mobile Stacked Card List · Mobile Bottom Sheet Sizing |

**The design's organising idea is the opposite of this catalog's.** Figma files
one specimen per breakpoint and specs the query (`stacking-breakpoint: < 960px`,
`repeat(2, 1fr)`, `min-height: 400px`). `styles/layouts/` claims a layout answers
to the width of its *box* and ships no media query at all. So the honest port is
**one layout per pattern, four Figma rows collapsed into it** — the breakpoint
table becomes a consequence you can drag a handle to see.

## Scope — which specimens become pages

Cross-referenced against the twelve layouts already in the catalog:

| Figma specimen | verdict |
|---|---|
| Features Grid 3-col / Card Grid 2-col | already a word — `grid/` `--column`, and `gallery` is the page |
| Content + Sidebar 70/30 | already `docs` and `feed` |
| Navigation Bar | already `shell`'s header part |
| Mobile Stacked Card List | already `split` / `mail`'s list pane |
| Footer — Multi-column | already `site.footer()`, on five pages |
| Accordion FAQ | absent, but its lesson is `grid auto` + `<details>` — words the catalog has |
| **Hero — Full Bleed / Stacked Hero / Mobile Hero** | **absent** — no two-up hero anywhere; `landing`'s is one column |
| **Structured Pricing Tables** | **absent** — no tier row, no emphasized column |
| **Testimonial Carousel** | **absent** — no scroll-snap rail anywhere in the framework |
| **Hamburger Menu / Bottom Sheet** | **absent** — no overlay shape at all |

Four new pages: `hero`, `pricing`, `carousel`, `overlay`.

Deliberately NOT a fifth rail-centre-rail layout — `docs` and `feed` are already
that shape twice, and a third is the duplication this pass exists to avoid.

## Steps

1. Read the Figma, cross-reference the catalog, fix the set
2. Read the vocabulary — `framework.css`, `Page.css`, `demo.layout()`, `web.js`
3. Build `hero`
4. Build `pricing`
5. Build `carousel`
6. Build `overlay`
7. Declare all four in `layouts/page.js` `children:`
8. Measure with `ext/LayoutTool` at 400 / 1280 / 1920 / 3440, iterate to A/B
9. Land — report CSS written, `framework.css` requests, what didn't work

## File ownership

**Mine:** `styles/layouts/{hero,pricing,carousel,overlay}/`, the `children:` line
in `styles/layouts/page.js`, this task dir.

**Not mine — do not touch:** `ext/LayoutTool/**` and `styles/rules/**` (the
parent task is editing both concurrently), `layouts/web.js`, `layouts/page.js`
beyond the one `children:` line, `framework.css`, `Page.css`. Anything wanted in
a shared file gets logged as a request, not edited.
