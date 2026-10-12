# layout-browser — every layout on the site in one place, and approve or improve each one

**Three laws.** Less is more (ASAP: fastest working version, then improve; show, don't tell). Clear beats brief by far (a newcomer says what the page is for in ten seconds; full plain sentences, basics first). Prioritize.
**Length budget:** level 1 is one screen: a tier strip and a wall of picture cards. A card is a picture, a name, a verdict mark. Level 2 (one click) is the thing at three widths, where it comes from, why it is the way it is, and the two buttons. Your landing report is one screen of plain sentences with links.
**The reader is the overwhelmed newcomer.** Shown, not told. Detail nests one click down and is never removed.

## The owner's words (2026-09-17)

> We've been working a lot on layout, and unfortunately, I just don't think we figured it out yet. I think part of what it is is that the layouts are too complex and that they're not polished enough. There's a lot of just random blank spaces. There's just a lot of things that don't line up properly. And part of that might require me going through layout by layout and either approving it or recommending what needs to change. So I think to do that, we need a layout browser. It's not just for layouts. I mean, the global layouts need to be different from the smaller templates, like mobile card UI, just from the actual layout of those pages in terms of what goes where, and how to browse all of those.

> I kind of think we need an approve or improve for the layout system.

> with all of these design decisions, we should be able to create content where I can browse through the decisions that were made. For example, for any thing we're creating, any element we're creating [...] layout, navigation, structure, visual hierarchy. What goes where? [...] iceberg UX. Minimal, effective, with the depth and detail at your fingertips, but nested away so it looks clean and simple.

The full prompt: `../mastermind-layout-browser/requirements.md`.

## Deliverables (each ticked against the sentences above at harvest)

1. **`/layouts/browse/`** — one page. Three tiers, each its own wall, in this order: **Global** (whole-page layouts: the five approved at `/imagine/design/layout/approved/`, the `/layouts/` ids, the `/imagine/layouts/` arrangements, `/imagine/shells/`), **Sections** (`/imagine/sections/`, the `/imagine/paging/` templates, `/imagine/screens/`), **Components** (`/framework/ui/`'s twenty, `/framework/ux/`'s eight — the "mobile card UI" tier). A tier strip at the top jumps between them and shows each tier's count and how many are approved. Every item is a picture card: a screenshot or the wire `/layouts/` already draws (`Layout.js` has a thumbnail view — reuse it), the name, the verdict mark. A preview is a picture, never a live instance.
2. **Approve / Improve.** On a card's level 2: **Approve** and **Improve** (Improve takes a one-line note: what must change). A press appends one line to `public/layouts/verdicts.jsonl` through `rpc:append` — the seam `/imagine/importance/` already uses (read `public/imagine/importance/` and `ext/JSONL/live.js` first; only `.jsonl` can be appended from the browser). Shape: `{"verdict": {"at": "<ISO>", "item": "<id>", "say": "approve|improve", "note": "…"}}`. The card shows the latest verdict (a check, or a pen); the history is one click down. Off the dev server (`available()` from `ext/Ask`, or the same test importance uses) the buttons hide and verdicts still render from the file. The owner is the only writer; you write no verdicts.
3. **Level 2 of an item:** the thing at 400 / 1920 (3440 where it matters) as pictures, a link to the real page, and **why it is the way it is**: its source's `readme.md` Watch-out list and `doc/decisions.md` if they exist, rendered one click down (fetch the md; 404 = omit). That is the "browse the decisions" ask, for layouts.
4. **The inventory is data**: `public/layouts/browse/items.json` — `{id, tier, name, url, source, shot|wire}` — built by you once from the realms' own manifests where they exist (`/layouts/layouts.json`, ui/ and ux/ page children, the approved page's `APPROVED` array). Do not edit the realms you catalog. Say in your log which items you could not picture and why.
5. **Linked from where a reader already is:** one line in `public/layouts/readme.md` (Use) and `browse` in `public/layouts/page.js` `children:`. The landing line's `highlight` puts it on the AI front.

## Rules

- Load `code`, `layout` (Q1: `/layouts/` pages are `wide` with `.std-body` taking the measure back — read `public/layouts/readme.md` Watch out), `css`, `new-css-class` (`std-` is `/layouts/`'s prefix; a browser class is `std-browse-*`), `new-page`; `new-task` before the first edit (your dir exists: `ai/2026-09-17/layout-browser/`; write its `task.jsonl` launch line); `documentation` then `finish-task` at the end; `skill-improvement` for any skill that misled you.
- **Fence:** `public/layouts/browse/**` (new), `public/layouts/verdicts.jsonl` (new, may stay absent until the owner presses), one line each in `public/layouts/readme.md` and `public/layouts/page.js`, your own task dir. Nothing else — not the realms you picture, not core, not framework.css.
- **Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`.** The owner's server (port 80) is NOT running; start your own: `PORT=8092 node server.js` from the repo root, in the background; kill it when you land. The `ui-test` skill has the headless recipe (Playwright import `file:///C:/…`; `page.routeWebSocket(/.*/)`); shots at 400 / 1280 / 1920 / 3440 into `browse/shots/` as jpeg, each under ~120 KB; a hidden tab does not lay out.
- The wall: `.grid.auto` with a real `--column` (14–22em) so 3440 gets 4+ columns; framed cards ride the padded track, never `bleed`. No text or framed box at x:0; no prose past the measure; no constant where a spacing token exists. Read it back at the four widths.
- **Resolve, don't park.** Findings as `log` lines in your task.jsonl; timestamps from the clock; never Out-File for jsonl.
- Landing: `outcome` = a headline, the link, one screenshot of level 1 at 1920, the counts (items per tier; pictured / not), what was left and why. One screen.
