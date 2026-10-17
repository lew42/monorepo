# Owner notes, 2026-10-16 (night): the mobile sheet, the drawer, the AI sidebar (dictated; captured by voice-app)

A big surgery. A mastermind manages it, a worktree tests it, and the owner approves each step before it is built. Slow and methodical; mock variants first.

## Words and shape

- "Rail" is wrong for the thing you pull up: a rail is a track something slides along. The thing you pull up to your chin is a **sheet**. Rename `ext/drawer/rail.js` (lowercase, not object-oriented) to a `Sheet` class.
- A top-down audit is wanted of how a page renders: the app render, the `hides-nav` flag (a weird flag), the hamburger menus on mobile, the mobile sheet, the desktop sidebar, the session page with columns, the site-wide hamburger that opens a global voice session. These systems need simplifying and the owner needs to SEE how they come together: document it first.
- The hamburger is misleading: on mobile it is the navigation menu (top right, hard to reach; top left is the logo); on desktop the same icon opens the dictation sidebar. Going between the two, the same button does two different things. Dislike it as the dictation trigger.

## The AI button, the route, and per-path AI

- Today the ✦ on the mobile sheet starts an auto dictation (the owner had never clicked it until today), and the ⋯ opens the full sidebar with tabs (AI, sessions) that also appears on the mobile session detail cards. Routing is a query string (`?drawer=ai` or similar): strange, works.
- Wanted: a ROUTED thing. Any path can have an `ai/` subdirectory: `<any path>/ai/` loads the assistant mode for that page: sessions, voice sessions, dictations, everything you can do, contextual to that page. The ✦ button navigates there. It could be a widget any website adds.
- **Past-work check first:** per-path AI subdirectories were discussed before; the mastermind finds what exists before proposing.
- Open, the owner goes back and forth: one global AI that remembers across pages (dictation already survives navigation, push-state routing; could survive reload) versus a page-specific AI that knows the page and can file a task about it. Likely both: a global agent with context awareness that can also reach a page-level expert. The chat tab is the default view of the sidebar.

## The sheet as the live space

- On mobile the sheet starts small (about 100 px, an unobtrusive transcription widget), slides up to split screen, and past ~90% snaps to full screen with an X to close; drag down from the title bar to return to split. Both directions.
- The sheet is the real-time space on that page: the AI puts things there as they happen (a task created and filed, a reference, a log line); it is the essence of chat. Page-specific recent things show there automatically, like a log. Space is tight; what goes in and what does not is a design question; it must be responsive.
- Unify mobile and desktop: the same sidebar reached by the ✦ on mobile and by a proper control on desktop; on desktop it may simply be there when there is room. One system, one class, two sizes.

## Dictation

- The dictation sheet is still wonky and needs a redesign, but not now, and not without approval. Mock 5 variants of any control (compact / verbose, more / fewer controls, more / less space) and lay them out to choose from. `ext/Refine`, `ux/Dictate` and the new tasks all touch this; the mastermind documents how they connect before proposing.

## Process

Audit and document → past-work check → proposal with mocked variants as cards on /live → the owner approves one step → that step lands in a worktree with tests → next. The rename to `Sheet` is approved now; everything else waits for a yes.

## The work on this (mastermind-sheet)

- ✅ The rename landed: `rail.js` is [`Sheet.js`](../Sheet.js), `class Sheet extends View` (merge 41c9607e7).
- ✅ The audit: [audit.md](../../../ai/sessions/2026/10/16/voice-20261016/sheet/audit.md).
- ⬜ The proposal and its variants: [proposal.md](../../../ai/sessions/2026/10/16/voice-20261016/sheet/proposal.md), waiting for the owner's yes, one step at a time.
