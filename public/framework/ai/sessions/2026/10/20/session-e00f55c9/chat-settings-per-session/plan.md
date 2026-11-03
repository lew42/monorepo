# Plan: Voice Chat features as plugins, set per session, in one Chat settings panel

Brief: [requirements.md](requirements.md). Older plan (census of 21 features, 29 settings, still valid for the feature list): [../dictate-plugins/plan.md](../dictate-plugins/plan.md). Past work: [past-work.md](past-work.md).

## The idea in four sentences

`core/Plugin` already lets a **class** list plugins and switch them on and off. This adds a second level: a **Voice Chat instance** (one per open chat) keeps only its *overrides* (which plugins it switched, which values it changed) and reads everything else from the class. The overrides are a small plain object. That object is what is saved on the voice session, loaded when the session is opened, and copied to the class defaults by "Make default". A new session is an instance with no overrides, so it starts from the defaults.

## Step 1: instance-level plugins in core/Plugin (merge 2; built, in review)

Built on qf-1's per-instance rows (`inst.plugins`, a List of `PluginEntry`, one per class plugin; `enabled`/`config` stay null until this instance overrides them, then read the class record). On top of that (commit a9a75d7df, 28 tests in `core/Plugin/Plugin.test.mjs`):

```js
inst.plugins.find(name).get("enabled" | "config")   // this instance's effective value (own override, else the class); config is merged field by field
inst.plugins.find(name).set({enabled?, config?})    // an override on THIS instance; attach/detach runs for this instance only
inst.overrides                     // plain {Name: {enabled?, config?}}: what is saved on a session
inst.load_overrides(obj)           // replace all overrides; diff against the old ones, run only what changed (same object twice runs nothing)
inst.reset_plugins()               // load_overrides({})
Host.make_default(inst)            // copy inst.overrides into the class records and Plugin.store, clear this instance's overrides, re-run other live followers
```

- A plugin reads its settings from `inst.plugins.find(name).get("config")`. A config change on an instance row stores only the changed fields and re-runs `detach` then `attach` (a plugin with no real `detach` cannot be re-run, so its row reports what is really attached), so a plugin never needs its own "settings changed" code.
- A class-level config change re-runs live instances through `reconfigure_live`, skipping any instance that overrode those fields. A class `disable` still detaches every live instance except one that overrode it on.
- Only an instance's *overrides* are stored on it, never a copy of the class values, so "falls back to the class" needs no copying.

Reference only (not merged): my first draft used `plugin_state`/`set_plugin` on branch `task/chat-settings-per-session` (worktree qf-4); those names do not exist.

## Step 2: Voice Chat on core/Plugin (merges 3, 4, 5)

Merge A (`worktree/dictate-plugins`, `ux/Dictate/VoiceChat/`) is ported, not merged as is: its own registry (`VoiceChat.use/host/set/try/store`) is replaced by core/Plugin.

```
ux/Dictate/VoiceChat/
  VoiceChat.js     class VoiceChat extends Plugin: the class level (VoiceChat.use(...)), one instance per chat: {recite, mic, session}
  plugins/         one file per plugin: static attach(vc), detach(vc), defaults, fields, label
  Features.js      the Features section drawn from VoiceChat.plugins + the instance
  VoiceChat.test.mjs
```

- A plugin is `static attach(vc)` / `static detach(vc)` with `static defaults = {on, ...}` and `static fields = [{key,label,kind,min,max,step}]`. It reads `vc.plugins.find(this.name).get("config")`. Hosts (`vc.recite`, `vc.mic`) are handed to the instance by `chat.js`; `audio/Recite` imports nothing from `ux/` (imports flow down). `stop()` must be safe before `start()` (Merge A finding): an off plugin still gets one `detach` when the instance appears, because Recite's own default may be on.
- The temporary `?vc.<id>.<key>=` override from Merge A is dropped: it was a second override layer, and the instance overrides are now the one layer. (Alternative: keep it as a not-saved override. It wins back if the owner wants it; cost about 20 lines.)
- Plugins, most valuable first, one merge each: **barge-in** (`mode`, `threshold`, `quiet_ms`; `BargeIn` already has the shape), **send on each sentence end** (`SETTINGS.send_on_period/question/comma`, `sentences_per_send`), **thinking cue** (`repeat_ms`; from Merge A), **word highlight**, **tap to pause**, **timings** (`turn_wait_ms`, `update_hold_ms`, `break_pause_ms`, send delay). Features that are tangled in `Mic.js`'s send state machine stay as plain gear rows; each plugin's fields are sliders or numbers.
- Mic-owned numbers (`SETTINGS`): a per-session value lives as a plugin config; the plugin's `attach` writes it onto the mic *instance* (`mic.sentences_per_send`, `mic.resend_ms`, which Mic already supports as per-mic overrides) rather than the global `SETTINGS`, so two sessions never share a value through a global.

