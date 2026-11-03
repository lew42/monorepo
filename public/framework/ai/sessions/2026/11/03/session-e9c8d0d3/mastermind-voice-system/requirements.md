# Voice system: five asks, from stray replies to the settings design

The owner's asks behind this diff, carried only as spawn titles until now:

1. **A stray `undefined`/`null` reply is never shown.** Acceptance: `is_filler()` (`Servex/agents/Sessions.js`) treats a stringified `undefined`/`null` as filler and drops it; `Sessions.single.test.mjs` covers it. — [minion-minion-undefined-guard](../../session-f5eadae9/minion-minion-undefined-guard/), commit `4ad5f61d8166`.
2. **A phantom "Thank you." (or other stock Whisper hallucination) never reaches the chat.** Acceptance: never a blanket drop. — [minion-minion-phantom-gate](../../session-f5eadae9/minion-minion-phantom-gate/), commits `e8702d579776`, `f17abf06787d`, `209c73eee1c2`; related: [minion-minion-phantom-thanks](../../session-f5eadae9/minion-minion-phantom-thanks/).
   - Drop only when the clip is short, its weakest word's probability is low, or it echoes what Recite just read (`should_drop_phantom` in `ux/Dictate/phantom-gate.js`, called from `deliver()` in `chat.js`).
   - Every drop is logged to `ai/whisper/bucket.jsonl`.
   - It reuses `BargeIn.noise`/`echo`, not a second blocklist.
3. **Whisper's own flags cut hallucination at the source.** Acceptance: `-mc 0 --suppress-nst` in whisper-server's launch args (`Servex/Servex.js`'s `whisper()`), live (whisper-server stopped and started once, not just a Servex restart — see finding below). — commit `f17abf06787d`.
4. **The minion findings on mingled chat and the reply path are logged.** Acceptance: the prompt-merge-window cause (`Sessions.js:548`), the reply-path investigation and the eyeballs-scope note are each written up and linked. — [minion-mingled-chat](../../session-f5eadae9/minion-mingled-chat/), [minion-minion-reply-path](../../session-f5eadae9/minion-minion-reply-path/), [minion-minion-eyeballs-scope](../../session-f5eadae9/minion-minion-eyeballs-scope/).
   - **"It replied far too often"** (ask 4, `owner-feedback-2026-11-03.md`: "listening", "nothing is open", "no open questions", said even after being told to only listen) — `Servex/agents/single-voice-assistant.md` is rewritten so the silence rule is said once, dropping the repeated "write only '-'" fallback and the pause section's "No real question: end the turn empty" — commit `bb38c2edb`.
5. **A settings-by-plugin design doc.** Acceptance: a short `doc/*.md` describing how a plugin's own settings are declared and read, linked from its module's readme. — [minion-settings-design](../../session-f5eadae9/minion-settings-design/). The doc itself is `ux/Dictate/doc/settings-plugins.md`, and it lands with `worktree/qf-1` (commit `ea40784c6`), not in this diff.

## Review fixes (this task, `minion-minion-qf9-fixes`, worktree `qf-9`)

Review at `session-e9c8d0d3/mastermind-voice-system/review.md` (main tree only — it predates this worktree's checkout, so it isn't readable here):

- `Servex/Servex.js` comment corrected: the whisper flags apply only once whisper-server itself is stopped and started (`stop_server`/`start_server "whisper"`), not merely on a Servex restart (Servex detaches and adopts the running process, `Process.js` `adopt()`).
- `ux/Dictate/phantom-gate.js` + `chat.js`: the last Whisper final's info is now timestamped (`info.at`) and `should_drop_phantom()` ignores it once older than `LAST_FINAL_MS` (3 s); `chat.js` also clears it after every use. Test case added to `ux/Dictate/test/phantom-gate.mjs`.
- `chat.js`'s `on_whisper` chaining: a comment now names the fragility (an assignment after this one still replaces the hook outright).
- `Servex/agents/Sessions.js`: the `is_filler` doc comment now mentions the `undefined`/`null` case.

Commits land on `worktree/qf-9`, listed in that task's own log.
