# Result — the paper-shell demo shows the nine-grid, and the rail-width bug is fixed at the root

Two passes. First pass: real content in the paper demo, plus the well's colour. Second pass
(after review): the rail-width bug that first pass had worked around locally is now fixed inside
`Shell.css` itself, and the local workarounds (in this demo and in `dev/DevShell`) are gone.

**Proof:** [`demo-1920.png`](demo-1920.png) / [`demo-400.png`](demo-400.png) — the real page at
`/framework/core/Shell/`, first demo only. [`devshell-1920.png`](devshell-1920.png) /
[`devshell-400.png`](devshell-400.png) — `dev/DevShell` (Ctrl + \\), opened on `/framework/core/Page/`,
same two widths, since the fix touches it too.

## What changed, and why

1. **Real content, first pass.** Left is a 4-item list (Overview, Members, Billing, Settings).
   Right is a plain white box labelled "chat" (not a real chat). Header reads "Page title · Tab ·
   Tab". Footer reads "Saved · 3 items".
2. **The well is solid gray, first pass.** `Shell.css`'s `--well` was a translucent `rgba()`,
   which let the demo stage's own checkerboard show through it. Switched it to `var(--wash)` —
   framework.css's own OPAQUE elevation token.
3. **The nested paper is visibly smaller.** Its own narrower left list ("Draft", "Final"), its
   own header ("Section · Details"), three real lines of body text.
4. **Page background:** checked side by side against the main site's own Shell page — identical.
   Nothing to undo.
5. **The rail-width bug, fixed at the root (second pass).** `left`/`right`'s width was
   `clamp(12rem, var(--core-shell-left-w, 18rem), 50%)` on the ITEM — inside any
   `container-type: inline-size` ancestor (every `ext/demo` stage, and `dev/DevShell`'s own
   window), that clamp either floored at 12rem (this demo) or ballooned to the width of its own
   text content (DevShell's long log paragraphs), because CSS Grid has to ask an `auto` COLUMN's
   item for its preferred width before the grid's own width is known, and a percentage in that
   item's own `width` can't resolve yet. Fixed by moving the clamp off the item and onto the
   COLUMN itself (`--core-shell-col-left`/`-right` on `.core-shell-grid`, set via
   `:has(> .core-shell-left)` so a missing rail still collapses to zero width) — an explicit
   column size never needs that item-intrinsic-sizing pass, so the bug has nothing to trigger on.
   `.core-shell-left`/`-right` are now just `width: auto`, filling whatever column the grid
   decided. Full writeup: `Shell/doc/decisions.md`.
6. **Both local workarounds removed.** This demo's inline `$left`/`$right` widths, and
   `dev/DevShell/DevShell.css`'s own duplicate column override — neither is needed once the real
   fix lives in `Shell.css`. The demo still asks for its two specific widths (chat box at 14rem,
   nested rail at the 12rem floor) the ordinary way, by writing `--core-shell-right-w` /
   `--core-shell-left-w` — the same custom property a drag already writes, not a bypass.
7. **Re-checked, both widths, both pages, after the Shell.css change:** all 9 demos on
   `/framework/core/Shell/` (the paper demo plus the 8 others — "every other demo" below was off
   by one in the first pass; there are 8, not 7), and `dev/DevShell`. Same text content at 400 and
   1920 on the Shell page (layout-only change). Zero console errors, page errors or failed
   requests at either width, on either page. The outer paper's `left` measures a real 288px
   (18rem, the default — no override needed anymore); `right` measures 224px (14rem, the brief's
   own number); the nested paper's `left` measures 192px (12rem, the floor — visibly narrower than
   288px). On `dev/DevShell` at 1920, the right rail's own right edge now lands exactly on the
   window's right edge (1920px) — the white strip this bug used to leave is gone.

## The three answers

1. **Can you see the gray corners?** Yes — all four read as a plain, solid gray, clearly darker
   than the white paper and the checkerboard stage around the whole demo.
2. **Do the header text and the paper's left edge line up?** Close, not pixel-exact: the header's
   own small inline padding (0.75em, the same on every Shell header) sits the text about 12px
   right of the paper's physical border — same as every other Shell demo on this page, not
   something this task changed.
3. **Is the nested shell visibly smaller?** Yes — narrower left rail (12rem vs. the outer's
   18rem), its own header, and a visibly smaller white card inside the outer paper's main area.

Commit: `6b0eee5e` on `worktree/dev-shell`.

