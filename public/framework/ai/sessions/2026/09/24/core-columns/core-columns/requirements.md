# core-columns — three core-layout loose ends

**The ask, verbatim (from the master mastermind, 2026-09-24):**

> You own three related core-layout loose ends. They are briefs 1, 2 and 6 in public/framework/ai/2026-09-24/loose-ends/report.md (read the page and its links first). All three are in core Page/columns/Doc CSS, so one worktree:
> 1. Navigation that doesn't jump: apply the 34cqi tuning from public/framework/ai/2026-09-17/nav-stability/proposal.md in core Page.css. The Reader centres at 3440.
> 2. Columns: a fill column gives back the space of columns opened under it, and a column head takes its own --pad. Test in the /imagine/paging/ lab.
> 6. A nested Doc draws as a plain section, with no doubled band (core/new 0, 1, starter; DesignTool/taste).
> These were decided by the loose-ends sweep; the owner said "make your best decision, don't wait on me." Where a viable alternative exists, write it in a decision line.
>
> THIS IS SHARED CSS, AND THE OWNER HAS BEEN BURNED ("an overnight session destroyed a bunch of padding on a bunch of containers"). So: before-and-after screenshots at 1280, 1920 and 3440 of at least SIX pages nobody on this task built: /framework/, /framework/ai/, /framework/ai2/, a module doc page, a /layouts/ page and a /notes/ page. Diff them. Any change you did not intend is a bug to fix before merging.

## Where things stand (read before building)

- The 09-17 proposal's *first* tuning already shipped 2026-09-18: `.page.columns .page-column-body` has `flex: var(--page-column-flex, 0 0 var(--page-column-recommended, clamp(40em, 42cqi, 46em)))`. Brief 1 is the switch to the proposal's third tuning, **freeze at a third of the row**: `clamp(var(--page-column-min, 16em), 34cqi, var(--page-column-max, 46em))`.
- `fill` already has a yield rule (`.page.active-ancestor > .page-column-body.page-column-fill`, 2026-09-05). It was written when the base fallback was `1 1 0`; it still says `1 1 0` + 64em, which now GROWS. Brief 2 is: measure whether a child opened under a fill column gets its own width, and make it so.
- The column head pads on `--page-column-pad-y/-x`. Brief 2 says it takes the column's own `--pad`.
- The Reader (`/layouts/practice/reader/`) already centres at 3440 (practice-critic, 09-17). Keep it.

## Worktree

`C:\Code\lew42\worktrees\core-columns`, branch `worktree/core-columns`. Every minion works there.

## Fences

- **builder** (one Sonnet): `public/framework/core/Page/Page.css`, `public/framework/ext/Doc/Doc.css`, `public/framework/ext/Doc/Doc.js` — in the worktree only.
- **shooters** (Sonnet): write only under this task's `shots/` dir in the worktree, and the session scratchpad.
- Nobody touches `Page.class.js` render()/render_column()/md_folder() — task-mastermind-md-pages is editing those.
