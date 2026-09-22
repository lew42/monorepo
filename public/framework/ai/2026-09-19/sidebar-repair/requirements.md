# sidebar-repair — the site sidebar's tree rows and filter, rebuilt to measured targets

Load the `minion` skill first. Then this brief. Model: Opus — the owner has lost trust in this surface, and it is on every page.

**Three laws.** Less is more. Clear beats brief by far. Prioritize (rows first, filter second, the rest last).

## The owner's words (2026-09-19)

> Somehow the sidebar got messed up. It doesn't look right. I'm not sure if I trust our layout and design system to try and fix it because it's just making blunders all over the place.

And a few minutes later, looking at it:

> the sidebar has its own footer with the light mode and a kind of empty avatar — put a little anonymous guy in there: just a circle, a smaller circle for the head and a bigger circle for the body. The filter pages form field — something off about it; it's like double nested, there's almost this unnecessary box. The framework sidebar is white and then that inner box wrapping the filter is white with a subtle border. I'm thinking we want that to be gray, and then the form field becomes white. It's like a UI bar: it goes from the logo to the UI bar — darken background for the UI bar, and white background for the form field. And we should be able to control that: what if you could reliably force any element using the darken as a theme to then use white form fields?

**That is the direction for the filter and the footer — it replaces the mastermind's "input alone" suggestion below:**

1. **The filter is a UI bar.** Directly under the brand, the full width of the rail (no side margins, no border box, no card): a `--darken-1` (or `-2`; look and choose) ground with the input on it, and the input is **white**. The empty chips `div` and its 25 px gap go, or collapse when empty.
2. **Fields on a darkened ground are white — as a rule the system owns, not a one-off.** Find how a ground is declared today (`framework.css`: `--lighten-*`/`--darken-*` aliases, `.surface`, the theme layer; `/framework/styles/system/`) and make it one small mechanism: an element that takes a darken ground sets a field-ground token (say `--field-bg`), and `input`, `select`, `textarea` read it. One place, documented on the design system page with a live example (a darken bar with a field on it, beside a plain one). Write it as a `decision` line with the alternative (a `.bar` word that carries both the ground and the token, versus a token set by every darken utility). Suggestion, not law: choose what reads best in the shots.
3. **The footer's avatar** gets the anonymous person: a circle holding a smaller circle (head) over a bigger circle (body, clipped by the avatar's edge) — inline SVG or two CSS circles, in the muted ink. Keep the light-mode control; make the footer's spacing match the new rows.

So this task is judged by **looking, and measuring against real products** — not by citing our own rules. Rules you use are suggestions; the screenshot is the verdict.

## What is wrong — measured by the mastermind at 1920 on `/framework/core/Page/`

- A tree row is **46.5 px** tall: `.sidebar .ui-tree-row { padding: 1em 1em 1em var(--gutter); gap: 1.3em }` in `core/Sidebar/Sidebar.css` (~line 112). That is the OLD flat menu's roomy link chrome (eight links, an icon and a label) carried onto a tree of forty rows with three things in each (toggle, icon, label).
- The 1.3em gap applies twice, so a depth-0 label starts at **x = 80 px** in a 256 px rail. On the home page, where no row has an icon or a toggle, the labels still float 80 px in.
- The fold toggle is a **9 px** glyph (`ui/tree/tree.js`: `font-size: 0.7em`) — barely visible, a tiny target.
- The filter is `ux/Filter`'s own `.filter.surface.pad.flex.wrap.gap` — a white **card with a 1 px border** inside the rail, 22 px side margins, and an empty chips `div` plus a 25 px gap pushing the input 26 px to the right. A card inside a rail reads as a broken box.
- The footer (a gear, an empty avatar circle): look at it and say whether it earns its place as drawn.

## Targets — from products people use all day (suggestions; beat them if you can show it)

