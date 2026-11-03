verdict: pass
1. [note] The one change is the sidebar, and at 400 it is a collapsed burger bar, so the pinned "Task queue" link is not visible there (shots/.../400.png) — only 1200, 1920 and 3440 show it. The author's "Checked" list does not say it was opened at 400.
2. [note] layout.json `errors` holds one 404 "Failed to load resource" per width. The brief says "no page errors", so the 404's source is unnamed (likely unrelated to this diff, but unchecked).
3. [note] The `visible_nodes` header comment in Sidebar.js still says "Tree nodes by index", but the code now matches by name (diff, Sidebar.js hunk 1). Stale wording.

Widths given: 400, 1200, 1920, 3440 for /framework/ai/ (one page, four shots plus sheet).

## Requirements
- 1 "A leaf page may name a few children to show anyway: `pinned: "queue"` beside `leaf: true`" — yes — diff: Tree.node_of reads `child.pinned`, nodes_of(page, names) loads only those
- 2 "`visible_nodes()` matches nodes by name; `index()` still walks every child of a leaf" — yes — diff: Sidebar.js filters `nodes` by `node.name`, and the index() guard now drops `!kids &&` so pinned leaves are still fully indexed
- 3 "`ai/page.js`: one line `pinned: "queue"`" — yes — diff: one line added after `leaf: true`
- 4 "`core/Sidebar/readme.md`: one line" — yes — diff: one bullet added
- 5 "a 'Task queue' link under AI in the sidebar" (the owner: "there's no link to it") — yes — shots/.../sheet.png: at 1200, 1920 and 3440 the AI row is open with "Task queue" under it. At 400 the sidebar is closed behind the burger.
- Live-instances page for a new or changed class — n/a — no class added; the diff changes a function and a page option

## Page structure
- page 1 (title says what the page is) — yes — shots/.../1920.png: "AI" h1, top band
- one page, one subject, nothing added to it by this diff — yes — only the sidebar changed

## Navigation
- techniques used: sidebar (tree, one pinned child), tabs on the AI page (unchanged), burger at 400
- sidebar shows where you are — yes — shots/.../1200.png: AI expanded with the queue link under it
- sidebar stays short, not 17 children — yes — shots/.../1920.png: one extra row only
- sidebar reachable on a phone — yes — shots/.../400.png: top bar with a burger
- tabs — yes — layout.json tab_rows 0 at all four widths (the AI page uses chips, unchanged)

## Layout
- no overflow, sidebar beside content at wide widths — yes — layout.json overflow_x false at all four widths
- bands in sensible order (title, then dashboard) — yes — layout.json bands: page-title then ad-dash at every width

## Sizing
- one pinned row is the same size as its siblings — yes — shots/.../1920.png, sidebar column; the row uses the same em-sized tree row
- sidebar width stable across widths — yes — widest sidebar text about 204 to 266px in layout.json; shots/.../sheet.png

## Wrapping
- anything wrapping that shouldn't — no — layout.json `wraps` lists only icon buttons (mode-btn, drawer-menu, chatbox-compose-more) and, at 400, the rail buttons drawer-rail-ai and drawer-rail-menu at 3.2 lines. These are unchanged by this diff, so a note at most.
- "Task queue" label fits on one line — yes — shots/.../1200.png, sidebar

## Spacing and padding
- indentation of the pinned row is one level under AI — yes — shots/.../1920.png
- nothing new padded or cramped — yes — layout.json left_stack h1 12/29/41/54 at 400/1200/1920/3440, a smooth ramp; no new spacing in the diff

## Colour and contrast
- n/a — no colour or CSS in the diff

## Flow
- eye lands on the AI page title, then the sidebar shows the way to the queue — yes — shots/.../1200.png, top band
- band share balanced (title 4-6 percent, dashboard 38-44 percent) — yes — layout.json bands

## Words
- link text "Task queue" matches the page's own label — yes — shots/.../1200.png; the label comes from nav.label
- readme bullet says what `pinned` does, where it lives and that search still sees the rest — yes — diff, core/Sidebar/readme.md
- the `pinned` comment in ai/page.js quotes the owner and says why — yes — diff, ai/page.js
- stale "by index" header comment in Sidebar.js — no — finding 3
