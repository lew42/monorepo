# `.switcher` — a responsive "vertical tabs" pattern, free for reuse

`switcher.css` is a small, generic CSS component (own file, own class names, no
`fs-`/`file-` prefix) built for the v2 explorer but not specific to it. It turns any
"a list of choices beside the one you picked" layout into a full-width, one-thing-
at-a-time view on a narrow screen, with zero JS beyond one click handler.

**To reuse it elsewhere:** wear three classes. `.switcher` is the outer box (it
measures its own width — a container query, not the viewport, so it collapses
inside a narrow panel too, not only on a phone). Inside it, `.switcher-body` holds
your three parts: `.switcher-header` (one `.switcher-toggle` button — the sticky
dropdown label on a narrow screen, invisible above the breakpoint), `.switcher-nav`
(your list of choices), and `.switcher-panel` (the one currently showing). Toggle
the class `.switcher-open` on `.switcher` from the toggle button's click handler —
that is the only JavaScript this pattern needs. Above the breakpoint, nav and panel
sit side by side and the header never shows; below it, the header is a sticky bar
and tapping it swaps the nav in for the panel.

⚠ **The container query is on `.switcher`, but it restyles `.switcher-body`, never
`.switcher` itself** — a container cannot conditionally restyle the element that
establishes it (the browser silently drops the rule; nothing errors). `switcher.css`
has the full note where this bit for real.

Import `View.stylesheet(import.meta, "switcher.css")` (or point at
`/framework/ext/files/switcher.css` directly) — it is deliberately a standalone
file, so lifting it into its own module later is a file move, not a rewrite.
