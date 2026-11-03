# Minion brief: sidebar variants

Load the `minion` skill first, then `code`, `page`, `layout`, `new-page`.

**The owner's words** (read the whole file — the sidebar part starts at "another thing along
these lines that might be a better solution is uh, what I was writing down as, you know, taking
over the, the left sidebar"):
`C:\Code\lew42\monorepo\public\framework\ai\2026\09\28\ai-2-rhythm-tabs-sections-and-sidebar-va\owner-words.md`

These are **variants to look at, not a decision.** The owner: "help me understand this by
creating multiple variants that exemplify what I'm saying and … make note of the things that I
was talking about."

## Today

`public/framework/page.js` `render()` builds the left rail:
`new Sidebar({ app: this.app, header: () => this.app.brand(this.title, this.url), root: this })`.
`brand(text, href)` in `public/app.js`: the logo → `/`, the word ("Framework") → `/framework/`.
The component is `public/framework/core/Sidebar/Sidebar.js` (`header`, `root`, `pages` options;
readme beside it).

## Where you work

Worktree `C:\Code\lew42\worktrees\section-variants` ONLY (server `http://localhost:58245/`).
Never write in `C:\Code\lew42\monorepo`. Commit in the worktree by exact path when it works.

**Fence:** `public/framework/core/Sidebar/variants/**` (new) and ONE line in
`public/framework/core/Sidebar/page.js` making `variants` a child (read how that Doc declares
children and its Docs/Overview tabs first; if adding a child would spill into its tab bar badly,
link to it from the Overview content instead and say which you did). Do not edit
`public/framework/page.js`, `public/app.js` or `Sidebar.js`: every variant is a demo.

## Deliverables

1. `core/Sidebar/variants/page.js` — the index: a wall of the four variants as small previews
   (each clickable), one line each saying what differs. Show, don't tell.
2. Four child pages `a/ b/ c/ d/`, each a STAGE that looks like the real site at real
   proportions: a left rail built with the real `Sidebar` component (a custom `header:` function,
   `root:` a real page so the nav is real — use `/framework/core/` or a page under it, reached
   with the Router the way other demos do) beside a mock page body with a real-sized H1. The
   pretend "current page" is a real sub-page, e.g. `/framework/core/Sidebar/` (title "Sidebar")
   and at least one with a LONG title, so long titles are visible.
   - **A — today:** logo → home, word "Framework" → /framework/, framework nav.
   - **B — one level down:** logo → the parent (/framework/), word = the current page's title,
     nav = that page's own children/sections.
   - **C — like B with a short name:** the word is a short label (e.g. the directory name, or a
     `short:` field if a page has one), truncated with an ellipsis and a full-title tooltip.
   - **D — breadcrumb of two words:** "Framework › Sidebar", each a link, small, under the logo.
   Each page quotes, verbatim in a blockquote, which of the owner's sentences it shows, and has
   one line on the trade-off (long titles, competing with the H1). The rail word must stay
   smaller/lighter than the H1.
3. Check at 1280, 1920 and 3440 headless (Playwright, script in your scratchpad named
   `variants-probe.mjs`): zero console errors, nothing overflows the rail. Screenshots at 1920
   into `C:\Code\lew42\worktrees\section-variants\public\framework\ai\2026-09-28\section-variants\walkthrough\shots\`
   as `variant-a.png` … `variant-d.png`, `variants-index.png`, plus `variant-b-1280.png` and
   `variant-b-3440.png`. Look at every one.

Any process you start: `windowsHide: true`; never a visible window. Don't start or restart any
dev server. Report back in under 10 lines: files, urls, shots, anything left.
