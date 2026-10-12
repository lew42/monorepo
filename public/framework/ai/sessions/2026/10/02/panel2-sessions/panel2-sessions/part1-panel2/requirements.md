# Minion brief: `ext/panel2` — Part 1 of the panel2-sessions task

You are a minion. Load the `minion` skill first, then `code`, `css`, `new-css-class` and `layout`
(this is a layout module with a demo page). Work only inside `public/framework/ext/panel2/`
(new directory — create it) plus its own demo page. Do not touch `public/framework/ext/Panel/`
(the old one — it has callers; leave it alone) or `public/framework/ai/` (that's Part 2, a
different minion, later).

Task directory (read the parent task's log and the full brief before you start):
`public/framework/ai/2026-10-02/panel2-sessions/` — `requirements.md` there is the owner's
original words for the whole task. This file covers only Part 1.

## The owner's own words (verbatim, the relevant slice)

> I'd like to use it as our standard UI area. It should have chrome: a header, a main content
> area, and a footer. In the main content area, maybe each one should be able to have a drawer
> or a sidebar on either side… mobile-friendly views. The heading should be a little toolbar
> where we can put controls that pertain to that area. Then we'll build up the logic for
> splitting them and resizing the dimensions between them, and maybe layout switches, like
> fixed width to fluid width… I've always thought the flex-wrap way, where it just works and
> you don't specify sizes. There are automatic grid ones where you can specify sizes, but I
> forget how that works.

## What to build — numbered, each one is checked against the words above at review

1. **A new, small module**, `ext/panel2/Panel2.js` (+ `panel2.css`). Copy nothing from
   `ext/Panel` — reuse only `ext/grip` (`/framework/ext/grip/grip.js`) for the resize drag.
   Read `ext/grip/readme.md` first; it is a small, well-documented API (`write`/`done`/`reset`/
   `from`/`axis`).
2. **The shape**: `header` (a slim toolbar — a title on the left, controls on the right,
   minimal height), `main`, and an optional `footer`. `main` can have an optional `start`
   and/or `end` side (a sidebar). On a narrow screen (pick the same breakpoint `grip.css` uses,
   34em, unless you find a better reason) a side becomes a **drawer** that slides over the main
   content instead of sitting beside it — reuse `ext/drawer` if it fits in one import, otherwise
   a small CSS transform is fine; don't build a second drawer system.
3. **The API: a class with parts as statics** (the `code` skill's pattern —
   `this.constructor.Thing`, parts are static subclasses, never config objects):
   ```js
   class Panel2 {
     static Header; static Side; // etc — your actual names, picked with the `naming` skill in mind
   }
   ```
   A toolbar control is just a View placed in `panel.header` — i.e. the header is a real
   container you `.append()`/mount things into, not a slot that takes a config array.
4. **Nesting and splitting.** A Panel2 can hold Panel2s side by side, each keeping its own
   header toolbar, with a `grip` between them that resizes the two. Build the simple two-way
   split now (vertical OR horizontal, picking at construction). Do NOT build layout switches
   (fixed-width ↔ fluid-width panels) — write that down as an open question in the readme
   instead, one paragraph, so the next person knows it was deliberately deferred and why.
5. **The responsive grid rule**, for arranging several Panel2s on a dashboard (this answers the
   owner's "I forget how that works" question — put the answer in the readme in plain,
   five-year-old-explains-it words): a CSS grid using
   `grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr))`. Each panel only
   says its own smallest comfortable width (the `22rem` number, overridable); the grid then fits
   as many per row as there's room, and stacks to one column on a phone automatically — no
   media queries, no manual breakpoints. Ship this as one small exported helper or CSS class
   (e.g. a `.panel2-grid` class you document), not a new layout framework. Record flex-wrap
   in the readme as "the alternative we didn't pick for this" with one sentence on the tradeoff
   (flex-wrap items can end up different widths per row; grid's auto-fit keeps a column grid).
6. **A demo page** at `/framework/ext/panel2/` (the module's own `page.js`) showing, as actual
   live Panel2 instances on the page — not screenshots, not prose — in this order:
   - one plain panel (header + main, no sides);
   - two Panel2s split side by side with a grip between them, each with a couple of toolbar
     buttons in its header so the "header is a real toolbar" point is visible;
   - the phone-width stack: either a real narrow iframe/frame on the page, or clear instructions
     plus a screenshot (take one with the `ui-test` skill's headless approach) showing a side
     becoming a drawer. Prefer a live resizable demo if it's cheap; a screenshot is acceptable
     for the phone case alone.
   Use `create_page` (see the `new-page` skill) for the page mechanics, then write the body by
   hand following `ext/grip`'s and `ext/Panel`'s demo pages as the house style for a module demo.
7. **Docs**: `readme.md` (the reader's index — what it is, the shape, a short code sample like
   `ext/grip`'s own readme, the two open items from steps 4 and 5 written as short notes with
   links to more detail if you write a `doc/*.md`) and the demo `page.js` above *is* the "show,
   don't tell" doc law 1 requires — don't also write a separate explainer page.

## Rules

- No build step: real `.js` ESM imports, resolve URLs against `import.meta`.
- Every CSS rule goes in a layer (`base theme site util`) per `panel2.css`'s needs — read
  `framework.css`'s layer order before writing a rule (the `css` skill covers this).
- Check `public/framework/styles/css-scopes.txt` before inventing a `panel2-` prefix — it should
  be free, but confirm (`new-css-class` skill, 30 seconds).
- Keep it small. This is "the fastest working version, then improve" (CLAUDE.md law 1) — a
  plain header/main/footer div structure with one grip between two panels and one CSS grid rule
  beats anything clever.
- Work in this worktree: `C:\Code\lew42\worktrees\panel2-sessions` (already has its own dev
  server running — check `Server/worktree-up.mjs`'s output for the port, or ask your parent).
  Commit your work there as you go (small commits); do not touch the main tree.
- When done: run `node Server/layout-check.mjs http://panel2-sessions.localhost/framework/ext/panel2/ --widths 400,1200,1920,3440` (or the worktree's own `http://localhost:<port>/...` url) and look at all four shots yourself before reporting done — read them, don't just confirm they exist.
- Report back to your parent (`task-mastermind-panel2-sessions`) when done: what you built, the
  demo url, and the two readme open-items you wrote.

## Two more open questions to record (design only — do NOT build either; added mid-task by the owner)

Add these to the readme's open-questions area, beside the fixed↔fluid one from step 4, each as a
short paragraph:

- **"Sprawl"**: a layout verb for big, similar sections that stack on a narrow screen and sit
  side by side on a wide one — e.g. three rows at 1000px, three ~1000px-wide columns at 3000px.
  `task-mastermind-framework-home` uses a plain CSS grid for this today; Panel 2 may own it
  later. Note it, don't build it.
- **Adaptive panel height**: when panels sit side by side, could a panel's height grow or shrink
  to fill the row, instead of always being auto-height (today's behavior)? Note it, don't build
  it.

## Out of scope (do not touch)

- `ext/Panel` (the old module).
- `public/framework/ai/` (Part 2 — a separate minion will build the Sessions tab and Overview
  grid on top of what you build here, after this lands).
