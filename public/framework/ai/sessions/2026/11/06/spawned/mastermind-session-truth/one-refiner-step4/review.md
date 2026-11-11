verdict: fix
1. [fix] Web dictation was not wired, and that is step 4 itself. The plan card (/live/plan/one-refiner/, steps 4 and 6) says web dictation calls `Ask.write` "then the refiner" (the parts brief), and Echo's clean/structure is the duplicate that gets moved aside. The work calls `Sessions.refine` (`Servex/agents/Sessions.js:947`, Echo clean + structure) good enough, so there are now two refiners after `Ask.write`: parts for voice and VS Code, and Echo structure for dictation and VS Code. The brief says "never a second refiner". `TurnRefiner.refine` should run after `Sessions.js:1304` too, or the log should say why not.
2. [fix] Nobody proved web dictation gets cited. Deliverable 2 asks for a real turn with `coverage().cited > 0` on any channel, but the only proof is the cloud-voice scratch turn (0 to 4 of 4, logged in session.jsonl). It was a temporary proof.mjs that the task folder does not keep.
3. [fix] Deliverable 3 (the view) is not done. There is no 1200 shot; the one shot, `shots/session-a943a876-400.png` (it sits only in the worktree), shows no Coverage line; and nothing says whether the "Reading the session…" stall is slow loading or a bug. The log names a suspect (`AISessionDetail.js:365`, the stats bar waits for `work_ready`) but has no timing measurement. The brief asked for that answer first.
4. [fix] The task was never landed. session.jsonl ends with "session ended (other) without landing", so it has no closing outcome. The report the brief asked for (three lines: what was missing, what was wired at file:line, coverage before and after) is only inside one long log line, and a fresh agent can't continue deliverable 3 from this folder.
5. [fix] Stale and unindexed docs. `Servex/ext/remote/doc/voice-logging.md` still describes the voice record as words plus sentences, with no refiner. `Servex/agents/readme.md` does not list `TurnRefiner.js` or its test. Law 9 asks for the structure in the readme, and law 10 for an index entry for each new file.
6. [note] `TurnRefiner` runs one Sonnet call (claude.exe) per voice turn with no switch. Unlike `PromptTasks` (`prompt-tasks.off`) and `Echo.call` (the free-memory floor, `Echo.js:124`), it can't be turned off and skips the memory check. Worth a one-line gate that reuses `PromptTasks.off()`.
7. [note] `TurnRefiner` is the generic "refine after `Ask.write`" step, not a Servex agent. It could sit beside `Server/Ask.mjs` (for example as `Server/TurnRefiner.mjs`), where every channel, including the hook, could import it. The `parts_of` split in `Server/PromptRecords.mjs:148` is clean and reuses the one brief.
8. [note] The code itself is sound. `TurnRefiner.test.mjs` passes in under 1 s. The second `refined` line (v 2, same `re`) fills the existing turn (`Session.js:181`), and its 1-based cites line up with `a<n>`. A Servex restart is needed before the cloud-voice change goes live.

## Requirements
- 1 "Find out whether PromptRecords.live runs on web dictation and cloud voice" — yes — session.jsonl log: PromptTasks.js:50,89 covers vscode-tab only; voice had none
- 2 "Wire what is missing… one path, after Ask.write, never a second refiner… cited > 0" — no — voice is wired (RemoteMCP.js:288); dictation stays on Echo structure; no dictation proof
- 3 "Coverage line shows and updates live… shots at 400 and 1200… stall: bug or slow" — no — one 400 shot with no stats bar, no 1200, cause unconfirmed
- 4 "Lean test for whatever class you change" — yes — TurnRefiner.test.mjs passes; PromptRecords.parts_of has no test of its own (it is a model call)
- 5 "Docs in the same commit: prompt-records.md and the step 4/5 paragraph" — yes — both in adde899b5; voice-logging.md not updated (finding 5)
- Class page with live instances — n/a (static helper class, no state)

## Words
- content 1 (plain, full sentences) — yes — prompt-records.md "Channels and the turn refiner" reads clearly, with a table
- content 2 (one takeaway) — no — prompt-refinement-map.md step 4/5 paragraph packs four channels and a proof into one 110-word paragraph; a short list would scan better
- content 3 (links for every named thing) — yes — TurnRefiner.js and prompt-records.md linked
