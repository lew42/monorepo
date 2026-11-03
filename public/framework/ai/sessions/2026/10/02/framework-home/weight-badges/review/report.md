verdict: pass
1. [note] The View card falls back to icon+name+description (no `## Architecture` section in its readme) but still carries the `.big` dark/enlarged styling, not the plain small-card shape other modules without a description use — shots/127-0-0-1-58078-framework/1200.png, Core row 1 (View vs AI card). Requirements.md says a module with no Architecture section "falls back to the current icon+name+description card"; reasonable to read either way (weight-sized box with a description, or the small card), so flagging as a note rather than a fix.
2. [note] Cards resize (small → big, plain → dark) after the weight fetch resolves, so the initial paint reflows once data arrives — no screenshot evidence of harm (shots are taken after load), but worth a skeleton/placeholder later if it's visibly janky on a slow connection.
3. [note] No sample in these shots shows a "big" card on a LIGHT ground (every heavy module today — View/Page/Item/List — is also a `.page-surface-dark` class card), so the light-mode `.page-preview-architecture` box (`rgba(0,0,0,0.06)` / `var(--subtle)`) is untested by this shot set; the dark-mode pairing is visibly fine.

## Requirements
- 1 "Card size follows weight... big card shows icon, name, first lines of readme's Architecture section, fetched live" — yes — shots/.../1200.png: Page card shows live code (`Page extends PageLog extends Item…`); diff shows `architecture_excerpt()` fetches `readme.md` live, never retyped.
- 1 "Small card is icon + name ONLY — no description line, even though one exists" — yes — shots/.../1200.png: AI, Router, App, Sidebar, Shell, Search, Layout, Section all show icon+name only.
- 1 "This only touches how a CARD renders... wall_rungs() and sprawl() stay untouched" — yes — diff.patch touches only `page.js`'s `module_card()`/`home_sections()` and `Page.css`; no change to `wall_rungs()` or `sprawl()`.
- 2 "A small count badge on each module card... render 0 or hidden until [per-module data] exists" — yes — `unread_count_for()` always returns 0; `module_card()` only appends a badge when `n > 0`, so no badge renders anywhere in the shots.
- 2 "Never a direct recompute from ext/Inbox's own is_read()" — yes — `unread_count_for()` is a stub returning 0, no read of `ext/Inbox` at all.
- 2 "Clicking a card... goes to that module's own inbox view... or the module's own page for now" — yes — `module_card()` still builds on `owner.preview_link(nav)`, the existing click-through to the module's page; unchanged.
- 2 (scope decision) "Sidebar's own rolled-up 'Framework (N)' total is deferred" — yes — not present in diff or shots; requirements.md logs the reason (ux/Tree has no badge slot today).

## Page structure
- 1 — yes — shots/.../1920.png: "A no-build, native-ESM web framework" states what it is, unchanged by this diff.
- 2 — yes — concept tiles (AI, Core, Styles…) sit right under the title, as linked cards.
- 3 — n/a — this diff only changes card shape within an existing section, not page content order.
- 4 — n/a — no open/done distinction on this page.
- 5 — n/a — no new page was added.
- 6 — yes — every card is a real link (`owner.preview_link(nav)`), each module keeps its own URL.
- 7 — yes — cards still render inside the existing wall-of-cards layout word (`page-previews bleed`), no page-specific CSS shape added.
- 8 — yes — icon + name cards (Router, App…) are self-evident from their existing names/icons; the architecture excerpt is readable as a shape, not retyped prose.
- 9 — yes — small cards dropped their description line entirely rather than show a redundant one-liner next to the icon+name.
- 10 — yes — a heavy module's "best form" is now its own live code shape (`Page extends PageLog extends Item…`) instead of a hand-written description.
- 11 — n/a — unchanged section titles (AI, Core, Styles…).
- 12 — n/a — no restructure of a working version here.

## Navigation
- 1 Identify — sidebar only (the left nav column); no tabs, rail-as-overlay, bottom rail, sheet, modal or full-screen view on this page.
- 2–4 Tabs — n/a — no tabs.
- 5 — yes — shots/.../3440.png: sidebar sits left, content wall fills the rest of the width (Rail + content pattern), unchanged by this diff.
- 6 — yes — sidebar doesn't move or jump; only cards inside the content area resize as their own weight/architecture fetch resolves.
- 7 — n/a — no bottom rail or fixed overlay.
- 8 — n/a — no sheet or modal.
- 9 — n/a — no full-screen view.
- 10 — yes — a card click navigates to the module's own page (its own URL), never expands in place.

