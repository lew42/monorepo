# Figma batch 3 briefs: size pages + text audit (2026-11-16)

Owner asks, relayed by voice-app. Common to every brief below: load the `minion` skill, then `figma:figma-use` and `figma:figma-generate-design` (pass `figma-use,figma-generate-design` in `skillNames` on every mutating `use_figma`). Read [build-checklist.md](/framework/ext/Figma/doc/build-checklist.md) and [explore-brief.md](explore-brief.md) first (the rules and traps). File `ADpu9u2V0BlEZfR3rrMfER`, use Figma sessionId `bbeccbc5-c30f-4059-88a0-e7ee9cdd59bc`. **Never touch the pages named `AI` (60:360, the first page; read its `Index` frame first, then the frames it lists: Rules, Components, Tokens, Text, Layout) or `Live` (owned by `mastermind-live`).** If a decision lands that the AI page should say, propose a one-line change to `mastermind-figma`, never edit it. **No agent reports done without screenshots** (whole page, plus each section). Several agents work in this file at once: re-read a node's state before editing it, edit only what your brief names, no variable or collection edits. One `setCurrentPageAsync` per `use_figma` call. Log a line in your task at each milestone; final message to `mastermind-figma`, one screen.

State already done by the mastermind: Scale has 8 modes now (`360 XS` 2:5, `400 Mobile` 2:1, `600 SM` 2:3, `1000 Default` 2:0, `1600 LG` 2:4, `1920 Desktop` 58:0 (draft values), `2600 XL` 2:6, `3440 Mega` 2:2). The `width` variable holds each mode's resolution. The page `1920 Pages` is already named `1920 Desktop`. The live tokens row on Scale has a 1920 Desktop column.

Local text styles (use `figma.getLocalTextStylesAsync()`; set with `await node.setTextStyleIdAsync(id)`, never per-instance overrides): `h1` Montserrat Black 48, `h2` Bold 36, `h3` SemiBold 24, `h4` Bold 14 (the kicker), `body` Medium 16, `label` Bold 16, `small` SemiBold 12, `code` JetBrains Mono 14.

---

## Brief P: one page per size (Sonnet, budget $6)

Deliver:

1. **Pages, named exactly like their Scale mode:** `360 XS`, `400 Mobile`, `600 SM`, `1000 Default`, `1600 LG`, `1920 Desktop` (this page already exists as the old `1920 Pages`: keep its content and its Page master 43:8103 untouched, do not rename it, add the content below to it), `2600 XL`, `3440 Mega`. Create the missing ones with `figma.createPage()`.
2. **Page order** (use `figma.root.insertChild(index, page)`; the `AI` page may or may not exist yet: if it exists it stays first and you never touch it): AI (if present), `Index`, then `360 XS`, `400 Mobile`, `600 SM`, `1000 Default`, `1600 LG`, `1920 Desktop`, `2600 XL`, `3440 Mega`, then `Elements`, `Icons`, `Scale`, then every `Explore – …` page last, plus the page now named `2600 Large` (old 2600 exploration, node 34:475) among them, in their current relative order. Do not edit the content of `Index`, `Icons` or `Elements` here.
3. **Each size page gets, in one vertical auto-layout frame:** (a) a title using the `h1` text style, text `<resolution> <name>` (e.g. `1600 LG`); (b) a **Page frame**: an instance of the local Page master (43:8103, on `1920 Desktop`; read how the existing instances on the `1920 Desktop` row (`50:4077`, instances 50:4080 … 50:4104) were made and do the same), at that mode's width (bound to the `width` variable) with that mode set on it (`setExplicitVariableModeForCollection`); (c) inside or beside it, the layouts that belong at that size: reuse instances of the existing layout masters (the `Layout.*` sets, the cards and sidebars on `2600 Large` / `Scale`; look at them and the `Index` first). Small sizes (360 to 600) show the one-column layouts, 1000 the single and two column ones, 1600 to 1920 sidebar plus main, 3440 the wide ones. Keep each page simple: the Page frame, a title, one or two fitting layouts. Never hand-build a layout that a master already gives you; if no master fits, leave that spot out and say so.
4. **The 2600 work moves to `2600 XL`, only clean layouts.** Take from `2600 Large` (34:475; organised frame 45:2966) what passed review: sections 1 (single column), 4 (Miller columns, including `Layout.Miller.Mobile Set` demos), 5 (the four `Layout.ScaleRegions Set` instances) and 6 (sidebar toggle), and the section 2 and 3 demos only if they use instances (they are hand-built frames, so leave them). **Move, don't copy:** re-parent the demo frames onto `2600 XL` (`page.appendChild` / frame `appendChild`; node ids stay). The masters those demos use stay as they are on `2600 Large`, loose; instances keep working across pages. If a re-parenting breaks (instances lose their main), stop that item and report. Add a short note frame on `2600 Large` saying what moved and where; do not delete anything.
5. **Add a `1920 Desktop` instance to the row** `Pages · one per Scale mode` (50:4077) on the `1920 Desktop` page, between the 1600 LG and 2600 XL instances, with mode 58:0 (the other seven instances show how). Update that row's labels if they list modes.
6. **Docs:** in `public/framework/ext/Figma/readme.md` (Docs section / pages list) and `public/framework/ext/Figma/doc/design-system-notes.md` (rule 7), update the mode list to eight and describe the page-per-size rule in one or two lines. Commit by exact path.

