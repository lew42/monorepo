verdict: fix
1. [fix] The task folder does not record this change: `requirements.md` ends at deliverable 8 (still "merge recorded below once landed", with no merge line) and says nothing about the Crumbs cause, branch `worktree/qf-2` or commit 0a403a6b0. A fresh agent reading this folder would not know the real cause of the empty process list was found, or that it still has to be merged. Add a deliverable 9 with the branch, the test and the merge once it lands.
2. [fix] The Crumbs module's own doc is now stale. `Servex/doc/restart.md:34` and `:52` describe `Crumbs.js`, but neither says it must keep `util.promisify.custom`. The new test `Servex/Crumbs.test.mjs` is not indexed in `Servex/readme.md` either; only `processes.md:31` mentions it. Add one line to `restart.md` saying that a wrapper must copy the promisify hook, and name the test there.
3. [note] With the hook copied as-is (`Servex/Crumbs.js:51`), a promisified call goes through Node's original `execFile`/`exec` and drops no breadcrumb. So `processes_async`'s PowerShell and netstat calls leave no crumb, though those slow calls are exactly what the crumb log is meant to name. A small wrapper keeps both: `cp[name][promisify.custom] = function(...a){ Crumbs.drop(...); return real[promisify.custom].apply(this, a); }`.
4. [note] `Servex/Lifecycle.js:160` `typeof r === "string" ? r : r.stdout` is a second guard against a bug the Crumbs fix already removes. It is harmless, but it would hide a future regression that the test is meant to catch. Either drop it, or add a comment saying why it stays.
5. [note] The change is right and small: `cp.exec` and `cp.execFile` both carry `promisify.custom` in Node 24 (checked), and only those two of the seven wrapped names have one, so the `if (real[promisify.custom])` guard is exact. `node Servex/Crumbs.test.mjs` on `worktree/qf-2` prints PASS. I did not re-run `closeout.test.mjs`. This is a Servex-only diff with no page, so it has no shots.

## Requirements
- 1 "an empty process list … reported as `left` with its cause" — yes. The real cause (the Crumbs wrapper) is now fixed, and `Crumbs.test.mjs` passes.
- 8 "a failure names its cause" — yes. Inside Servex the list is no longer empty, so the sweep's `found gone` lines are true again (`processes.md:31`).
- "zero footprint, with the cause fixed so nobody has to ask again" — partly. The cause is fixed in code, but not yet merged or recorded in the task folder (finding 1).
- Show the class and its live instances — n/a (no class added or changed in shape).

## Words
- content: plain sentences, one takeaway — yes. `processes.md:31` explains the cause, the effect and the proof in three sentences.
- content: no undefined jargon — yes. "promisify hook" is defined by what it does ("resolved a bare string").
- content: no restated caveats — yes.
