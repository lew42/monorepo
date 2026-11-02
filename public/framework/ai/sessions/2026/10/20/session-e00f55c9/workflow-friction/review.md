verdict: pass
1. [note] Snag 1 still needs a Servex restart to take effect (`Servex/agents/readme.md` "Sending to a VS Code tab" says so). `session.jsonl` answer 8 only promises that the 3-line report to vscode-mastermind will say it. Make sure that report goes out.
2. [note] `review.mjs --shots-only` takes the shots from the worktree's own server only when the worktree has a `.worktrees.json` entry. Without one it shoots the MAIN site, and only a log line says so (`Server/review.mjs:785-792`). The doc paragraph in `Server/doc/review.md` (the one route for the gate's shots) should say that the worktree must be registered.
3. [note] `--shots-only` also skips shooting when every `<width>.png` already exists (`Server/review.mjs:787`), so a hand-drawn PNG left in `shots/` is still accepted as real. The rule against hand-made shots is only in the docs.
4. [note] The snag 4 proof (run-all `--browser` beside another headless job) is linked from the `proof` line in `session.jsonl` as whole files (`core/Test/results.jsonl`, `run-all.jsonl`), not as the specific run lines. Naming the run's `at` stamps would let a reader find them.
5. [note] Commits 40d37e7d0 and 215896213 both say "Server readme lists OutPath and IgnoredImageLinks". The second one looks like a follow-up to the same edit. This is harmless.

## Requirements
- 1 "a send to a tab answers 'delivered to the tab's inbox'": yes. `Servex/agents/External.js:110` returns `ok: true`, `delivered_to` and a "Delivered." note. `Agents.successor()` (`Agents.js:713`) no longer follows a tab to an agent that shares its session. Two new cases in `External.test.mjs`.
- 2 "find the review by the branch's own task dir, not by age": yes. `branchTaskDirs` and `TaskDirs.find(slug, 3650)` in `Server/merge.mjs`. The first review's bug with porcelain lines is fixed (no trim, CR stripped), and `merge.test.mjs` covers an old session plus a tracked log that was edited afterwards.
- 3 "one route that works; review.mjs takes the gate's shots from the worktree's server into the task dir": yes. `OutPath` allows the repo's own git worktrees, `review.mjs --shots-only` was added, and the gate and review.mjs both pick widths with `widthsFor`, so they agree. The merge refusal names the command. Notes 2 and 3 above.
- 4 "find what is slow under load, fix the wait, prove it beside another job": yes, and the cause turned out to be different. `jfk.wav` is git-ignored, so worktrees had no copy; `TestRunner.wav_path()` now uses the main checkout's copy. `refresh` gets 300 s. The fallback is tested against a real git worktree, and the proof is in `core/Test/doc/health.md` and the `proof` line.
- Each snag is its own commit: yes. c8064ed23, 56ea0eab8, 33a1eb62e and 917f98119; the review fixes are in 7ff85ce46.
- Document each fix in `Server/doc/review.md` and `Servex/agents/readme.md`: yes. `Server/README.md` now also indexes `OutPath.mjs` and `IgnoredImageLinks.mjs`.
- Don't restart Servex; say a restart is needed: yes in the readme. The report itself is still pending (note 1).
- The extra work (snags 5 and 6, IgnoredImageLinks) is recorded: yes. The `scope` line in `session.jsonl` says vscode-mastermind asked for it. `Servex/doc/item-tool.md` documents both changes.
- Coordination on `Agents.js`: yes. The `coordination` line in `session.jsonl` records it.
- Could a fresh agent continue from this folder? Yes. The brief, the first review, the answers to each finding, and the scope, proof and coordination lines are all there.
- A page that shows a new class's live instances: n/a. `IgnoredImageLinks` is a stateless helper.

## Words
- content 1 (says what it is first): yes. Each new paragraph in `Server/doc/review.md` and `Servex/agents/readme.md` opens with what it is.
- content 3 (short, plain): mostly. The `Server/doc/review.md` shots-route paragraph and the health.md "Load and the fake mic" entry run long and keep history inline. This is a small thing.
- Owner's names ("VS Code tab", "inbox", "gate"): yes.
