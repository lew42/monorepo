# Wake the smart assistant per thought, not per sentence: report

Branch `worktree/dictation-wake` (commits in `C:/Code/lew42/worktrees/dictation-wake`). Not merged, Servex not restarted: it needs a Servex restart to take effect.

## Numbers (real voice sessions of 2026-10-24 and 25: 15.9 min of dictation, 61 owner lines)

| | Before | After (replay) |
| --- | --- | --- |
| Smart wakes | 44 (**2.77 / min**) | 35 (**2.20 / min**) |
| Smart-seat tokens per minute of dictation | **203,897** | **161,043** (about -21%) |
| Smart-seat dollars (whole 15.9 min) | $1.14 | $0.91 |

`before.json` is the real transcripts. `after.json` is `replay.mjs`: it rebuilds the old rule from the session files (it reproduces the real wakes: 18 vs 18 and 24 vs 26) and feeds the same releases to the new gate on a fake clock, telling the gate when the owner is speaking (each voice line's floor, 8 s auto-done), exactly as `Sessions.set_floor` does. Re-run after review: the first run did not pass the floor, so it counted speaking time as pause and showed 40 wakes / 182,607 tokens/min. Tokens after = the seat's real tokens per wake (about 74k, nearly all cached context) times the new wake count.

**The honest reading.** These two recordings are mostly short spoken questions ("can you hear me?", "what model are you running?"). A question is an `asked` wake by design, so the gate cannot save those. The one long dictation (v-xhx7fmx, 7 min, 24 lines) went from 14 wakes to 12, and the Q&A session (v-zg6h7hl) from 18 to 15: speaking time no longer counts as pause, so thoughts spoken back to back batch up (6 sentences, 7, 8, 10 per wake); the owner paused 50 to 75 s between whole thoughts, and a pause is a wake by design. Where sentences come fast, the gate is large: the unit test dictates 20 sentences in 2 minutes with three pauses and wakes it **4 times, not 20**; 20 sentences with no pause at all wake it 4 times (every 6 sentences, then the end).

**The bigger lever is not the wake count.** Each wake costs about 74k tokens ($0.026) because the Opus seat re-reads its whole long context every turn. A fresher or compacted smart seat per voice session would cut tokens per wake; that is a separate change (not done, not in the brief).

## The rule (`Servex/agents/WakePolicy.js`, used by `Sessions.js`)

The fast seat and the page still do all per-sentence work. The smart seat gets ONE batch, with the reason as its last line, when:
- **you paused** `gap_ms` (default 6 s; the quiet the page already measured counts toward it; the time you spend speaking again does not, the timer stops while the floor is `speaking` and starts a whole gap when it is `done`), or the mic went off;
- **you asked**: your last words end in `?`, or a sentence starts with "smart" / "mastermind", or a ❓ reaction (the waiting lines go first);
- **`every` sentences** (default 6) have piled up.

Typed lines wait the existing 1.5 s. Every old path (`release_thought`, `gather`, `quiet`, `owner_reacted`) now feeds the gate, and `feed_smart()` is the only place the owner's words reach the smart seat. The one ungated send is the respawn recovery (it re-sends the one line a restarted seat never answered), with a comment saying so.

## The knobs, and where they live

`gap_ms` and `every`, per session, in Servex's `sessions.json` under that session's entry (`wake`). Defaults and the allowed ranges are in `WakePolicy.js` (`WAKE_DEFAULTS` 6000 / 6; boot overrides `SERVEX_SESSION_WAKE_GAP_MS`, `SERVEX_SESSION_WAKE_EVERY`). The dictation widget's settings panel sets them with `POST /api/session/settings {session, gap_ms, every}` (validated: gap 1000 to 60000, every 1 to 50; `null` resets). Doc: `public/framework/ux/Dictate/doc/wake-policy.md`.

Why 6 s and 6: the replay is nearly flat between 4 and 8 s (36 vs 35 wakes), since real pauses are either under 3 s or over 50 s; a 15 s gap with every 10 gives 29 wakes (-34%, 132,474 tokens/min) but makes the smart seat slow to answer a statement. Alternative if the owner wants it quieter: gap 15000, every 10.

## Proof and what to run

`node Servex/agents/WakePolicy.test.mjs` (16 checks, fake clock, no model, includes Sessions.js against a fake agent host, and the owner speaking again holding the pause timer) and `node Servex/agents/Sessions.test.mjs` (24 checks) and `fixer.test.mjs` (6) pass. `node replay.mjs` reruns the replay.

## Docs changed

New `ux/Dictate/doc/wake-policy.md` (linked from the Dictate readme); `Servex/agents/session-smart.md` and `ext/Session/doc/sessions.md` updated. Left out of date: nothing known. Note: this worktree had no `Servex/node_modules`, so I copied the main one in (a real copy, gitignored) to run the tests.
