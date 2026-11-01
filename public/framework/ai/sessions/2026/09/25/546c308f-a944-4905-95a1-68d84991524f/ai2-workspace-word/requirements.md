# AI 2: the "workspace" word looks dead

Load the `minion` skill first, then `code`.

The owner, verbatim: "what is this workspace link?? it doesn't do anything".

servex-mastermind checked headless: the `workspace` word in the rail header adds ?view=workspace and
reloads, but it only changes top-level tabbed cards (`in_workspace()` needs `tabbed()`). On the inbox
root, on plain cards and on the real-page rows (`real.js`) nothing changes, so it reads as dead.

## Deliverables

1. Show the word ONLY where it has an effect: when the open detail is a card that `in_workspace()`
   would change. Hide it everywhere else (inbox root, plain cards, real-page rows). It must update
   as you click from row to row without a reload (the rail header stays mounted).
2. A self-evident label and a tooltip: label "Floating page view (try it)" when off and
   "Back to the normal view" when on; the `title` says in one sentence what it does (the card
   becomes a centred page with its own left nav).
3. Proof: headless at 1920, from the rail by clicking: System design (word visible, click → floating
   view), the inbox root and a plain card (word absent), the Page real row (absent). Zero console
   errors, zero failed requests. Shots in this task dir.

## Fence

Worktree `C:\Code\lew42\worktrees\qf-4` (branch `worktree/qf-4`), server http://127.0.0.1:60064/ .
Write only `public/framework/ai2/page.js`, `workspace.js`, `ai2.css`, `card.js` (only if needed) and
this task dir. Its first commit is a snapshot of the main tree's AI 2 files; if a page breaks
because another uncommitted main-tree file is missing, say so rather than copying it in. Scripts in
the scratchpad `C:\Users\mike\AppData\Local\Temp\claude\C--Code-lew42-monorepo\546c308f-a944-4905-95a1-68d84991524f\scratchpad`
as `ai2t-*.mjs`. Any process: `windowsHide: true`. Commit (`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).
Never edit C:\Code\lew42\monorepo. Report: commit hash, shot paths, anything left.
