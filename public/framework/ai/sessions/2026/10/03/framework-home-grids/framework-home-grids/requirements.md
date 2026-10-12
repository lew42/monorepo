# /framework/ home: grids without voids, layouts you can see

## The ask (owner, 2026-10-03, dictated; condensed close to their words)
> The framework page has a nice navigation now; most classes are dark mode and I like it. But there's a lot of space in these grids where items have different heights. Core classes: View has two lines of preview, Page has a class architecture, Router, App and Sidebar have nothing, so there's a void under them. Equal content is the wrong restriction; masonry is the alternative. And all these items are really narrow: five columns for styles/UX plus five for core on my screen. The spacing between the styles column and the core column needs fixing.
> It'd be useful to see how the grids are set up: section labels that render the class names used on a container, what grid configuration, so I don't have to inspect to find the right container.
> Using a grid class is better than baking the grid into some complex selector. `.wall, .page-previews:where(:not(.page))` adds display grid; that's fine, but `.page-previews` should also wear the `grid` class, redundant or not, because the class on the element tells you what layout it is.
> DevTools: most selectors link to framework/framework.css, but these two show an inline style element, and clicking it goes to the link in the head for page/page.css. Why?
> Masonry: once you know the column count (a min/max column width algorithm, recomputed on resize), make that many real columns and deal the items into them so they stack densely.

## What exists (use it, law 6; read these first)
- `framework.css` ~line 1023: `.masonry` (CSS columns, zero JS) and `.packed` (row-order masonry, `styles/layouts/masonry/masonry.js` `pack()`).
- `ext/sprawl/sprawl.js`: real columns, each block dropped into the SHORTEST column, re-run only when the column count changes. This is the owner's "deal into real columns" idea, done better than round-robin. Use it, or `.packed` when reading order matters.
- `core/Page/Page.css` ~line 144 (the `.flex/.grid/.masonry` note) and the `.wall, .page-previews` rule.
- The /framework/ home page code (find it from `public/framework/page.js`).

## Do
1. **Screenshot `/framework/` first** at 1920 and 3440 (headless) and post them as the card's first lines.
2. **Fill the voids:** the class-card groups use `.packed` (or sprawl for the big sections), so short cards (Router, App, Sidebar) don't leave holes. Cards get a sensible minimum width so 3440 shows fewer, wider columns, not five narrow ones per group.
3. **Fix the gap between the styles section and the core section.**
4. **Explicit layout classes:** any container that's a grid/masonry/packed wears that class (`grid`, `masonry`, `packed`). Keep the existing selectors; redundancy is fine.
5. **Layout labels (a dev toggle):** a switch (DevBar, or `?layout=1`) that puts a small label on every container with a layout class showing its classes and the computed `display` / `grid-template-columns` / column count. Check `ext/DesignTool` first; something like it may exist.
6. **The DevTools "inline style" question:** find why those rules show as a `<style>` element. Likely suspect: the dev live-reload swaps a changed CSS file in as an inline style or a constructed sheet. If so, have it swap the `<link>` href (cache-busted) instead, so DevTools keeps the filename. Write the answer in one line on the card.
7. Screenshots after, at 400/1200/1920/3440.

## Fence
Write: the /framework/ home page files, Page.css's previews rule, the layout-label toggle, the live-reload CSS swap, this task dir. Hold reloads while writing (`node Server/hold.mjs`).
Model: Sonnet. Budget $10. Over pace: no reviewer spawn; check your diff yourself.