## Layout
- 1 — yes — shots/.../3440.png: sidebar + wide content wall, several cards per row, not one narrow column.
- 2 — yes — the page keeps its existing Tile-wall-style card grid (`page-previews bleed`); this diff doesn't add a new layout.
- 3 — yes — the architecture box's width tracks its card's width at every shot (400/1200/1920/3440); `white-space: pre-wrap` + `word-break: break-word` reflows instead of overflowing — layout.json `overflow_x: false` at every width.
- 4 — yes — the architecture excerpt box takes padding (`0.6em 0.7em`) because it's a framed sub-box inside the card, not bled.
- 5 — yes — shots show the code text sitting clear of the box's own edge at every width.
- 6 — n/a — single-column card content, not multi-column prose.
- 7 — not measured — layout.json's `bands` only covers the page's top-level sidebar/pages split (both ~1.0 share, ~0.25–0.3 ink at 1200+), not individual card rows; no band is both big and empty.
- 8 — n/a — cards are a wall, not a fixed-column pair.
- 9 — n/a — no dead-space gutter question raised by this change.
- 10 — yes — the architecture excerpt's `0.8em` text and `.big` card's `1.1em` title scale with the bigger box; small cards keep the same icon+name size as before.
- 11 — yes — shots/.../1920.png, .../3440.png: wall rows read full/balanced, no lone trailing card visible in what's shown.
- 12 — yes — all cards (light and `.page-surface-dark`) keep the same rounded-corner + gap treatment; unchanged by this diff.

## Sizing
- 13 — yes — every card and the architecture box are auto height; the box grows with however many of its (max 6) lines exist, no fixed height set in the CSS added.
- 14 — yes — the architecture excerpt is exactly as tall as its (up to 6-line) content, not cropped or padded to a fixed box.
- 15 — yes — `architecture_excerpt()` already truncates to `ARCHITECTURE_LINES = 6`, and the CSS backs it with `overflow: hidden` — the one case of "longer content" (a bigger readme) is handled by both the JS slice and a CSS safety net.
- 16 — yes — no new scrollbar introduced; the `pre` wraps instead of scrolling.
- 17 — n/a — no band above first navigation changed.
- 18 — yes — layout.json `overflow_x: false` at 400/1200/1920/3440.
- 19 — yes — the new CSS uses `em` throughout (`0.5em`, `1.4em`, `0.6em 0.7em`, `0.8em`, `1.1em`, `1.3em`), no px or rem floor introduced.

## Wrapping
- 20 — yes — layout.json's `wraps` at every width lists only the pre-existing h1/mode-btn/drawer-menu rows, nothing from the new cards or badge.
- 21 — n/a — same `wraps` list appears at 1200/1920/3440 (h1, mode-btn, drawer-menu); nothing newly introduced wraps only below 1920.
- 22 — n/a — the architecture box isn't a flex row, it's a text block that reflows by design (`white-space: pre-wrap`).
- 23 — n/a — cards aren't full-row items; they sit in the existing auto-fill wall.
- 24 — yes — the architecture excerpt is sliced to the same 6 lines server-side before render, so the same module shows the same (unclipped-by-CSS) text at every width; it reflows, it isn't clipped mid-line.

