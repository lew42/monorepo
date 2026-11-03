# Plan: Voice Chat features as plugins, set per session, in one Chat settings panel

Brief: [requirements.md](requirements.md). Older plan (census of 21 features, 29 settings, still valid for the feature list): [../dictate-plugins/plan.md](../dictate-plugins/plan.md). Past work: [past-work.md](past-work.md).

## The idea in four sentences

`core/Plugin` already lets a **class** list plugins and switch them on and off. This adds a second level: a **Voice Chat instance** (one per Recite, so one per page) keeps only its *overrides* (which plugins it switched, which values it changed) and reads everything else from the class. The overrides are a small plain object. That object is what is saved on the voice session, loaded when the session is opened, and copied to the class defaults by "Make default". A new session is an instance with no overrides, so it starts from the defaults.

## Step 1: instance-level plugins in core/Plugin (merge 2, landed d09621cc5)

Built on qf-1's per-instance rows (`inst.plugins`, a List of `PluginEntry`, one per class plugin; `enabled`/`config` stay null until this instance overrides them, then read the class record). On top of that (commit a9a75d7df, 28 tests in `core/Plugin/Plugin.test.mjs`):

```js
inst.plugins.find(name).get("enabled" | "config")   // this instance's effective value (own override, else the class); config is merged field by field
inst.plugins.find(name).set({enabled?, config?})    // an override on THIS instance; attach/detach runs for this instance only
inst.overrides                     // plain {Name: {enabled?, config?}}: what is saved on a session
inst.load_overrides(obj)           // replace all overrides; diff against the old ones, run only what changed (same object twice runs nothing)
inst.reset_plugins()               // load_overrides({})
Host.make_default(inst)            // copy inst.overrides into the class records and Plugin.store, clear this instance's overrides, re-run other live followers
```

- A plugin reads its settings from `inst.plugins.find(name).get("config")`. A config change on an instance row stores only the changed fields and re-runs `detach` then `attach` (a plugin with no real `detach` cannot be re-run, so its row reports what is really attached), so a plugin usually needs no "settings changed" code. A plugin that holds a mic or a timer open defines `reconfigure(inst)` instead, which core/Plugin calls in place of detach and attach (it only rewrites values).
- A class-level config change re-runs live instances through `reconfigure_live`, skipping any instance that overrode those fields. A class `disable` still detaches every live instance except one that overrode it on.
- Only an instance's *overrides* are stored on it, never a copy of the class values, so "falls back to the class" needs no copying.

Reference only (not merged): my first draft used `plugin_state`/`set_plugin` on branch `task/chat-settings-per-session` (worktree qf-4); those names do not exist.

## Step 2: Voice Chat on core/Plugin (merge 3 is Interrupt and ThinkingCue; then one merge per plugin)

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

## New direction, 2026-11-03 (the owner, via vscode-mastermind; [requirements.md](requirements.md), "Added by the owner"; [principles.md](/framework/ux/Dictate/doc/principles.md), "Settings"): `core/Settings`

The plugin work above stays: it is what holds a setting's value and switches. What changes is the layer above it and where the data lives. Steps 3 to 5 below replace the old "Features section" and "saved on Servex" plans.

```
core/Settings/Settings.js   class Settings: a group of fields with values, an owner, a save policy, render()
  fields   [{key, label, type: toggle | slider | number | select, min, max, step, options, low, high, help}]
           low / high: what the two ends of a slider do (shown under it); help: one plain sentence
  values   own overrides only; get(key) falls back to the defaults (the class level), like core/Plugin
  save     policy: "each" (every change), {debounce_ms}, or "manual"; calls the owner's save(group, overrides)
  render() the panel for this group (and its child groups, in order), says which level it edits: "This session" or "Defaults (new sessions)"
```

- **On a Session:** `session.settings` keeps its plain `{key: value}` merge (the Name / Model form uses it) and gains two groups, `settings.dictate` and `settings.recite`, named after the classes. A group is saved as one line in the session's own `session.jsonl`: `{"settings":{"recite":{<overrides>}}}` (`core/Session/Session.js` already replays `{"settings":…}` lines; a later line wins, per group). The plugin overrides of `VoiceChat` split by the group each plugin declares (`static group = "dictate" | "recite"`): `{"Interrupt":{"config":{"threshold":0.6}}}` sits under `recite`. This replaces `sessions.json` as the home of per-session plugin settings: `Servex/agents/Sessions.js settings({session, plugins})` appends the line instead (one writer, still), `GET /api/session/<id>` reads the replay. Shared defaults for new sessions stay in `session-defaults.json` (class level), with `localStorage` as the fallback.
- **Names close to the code:** a row is labelled with the name it controls and its data path in small type, e.g. `Interrupt.threshold` (`settings.recite.Interrupt.config.threshold`), a status is the state's own name (`listening`, `sending`, `working`, `speaking`).
- **Why a class and not more plugin rows:** the panel, the field types and the save policy are not Plugin's business and any Item may want them; the plugin rows are the values behind it (law 6: one source of values). Alternative: grow `core/Plugin` fields into a panel; it wins only if nothing but plugins is ever configured.

