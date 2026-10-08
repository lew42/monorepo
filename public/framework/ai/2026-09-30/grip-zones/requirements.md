# Grip: the resize handle's zones, and names for the layouts: requirements

The owner's words are verbatim in [owner-words.md](owner-words.md). Re-read them before each step.

## The widget
The resize handle is **the grip**: [`ext/grip`](/framework/ext/grip/) (grip.js, grip.css). It's ONE system, used everywhere a column resizes. Keep the little orange pill exactly as it is.

## The bug
The grip is a 0.75rem strip placed just INSIDE the rail's edge (grip.css: `width: 0.75rem`, `inset-inline-start: 0`). So it extends left over the rail's own scrollbar and barely at all to the right, and on the AI 2 Inbox you can't grab the preview rail's scrollbar.

## Asks
1. **Two invisible zones:**
   - **Show zone (about 50 px radius):** the separator line and the pill appear.
   - **Grab zone (smaller):** the resize cursor appears and a drag works, even when you're not exactly on the pill. It extends about 5–10 px to the right and up or down, but only about **1 px toward the scrollbar**, so the scrollbar right beside it stays easy to grab.
2. **The same on every grip surface:** check each one (grip-everywhere, 2026-09-29, listed the surfaces), both x and y axes, in both directions.
3. **Names.** The grip's page says in one line what it's called and where it lives, so "where's the resize handle?" is answered with a link. On the same page, name the layout it sits in: the **preview rail** (a flush stack of previews, persistent navigation) beside the **detail**. Reuse names already in [/framework/design/layout/](/framework/design/layout/): "flush stack" is there. Record the names in the design system's naming list, not only here.
4. **No regressions.** Screenshots at 400 and 1920 on each surface. Mobile has no hover, so touch keeps working as it does today.

## Rules
Quick-fix pool: `take_worktree`, then `merge.mjs` (smoke test), then the review skill. Small and clear, so build it directly; there's no plan step. The owner uses AI 2 now, so check /framework/ai2/ first.

