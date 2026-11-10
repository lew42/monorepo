# One refiner, steps 4 + 5: the refiner runs after every channel's Ask.write, and you can watch it

Budget: $4. Sonnet. Load the `minion` skill first, then `code`. Card / owner's words: [/live/plan/one-refiner/](/live/plan/one-refiner/) (card `steps`, items 4 and 5); the decision: voice-app under the owner's rule, 2026-11-09 (t21 on `../session.jsonl`).

## Where things stand (checked 2026-11-09 by mastermind-session-truth)

- Every channel already stores the owner's words as sentences through the one writer `Ask.write` (`Server/Ask.mjs:69`):
  - web dictation: `Servex/agents/Sessions.js:1304`
  - cloud voice: `Servex/ext/remote/RemoteMCP.js:287`
  - VS Code: `Servex/agents/Echo.js:357`
- Step 2 (merged 9783830fc): the parts brief lives in `public/framework/ext/Refine/PartsBrief.js`, and `PromptRecords.live` (`Server/PromptRecords.mjs`) runs parts on Sonnet. PromptTasks is on (`node Servex/agents/PromptTasks.js status`).
- Step 3 (merged babe50908): `Session.coverage()` (`public/framework/core/Session/Session.js`) and the session page line in `public/framework/ai/AISession/SessionStats.js` (`SessionStats.coverage`). The item tool serves it now: `item({path: "/framework/ai/sessions/2026/11/09/cloud-voice-session-recall/", read: "coverage"})` answers 14 sentences, 0 cited.
- ⚠ The line was NOT visible on that session page in a 6 s headless shot at 1200: the page still said "Reading the session…" and drew no stats bar. Find out why first (slow load or a bug), and say which.

## Deliverables

1. **Find out** whether `PromptRecords.live` (through PromptTasks) already runs on a web-dictation turn and on a cloud-voice turn, or only on VS Code turns. Answer with the code path (file:line) as a `log` line in this task's `session.jsonl`.
2. **Wire what is missing**, so a turn on any channel is refined: one path, after `Ask.write`, never a second refiner. Prove it with one real test turn on a scratch session: its sentences end up cited (`coverage().cited > 0`).
3. **The view:** the session page's Coverage line shows and updates live as the parts land (stream, never poll). Shots at 400 and 1200 of a session whose coverage is above 0, into `shots/`. If the "Reading the session…" stall is a bug, fix it if it is small. Otherwise log it with the measurement, and take the shots on a page that does load.
4. **Lean test** for whatever class you change (`X.test.mjs`, under 1 s).
5. **Docs** in the same commit: `ext/Refine/doc/prompt-records.md` and the step 4/5 paragraph in `public/framework/ai/doc/prompt-refinement-map.md`. Say which channels refine and where.

**Cut first if short of budget:** the live update in 3 (a reload showing the new count is enough), then the scratch-session proof for cloud voice (a unit test of the call is enough there).

## How

- Make your own worktree: `node Server/worktree-up.mjs refiner-step4`. Commit by exact path after each working step. Do not merge: report back and the parent merges.
- Spawn nobody. Never kill or restart the dev server or Servex. Never drive the owner's tabs. Never `git stash`. A change to `Servex/` goes live only after a Servex restart, so say in your report that one is needed. The parent does the restart.
- Report in three lines: what was missing, what you wired (file:line), and the proof (the coverage number before and after).
