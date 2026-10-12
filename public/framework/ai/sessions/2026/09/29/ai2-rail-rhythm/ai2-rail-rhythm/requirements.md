# AI 2: the rail's rhythm (padding at the source)

Load the `minion` skill first, then `css` and `layout`.

## The owner's words, verbatim (10:50 PM)

Full: `public/framework/ai/2026/09/28/ai-2-rhythm-tabs-sections-and-sidebar-va/owner-words.md`.

"the visual hierarchy is so bad. Like, there's not enough padding on the preview cards. And so they
all just run together as this big sloppy mess. We need like a cadence or a rhythm or a consistency
to each card. I mean, I like the flush cards. I like that there's no padding or gap on the container
because it saves space and it gives more space to the cards themselves. However, then the cards
themselves need, if our default padding, if that's our default padding, which it should be, then
the default padding system is broken."

## Deliverables

1. **Before shots first:** /framework/ai2/ at 1920x1080 and 3440x1440, headless, saved in this task dir.
2. **Find why.** Keep the rail container flush (no outer padding, no gap between rows). Each row
   (card rows in `ai2/faces.js`, group rows in `ai2/page.js` `group_face`, the Live row, real-page
   rows in `ai2/real.js`) must get the site's DEFAULT padding and one consistent cadence: the same
   inset on every row, the same space between title, sub-line and the "what happened" bar, a clear
   separator between rows. Measure what each row gets today (computed padding, which rule sets it,
   which layer wins) and write it in `why.md`, a short table plus one sentence of cause. The
   owner's own diagnosis to test: "if that's our default padding … then the default padding system
   is broken". Known traps: `@layer util` beats `@layer theme` at any specificity; spacing utilities
   are `cqi` clamps, so a size container re-bases them; framework.css's util-layer rules
   (`:first-child`, `max-width:100%`) beat component CSS.
3. **Fix it at the source,** not with AI 2-only CSS, if the default padding system is the cause
   (framework.css / styles/ / the padding tokens). If the cause really is local to AI 2 (it never
   used the default), fix it by making AI 2 USE the default, not by inventing values.
   **A change to shared CSS needs before/after shots at 1920 of three pages that use it and that AI 2
   is not** (e.g. /framework/core/Page/, /framework/ux/, /framework/servex/), judged unchanged or
   better, and `node Server/layout-check.mjs <urls>` on them.
4. **After shots** of /framework/ai2/ at 1920 and 3440, same framing as before. Zero console errors
   and zero failed requests on /framework/ai2/, a card, and the three shared pages.

## Fence and where

Worktree `C:\Code\lew42\worktrees\ai2-rhythm` (branch `worktree/ai2-rhythm`, from michael/dev),
server http://localhost:53613/ . Write: `public/framework/ai2/**`, `public/framework/framework.css`
and `public/framework/styles/**` only if the cause is there, and this task dir. Nothing else. Scripts in
`C:\Users\mike\AppData\Local\Temp\claude\C--Code-lew42-monorepo\546c308f-a944-4905-95a1-68d84991524f\scratchpad`
as `ai2r2-*.mjs`. Any process: `windowsHide: true`. Commit in the worktree
(`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`). Never edit C:\Code\lew42\monorepo.
Report: the cause in one sentence, the files changed, the shot paths, anything left.
