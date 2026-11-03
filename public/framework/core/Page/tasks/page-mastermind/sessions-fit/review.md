verdict: fix
1. [fix] Cause D is not shown fixed at 1920. In `shots/before/root-1920.png` and `shots/after/root-1920.png` the page looks the same: with the chat panel open, the grid draws cards, not the table. So the owner's ask, "names show whole at 1920", is never seen working, and report.md marks root-1920 "before fail D → after pass" without a shot of it. Either take a 1920 shot that shows the table (chat panel closed, the way the original `sessions-shots/shots/root-1920.png` was taken), or lower the switch point from cards to the table so a 1920 screen gets the table. The report says that switch happens at 88em.
2. [fix] The narrower Role column (9rem, `AISessionsPage.js:162`) breaks the table where it does show. In `shots/after/root-3440.png`, "SDK jobs" wraps to two lines on every row, "task-mastermind" is cut to "task-", and on the "Feedback council" row the FRESH, VS CODE and MASTERMIND chips run into each other. Role needs about 11rem, or Source needs room for three chips. Cost (8rem) still has spare room, so take the width from there.
3. [note] The 400 tab bar is fixed. In `shots/after/root-400.png` all seven tabs show on two rows (`rail.css:167-169`), and the routine and role chip rows scroll inside their own box instead of pushing the page wider. That meets ask 2. Wrapping is one of the two fixes the brief allowed.
4. [note] The table's footer ("317 sessions listed … show 30 more days") sits on top of a row, and rows keep drawing below the panel's edge ("Refine v3" and "ext/Refine …" in `after/root-1920.png` and `after/root-3440.png`). The before shots show the same thing, so this change didn't cause it, but it is the same table, and nobody has been given it to fix.
5. [note] The report's count, "15 before", includes that unshown D row (finding 1). The honest count is 14 C rows fixed, and D unverified.

## Requirements
- 1 "Shoot before" — yes — shoot.mjs is in the task folder; shots/before holds 14 pages × 4 widths
- 2 "C: every tab reachable at 400; chips and tables wrap or scroll in their own box" — yes — after/root-400.png: tabs on two rows, chip rows scroll in their own box
- 3 "D: names show whole at 1920, numbers stay narrow" — no — after/root-1920.png shows cards, not the table; at 3440 the Role and Source columns now break (findings 1, 2)
- 4 "Shoot after + report.md with matching counts" — yes, but the count claims a D fix with no shot behind it (finding 5)
- Live class instances — n/a (no class added)

## Words
- The rail.css comment and report.md are plain and say why the change was made — yes
