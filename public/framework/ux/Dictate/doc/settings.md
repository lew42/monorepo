# The settings panel (the gear)

One panel, the old one: `ComposerMic.settings_panel()` in `ext/Chat/Mic.js`, opened by the composer's gear (`ext/Chat/Composer.js`, "Dictation settings"). On the sheet the composer's row is hidden by the dictation bar, so the bar has its own ⚙ (`DictationBar.js`, `.dictation-bar-gear`) that presses the hidden gear: same panel, never a second one.

## The knobs that matter

- **Send delay (s), default 2.** Quiet that must pass before the words on screen leave as one prompt. Keep talking within it and the new sentence joins the same prompt. It sets both waits `auto_check()` uses, `SETTINGS.paragraph_pause_ms` (natural pause after a finished sentence) and `SETTINGS.pause_send_ms` (silence before the tail), to the same value.
- **Smart assistant: batch after quiet (s, 1 to 60) and after this many sentences (1 to 50).** These are Servex's `gap_ms` and `every` ([wake-policy.md](wake-policy.md)); empty means Servex's default (6 s, 6). Changing one POSTs `/api/session/settings` to the current voice session (`ComposerMic.push_wake()`); `chat.js` also sends the saved values once to each new session at its first send.

The rest of the panel (send mode, sentences per send, guess every, box lines, safety chunks, fillers) is unchanged.

## Where the values live

`localStorage` key `chat.mic.settings.4`, the whole `SETTINGS` object (`save_settings()`). `.4` replaced `.3` on 2026-10-25: the old 700 and 1500 ms defaults are dropped on load so the 2 s default shows. The two smart assistant values are `wake_gap_s` and `wake_every` (null = default).

## Proof

`node ux/Dictate/test/settings.mjs <base-url>`: the delay holds across a reload; at 3 s two sentences 1 s apart are one prompt, at 0.5 s they are two; the batch seconds reach `/api/session/settings`. Shots in the task folder's `shots/`.