## Step 3: core/Settings (merge 4, tests first)

`Settings.test.mjs` (get/set/defaults fall back, change events, each save policy with a fake clock, overrides round trip), then `Settings.js`, `readme.md`, a demo page (`core/Settings/page.js`) with the four field types. `render()` is checked in a browser shot, phone first (360x740) and 1920. Wired to `VoiceChat` plugin rows through a small adapter: a plugin's `fields` get `low`/`high`/`type`.

## Step 4: session.settings in session.jsonl (merge 5)

`Session.settings` groups (`core/Session`, test in `Session.test.mjs`), the Servex move (`Sessions.settings` appends the line; `sessions.json` `plugins` removed, its Servex tests updated), the page side: opening or switching a session calls `vc.load_overrides(...)` from the groups, a change saves per the save policy, **New session** calls `vc.reset_plugins()`.

## Step 5: the Chat settings panel (merge 6)

The gear says **Chat settings** (`ext/Chat/Composer.js`, `DictationBar.js`); the panel is `settings.render()` in this order: **Dictate: Whisper** (what the mic hears) → **sending to the LLM** (`Send after`: a dropdown of presets with a description each, default "each sentence"; replaces `send_on_period/question/comma` and `sentences_per_send`) → **Recite: read aloud** (voice picker moves here from the toolbar, auto-read) → **Interruption** (its own group: `Interrupt` on/off, mode, sensitivity, quiet_ms). Every slider says what its two ends do; the owner could not tell what interrupt "sensitivity" changed, so it gets the clearest text: low = "only a loud or long interruption stops it", high = "any small sound stops it", plus a live meter if cheap. The two toolbars otherwise stay. **Make default** edits the class level and **Reset to default** drops the session's overrides; the panel header says which level you are editing. The older `Mic.js` rows move into the groups; what is not yet a plugin stays as a plain row under "More".

## Step 6: a status line beside the mic (merge 7)

One line, named as the code names it: `listening` / `sending` / `working` / `speaking`. Read from the state the code already has (`mic` listening, Servex `floor`, `Recite` speaking), never a new copy of state. Phone first.

## Step 7: the remaining plugins (as budget allows): word highlight, tap to pause, timings

Each is one reviewed merge, once the panel can show it (a plugin file plus its fields; no panel work). Optional and later (owner): one Chat widget that owns the area with Dictate and Recite as plugins; not planned here.

Carried from the step 2a review: the bar's switch (`Interrupt.bind`) writes an override even when the value equals the class value, so that chat stops following a later Make default; drop an override that equals the class value (in step 4). `Plugin.store` on the chat page is a Map until step 5 swaps in Servex plus `localStorage`. Interrupt's defaults repeat BargeIn's own; read them from BargeIn (step 5). Test re-enabling Interrupt after a paused-reading detach.

## Files, cost, time

- Spent so far: $22.95 (this mastermind, from `list_agents` at 14:10 on 2026-11-03; reviews are billed to their own reviewer agents, about $0.8 each). Budget now $35, so about $12 remain.
- That covers steps 3 to 5 only if the builds are cheap: a Sonnet minion at low effort builds each step from a brief (files, tests first, how to check), and I review and merge. Rough cost with that: step 3 `core/Settings/*` about $2, step 4 `core/Session/Session.js`, `Servex/agents/Sessions.js` (+ tests), `ux/Dictate/chat.js` about $3, step 5 `ext/Chat/Mic.js`, `Composer.js`, `DictationBar.js`, `ux/Dictate/VoiceChat/*` about $4, reviews about $1 each. Steps 6 and 7 are queued behind the budget (the status line is a small step and is next if money is left); they never start unasked while over.
- Order: each merge keeps Voice Chat working. One worktree per step (`chat-settings-<step>`), merged by me after review.

## Status (updated as merges land)

