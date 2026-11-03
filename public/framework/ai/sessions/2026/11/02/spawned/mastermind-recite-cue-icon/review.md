verdict: fix
1. [fix] The repeating cue has no end except a reply that has text: `start_thinking()` reschedules itself while `cue_pending` is true (Recite.js, `start_thinking`), and `partial("")` (the end of the stream) never calls `cancel_cue()` (Recite.js:320 cancels only `if (text)`). If the agent fires `thinking` and then sends an empty reply (session-smart.md:58 tells it to stay silent sometimes) or its turn fails, the phone beeps every 2 s until the owner speaks again. The owner already finds the cue annoying. Fix: cap the repeats (for example 30 s), or cancel on the stream's end too.
2. [fix] The brief is missing from the task folder: there is no `requirements.md`, so a fresh agent (or this reviewer) can't see the two asks without digging through the agent's transcript. Save the spawn prompt as `requirements.md` beside `session.jsonl`.
3. [fix] The brief asked for two merges, with the cue fix "FIRST, as its own small merge". Both fixes are in one commit, da0d972af, on `worktree/recite-cue`, which is not merged into michael/dev yet. Either split it, or record why one merge was chosen.
4. [fix] The brief asked for a shot of the resume button at 360x740 (ask 2). There is none in the task folder (no `shots/`). The contrast claim ("about 9:1", Recite.css:35) is not checked anywhere, and the brief also asked for a 2-line report to vscode-mastermind and a closed task. `session.jsonl` has no landing line.
5. [fix] Old comments still describe the automatic cue. Recite.test.mjs:377-379 still says "a short tone once the owner's line lands, again cue_repeat_ms later... then quiet". Recite.js:50 (`cue_timer`) still says "expect_reply()'s own pending timeout for the second cue". doc/architecture.md:32 ("Why any non-assistant chat.text is close enough… chime once a line was sent") still argues for the trigger that was just removed. Update or delete each one.
6. [note] Recite.css:35 hard-codes `#1a1008`. framework.css:605 already sets the ink on orange for `.bg-prime` as `#1a1a1a`. Reusing that value (or that class) keeps one ink-on-prime colour instead of two. The comment should also go on its own line; at 170 characters it runs past the declaration it explains.
7. [note] Ask 1 is met as described: a plain line now only sets `cue_pending` (`expect_reply`), the `{thinking:{by:"smart"}}` line plays the cue and repeats it, `thinking_cue` is kept, and the readme and session-smart.md each say in one line how to fire it. The 120 s staleness guard in `from_wire` covers only `chat.at`. A `thinking` line has no timestamp check, so if the wire ever replays old lines, a stale one would start the cue. Today `Session.stream` sends live lines only (ext/Session/Session.js:158), so this is a watch-out, not a bug.
8. [note] `Recite/ai/files.jsonl` gains one more `log.jsonl` "gone" line; that line is noise from the machine log and is unrelated to either ask.

## Requirements
- 1 "the automatic cue after each line is off; add an explicit trigger the agent can fire… repeats while the agent stays working, stopping when its reply arrives" — yes, but it never stops when the reply is empty (finding 1). Recite.js `from_wire` `thinking` branch + `start_thinking()`.
- 1 "Keep the thinking_cue setting" — yes — `start_thinking()` returns early when it is false; the test "thinking_cue = false turns the cue off" now drives the new trigger.
- 1 "Update audio/Recite/readme.md and tell the voice brief in one line" — yes — readme.md "The thinking cue" and session-smart.md:56.
- 1 "FIRST, as its own small merge" — no — one combined commit da0d972af (finding 3).
- 1 "Headless test (no cue after a plain line; cue on the explicit trigger; stops on reply)" — yes — Recite.test.mjs, the renamed first cue test covers all three.
- 2 "fix the icon colour so it reads clearly in light and dark (at least 4.5:1), one place in the CSS" — yes in code (Recite.css:35-36, a fixed dark ink on `--prime`); not proven (finding 4).
- 2 "Shot for 2 at 360x740" — no — no shot in the task folder.
- Class with live instances — n/a (no new class).

## Words
- Readme and doc text — yes — plain, says what fires the cue and how to turn it off; stale sentences remain in architecture.md and comments (finding 5).
