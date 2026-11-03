verdict: fix
1. [fix] Every shot is Chrome's "This site can't be reached" page, not the site (req 3, four widths): both pages, all four widths — shots/*/sheet.png; layout.json widest_text_sample "This site can't be reached" at 400/1200/1920/3440. The private server on 127.0.0.1:60833 was down when review.mjs shot, so no layout question can be answered. Re-shoot with the server up.
2. [fix] No screenshot of the tree beside a real demo at 1200 (req 3), and the tree is not "beside" anything: the demo page (instance-tree/page.js) stacks buttons, then the tree, then the doc, in one column. CLAUDE.md "Show the class" asks for the rendered view and the live instance side by side.
3. [fix] The second placement is weaker than asked (req 2): the "live tree" link went into `ext/System/readme.md` and `catalog/readme.md`, which are readmes, not the `ext/System` class card or the catalog's class-cards section. A reader browsing the cards never sees it.
4. [note] `InstanceTree.render()` wraps `app.navigated` on every mount, and `stop()` never unwraps it. The dev bar re-renders its tabs, so each show/hide adds another wrapper that stays in the chain for the rest of the session (InstanceTree.js, render()).
5. [note] `install()` patches `Page.prototype.add` for the whole site the first time any tree loads. It is honest about it in the doc, but it is a core hook that lives outside `core/`; once `Property.of` lands, swap it for a real event on Page.
6. [note] The `Object.js` descriptor fix (no getters run on a prototype) is a good, real bug fix, but it lies outside the fence; say so on the card.

Widths given: 400, 1200, 1920, 3440 for `/framework/ux/Content/Object/` and `/framework/ux/Content/Object/instance-tree/`. All eight are error pages.

## Requirements
- 1 "the class, as specified, with its own page… updating when a child page mounts or a tracked property changes" — yes (code only) — `InstanceTree extends View` in ux/Content/Object/InstanceTree.js; page instance-tree/page.js has "add a child page" and "rename this page" buttons; it redraws on add, `change` and navigation. Not seen running: the shots are error pages.
- 2 "Shown in two places: the dev bar toggle… and the ext/System class card / catalog class cards" — partly — the dev bar `page` tab gets an "instances" toggle (DevBar/tools.js); the System and catalog links are readme lines, not card links (finding 3).
- 3 "Four widths, smoke clean… a 1200 screenshot of the tree beside a real demo; instance-tree.md updated" — no — the shots failed (finding 1) and there is no side-by-side shot (finding 2); catalog/doc/instance-tree.md now says "built 2026-10-13" ✅.
- 4 "Report on your card: link, screenshot, what updates live and what does not" — n/a — the card is not part of the diff; doc/instance-tree.md does state what is and is not live.
- Fence "core/Property is read-only" — yes — untouched; the doc says `Property.of` is not on michael/dev and names the branch.

## Page structure
- page 1 (title says what it is) — not measured — shots are error pages; the code's title "InstanceTree" and description are clear.
- remaining page questions — not measured — no rendered page in any shot.

## Navigation
- nav 1 (techniques used) — a details/summary tree; a dev bar toggle button.
- the others — not measured — shots are error pages.

## Layout
- all — not measured — shots/*/1200.png show the Chrome error page; layout.json layout "custom" is the error page's own.
- the side-by-side ask — no — from the code: a single column (finding 2).

## Sizing
- all — not measured — layout.json widest_text 274 is the error message.

## Wrapping
- all — not measured — layout.json wraps [] and tab_rows 0 describe the error page.

## Spacing and padding
- all — not measured — layout.json bands are the error page's one block. From the CSS: indent 1.2em plus a 1px guide line per level, which looks sensible.

## Colour and contrast
- all — not measured. From the CSS: the active row uses `--accent` at 25% behind text that is set to weight 600, and `.instance-class` sits at opacity .7. Check that contrast once real shots exist.

## Flow
- all — not measured.

## Words
- content (lead sentence states the takeaway) — yes — page.js: "This is the site's real instance tree, drawn from the live App. Press the buttons: the tree follows with no reload."
- content (plain, no jargon) — yes — doc/instance-tree.md opens with what it is, then "What updates live" and "Not live yet" in plain sentences.
- content (links, not plain names) — yes — the readmes and the catalog doc link the page and the doc.
- content (headline state) — note — the catalog doc heading still reads "spec for the live instance hierarchy (built …)". That is fine, but "Below is the original spec" leaves the stale spec text in place with no marker on which parts differ (Property.of is not used).
