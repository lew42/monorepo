verdict: fix
1. [fix] The task folder doesn't mention this follow-up. The change is commit 3f5d9f788 on `worktree/qf-8` and is not merged into compliance/dev, yet `requirements.md` still says "Status: built, reviewed and merged (c3a59f3ba)" and has no line for this work. A fresh agent can't tell from the folder that the change exists or that it is waiting to merge. Add a deliverable line that names the branch and its state.
2. [fix] Two docs now describe the old behaviour. `requirements.md:9` says the list "is retried once", and `requirements.md:21` says the test has "11 checks" (it now has 12). `Servex/doc/processes.md:43` says "it is now retried once", which contradicts line 31 of the same file, now "retries twice".
3. [note] A closeout that can't read the process list still goes on to remove worktrees (`Servex/Lifecycle.js` closeout loop → `Worktrees.close_now`). With an empty list, `close_under` and `held_by` see no processes inside the folder, so a dev server running in a merged worktree goes unseen and the removal can be only partly done. The final report still says `ok: false` with the cause, so nothing is hidden. Skipping the worktree step when `!this.procs?.size` would be the safer choice.
4. [note] When PowerShell answers but `netstat` fails, the error is dropped (`process_error` is set only when the map is empty, `Lifecycle.js` `processes_async`). The listing then has no ports, and nothing says why.
5. [note] The commit message says "retried three times", but the code makes three attempts, which is two retries. `processes.md:31` gets this right ("retries twice, after 1.5 s, then 3 s").
6. [note] It works: I ran `node Servex/closeout.test.mjs` on `worktree/qf-8` and got "ALL 12 CHECKS PASSED", with 0 test processes and 0 test worktrees left at cleanup. The new check fakes `processes_async`, which is the simplest honest way to test this. Guarding `sweep`'s "found gone" lines with `this.procs?.size` is the right minimal fix: an unreadable list used to mark every live process dead.

## Requirements
- 1 "an empty process list is retried once and reported as `left` (the cause of 'it closed nothing')" — yes, and more: now three tries with a backoff (1.5 s, then 3 s), the `left` line names the cause, and the sweep no longer writes "found gone" lines from a blind list. Proof: closeout.test.mjs check 12 passes.
- "every mastermind who spawns anything leaves zero footprint" — yes for this change: the test run left 0 processes and 0 worktrees.
- "with the cause fixed so nobody has to ask again" — yes: a failed listing now says which command failed and why (ENOENT, a timeout, or zero processes parsed).
- New class or changed class shown live — n/a (no new class; `Lifecycle` changed only internally).
- A fresh agent can continue from the folder alone — no: see finding 1.

## Words
- The `left` message, "the process list could not be read (<cause>), so nothing was verified; run the close again", is plain and says what to do next — yes.
- The new comments in `Lifecycle.js` and `closeout.test.mjs` are short and say why — yes.
- `processes.md:31` is clear, but line 43 of the same file contradicts it — no (finding 2).