- Decision 2026-11-03 (vscode-mastermind): ONE core/Plugin implementation. mastermind-voice-system's per-instance rows (`inst.plugins`, commit c8c0af7b2 on worktree/qf-1, merging first) are the base. My own step-1 draft (plugin_state/set_plugin, branch task/chat-settings-per-session, worktree qf-4) is NOT merged; kept as reference. After qf-1 lands I add only: a config change on an instance row re-runs detach then attach; overrides / load_overrides / make_default over the rows.
- Servex half of steps 4 and 5: built in worktree/chat-settings-servex (commits 9a39ff44a and the one after): per-session `plugins` via POST /api/session/settings, shared defaults via /api/session/defaults, 4 tests. The page does not use them yet.
- Make default also saves the defaults on Servex (vscode-mastermind, 2026-11-03): done on the Servex side; the page side will read it at load, with localStorage as the fallback (not built yet).
- qf-1 landed on michael/dev (bc4147365, 2026-11-03).
- Step 1 remainder: built on qf-1 in worktree/chat-settings-plugins (a9a75d7df and after): overrides, load_overrides, reset_plugins, Host.make_default, a config change re-runs detach then attach; 28 core/Plugin tests; page demo and docs. Merged as d09621cc5 (merge 2).
- Step 2, first group (merge 3): the VoiceChat class, Interrupt and ThinkingCue as plugins, `chat.js` makes one VoiceChat per Recite (the page has one reader). 12 VoiceChat tests, 30 core/Plugin tests. core/Plugin gained two small things for it: a plugin may define `reconfigure(inst)` (a threshold slider must not close and reopen the mic) and a constructor arg `overrides` is loaded before attach (no moment of Interrupt on when the browser had it off). Merged as c68d0494e (merge 3).
- 2026-11-03: new direction from the owner (core/Settings, session.settings in session.jsonl, panel order, status line): steps 3 to 7 above are rewritten for it; the plugins still to port from Merge A (word highlight, tap to pause, timings; `worktree/dictate-plugins`, c7330581d) are now step 7. Do NOT port Interrupt or ThinkingCue again. None of the five asks is ticked yet.
- Step 3 (merge 4): `core/Settings` built by minion-settings-build-step3 in worktree/chat-settings-settings (915342569), review fixes after (grouped `load` no longer persists, slider gets the room, this line). 13 tests in `core/Settings/Settings.test.mjs`. `render()` draws one level's fields; the Chat settings panel (step 5) draws the groups under headings. Next: step 4 (`session.settings` in `session.jsonl`, Servex `Sessions.settings` appends the line). Spent so far: $23 of $35. Once the panel lands, check nothing in `worktree/dictate-plugins` is left unported and mark it superseded in `session-e00f55c9/unmerged-work/triage.md` (vscode-mastermind, 2026-11-03).
- Step 4 (merge 5): built by minion-settings-build-step4 in worktree `chat-settings-session` (commit e9ddafafe + a page-side commit). `session.settings` is now a `core/Settings` instance with groups `dictate`/`recite` (`core/Session/Session.js`; flat keys read with `.get(key)`, `SessionSettings.js` updated). `VoiceChat.overrides_by_group()`/`load_grouped()` split/merge by each plugin's `static group` (`Interrupt`, `ThinkingCue` both tagged `"recite"`); also fixed the carried step-2a finding (`Interrupt.bind` drops an override equal to the current class value). Servex `Sessions.settings({session, plugins})` now appends one `{"settings":{dictate,recite}}` line to the session's own `session.jsonl` instead of writing `sessions.json`'s `plugins`; `GET /api/session/<id>` and the response both rebuild the flat shape from the replay (`plugins_of`). Page side: `ux/Dictate/chat.js` `attach()` loads a session's settings on open/switch (`Session.get` + `vc.load_grouped`, new `ext/Session/Session.js` exports `get`/`settings`); a plugin row's `"change"` event posts the merged overrides, debounced 400 ms (wired once per page, beside where `Recite.shared.voice_chat` is made) — a simplification from the brief's "post the changed group": the page always posts the whole current `vc.overrides` (flat), and Servex does the group split, so one POST always carries the complete, correct state either way. Tests: `Session.test.mjs` (+2), `VoiceChat.test.mjs` (+2), `Servex/agents/Sessions.plugins.test.mjs` (rewritten, +1) all green. `session-defaults.json` (shared defaults) untouched, still queued for step 5. Not run live against a real Servex (fences: never test against the live Servex with a real session) — a node-level round trip only.
