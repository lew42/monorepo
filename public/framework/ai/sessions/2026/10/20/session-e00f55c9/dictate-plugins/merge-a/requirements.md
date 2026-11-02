# Voice Chat plugins, merge A: the plugin base, the Features panel, and the thinking cue as the first plugin

Budget: $7. Load the `minion` skill first, then the `code` skill. Sonnet, high effort.

**Why:** the owner wants each Voice Chat feature to be a class with an on/off toggle in the settings panel that takes effect live ([parent brief](../requirements.md)). **Read [../plan.md](../plan.md) sections 2 and 3 first: it is the design; build exactly that.** If something in it cannot work, log why in your `task.jsonl` and pick the nearest thing that does.

**Worktree:** `C:/Code/lew42/worktrees/dictate-plugins` (branch `worktree/dictate-plugins`). Work and commit only there, by exact path. Don't merge; the mastermind merges.

## Build

1. **`public/framework/ux/Dictate/VoiceChat/VoiceChat.js`**, `class VoiceChat` (static registry; one per page):
   - `use(P)`: register a plugin class (shape below); refuse one with no `static id` in one clear `console.warn`.
   - `host(name, obj)`: hand over a host (`"recite"`, `"mic"`). Starts every registered plugin for that host whose `on` is true: `new P({host: obj, settings})`, then `.start()`. Calling it twice with the same object does nothing.
   - `set(id, patch)`: merge into that plugin's settings, save, then `stop()` the live instance and, if `on`, make a new one and `start()` it. Fire `voice-chat-changed` on `document`.
   - `try(id, patch)`: the same, never saved (this page load only).
   - `settings(id)`: defaults ← saved ← override.
   - Store: `localStorage` `voice-chat.plugins.1` = `{<id>: {...}}`. `save()` never writes an overridden key's override value.
   - URL override, read once at load: `?vc.<id>.<key>=<value>` (`1/0/true/false` → booleans, numbers → numbers). `vc.mic.<key>` sets `SETTINGS[key]` from `ext/Chat/Mic.js` for this load and is never saved: change `save_settings()` in `Mic.js` so it writes the saved value, not the override, for each key in an `OVERRIDDEN` set that VoiceChat fills. That is the only behaviour change to `Mic.js` besides item 3.
   - `VoiceChat` is put on `globalThis.VoiceChat` so `VoiceChat.try(...)` works from the console.
2. **`VoiceChat/Plugin.js`**, `class Plugin` (the optional base): `static id`, `static label`, `static host`, `static defaults = {on: true}`, `static fields = []` (`{key, label, kind: "number"|"boolean"|"text"|[options]}`), constructor assigns `{host, settings}`, empty `start()` / `stop()`.
3. **The Features panel.** In `ext/Chat/Mic.js` add `static panel_sections = []` on `ComposerMic`; `settings_panel()` calls each `fn(panel)` and puts what it returns at the TOP of the panel. VoiceChat pushes one function: a "Features" heading, then one row per registered plugin: a toggle (checkbox), its label, and, when on, its `fields` as inputs. A change calls `VoiceChat.set()` and redraws only that section. A plugin under a URL/console override shows "(override, not saved)" after its label. Reuse the panel's existing grid look (no new CSS file unless needed; new class names prefixed `voice-chat-`, checked against `public/framework/styles/css-scopes.txt`).
4. **The first plugin: `VoiceChat/plugins/ThinkingCue.js`**, exactly the example in plan.md section 2: host `recite`, default on, `repeat_ms` 2000; `start()` sets `recite.thinking_cue = true` and `recite.cue_repeat_ms`; `stop()` sets `thinking_cue = false` (and calls `recite.cancel_cue()` so a pending second cue does not fire).
5. **Wire the hosts:** in `ux/Dictate/chat.js`, where `Recite.shared` is first used for this chat (around line 238), call `VoiceChat.host("recite", Recite.shared)`; where the composer's mic exists, `VoiceChat.host("mic", mic)` if a plugin needs it (none does yet, so this can wait). Register ThinkingCue in `VoiceChat/plugins/index.js` (imported once by `chat.js`).
6. **Docs:** `VoiceChat/readme.md` (what it is, the on-disk files, the store key, the override, how to add a plugin: a 10-line example), and one line in `ux/Dictate/readme.md` near the top: "**Voice Chat** is the name for the whole in-browser voice conversation…; its features are plugins: [VoiceChat/readme.md](VoiceChat/readme.md)". Add the same name line to `ux/Dictate/doc/map.md`.

## Prove it

- `VoiceChat/VoiceChat.test.mjs` (node, under 1 s, the `core/Test` shape: look at a sibling `*.test.mjs`, e.g. `audio/Recite/Recite.test.mjs`): use, host starts it, `set(off)` calls stop, `set(on)` starts a fresh one, `try` leaves `localStorage` untouched (stub it), URL override parsed, an overridden key is not saved.
- A headless browser test `ux/Dictate/test/voice-chat-plugins.mjs` (model: `ux/Dictate/test/settings.mjs`; read the "Stub what the page asks Servex" bullet in `ux/Dictate/readme.md`): open the gear, see the Features section with "Thinking cue" checked; uncheck it → `Recite.shared.thinking_cue === false`; reload → still off; `?vc.thinking-cue.on=1` → on, with the override mark, and `localStorage` still says off. Shots of the open panel at 400 and 1920 into `merge-a/shots/`.
- `node public/framework/core/Test/run-all.mjs --browser` from the worktree root (a new browser script runs there only once it is added to `core/Test/browser-scripts.mjs`; add yours) (the TestRunner Servex fence; never the live Servex). No new failures; paste the summary line in your log.
- `node --check` every file you touched.

## Fences

- Touch only: `ux/Dictate/VoiceChat/**`, `ux/Dictate/chat.js` (the host lines and the import), `ext/Chat/Mic.js` (`panel_sections`, `save_settings` override guard), `ux/Dictate/readme.md`, `ux/Dictate/doc/map.md`, `ux/Dictate/test/voice-chat-plugins.mjs`, this folder.
- Don't touch `audio/Recite/BargeIn.js` (`mastermind-playback-stutter` owns it today), `ext/Chat/v1-2/`, `cursors.js`, `Chat.css`.
- With every plugin at its default, the page must behave exactly as today.
- Never kill or restart the dev server or Servex, never drive the owner's tabs, never `git stash`, no `python -`.
- Log in `merge-a/task.jsonl` as you go (`{"log":{"at":"NOW","msg":…}}` via `node .claude/hooks/append.mjs`). End with a one-screen report: commits, test lines, shots.
