# The settings panel (the gear)

**The `assistant` setting has a fourth value, `single`** (one agent per session instead of the fast + smart pair), at boot (`session-assistant.txt`) or per session (`POST /api/session/settings {session, assistant}`): [single-voice-assistant.md](single-voice-assistant.md).

One panel, the old one: `ComposerMic.settings_panel()` in `ext/Chat/Mic.js`, opened by the composer's gear (`ext/Chat/Composer.js`, "Dictation settings"). On the sheet the composer's row is hidden by the dictation bar, so the bar has its own ⚙ (`DictationBar.js`, `.dictation-bar-gear`) that presses the hidden gear: same panel, never a second one.

## The knobs that matter

- **Send delay (s), default 2.** Quiet that must pass before the words on screen leave as one prompt. Keep talking within it and the new sentence joins the same prompt. It sets both waits `auto_check()` uses, `SETTINGS.paragraph_pause_ms` (natural pause after a finished sentence) and `SETTINGS.pause_send_ms` (silence before the tail), to the same value.
- **Smart assistant: batch after quiet (s, 1 to 60) and after this many sentences (1 to 50).** These are Servex's `gap_ms` and `every` ([wake-policy.md](wake-policy.md)); empty means Servex's default (12 s, 6: `WAKE_DEFAULTS` in `Servex/agents/WakePolicy.js`; the placeholders in `Mic.js` repeat those two numbers). Changing one POSTs `/api/session/settings` to the current voice session (`ComposerMic.push_wake()`); `chat.js` also sends the saved values once to each new session at its first send.

- **Voice assistants: Default / One assistant / Two assistants (fast + smart).** Picking one POSTs `{session, assistant: "single" | "voice" | null}` to `/api/session/settings` (`ComposerMic.assistant_row()`, then `push_wake()`; `chat.js` re-sends the pick to each new session). The line under it ("Live now: …") is read from `GET /api/session/<id>`, which reports the session's own `assistant` word; with none it says Servex's default. The pick is kept in `SETTINGS.assistant` only so a new session gets it.

The send delay is the first row. Guess every, box lines, safety chunks and filler words sit under a closed **More**; the rest of the panel is unchanged. The compact bar (the strip) has no ⚙ on purpose: only the full-size bar opens the panel.

## Where the values live

`localStorage` key `chat.mic.settings.4`, the whole `SETTINGS` object (`save_settings()`). `.4` replaced `.3` on 2026-10-25: the old 700 and 1500 ms defaults are dropped only when values are carried over from `.3` or `.2`; a value saved under `.4` (a 1.5 s pick included) is kept as is. The two smart assistant values are `wake_gap_s` and `wake_every` (null = default).

## Proof

`node ux/Dictate/test/settings.mjs <base-url>`: the delay holds across a reload; at 3 s two sentences 1 s apart are one prompt, at 0.5 s they are two; the batch seconds reach `/api/session/settings`; choosing One assistant posts `assistant: "single"`, the live line reads it back from the server, and it holds across a reload (shot `assistants-360.png`). Shots: `ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/settings/shots/` (`panel-400.png`, `panel-1920.png`).

## Plugin settings per session ("Chat settings"), and "Make default" (chat-settings-session, step 4)

A voice session's plugin switches and values — a [`VoiceChat`](/framework/ux/Dictate/VoiceChat/readme.md) instance's own `overrides`, `{Name: {enabled?, config?}}` (only what that session changed; anything missing is the class default) — are **not** kept in `sessions.json` any more. They are saved as two groups on the session's own `session.settings`, `dictate` and `recite` (named after the classes, [core/Session/readme.md](/framework/core/Session/readme.md) "Session.settings"), appended as lines in that session's own `session.jsonl`: `{"settings":{"dictate":{...},"recite":{...}}}`. `VoiceChat.overrides_by_group()` does the split (by each plugin's `static group`; a plugin with no group goes under `recite`), `vc.load_grouped(obj)` is the inverse.

- **Saving:** `POST /api/session/settings {session, plugins}` still takes the flat, unsplit shape (`checked_plugins()`, unchanged: booleans, numbers and short strings, nothing nested) — `Sessions.settings()` (`Servex/agents/Sessions.js`) splits it with `group_plugins()` (which reads each plugin's `static group` off `VoiceChat.records`, imported from the browser class — a plain ESM import works fine in Node, no DOM at load time) and appends ONE `{"settings":{dictate,recite}}` line. `plugins: null` ("Reset to default") appends both groups empty.
- **Reading:** `GET /api/session/<id>` and the response of `settings()` both rebuild the flat shape by replaying the session's `session.jsonl` as a `Session` and merging `session.settings.dictate.own` and `.recite.own` (`Sessions.js` `plugins_of()`) — never a cached copy, so a phone and a PC always see the same thing.
- **The page** (`ux/Dictate/chat.js`): `attach()` calls `Session.get(session).then(rec => panel.voice_chat.load_grouped(rec.plugins ?? {}))` whenever the watched session opens or switches — a brand-new session has no settings lines yet, so this reads as `{}` and the chat starts from the defaults (the same thing "New session" wants, with no separate call needed). Every plugin row's `"change"` event (wired once per page, right where `Recite.shared.voice_chat` is made) debounces 400 ms and posts `Session.settings({session, plugins: panel.voice_chat.overrides})` (`ext/Session/Session.js` `get`/`settings`, new).
- **The shared defaults** ("Make default") are unchanged by this step: one more object of the same flat shape in `session-defaults.json` beside `sessions.json` (`POST`/`GET /api/session/defaults`), the page side still not wired to read it (queued).

Tests: `node Servex/agents/Sessions.plugins.test.mjs` (rewritten for the new storage), `node public/framework/ux/Dictate/VoiceChat/VoiceChat.test.mjs` (`overrides_by_group`/`load_grouped`), `node public/framework/core/Session/Session.test.mjs` (`session.settings` groups).