Screenshots: one per new page and one of `2600 XL`, read them, fix what is wrong, then report with the screenshots and node ids. Long-text test on one layout, narrow test on the 360 XS page.

---

## Brief A1: text audit, masters first (Sonnet, budget $6)

Pages: `1920 Desktop` (Page master 43:8103 first), `Elements`, `Scale`, `Index`, `Icons`. Skip the `AI` page and the explorations (another agent has them).

The owner's request, verbatim intent: "System-wide text audit, all pages except AI. 8 local text styles. On the 2600 page, 820 of 967 text layers are unstyled Inter. Per page, count styled vs. unstyled text, then apply the closest style to every unstyled text node. Fix MASTERS first so instances follow; never add per-instance style overrides. Skip text inside remote instances (the Big Sloppy instances on Icons). Don't change any wording. Report before/after counts per page, plus anything ambiguous."

Method:

1. **Count first, per page:** a text node is styled when `textStyleId` is a non-empty string (it is `figma.mixed` for mixed ranges: count those separately). Find all text with `page.findAllWithCriteria({types:['TEXT']})`. Skip hidden text, and text whose ancestor instance has a main component in another file (`mainComponent.remote === true`; the Big Sloppy instances on Icons). Record per page: total, styled, unstyled, skipped-remote, mixed. This is the "before" count.
2. **Masters first:** text inside a `COMPONENT` (or component set variant) gets its style there, so every instance follows. Text inside an instance node (id starting `I…`) is an override: never style it on the instance if the master's text can take it; when the master is styled the instance text follows automatically, recount after.
3. **Mapping (nearest style by size, then weight/family):** 48 and above -> `h1`; 30 to 47 -> `h2` (36); 20 to 29 -> `h3` (24); 14 or below bold/uppercase small kicker -> `h4`; 16 bold -> `label`; 14 to 18 regular/medium -> `body`; 12 and below -> `small`; any monospace font -> `code`. Inter and other fonts map by size, not family. A node that fits no row cleanly (13, 18, 20 px, a mixed-size text, a two-style range) is **ambiguous**: apply the nearest style if one clearly fits, else leave it and list it with its node id.
4. **Do not change a character of wording.** Applying a style changes size and font, so text can reflow: after each page, take a screenshot and fix anything that broke (cut-off text, overlaps) by adjusting only the container's sizing (Hug/Fill), never the wording or the style. Wrapping text with a fixed width stays fixed.
5. **Index and Icons are hand-edited by the owner:** re-read before each edit, change only text styles on unstyled nodes, nothing else.
6. After the page work, recount (the "after" numbers) and report a table: page, total, styled before, styled after, unstyled left (with reasons), skipped-remote. Screenshots of each page before reporting done. Commit nothing in the file; log to your task.

---

## Brief A2: text audit, exploration pages (Sonnet, budget $5)

Pages: every `Explore – …` page (`Explore – Sizing`, `Explore – Color permutations`, `Explore – Icon + title`, `Explore – Layout examples`, `Explore – Figma → CSS`, `Explore – Legacy vs Latest`, `Explore – Drag playground`). **Not** `2600 Large`, `2600 XL` or the size pages: the mastermind sends those later once the page agent has landed. Same request, method, mapping and report as Brief A1 (read it above; it is identical), including: count first per page, masters first, no per-instance style overrides, skip remote instances, no wording changes, screenshot per page, before/after table, ambiguous list. The `Explore – Drag playground` page was built with 16 px labels on purpose: they map to `body` or `label`.
