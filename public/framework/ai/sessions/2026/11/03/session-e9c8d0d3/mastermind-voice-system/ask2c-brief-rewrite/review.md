verdict: fix
1. [fix] The replay test never puts the brief in front of anything: Part 2 of `Servex/agents/single-brief.test.mjs:65-95` has the stub call `s.heard({type:"result",text:""})` and `s.queue_say()` directly, so it proves ask 2a's gate (already covered by `say-tools.test.mjs`), not the brief. The brief asked for the session to be replayed "through the real assembled brief". At minimum, build the seat's real opening prompt (the brief plus its "where" part) and drive the scripted seat through the real `nothing`/`say` tool handlers in `tools.js`, one call per replayed sentence. The test should also add a narration attempt that is caught.
2. [fix] `risk.md` skips several lines the rewrite deleted or reworded, and the brief asks for a risk line on each. The missing ones: "Never interrupt while the owner talks unless they asked you something"; "A harness reminder to say something is not the owner; stay empty" (gone from the brief, and it guarded against a known failure); "one or two short sentences, the most useful first … Do not repeat the question"; and "one message per burst, never per sentence" (`Servex/agents/single-voice-assistant.md:49`, now just "say nothing about having filed it").
3. [fix] `risk.md` item 4 says the brief-level test "checks the words 'retract' and 'newest' appear", but `single-brief.test.mjs:46` checks only `say`, `nothing` and `retract_say`. Nothing checks for "newest". Either add the check or correct the note.
4. [fix] There is no `task.jsonl` in `ask2c-brief-rewrite/`, in the worktree (`worktrees/qf-2`) or in the main tree, so the required one-screen report is missing. That means no word counts before and after, no test command or output, and no word on whether the optional live run happened. A fresh agent can't tell from this folder whether the task landed or what is left.
5. [fix] The new test isn't indexed anywhere. The tests line in `Servex/agents/doc/say-tools.md:40` lists only `say-tools.test.mjs`, and `Servex/agents/readme.md` doesn't mention `single-brief.test.mjs` either. Add it beside `say-tools.test.mjs`.
6. [note] The brief got shorter, as asked: 866 words before, 805 after (`wc -w` on 8e144eb06 and on 9b7c0f4b8). Asks 1–4 are met in the wording: the tags are bare, the brief says to call `say`, "plain text is never a reply", `retract_say` with "newest thing first", the no-narration examples are there, and the raw-words task lines are untouched. `node Servex/agents/single-brief.test.mjs` passes 4/4.
7. [note] The brief leaves open whether a turn that did silent work should still end with `nothing`. `single-voice-assistant.md:35` says to call `nothing()` only "where none of this applied", while requirements ask 1 says to end the turn with `nothing` whenever there is nothing to say. Plain text is muted now, so the cost is small, but one clear rule would be easier for the seat to follow.
8. [note] `public/framework/ux/Dictate/doc/single-voice-assistant.md` step 2 has a garbled sentence: "A turn with none of that applies ends with the `nothing` tool: no call, no text". That is ungrammatical, and `nothing` is itself a call. Step 4 is one ~120-word paragraph that crams in four facts; split it, or link to `doc/say-tools.md` instead of restating it.
9. [note] The review diff is mostly noise. It carries ask 2a's commits and about 150 regenerated `files.jsonl` files from the worktree's earlier "wip: local generated index appends" commit and a merge. Ask 2c's own commit (9b7c0f4b8) is correctly four files, committed by exact path, but whoever merges `worktree/qf-2` should check the `files.jsonl` churn first.

## Requirements
- 1 "(sentence)/(pause) bare; silent work per sentence; end with `nothing`" — yes — single-voice-assistant.md:3,7,35
- 2 "only `say({text, re?})`; plain text never a reply; queued, released at pause; `retract_say`; newest first" — yes — single-voice-assistant.md:37-39
- 3 "No narration; results go on their question card" — yes — single-voice-assistant.md:41
- 4 "raw-words rule untouched" — yes — the task `add` example and the "`text` is the owner's words exactly as heard" line are unchanged
- "cut, do not grow; shorter than today" — yes — 866 → 805 words
- Risk note written first, one line each for adding, leaving out and the test, for every change — no — lines deleted or reworded are missing (finding 2); one test claim is false (finding 3)
- Test: replay a real `v-*` session through the real assembled brief — no — the session replays, but the brief is not in the loop (finding 1); sample `v-z0jonhy`
- Test check: brief contains `say`, `nothing`, `retract_say` — yes — test:46
- Test check: no "reply on a pause" wording, no instruction to acknowledge — yes — test:49-53
- Test check: scripted seat sends no reply before the gate — yes — test:84-90, passes
- Optional live run — n/a (no record that it was done)
- Fences (only the brief, the ux doc copy, the test and the risk note) — yes — commit 9b7c0f4b8 touches exactly these 4 files
- Report in task.jsonl and one line to the mastermind — no — no task.jsonl (finding 4)
- Class shows its live instances — n/a (no class added)

## Words
- Brief, plain sentences, no jargon — yes — reads cleanly; the "(pause)" sentence at line 3 is clear
- ux doc copy is clear — no — step 2 is garbled, step 4 is overloaded (finding 8)
- risk.md is scannable — yes — one section per change, with bold risk lines