## Step 3: one "Chat settings" panel (merge 3)

`ComposerMic.settings_panel()` stays the one panel (law 6). The gear's label becomes **Chat settings** (`ext/Chat/Composer.js`, `DictationBar.js`). Recite's own rows (voice, auto-read, barge-in on/off and threshold) move in as a "Read aloud" group, and the panel gets a **Features** section on top: one toggle per plugin, its fields one tap down. Phone first (360x740); shots at 400 and 1920.

## Step 4: saved with the session (merge 4)

**Store: Servex's per-session settings** (`Sessions.settings({session, ..., plugins})`, kept in `sessions.json` beside `assistant` and the wake knobs; `GET /api/session/<id>` returns `plugins`). Why: the assistant mode and the wake knobs already live there, so one place holds a session's settings; Servex is the one writer, so a phone and a PC see the same value; a new session has no entry, which means "defaults". The alternative, a `{settings}` line in the session's own `session.jsonl` record, replays with the session and survives a copy of its folder, but needs the Session class and its replay taught a new verb and is not readable from the page without a fetch of the file; it wins when the owner wants a session's settings to travel with its folder. The two share the same payload (`inst.overrides`), so moving later is a one-function change.

Flow: opening or switching a session calls `vc.load_overrides(session.plugins ?? {})`; any panel change calls `vc.plugins.find(name).set(...)`, then POSTs `inst.overrides` (debounced); **New session** calls `vc.reset_plugins()` (it starts from defaults). A Servex test covers the `plugins` round trip (set, get, null clears).

## Step 5: Make default (merge 5)

Two buttons at the top of the Features section: **Make default** (`VoiceChat.make_default(vc)`: copies the overrides to the class records and `localStorage` through `Plugin.store`, then clears the session's overrides, since they now equal the default) and **Reset to default** (`vc.reset_plugins()` and POST `plugins: null`). The tricky part is that a class default changes for *every other open chat*; they keep their own overrides, and the ones without an override re-attach with the new values (the "class config change re-attaches" rule in step 1).

## Files, cost, time

- Step 1: `core/Plugin/Plugin.js`, `Plugin.test.mjs`, readme. About $2, 20 min.
- Steps 2-5: `ux/Dictate/VoiceChat/*`, `ext/Chat/Mic.js`, `Composer.js`, `DictationBar.js`, `audio/Recite/*` (only `start/stop` seams), `ux/Dictate/chat.js`, `Servex/agents/Sessions.js` (+ test), docs `ux/Dictate/doc/settings.md`. About $12 across four builds, 2 hours.
- Reviews: `node Server/review.mjs` per merge group, about $3. Total about $17 of the $20.
- Order: each merge keeps Voice Chat working (an empty Features list draws nothing). Worktree `task/chat-settings-per-session`, one branch; merge after steps 1, 2, 3+4, 5.

## Status (updated as merges land)

- Decision 2026-11-03 (vscode-mastermind): ONE core/Plugin implementation. mastermind-voice-system's per-instance rows (`inst.plugins`, commit c8c0af7b2 on worktree/qf-1, merging first) are the base. My own step-1 draft (plugin_state/set_plugin, branch task/chat-settings-per-session, worktree qf-4) is NOT merged; kept as reference. After qf-1 lands I add only: a config change on an instance row re-runs detach then attach; overrides / load_overrides / make_default over the rows.
- Servex half of steps 4 and 5: built in worktree/chat-settings-servex (commits 9a39ff44a and the one after): per-session `plugins` via POST /api/session/settings, shared defaults via /api/session/defaults, 4 tests. The page does not use them yet.
- Make default also saves the defaults on Servex (vscode-mastermind, 2026-11-03): done on the Servex side; the page side will read it at load, with localStorage as the fallback (not built yet).
- qf-1 landed on michael/dev (bc4147365, 2026-11-03).
- Step 1 remainder: built on qf-1 in worktree/chat-settings-plugins (a9a75d7df and after): overrides, load_overrides, reset_plugins, Host.make_default, a config change re-runs detach then attach; 28 core/Plugin tests; page demo and docs. Ready to merge after its review.
- Step 2, first group (Interrupt, ThinkingCue, the VoiceChat class, chat.js wiring, 10 tests): built in worktree/chat-settings-voicechat, stacked on step 1; merges after step 1. Still to port: send on each sentence end, word highlight, tap to pause, timings.
- Open: step 2 remainder, step 3 (Chat settings panel), page side of 4 and 5 (load, save, Make default, Reset to default). None of the five asks is ticked.
