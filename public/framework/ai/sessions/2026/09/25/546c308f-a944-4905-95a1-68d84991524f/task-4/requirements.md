# AI 2: a group row drops out of the rail for a few seconds

Load the `minion` skill first, then the `code` skill.

## The owner's words, verbatim

"the uh, system, design card, just dropped off my inbox. I was actually looking for it and I
couldn't see it in the inbox. I was scrolling up and down and it, it was there and then it wasn't
there. And then a few seconds later, it just popped back onto my screen. That shouldn't happen.
Like, you know, if I haven't deleted something, you know, I'm not sure if there was a change being
patched to it. So it's kind of removed and then re-added, but generally the logs should be append
only, right? And so I don't know why that disappeared, if it was See if you can figure it out."

Card: `public/framework/ai/2026/09/24/system-design/` (a GROUP card). Around 10:59-11:00 on
2026-09-28 three `message` lines were appended to its page.jsonl; every line parses, no commits
or merges then. So the file was appended to, not rewritten: the gap is in the rail.

Suspects from servex-mastermind (check each, name the real one):
(a) a keyed row removed and re-added when a group's summary changes (card.js ~686-708, "a card
    whose summary changed is replaced");
(b) a refetch or reindex where a 09/24 group is briefly missing from the list (groups.js,
    inbox.js, page.js's group rows / flush() / count());
(c) the resurfacing sort (the "what happened" bar, activity.js, page.js) moving it while it redraws.

## Deliverables

1. **Reproduce it headless** before fixing: load /framework/ai2/ at 1920, attach a
   MutationObserver to the rail, make a line arrive on a group card, and record whether that
   group's row element ever leaves the DOM (or is hidden / zero height) and for how long.
   ⚠ Never append test lines to a real card: Servex (8090) writes into the MAIN tree, which the
   owner is reading. Inject the new line instead (Playwright `page.route()` on the fetch/stream the
   rail reads, or a throwaway card in the worktree's own files that only your server sees).
2. **Fix it** so a row NEVER leaves the DOM when its card or group gets a new line: it updates
   in place and moves (or waits behind the "new" pill, per the readme's no-jump rules).
3. **Prove it**: the same probe after the fix shows the row stays in the DOM the whole time
   (log the observer's counts), and zero console errors on /framework/ai2/, a card, a group
   (System design), and the Now card. A before/after line of numbers is the proof; one 1920 shot
   of the rail after the injected line.
4. One line in `public/framework/ai2/readme.md` "Watch out" naming the trap, if it is a new one.

## Fence and where

Worktree only: `C:\Code\lew42\worktrees\ai2-row-vanish` (branch `worktree/ai2-row-vanish`), its
server http://localhost:61012/ . Write only under `public/framework/ai2/` and this task's dir in
the worktree; probe scripts in the scratchpad
`C:\Users\mike\AppData\Local\Temp\claude\C--Code-lew42-monorepo\546c308f-a944-4905-95a1-68d84991524f\scratchpad`
named `ai2v-*.mjs`. Never edit C:\Code\lew42\monorepo. Keep the diff small; don't reformat.
Any process you start: `windowsHide: true`. Commit in the worktree when done
(`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).

Report: the cause in one line, the before/after numbers, the commit hash, the shot path.
