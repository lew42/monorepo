verdict: fix
1. [fix] Stale and dangerous: `ux/Dictate/doc/settings-plugins.md:16` still says "Delete/ignore `ux/Dictate/VoiceChat/VoiceChat.js`", but that path is now the new core/Plugin-based class this diff adds. A fresh agent following the doc could delete live code. Reword it to say the old branch's registry is gone and the new `VoiceChat/` is the port, and link `VoiceChat/readme.md`.
2. [fix] Contradiction: `ux/Dictate/readme.md:101` says "one `VoiceChat` per chat", and the `VoiceChat.js:1` header and the `VoiceChat.test.mjs:1` header say "one instance per open chat", but `chat.js:246` and `VoiceChat/readme.md:3` make ONE per Recite, shared by every chat on the page. Make all four say "one per Recite (one per page)".
3. [fix] Stale: `settings-plugins.md` ("The per-instance settings" section) and `plan.md` step 1 ("re-runs detach then attach … a plugin never needs its own settings-changed code") no longer tell the whole story: core/Plugin now calls `reconfigure(inst)` when a plugin has one (`Plugin.js:198`). Add one clause to each, so the next plugin port knows to use `reconfigure` for anything that holds a mic or a timer open.
4. [note] Requirements: this is merge 3 (step 2, first group). Asks 1 and 2 are only partly met (2 of the ~6 plugins, and no panel yet). Asks 3, 4 and 5 are not started on the page side. `plan.md` Status says so honestly and ticks nothing, so this is correct staging, not a miss.
5. [note] Two sets of defaults: `Interrupt.defaults` (`Interrupt.js:333`) repeats BargeIn's own field initializers (`BargeIn.js:29-46`) and its `static label/defaults`. If either one changes, `snapshot()` turns the difference into a phantom override. Later, read the defaults from `BargeIn` instead.
6. [note] `Interrupt.attach` sets `b.on = true` without BargeIn's `set_on` side effect (`if state === "heard" → "off"`, `BargeIn.js:322`). After a detach that happened while reading was paused, re-attaching could leave `state` at "heard". Probably harmless, because `detach` → `sync` resumes reading. Worth a test.
7. [note] The bar's toggle writes an override even when it matches the class (`set_on(true)` → `{Interrupt:{enabled:true}}`, `Interrupt.js:360`). The plugin then stops following a later Make default for that switch. That matters once step 5 is built.
8. [note] On the chat page, `Plugin.store` is still the node `Map` (only `core/Plugin/page.js:6` swaps in localStorage), so `VoiceChat.make_default` would not survive a reload. This is expected until the page side of step 5 is built; record it in the plan.
9. [note] `core/files.jsonl`, `core/Plugin/files.jsonl` and `ux/Dictate/files.jsonl` each gain a `failures.jsonl … gone` line that this task did not cause (an indexer churning on a test artifact). It is noise in the diff; worth finding the writer.

## Requirements
Widths given: none (no shots for this diff; the page code changed only in `chat.js` wiring).
- 1 "the dictation and recite rules and thresholds as plugins you can switch on and off" — partly — Interrupt and ThinkingCue are plugins with switches and config (`VoiceChat/plugins/`). Send on sentence end, word highlight, tap to pause and the timings remain (plan.md Status).
- 2 "registered at the class level, toggled and configured per instance" — yes for the two built — `plugins/index.js` registers once; tests "one chat's threshold is its own" and "load_overrides" pass (12/12 VoiceChat, 30/30 core/Plugin, run by me).
- 3 "one Chat settings panel (the gear), with Recite's settings in it" — no — not in this diff (step 3)
- 4 "settings persist with the session; a new session starts from the defaults" — no on the page side — `vc.overrides` is the payload and the Servex side exists elsewhere; nothing loads or saves it yet
- 5 "a 'Make default' button" — no — `VoiceChat.make_default` works in tests; there is no button in Chat
- class live-instances page — no — the `VoiceChat` class has no page showing its live instance and its overrides; the core/Plugin demo covers the mechanism. [note] for now; once the panel exists, it is that view.

## Words
- plain sentences, the reader's terms: yes — `VoiceChat/readme.md` has Use, Structure, a plugin table and Watch out, in plain words
- nothing stale: no — findings 1, 2, 3
- new files indexed: yes — `VoiceChat/` is in `ux/Dictate/files.jsonl` and linked from `ux/Dictate/readme.md:101`; `plugins/files.jsonl` lists all three
- a fresh agent can continue from the task folder: yes — `plan.md` Status names the worktree, the commits, the four plugins still to port, "do not port Interrupt or ThinkingCue again", and the open steps 3–5
