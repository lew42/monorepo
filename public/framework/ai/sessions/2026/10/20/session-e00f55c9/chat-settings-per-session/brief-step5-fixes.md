# Brief: step 5 review fixes

Budget: $3. Same worktree `C:/Code/lew42/worktrees/chat-settings-panel` (branch is current with michael/dev). The review is [review.md](review.md) (findings 1-13). Commit by exact path; before each commit restore sweep-modified `files.jsonl` files with `git checkout -- <paths>`; never stash, never touch CLAUDE.md, never write the owner's name. Tests first where a test fits.

Fix:
1. **Panel redraws on every edit.** Set the `own` guard before `row.set` (inside `PluginSettings.set`, or let `watch()` ignore events while a panel row is writing). Add a test with a fake row that emits "change" synchronously: `refresh()` must not run.
2. **Stop keeps the mic's own send count.** `ext/Chat/Mic.js` ~l.636 and l.788: `this.sentences_per_send ?? SETTINGS.sentences_per_send`. Test with a plain-object mic: preset `pause` and `two` stay in force when `send_sentences()` runs from `stop()`.
3. **Slider ends at 360.** In the `core/Settings` render, put `low | slider | high` on one line (the low text left of the slider, the high text right of it, both small, wrapping to the line below the slider only if there is no room), or show the two end texts under the slider's two ends. Either way each end text sits at its own end. Re-shoot at 360 and read it yourself.
4. **plan.md Status** gets a step 5 line (three commits, the worktree, shots location, what is left) and a step 6 "next" line; also fix the step-5 paragraph where low/high of the threshold are reversed (left = almost any sound counts as you, right = only loud talking).
5. **A shot with a session open** ("Editing: This session", Make default and Reset to default enabled): stub `session()` to return an id in the headless page, shoot at 360 and 1920, put them in `chat-settings-per-session/` beside plan.md with the earlier four, and link all from plan.md. Click Make default in that shot page (stub the POST) and say what the note line shows.
7. **Reset saves once:** keep the event-driven save from `chat.js`, drop the explicit `save_session(null)` if `reset_plugins()` always emits a change when there is anything to clear; if it can emit nothing (already clean), say so in a comment line and keep the explicit one only for that case.
8. **Stale text:** `ReadAloud.js` ~l.202 comment, the `VoiceChat/readme.md` ReadAloud row (`recite.pick`), and the `ux/Dictate/readme.md` settings line (plugin values live in `session.jsonl`; defaults at `/api/session/defaults`).
9. **Whisper rows get a data path** in small type like the plugin rows (`SETTINGS.send_delay` etc.) where `Mic.settings_panel()` builds rows (add an optional path to the row label; the key is already known).
10. **Sending section shows ONE control, "Send after"** (a dropdown): the SendAfter field label is "Send after", and the plugin's own on/off toggle is not drawn for SendAfter (a `toggle: false` option on `PluginSettings`, or the like). Keep the toggle for the other plugins.
11. **Sweep noise:** remove the extra `{"file":"failures.jsonl","gone":true}` line from `audio/Recite/files.jsonl`.

Leave 6 and 12 (I put them in the todo). Check: the same tests as step 5 plus the new ones, `node --check`, `git status` clean, committed. Report ONE message: commit hash, test counts, what the new 360 shots show.
