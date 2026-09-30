# Minion brief: the card system at core/Page/card/

Load the `minion`, `page`, `css` and `new-css-class` skills first. Parent: task-mastermind-cards-and-logs. Parent task dir `public/framework/ai/2026-09-29/cards-and-logs/`: read `owner-words.md` IN FULL (both sections; the 8:40 PM one ends with the card-storage decision) and `requirements.md` (Phase 1 + the "Decision from the owner").

## The owner's words (the acceptance test)
"Let's create a core page card system ... A card is sort of just like a mini page. It's like a page that's responsive and so it works on mobile ... Sometimes they have a title on them. Usually they're clickable you, or expandable or have menus ... most cards by default would have their own background color ... if a background is like white, for example, you could have a different colored background card, like a light gray or a dark themed card, or even maybe a strong hue, like a primary color ... you could kind of nest these and stack them in different ways ... what scale and what kind of content gets crammed into the cards ... different ways to use headers and menus ... If you're going to have a whole list of cards, especially if they have previews that are clickable ... they need to be routed. They should be pages of their own."
"they can't go too deep ... after the third level, you're kind of maxing out your padding space ... a H2 section ... uses a big heading and then the first paragraph underneath is at the same indentation level. You can have higher visual hierarchy without having boxes and borders and different background colors."
Decision (owner, 8:40 PM): "a card is kind of a tiny page and doesn't need a directory of its own" — its data is a line in the nearest existing parent page.jsonl, with a virtual routed URL through the parent's route(); a folder only on demand.

## Input
`public/framework/core/Page/card/inventory.json` + `inventory/*.png` (in the worktree) and `ai/2026-09-29/cards-and-logs/inventory/findings.md` — what exists today. Build FROM it: reuse `.card`, `.surface`, `.wash`, `.darken-1..3`, `--pad-card`, `--radius`, `--card-edge` in framework.css. Do NOT edit framework.css. New CSS lives in `card/card.css` inside a layer, with a prefix cleared by new-css-class (`card` itself is reserved by the framework block).

## Work in
Worktree `C:\Code\lew42\worktrees\cards-and-logs` (server http://localhost:52442/). Fence: `public/framework/core/Page/card/` except `card/log/` (another minion's; read it, don't edit). Commit by exact path. If `card/page.js` is a stub the logger minion left, replace it, keeping its `log` child.

## Deliverables (each shown live, not described)
1. **Grounds** — four: default (surface on the page), light gray, dark, strong hue (primary). A demo grid: each ground on each ground, text readable on all (check contrast in light AND dark mode).
2. **Nesting** — levels 1, 2, 3 as boxes; level 4+ drops the box and becomes heading-led hierarchy at the same indentation. A demo 5 levels deep that stays readable at 400px wide. Make depth automatic if it can be done with CSS alone (e.g. a class per level set by a tiny `Card` view, or a `:is()` depth selector); say which in the doc.
3. **Title, header and menu patterns** — none, heading, icon+title, header bar with a `···` menu; clickable (whole card is a link), expandable (details), with a menu. One demo each, the pattern's name above it.
4. **A card is a mini page** — a `Card` class (or view factory) whose instance is a routed child: a list of clickable cards whose data lives as lines in ONE `page.jsonl` in a demo folder, each card at its own URL via the parent's `route()`, reload lands on the same card, no folder per card. Read `core/Page/dynamic/` and `core/Page/jsonl/` for the mechanism that already exists; reuse it.
5. **Scale and content** — small / default / large (`--size` via `.size-small` etc. if it already exists); what content fits each (a table: size → content it holds).
6. **Keep v1 reachable:** nothing existing is restyled. If you prototype a variant of an existing card, it extends it.
7. `card/page.js` (title "Cards", icon, one-line description; first thing: concept tiles for Grounds · Nesting · Headers & menus · Mini pages · Scale · Log — each a child page), `card/readme.md` (index shape), `card/doc/system.md` (the rules: which card when, one table), `card/doc/inventory.md` (the inventory table rendered, pointing at inventory.json).
8. Screenshots at 1920 and 400 of the card page and each child, into your task dir; zero console errors, zero failed requests on every page (headless Playwright, windowsHide, stop what you start).

Length: keep new CSS under ~120 lines. Budget ~$6; stop at it with what has landed, and log steps in your task.jsonl.
