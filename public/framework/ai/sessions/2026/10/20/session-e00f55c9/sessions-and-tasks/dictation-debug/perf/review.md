verdict: pass
1. [note] The brief's "Done when" asks for both harnesses to be re-run 3 times, but perf/report.md:20-21 gives one `freeze.mjs` run per mode (hand, fake mic) and three only for `load.mjs`. Both freeze results are 0 tasks over 50 ms, so the target looks met; two more freeze runs would make it as solid as the load numbers.
2. [note] Ask 1's "skipped when the draft's height did not change" was not built. perf/report.md:35 explains why: the layout read now happens once inside the frame callback, so a height check saves nothing. The reasoning holds, and with this change anchor() runs once per frame during a replay instead of never.
3. [note] `test/load.mjs` and `test/earlier.mjs` read `/ai/v-yxnts4l.jsonl` by default. That file still exists in the worktree, but the main tree's working copy shows it deleted (`git status`: ` D public/ai/v-yxnts4l.jsonl`). If that deletion is committed, both harnesses lose their default fixture. `freeze.mjs` already uses the dated copy at `/framework/ai/sessions/2026/10/05/v-yxnts4l/session.jsonl`, and the other two should use it too.
4. [note] `stall.mjs` (2 FAIL, "late" scenario) and `anchor.mjs` (1 FAIL) fail the same way on the untouched main tree, so this work did not cause them (perf/report.md:42). Nobody owns them yet. The dictation mastermind should file them as a task so they don't slip.
5. [note] Known loss, documented in voice-assistant.md#nothing-jumps and perf/report.md:51: if a place or refined line in the shown part points at a bubble still behind "show earlier", it is never re-applied. This is acceptable for now. The fix would be to replay the held lines' targets in `Widget.Thread.load_earlier()` (Widget.js ~346).

## Requirements
- 1 "anchor() at most once per animation frame, never during a history replay, skipped when the draft's height did not change": partly met. It runs once per frame through `place_anchor()` in a rAF (diff Widget.js:249-256). The height check was skipped, with a reason (note 2).
- 2 "refresh() once after the replay batch": yes. `entry.history ? refresh_after_batch() : refresh()` coalesces through a microtask (Widget.js:314, 362-366).
- 3 "on_level: store the level, write styles once per frame": yes. `Dictate.paint_level()` uses rAF, as DictationBar does (Dictate.js:447-462).
- 4 "Draw only the newest 50 bubbles, with an 'earlier' control; reuse Chat.js's way": yes. `Widget.HISTORY = 50`, plus `hold_history`, `load_earlier` and the shared `.chatbox-earlier` class, which is already styled in Chat.css:590. Proof: test/earlier.mjs.
- 5 "watch() fetches only bytes after seen, or drop the poll if SSE carries it": yes, the first option. Each poll is now a byte-range read. The poll was kept because the live stream is cut every 30 s and the poll delivers history on open (report.md:36, ext/Session/doc/watch.md). Proof: test/watch.mjs, run with and without Range support.
- mark() replay calls stay fixed: yes. `mark()` is still gated by `!entry.history` (Widget.js:317).
- Done when: first bubble under 0.5 s at 4x: yes (421 / 387 / 403 ms). No freeze over 100 ms at 4x: yes (0 tasks over 50 ms), but from one run per mode (note 1).
- Done when: flicker, stall, reconnect and order pass: flicker, reconnect and order pass. stall fails, but it fails the same way on the main tree (note 4).
- Done when: smoke shows no FAIL: yes, per report.md:43.
- Done when: the docs say what the code does: yes. voice-assistant.md#nothing-jumps, the ext/Session readme line and the new doc/watch.md are all linked from the readme's More section.
- Harnesses copied into ux/Dictate/test/: yes. load, freeze, earlier and watch are all indexed in test/files.jsonl.
- Deliverable: perf/report.md is one screen with a before/after table: yes. Findings are `log` lines in perf/session.jsonl: yes.
- Class inspector question: n/a. No new class; the diff only adds methods to Widget.Thread and Dictate.

## Words
- content 1 (plain, clear sentences): yes. The report's headline states the outcome ("opens in 0.4 s at 4x CPU"), and each commit gets one sentence.
- content 2 (one screen, scannable): yes. The report is 46 lines: a table, five numbered commits, then decisions.
- content 3 (no unexplained jargon): yes. "206", "416" and `Range` are explained where they first appear in doc/watch.md.
- content 4 (decisions name the alternative): yes. report.md "Decisions" gives the reason for each choice not made.

Could a fresh agent continue from this folder? Yes. The brief, report.md, the session.jsonl log lines and the branch name `worktree/dictation-perf` (7 commits, c58936dcb) are all here, and so is the one open item (note 4).