| | GitHub file tree | VS Code | Notion | aim here |
|---|---|---|---|---|
| row pitch | 32 px | 22 px | 30 px | **30–34 px** at the rail's font size |
| toggle | 16 px box | 16 px | 20 px | **a 16 px box or more, glyph 11 px or more**, clearly visible |
| toggle → icon → label gaps | 4–8 px | 4–6 px | 6 px | **0.35–0.5em** |
| indent per level | 16–20 px | 8 px | ~24 px | the child's icon under the parent's label, or one step of ~1.2em |
| filter | a plain full-width input | same | same | **a full-width darken bar with a white input** (the owner's direction above) |

Sizes are the ROW's own `em` — never `--pad`/`--gap` (those are page ramps; the sidebar's own comment near line 113 says why: 48.7 px at 3440). Keep hover, `.active`, the focus ring, the drag grip and the row buttons working. A sibling group with no icons and no toggles anywhere (the home page's top level) should not reserve 60 px of empty columns — decide how (a class the Tree stamps, `:has()`, or a narrower reserved column) and say why.

## Scope

- `public/framework/framework.css` and `public/framework/styles/system/**` for the field-ground mechanism only (one small, single-write edit; framework.css is live on every page — load a page headless within a minute of the write). `public/framework/core/Sidebar/**` (CSS first; JS only if the filter's markup must change), `public/framework/ui/tree/tree.js` (the toggle's size — then check the other Tree consumers still look right: `/framework/ux/Tree/`, `/imagine/paging/make/`, `/layouts/labs/trees/`), `public/framework/ux/Filter/**` only if a quiet, chrome-less form of the filter is the clean way (a config word beats a CSS override from outside — your call; write the alternative down as a `decision` line).
- Below 52em the sidebar is a top bar with a menu — it must still work at 400.

## Prove — before and after, side by side

Private server `PORT=8132 node server.js` (background; kill by its real Windows PID at landing). Shots of the rail (clip to the sidebar's box plus 100 px of page) on `/`, `/framework/`, `/framework/core/Page/`, `/framework/ai/` at **1280, 1920, 3440**, and the open menu at **400**. Take the BEFORE shots first — the tree is uncommitted, so there is no other way back to them. A small `page.js` in your task dir shows the before | after pairs. Numbers in the landing: row pitch, label x at depth 0 / 1 / 2, toggle glyph size, filter box — before → after at 1920 and 3440. Then LOOK at the after shots yourself, as a stranger would, fix what still looks off, and say what you changed on that second look.

## Rules

- `new-task` before the first edit (your dir: `ai/2026-09-19/sidebar-repair/`); `css`, `layout`, `ui-test`; `finish-task`; `skill-improvement` if a skill misled you — and if a skill's guidance is what produced the 46 px row, say which line.
- Core is live on the owner's dev server (port 80): **never kill or restart it, never drive the owner's tabs**; every edit in one write, loaded headless within a minute; if broken, fix forward at once. Never `git stash`, never `find /`; an `rg` pattern starting with `/` returns nothing here — drop the slash. A bash heredoc containing an apostrophe fails in this harness — write files with the Write tool.
- Playwright: `import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs"`; block the socket with `page.routeWebSocket(/.*/, () => {})`. Scratch in the session scratchpad.
- Landing `outcome`: one screen — the headline, the before → after numbers, the pairs page link, decisions, what was left and why.

## The owner's words, round two (2026-09-19, mid-task)

> the framework sidebar's footer should be like one row, like one button row. It's taking up 50% of the vertical space. It's just a big white chunk that's taking up a huge amount. And when the sidebar is expanded and you need to scroll it…

> the icon doesn't align properly. It's too high. The icons should be properly framed so that they always look good — in some sort of square frame, centered vertically and horizontally … sized in ems so they respond with the font size … fixed height and width, aspect ratio square.

> figure out if there was a screenshot taken and whether the minions that were reviewing that layout thought that was acceptable.

4. **The footer is one compact button row, pinned to the bottom.** Measure the rail at 1080 and 1400 tall, with the tree as it loads and with every branch expanded: the tree is the only thing that scrolls, and no white block sits between the last row and the footer other than the tree's own free space. Name the cause of the block in one sentence.
5. **The tree row's icon gets a square frame** — fixed em width and height, aspect-ratio 1, display grid, place-items center, the glyph sized inside it, line-height 1 — and the toggle takes the same frame, so toggle, icon and label share one centre line. Centre-y of the icon box vs the label box on five rows: within 1px. Then write a `decision` line on whether that frame should become the site-wide default for `.icon` (count the callers, name what would shift), with the alternative: change only the tree rows and the footer's buttons today.
6. **Forensics.** Read the three earlier sidebar task logs (`ai/2026-09-18/site-sidebar-tree`, `sidebar-filter`, `tree-fixes`) and say in the landing what each builder claimed to have verified about the whole rail.