## Spacing and padding
- 33 — not measured against this diff — layout.json `left_stack` (h1/p offset) is 24px at 400 (under 3em≈48px) but 58/80/90px at 1200/1920/3440; this is the page's existing header spacing, unrelated to the card change in this diff.
- 34 — yes — the architecture box nests one padding level (`0.6em 0.7em`) inside the card's own padding; no third nested padded box.
- 35 — yes — the architecture box is a framed `.card`-like box, not a bare `.pad`; opted in deliberately per the CSS comment.
- 36 — yes — shots show the code text sitting inside its own box padding, not flush with the card edge.
- 37 — n/a — the new rules use `em`, not the spacing clamp tokens; they size a control-like sub-box (a badge, a code excerpt), which Q38 covers instead.
- 38 — yes — `.page-preview-badge` and `.page-preview-architecture` both use fixed `em` sizes (padding, min-width, height, font-size), never a spacing clamp or `vw`.
- 39 — yes — the architecture box's `rgba(0,0,0,0.06)` / `rgba(255,255,255,0.08)` background differs from its card's own ground, so it doesn't float without a visible edge (this was review finding 2 from round 1, now fixed).
- 40 — n/a — the card itself isn't bled; no bleed container involved here.
- 41 — yes — all new rules sit inside the file's existing `theme`/`site` layer blocks (same indentation/brace nesting as the surrounding rules); no new layer name added.
- 42 — yes — reuses `.page-preview`, `.big`, `.page-surface-dark` and adds exactly two new classes (`.page-preview-badge`, `.page-preview-architecture`) for genuinely new shapes (a badge, a code excerpt) that nothing existing covered.

## Colour and contrast
- 1 — yes (dark card) — shots/.../1200.png, .../1920.png: Page/View architecture text reads as light `--dark-ink` text on a lifted dark box, clearly legible.
- 1 — n/a (light card) — no "big" card on a light ground exists in today's data (every big module is also `.page-surface-dark`), so this pairing isn't exercised yet.
- 2 — n/a — no accent-coloured text introduced by this diff.
- 3 — yes — all new colour values are tokens (`var(--prime)`, `var(--prime-ink)`, `var(--dark-ink)`, `var(--subtle)`) except the two box tints, which are deliberately literal `rgba()` (documented reasoning: `--wash` reads against the PAGE ground, not the card's own, and the two happened to be visually identical hex values).
- 4 — yes — the architecture box's background is a lift off its own card ground (`rgba(0,0,0,0.06)` / `rgba(255,255,255,0.08)`), not `--wash` on the page.
- 5 — yes — the dark-card override sits beside the existing `.page-surface-dark` rule (same file, same pattern), so it covers both themes the same way the ink override already does.
- 6 — yes — the architecture box's edge is deliberate (documented in the CSS comment, citing the earlier hex-value near-miss finding).
- 7 — n/a — no repeated anchor mark introduced.
- 8 — n/a — no muted text introduced (`--subtle` is used, which is a separate, already-approved token elsewhere in this file).

## Flow
- 25 — yes — within a card, the icon+name still leads, then (for a big card) the architecture excerpt or description follows — priority order unchanged.
- 26 — yes — layout.json `overflow_x: false` at every width; nothing sits past the right edge.
- 27 — yes — the architecture box uses its own `pre`/code rhythm (fixed line-height, no `.flow`), appropriate for code, not prose.
- 28 — yes — the badge and architecture excerpt sit inside their own card's padding, clearly closer to their own card than to a neighbour.
- 29 — n/a — this isn't a live-arriving list; cards are a static section render, not new items streaming into a feed.
- 30 — yes — layout.json `widest_text` stays well under each width's measure (350/533/572/704px) at every shot; unrelated to this diff's own box widths.
- 31 — n/a — no change to fixed site chrome.
- 32 — n/a — no nested `.page`-in-`.page` padding touched here.

## Words
- 1 — yes — a heavy module now shows its own live shape (code), not a hand-written sentence about it — "let the layout say it."
- 2 — yes — the excerpt itself (`Page extends PageLog extends Item`, indented fields) carries the structure; no caption explains it.
- 3 — n/a — no prose paragraph introduced; the excerpt is code, and the one fallback description (View's) is the module's pre-existing one-liner, untouched.
- 4 — yes — a reader scanning Core sees in a few seconds which modules are heavy (bigger, dark, code-backed) vs light (icon+name).
- 5 — n/a — card titles are existing module names, unchanged.
- 6 — n/a — no picture/caption introduced.
- 7 — yes — "weight" is named the same way the diff's own comments, requirements.md and `core/Page/weight/weight.js` already use it; no synonym introduced.
- 8 — n/a — no new concept-with-its-own-page referenced in card text that lacks a link; cards themselves remain links to their module pages.
- 9 — n/a — not a readme/doc page.
- 10 — yes — the most important thing (which modules are heavy) now leads visually in the wall itself, no separate list needed.
- 11 — yes — code comments in the diff are full, plain sentences explaining the "why," consistent with the rest of this codebase's style.
