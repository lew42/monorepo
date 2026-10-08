Budget: $2.

# Review: an empty diff is refused, never passed unreviewed

**Why:** tonight's review of all 44 tasks from 2026-10-03 (vscode-mastermind, [card](/framework/ai/2026/10/03/now/review-of-today-s-44-tasks-what-s-really/)) found that the review gate passes work it never saw.
- `Server/review.mjs` `sizeOf()` (line 157) returns `"none"` when no file changed: `if (!files.length) return "none";`.
- The `size === "none"` branch (line 708) then writes "No review needed: only CSS/docs changed (0 line(s))" and passes.
- A task committed straight to the main tree has an empty branch diff, so it always passes. 8 of today's `review.md` files say this, including core JS changes (move-nesting-fix, now-card-blank, prompts-live).

## What to change

1. **An empty diff is a refusal.** In `review.mjs`'s main path, when the diff has no files, print `refused: nothing in range; pass --range <base>...<sha> (the commits this task made)` and exit 1. Don't write a pass.
2. **`sizeOf()` stops calling an empty diff "none".** Return `"empty"` (or make the callers check `files.length` first; pick one and say why). The "none" size stays for what its comment says: only .css/.md, 20 lines or fewer, no new file.
3. **Check `Server/merge.mjs`.** It reuses `sizeOf` in `reviewGate()` (line 155: "none" means no review needed) and `quickEligible()` (line 135). An empty branch diff in `reviewGate` means there's nothing to merge: refuse with the same message, don't wave it through. Confirm `quickEligible` already refuses it (no files means no single module) and add a test that proves it.
4. **Tests:** an empty diff is refused by `review.mjs` and by `merge.mjs`; a 5-line .css change is still "none" and passes; a 1-line .js change is not "none".
5. **Name the 8 tasks.** List today's `review.md` files that contain "No review needed" with 0 lines (a node one-liner, law 7), and post the list on the card as "passed without a review". Don't re-review them in this task.

## Land

`node --check` both files, run the tests, commit by exact path, merge. No Servex restart is needed (these are command-line scripts).

Sonnet, medium effort. Never `stash`, `checkout --` or `reset` in the main tree. Don't wait on the owner.
