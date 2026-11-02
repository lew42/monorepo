# Census: every Voice Chat feature that could be a plugin, and whether each setting is wired

Budget: $3. Load the `minion` skill first. Read only; edit nothing outside this folder.

**Why:** the owner wants each Voice Chat feature (Dictate, Recite, the chat views) to be a class that can be switched on and off. Before the plan, the mastermind needs a map of where each feature lives today. Parent brief: [../requirements.md](../requirements.md).

## Deliverable: `census.jsonl` in this folder, one JSON line per feature

`{"feature", "files": ["path:line-line", ...], "entry": "the one call/place that turns it on today", "setting": "SETTINGS key or null", "default", "wired": true|false|"partly", "proof": "file:line where the setting is READ and changes behaviour (or 'not read anywhere': grep shown)", "seam": "how cleanly it could be lifted out: clean | tangled (why, one line)"}`

Then 2 summary lines at the end: `{"count_features": N}` and `{"count_settings": M, "wired": a, "partly": b, "unwired": c}` (a+b+c must equal M).

## Features to find (check each; add any other switchable behaviour you meet)

1. Barge-in (the owner's voice interrupts read-aloud): volume-based; any `words` option.
2. The reply wait (quiet before a reply is spoken/sent): `answer_quiet_ms`, `pause_send_ms`, `paragraph_pause_ms`.
3. The thinking cue (sound or icon while an assistant works).
4. No-flood / agent updates folded into one line.
5. Read-aloud (Recite) and its word highlight.
6. Tap to pause read-aloud.
7. Per-bubble replay (`Recite.Bubble`, `Widget.Thread.replay_ctl`).
8. The send cursor / the two moving ✓/🧠 cursors (`ext/Chat/cursors.js`).
9. Whisper repeat collapse (`ux/Dictate/repeat.js`), guess-every, filler words, safety chunks, box lines.
10. Wake policy knobs (`wake_gap_s`, `wake_every`).

## Where to look (Grep/Glob scoped to the repo; never `find /`)

`public/framework/ext/Chat/Mic.js` (`SETTINGS`, `settings_panel()`, `save_settings()`), `ext/Chat/Composer.js`, `ext/Chat/Chat.js`, `ext/Chat/cursors.js`, `ux/Dictate/chat.js`, `ux/Dictate/Widget.js`, `ux/Dictate/DictationBar.js`, `ux/Dictate/floor.js`, `audio/Recite/` (all .js), `ux/Dictate/doc/settings.md`, `Servex/agents/Sessions.js` (only the settings route and `answer_quiet_ms`), `Servex/agents/WakePolicy.js`.

## Rules

- **Prove "not wired" before you say it:** show the grep that finds no reader. A setting is wired only if a line READS it and the behaviour changes.
- Every `files` entry is a real path:line you opened. No guesses.
- Log one `log` line in this folder's `task.jsonl` when done: the two counts. Never kill or restart the dev server, never drive the owner's tabs, never `git stash`. Don't commit; the mastermind commits.
