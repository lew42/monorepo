# Minion brief: the walkthrough

Load the `minion` skill first, then `new-page` and `content`.

The owner's words: `C:\Code\lew42\monorepo\public\framework\ai\2026\09\28\ai-2-rhythm-tabs-sections-and-sidebar-va\owner-words.md`
(the section part and the sidebar part). Task: `C:\Code\lew42\monorepo\public\framework\ai\2026-09-28\section-variants\requirements.md`.

## Where you work

Worktree `C:\Code\lew42\worktrees\section-variants` ONLY (server `http://localhost:58245/`).
**Fence:** `public/framework/core/Sidebar/variants/walkthrough/page.js` (new), the one word
`walkthrough` added to `children:` in `public/framework/core/Sidebar/variants/page.js` (plus a
link to it at the top of that page's content), and new shots in
`public/framework/ai/2026-09-28/section-variants/walkthrough/shots/`. Never commit `task.jsonl`.
The pictures stay where they are; load them by absolute url
(`/framework/ai/2026-09-28/section-variants/walkthrough/shots/<name>`).
Why not in the task dir: a declared task dir replaces its live log on the day page.

## Deliverable

`core/Sidebar/variants/walkthrough/page.js`: a Next/Next walkthrough, a copy of the shape of
`public/framework/ai/2026-09-25/ai2-lead/page.js` (ux/Wizard, the step in `#N`, one picture and
one plain sentence per step, "Open it live →"). The shots already exist in `walkthrough/shots/`
(list them). Steps, in this order:

1. The section element: section-1920.png, then the hover shot. Say: a thin border; hover shows the section's class names, so browsing teaches them.
2. Variants index (variants-index.png): four ways to take over the left sidebar.
3–6. Variant A, B, C, D, one each: say what the logo does, what the word is, what the nav shows.
7. B at 1280 and 3440 (two pictures, like ai2-lead's before/after).
8. Who owns the rail (variant-rail.png, open `/framework/core/Sidebar/variants/rail/`): the app swaps one rail (E), or each page owns its own and the `active` class hides the rest (F).
9. "Which one?": one sentence saying the choice is on the card as a Decision.

Each sentence in plain words for a newcomer, under 30 words. Read the variant pages themselves
(`public/framework/core/Sidebar/variants/`) so what you say matches what they do.

Verify headless (Playwright, `walkthrough-probe.mjs` in your scratchpad): load
`http://localhost:58245/framework/core/Sidebar/variants/walkthrough/#1` (and reach it once by clicking from `/framework/core/Sidebar/variants/`), zero console
errors, press Next through every step, every image loads (naturalWidth > 0). Screenshot step 1
and step 4 at 1920 to `walkthrough/shots/wt-1.png`, `wt-4.png`, and look at them. Commit your files by exact path, plus every png in `walkthrough/shots/` (the other minions left theirs uncommitted). `windowsHide: true` on any process. Reply in under 8 lines.
