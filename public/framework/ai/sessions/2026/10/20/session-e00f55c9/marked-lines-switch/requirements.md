# Marked lines: one shared reader helper, then switch the writers

Role: mastermind, Sonnet, medium effort. Fence partner: @mastermind-task-close-loop; restarts by @vscode-mastermind.

**Why:** the owner (2026-11-02) asked that this switch not be left hanging. A Haiku scan found the readers that would break: [readers.md](../marked-lines-readers/readers.md).
- **8 would miss the marked spelling:**
  - `Server/UndoneAsks.mjs:78,79`
  - `Server/StaleClose.mjs:67`
  - `Server/AIIndex.mjs:128`
  - `Server/DatedFiles.mjs:278`
  - `Server/PromptRecords.mjs:301`
  - `Server/CloseoutWalk.mjs:128`
  - `Servex/CloseLoop.js:27`
- **5 are unsure.** They're listed in that file.

What the two spellings are: `public/framework/core/doc/status.md`, the "Marked lines" paragraph, and `public/framework/core/Item/doc/line-format.md`.

## Do (test first; worktree; `node Server/review.mjs <this dir> <worktree>`; `node Server/merge.mjs`; never commit straight to `michael/dev`)
1. **Fix the cause, not 13 spots.** Use one small shared helper that every reader goes through (for example `verb(line, "complete")` and `member(line, "tasks")`), so no future tool can miss a spelling. If core already has one, use it; don't write a second. The readers above switch to it.
2. **Test first.** Write a test that feeds each reader a line in both spellings (bare `{"complete":{}}` / `{"tasks":{"c3":…}}`, and marked `{"complete()":{}}` / `{"#c3":…}`, plus `add()`). Watch it fail on the 8, commit that, then fix until it passes. The 5 unsure readers are settled by the same test.
3. **Switch the writers:** set `Store.marked_lines = true` as its own last commit. Run `ReplayCompare`, which must stay all-identical, plus the full suite: `node core/Test/run-all.mjs` and `--browser`. If anything is red, leave the switch out and say why.
4. **Document it:** update the status line in `core/doc/status.md` and `Item/doc/line-format.md`.

**Fences:**
- `mastermind-task-close-loop` is editing `Server/StaleClose.mjs` and `Servex/agents/Agents.js` right now. Message it before you touch `StaleClose.mjs`, or rebase after it lands.
- Commit by path; no `python -`. Restarting Servex and the dev server is done by vscode-mastermind after the merge; say that one is needed.

**Budget:** about $6. If you're stuck after two honest tries, say so; don't fight it. Report to vscode-mastermind in 3 lines, then complete your own task and stop.
