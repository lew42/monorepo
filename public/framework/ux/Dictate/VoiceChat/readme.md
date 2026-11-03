# VoiceChat

One `VoiceChat` per Recite (the page has one reader, so the first chat makes it and the others share it): the rules and thresholds of Voice Chat (when to interrupt, how often the thinking tone repeats, later when to send) as plugins you switch on and off and configure for that chat. It is a [`core/Plugin`](/framework/core/Plugin/readme.md) host. The class lists the plugins and their defaults once (`plugins/index.js`); each instance keeps only what it changed (`vc.overrides`) and reads the rest from the class.

## Use

- `new VoiceChat({ recite, mic, overrides })` (done in `../chat.js`, kept at `Recite.shared.voice_chat`): `recite` is `audio/Recite`'s shared reader, `mic` the chat's Dictate, `overrides` (optional) is loaded before anything attaches. Every plugin that is on attaches to it.
- `vc.plugins.find("Interrupt").set({ config: { threshold: 0.6 } })` changes the threshold for this chat only (the plugin re-runs); `.set({ enabled: false })` switches it off for this chat.
- `vc.overrides` is the plain object a session saves; `vc.load_overrides(obj)` puts one back; `vc.reset_plugins()` returns to the defaults; `VoiceChat.make_default(vc)` copies a chat's settings to the defaults ([core/Plugin readme](/framework/core/Plugin/readme.md)).

## Structure

- `VoiceChat.js`: the class. `initialize()` settles every plugin that is off for this chat into its off state (a host's own default may be on), then calls each plugin's optional `bind(vc)`. `VoiceChat.config(vc, Plugin)` is what a plugin reads.
- `plugins/`: one file per plugin, a plain class with `static label`, `description`, `defaults` (`on` is the switch, the rest is config), `fields` (what the panel draws: `slider`, `number` or `choice`), `attach(vc)`, `detach(vc)`, and optionally `reconfigure(vc)` (a config change that must not restart what is open: called instead of detach and attach) and `bind(vc)`. `plugins/index.js` registers them in value order.
- `VoiceChat.test.mjs`: `node public/framework/ux/Dictate/VoiceChat/VoiceChat.test.mjs`, plain objects stand in for the hosts.

| Plugin | Config | Does |
|---|---|---|
| `Interrupt` | `mode`, `threshold`, `quiet_ms` | Sets `recite.barge`; `reconfigure` only rewrites the values, so the mic stays open while the threshold slider moves. `bind` makes the bar's mic, mode and threshold controls also write the row of the chat that owns the bar (wrapped once per bar); `snapshot(recite)` reads the browser's remembered values as overrides. |
| `ThinkingCue` | `repeat_ms` | Sets `recite.thinking_cue` and `cue_repeat_ms`; off also clears the pending repeat (not `cue_pending`). |

## Watch out

- Values go straight onto the host object, never through `remember()` (the browser's memory): they belong to the chat. The bar's own controls still save to the browser until the settings are saved with the session ([plan](/framework/ai/sessions/2026/10/20/session-e00f55c9/chat-settings-per-session/plan.md)).
- Read `Interrupt.snapshot(recite)` BEFORE `new VoiceChat(...)` and pass it as `overrides`: the first attach writes the class values onto the host.
- One Recite means one set of read-aloud settings on a page: two chats on a page share one VoiceChat, they do not each get their own.
- A plugin's `detach` must be safe when it was never attached.
- `audio/Recite` imports nothing from `ux/`; the hosts are handed in.
