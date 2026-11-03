verdict: fix
1. [fix] A send delay of 1.5 s does not survive a reload. `ext/Chat/Mic.js:39-40` deletes saved `pause_send_ms`/`paragraph_pause_ms` values of 1500 (and 700) on every load, including loads from the new `.4` key, so the owner's own 1.5 s pick snaps back to 2 s. The 0.5 s steps in the input make 1.5 an obvious choice. Only strip stale defaults when migrating from `.3`/`.2`, then add a 1.5 s case to `test/settings.mjs` (it only tries 3 and 0.5, which is how this slipped through).
2. [fix] The screenshots are not committed. `shots/panel-400.png` and `shots/panel-1920.png` exist in worktree `qf-3`, but `git ls-files` for the task folder lists only `requirements.md` and `session.jsonl`. `doc/settings.md:20` says "Shots in the task folder's `shots/`", so that link breaks on merge. Add them by path.
3. [fix] `ext/Chat/doc/mic-notes.md` is now stale. The "paragraph_pause_ms history" section still ends at the owner's 2026-10-01 "500 to 1000 ms" (700), and line ~350 still quotes "(700ms)". Nothing there says that both waits became one 2 s "send delay" on 2026-10-25, that the store moved to `.4`, or that `doc/settings.md` exists. Add one history line and a link. Whoever reads it next will otherwise think the owner's 700 ms ask still holds.
4. [note] The owner's Part 7.6 ask comes first, but the panel buries it. "send delay" is row 5 of 11, below send mode and sentences per send (`shots/panel-400.png`, middle band). The owner asked for "a small settings panel: the delay before sending … and the other knobs". Moving the send delay to the top row, and maybe the expert knobs (guess, safety chunks, fillers) under a fold, would match those words better.
5. [note] The smart assistant's default stays at 6 s. The owner's Part 10 says batches go "every ~10–15 s", and the brief said 12. The minion logged this as out of fence (`Servex/agents/WakePolicy.js` `WAKE_DEFAULTS`). The parent should route it, or the owner's number never lands.
6. [note] The new 2 s default changes `SETTINGS` for every composer on the site, not just the sheet, and every saved 700/1500 value gets wiped. That fits the owner's "say 2 s", but it reverses the 2026-10-01 "500 to 1000 ms" ask. Say so in the landing line.
7. [note] The ⚙ is created only when `!this.compact` (`DictationBar.js:93`), so the compact bar has no way into settings. Fine if compact never needs it. One line in `doc/settings.md` would say so.
8. [note] The `push_wake` call in `chat.js:170` relies on `panel.dictate`, and `Widget.js:786` relies on the Widget keeping its `session` option as `w.session`. `test/settings.mjs` proves both work (the POST reaches the stub session), so this only matters if Widget stops assigning its options.

## Requirements
- Widths given: panel-400.png and panel-1920.png (taken by the minion; there is no review.mjs `layout.json`, so band numbers are not measured).
- 1 "Worktree" — yes — `worktree/qf-3`, 2 commits (b1c6726b3, 6814c8087), not merged
- 2 "Look first, one log line" — yes — `session.jsonl` log: reused `ComposerMic.settings_panel`, found the composer gear hidden by DictationBar.css
- 3a "send delay, default 2 s, wired to the code that waits" — yes — `Mic.js:67-69` sets both `auto_check()` waits; but it fails to persist at 1.5 s (finding 1)
- 3b "batch interval, only if a knob exists" — yes — `gap_ms`/`every` already exist in Servex; the rows POST `/api/session/settings`; the default is 6 s, not 12 (finding 5)
- 3c "persist per browser, the old panel's store" — partly — `chat.mic.settings.4`; 1.5 s is lost (finding 1)
- 4 "settings.mjs: reload holds, two sentences 1 s apart become one prompt; shots 400 + 1920; order/flicker/repeat no FAIL" — yes by the log, but the shots are uncommitted (finding 2)
- 5 "one readme line + doc/settings.md" — yes — `readme.md:44`, `doc/settings.md`; `mic-notes.md` is stale (finding 3)
- 6 "commit by path, don't merge" — yes
- Class live-instances page — n/a (no new class)

## Page structure
- Title says what it is — yes — "Dictation settings", panel-400.png top band
- One purpose — yes
## Navigation
- Techniques — a sheet (the gear opens the composer's settings sheet), with a Close button
- Close is visible and labelled — yes — panel-400.png top right
- The way in is findable — partly — ⚙ beside ⌨ on the full bar only (finding 7)
## Layout
- Label/input two-column grid reads at both widths — yes — panel-400.png, panel-1920.png
## Sizing
- Panel width at 1920 is capped and centred — yes — panel-1920.png, about 600 px centred
- Inputs a fixed 10em — yes; the filler-words value is cut off ("ah uh um er erm h"), minor
## Wrapping
- Long labels wrap to 2 lines at 400 — acceptable — "send delay (s): keep talking…" and "clean transcription…", panel-400.png
## Spacing and padding
- Even row rhythm, and the section head has space above it — yes — panel-400.png, the "Smart assistant" head
- Bottom third empty at 400 — n/a for a short form
## Colour and contrast
- Placeholder "default (6)" is grey on grey — note — it reads, but it is faint (panel-400.png, bottom band)
## Flow
- Most important knob first — no — send delay is row 5 of 11 (finding 4)
## Words
- Labels in plain words — mostly — "send delay (s): keep talking within it and the words join one prompt" is clear; "guess every (ms)" and "safety chunk" are jargon the owner never asked to see first
- Doc is plain and current — yes for `doc/settings.md`; no for `mic-notes.md` (finding 3)
- Could a fresh agent continue from the folder alone — mostly — requirements, log and commits are there; the shots are missing (finding 2) and there is no landing line yet
