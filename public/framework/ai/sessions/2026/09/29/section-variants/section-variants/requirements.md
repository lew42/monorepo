# Section element + sidebar variants

The owner's words, verbatim and in full: [`../../2026/09/28/ai-2-rhythm-tabs-sections-and-sidebar-va/owner-words.md`](../../2026/09/28/ai-2-rhythm-tabs-sections-and-sidebar-va/owner-words.md)
(card `2026/09/28/ai-2-rhythm-tabs-sections-and-sidebar-va`). This task owns the parts below —
two at first, two more added as the owner kept talking; the AI 2 rhythm and tabs parts belong to other tasks.

Worktree: `C:\Code\lew42\worktrees\section-variants` (branch `worktree/section-variants`,
server `http://localhost:58245/`). Every minion works there, never in the main tree.

## Deliverables

1. **`ui/section`** — a new UI element, minimal markup plus CSS. Subtle border; its NAME shows
   subtly on hover (try both top-left and bottom-right). The name is the section's own class
   names (".bleed .flex"), so browsing teaches the class names. Opt-in, not every element.
   A demo page with 3–4 real sections (bleed, flex wrap, a catalog grid).
   Brief: [`minion-section.md`](./minion-section.md).
2. **Sidebar variants** — to look at, not a decision. Today the logo goes home and "Framework"
   goes to /framework/. The idea: one level down, the logo goes up to the parent, the word
   becomes the current page, the sidebar shows that page's own nav. 3–4 variants, each quoting
   the owner's sentence it shows; long titles; don't compete with the H1; 1280 and 3440.
   Brief: [`minion-variants.md`](./minion-variants.md).
3. **Who owns the rail** (added 2026-09-28 ~11:00 PM, owner-words "Continued"): the app swaps one
   rail vs each page owns its own (`active` class); tree resizable; selection-in-localStorage trade-off.
   Brief: [`minion-architecture.md`](./minion-architecture.md).
4. **The floating page as a core/Page layout** (added 2026-09-29 ~12:05 AM, relayed by
   servex-mastermind): gray well, white page, padding-top, sticky inner nav; AI 2 uses it; System
   design shown in it. Brief: [`minion-floating.md`](./minion-floating.md).
5. **Walkthrough** (Next/Next) of all four, with screenshots, on the card; a Decision on the card.

## Where things are

- The framework sidebar: `public/framework/page.js` `render()` builds `new Sidebar({ header: () => this.app.brand(this.title, this.url), root: this })`.
- `brand()` is in `public/app.js`: logo → `/`, text → the page's url.
- The component: `public/framework/core/Sidebar/Sidebar.js` (`header`, `root`, `pages`).
