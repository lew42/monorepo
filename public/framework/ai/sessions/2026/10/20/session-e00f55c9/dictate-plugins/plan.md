# Plan: Voice Chat, every feature a plugin you can switch on and off

## ⏸ Paused for core/Plugin (2026-11-02, 14:50)

**Why:** the owner moved the plugin base into the framework: `core/Plugin` (`class Plugin extends Events`, replacing `Server/Events.js`'s `use()`), with a plugins List and a generic toggle and config UI. A separate build process owns that now. Nothing below is merged. The Voice Chat-only registry in section 2 is superseded; the feature list in section 3 still holds.

**What Merge A contains** (branch `worktree/dictate-plugins`, worktree `C:/Code/lew42/worktrees/dictate-plugins`; commits 088d46933, 6a3f7352c, c7330581d; finished and tested, not reviewed, not merged):
- `ux/Dictate/VoiceChat/`:
  - `VoiceChat.js` (registry: use, host, set, try, the store `voice-chat.plugins.1`, the `?vc.<id>.<key>=` override);
  - `Plugin.js` (the base);
  - `Features.js` (the gear's Features section);
  - `plugins/ThinkingCue.js`, `plugins/index.js`;
  - `readme.md`, `VoiceChat.test.mjs` (20 checks, under 1 s).
- `ext/Chat/Mic.js`: `ComposerMic.panel_sections`, an `OVERRIDDEN` set, and `save_settings()` never saving an override.
- `ux/Dictate/chat.js`: one host line (`VoiceChat.host("recite", Recite.shared)`).
- `ux/Dictate/test/voice-chat-plugins.mjs`: browser test, passing at 400 and 1920; shots in [merge-a/shots/](merge-a/shots/).
- The "Voice Chat" name line in `ux/Dictate/readme.md` and `doc/map.md`.
- One finding worth keeping: a plugin saved *off* must still get one `stop()` when its host arrives, because the host's own default may be on (Recite's `thinking_cue = true`). So `stop()` must be safe before `start()`.
- A second worktree, `dictate-plugins-test` (http://127.0.0.1:50703), was made only to serve the browser test. Remove it with `node Server/worktree-down.mjs dictate-plugins-test` once nobody needs it.

**The feature census** ([census/census.jsonl](census/census.jsonl), 21 features):
- 29 settings: 23 wired, 6 partly wired, 0 that do nothing.
- Partly wired (they work but have no panel row and are not saved): `thinking_cue`, `cue_repeat_ms`, `turn_wait_ms`, `update_hold_ms`, `BargeIn.quiet_ms`, Servex `answer_quiet_ms`.
- 5 features with no switch at all: word highlight, tap to pause, per-bubble replay, the send cursors, Whisper repeat collapse.

**What Voice Chat needs from core/Plugin:**
1. **Hosts that don't import the registry.** `audio/Recite` must not import `ux/` or a plugin list, so a plugin attaches to a host it is handed (`host(name, obj)`, or `Host.use(P)` with the host never knowing the list).
2. **Switch off live:** `stop()` undoes `start()` exactly; a setting change is stop, then start with the new values.
3. **Settings per plugin:** `static defaults` (with `on`), and `static fields` (key, label, kind) that drive the generic config UI.
4. **One saved store, plus a not-saved override:** a URL parameter and a console call that last one page load. Saving must never write an overridden value.
5. **The generic UI must fit inside an existing panel** (here the gear's `settings_panel()`), not only on its own page.
6. **An off plugin gets one `stop()` when its host arrives** (the finding above).
7. **Wrapping is enough:** existing classes (`Recite.Tap`, `Highlight`, `Bubble`, `BargeIn`) get `start()`/`stop()` and stay built by their host.

**Barge-in is ready to plug in** (row 9): `mastermind-playback-stutter` landed it on `michael/dev` at b0fce2e7f. `audio/Recite/BargeIn.js` already has the plugin shape: `static id = "barge"`, a label, `defaults {on, mode: "volume"}` (or `"words"`), and `start()`/`stop()`, with no `ux/` import. `BargeIn.js` and `Recite.js` are free to edit again.

**To resume:** port `VoiceChat.js` onto `core/Plugin` (most of it should become a thin list of plugins), keep ThinkingCue and the tests, then do section 3's rows 4 to 11 one merge each. The child tasks on this task's log are still the queue.

**What it is:** each Voice Chat feature (barge-in, the thinking cue, read-aloud highlight, tap to pause…) becomes one class with an on/off switch. The gear panel lists them, one toggle each, and switching one takes effect at once, with no reload. Brief: [requirements.md](requirements.md). Census of what exists: [census/census.jsonl](census/census.jsonl).

**The name:** *Voice Chat* is the browser experience as a whole: you talk (Dictate), Whisper listens, the assistants answer, Recite reads the replies aloud. *Voice session* stays the data word (the record's `kind: "voice"`). The Claude app's call is the *cloud voice agent*; the Claude app bridge is the *voice bridge*.

## 1. What already exists (and is reused)

- **`use()` twice already.** `Server/Events.js:91` (`Server.use(Plugin)` → `Plugin.setup(instance)` on every new instance) and `core/Page/Page.class.js:39` (`Page.use(Ext)` → `Ext.setup(page)`). Neither can switch a plugin off or has settings. Voice Chat keeps the same word, `use`, and adds the two things that are missing: `stop()` and settings.
- **Recite's parts are already separate classes:** `Recite.BargeIn`, `Recite.Highlight`, `Recite.Tap`, `Recite.Bubble` (`audio/Recite/`), built in Recite's constructor (`Recite.js:66-68`). They are most of the way to plugins: each needs only `start()` and `stop()`.
- **Some features are already a flag:** `Recite.thinking_cue` (`Recite.js:47`), `BargeIn.on` (saved as `lew42.recite.barge`).
- **The gear panel** is `ComposerMic.settings_panel()` (`ext/Chat/Mic.js:314`), values in `SETTINGS` (`Mic.js:13`, saved as `localStorage` `chat.mic.settings.4`). One panel stays one panel (law 6): the plugin list is a new section at its top, never a second panel.
- **Three settings stores today:** `chat.mic.settings.4` (the mic), `lew42.recite.*` (Recite's voice, barge on/off, threshold), and Servex's per-session wake knobs. Plugins get one store; the old keys are read once as the starting value, so nobody's saved choice is lost.

## 2. The shape

```
ux/Dictate/VoiceChat/
  VoiceChat.js     class VoiceChat — the registry: use(), start(), set(), try(), the store, the URL override
  Plugin.js        class Plugin — the optional base for a NEW feature class (static id/label/defaults/fields, start/stop)
  VoiceChat.test.mjs   one lean node test (core/Test rule)
  plugins/         one file per plugin that is not already a class somewhere (ThinkingCue.js, ReplyWait.js, …)
  readme.md
```

**A plugin is any class with this shape** (duck-typed, so `audio/Recite/BargeIn.js` can be one without importing anything from `ux/`; imports flow down):

```js
class ThinkingCue extends Plugin {
	static id = "thinking-cue";
	static label = "Thinking cue: a soft tone while a reply is on its way";
	static host = "recite";                         // which object it hooks into
	static defaults = { on: true, repeat_ms: 2000 }; // on = today's behaviour
	static fields = [{ key: "repeat_ms", label: "second cue after (ms)", kind: "number" }];
	start(){ this.host.thinking_cue = true; this.host.cue_repeat_ms = this.settings.repeat_ms; }
	stop(){ this.host.thinking_cue = false; }        // leaves the host exactly as with the feature off
}
VoiceChat.use(ThinkingCue);
```

- **Hooking in:** `VoiceChat.use(P)` registers a class. A host is handed over once, where it is first used: `VoiceChat.host("recite", Recite.shared)` and `VoiceChat.host("mic", composer_mic)`, called from `ux/Dictate/chat.js` (and the ✦ Sheet). The host never imports VoiceChat, so the Recite page and its tests run exactly as now.
- **On and off at runtime:** `VoiceChat.set(id, {on: false})` calls `stop()` on the live instance, saves, and redraws the panel; `{on: true}` makes a new instance and calls `start()`. A changed setting is `stop()` then `start()` with the new values, so a plugin never needs its own "settings changed" code.
- **Existing classes wrap, not move:** Recite still builds `barge`, `highlight` and `tap` itself. Their plugin entry just calls `recite.tap.start()` / `stop()`. So a page without Voice Chat (the Recite demo) is unchanged.
- **The store:** `localStorage` `voice-chat.plugins.1` = `{ "<id>": {on, …settings} }`. Device-local, like today; the owner's "one set everywhere" (a settings record in Servex) is the readme's existing ⬜ and fits behind `VoiceChat.load()`/`save()` later.
- **The temporary override (never saved):** `?vc.<id>.<key>=<value>` in the URL (`?vc.thinking-cue.on=0`, `?vc.mic.wake_every=1` for a gear setting), or in the console `VoiceChat.try("thinking-cue", {on: false})`. Both change this page load only. `save()` writes the stored values for every overridden key, so an override never leaks into `localStorage`. The panel shows an "override (not saved)" mark on that row. The alternative, `?dictate.wake_every=1` (the brief's example), reads as Dictate-only; `vc.` covers the plugins and the mic.
- **The panel:** `ComposerMic.panel_sections` (a static list, `ext/Chat/Mic.js`) gets one function from VoiceChat; `settings_panel()` calls each and prepends what it returns. VoiceChat's section is a "Features" list: a toggle per plugin, its label, and its fields under it when on. A toggle redraws the section in place.

**Alternatives considered:**
- *A shared `core/Plugin` for the whole framework.* Wins once a second system needs on/off plugins; today only Voice Chat does, and moving `Page.use`/`Server.use` onto it is a dozen-caller change (CLAUDE.md "ask before"). `Plugin.js` is written so it can move there unchanged.
- *A new top-level module `ux/VoiceChat/`.* Cleaner tier-wise (it composes Dictate and Recite), but adds a module and a readme for what is today one registry. It moves with a scripted rename if it grows.
- *Each host owns its own `use()` (`Recite.use(P)`, like `Page.use`).* No central list, so no one panel; rejected.

## 3. The features, cheapest and most useful first

| # | Plugin | Host | Default (= today) | Setting | Test |
|---|---|---|---|---|---|
| 1 | base: `VoiceChat`, `Plugin`, store, override | — | — | — | `VoiceChat.test.mjs`: use, start, set off/on, try not saved, URL override |
| 2 | **Features panel** in the gear | mic panel | — | one toggle per plugin | headless: open gear, toggle, row redraws, reload keeps it, `?vc.` shows the mark |
| 3 | **Thinking cue** | recite | on | `repeat_ms` 2000 | headless: off → no `thinking cue` trace after an owner line; on → one |
| 4 | **Tap to pause** (`Recite.Tap`) | recite | on | — | headless: off → a tap on a bubble leaves playback as is |
| 5 | **Read-aloud highlight** (`Recite.Highlight`) | recite | on | — | headless: off → no highlight marks while reading |
| 6 | **Per-bubble replay** (`Recite.Bubble`) | recite | on | — | headless: off → no ▶ control on reply bubbles; on → back without reload |
| 7 | **No-flood** (agent updates held, one line) | recite | on | `turn_wait_ms` 2500 | `Recite.test.mjs` case: off → an update plays at once |
| 8 | **Reply wait, adaptive** (new) | recite | **off** (V1 unchanged) | `base_ms` 1000, `per_talk_s_ms` 100, `max_ms` 4000 | node: wait grows with talk length; headless: 3 s of talk → ~1.3 s wait |
| 9 | **Barge-in**, `volume` or `words` | recite | on, `volume` | `mode`, `threshold` | after `mastermind-playback-stutter` lands its `words` class |
| 10 | **Send cursor** (V1.2) | chat | on | — | after `mastermind-v1-2` lands |
| 11 | **Whisper repeat collapse** (`ux/Dictate/repeat.js`) | mic | on | — | `repeat.mjs` with it off: the repeated tail stays |

**Are the gear's settings wired? Yes** ([census](census/census.jsonl), 21 features, 29 settings; one checked by hand: `break_pause_ms` is read at `ext/Chat/Mic.js:112`, `send_on_comma` at `:684`):
- **23 wired:** all 19 `SETTINGS` keys in `ext/Chat/Mic.js`, and Recite's four saved values (auto-read, barge-in on/off, threshold, voice).
- **6 partly wired** (they change behaviour, but have no panel row and are not saved): `thinking_cue`, `cue_repeat_ms`, `turn_wait_ms`, `update_hold_ms`, `BargeIn.quiet_ms`, and Servex's `answer_quiet_ms` (an environment variable only). Each becomes a field of its plugin above, so it gets a row.
- **No switch at all today:** word highlight, tap to pause, per-bubble replay, the send cursors, repeat collapse. Rows 4, 5, 6, 10, 11 give each one.
- **Barge-in has no `words` option yet**; `mastermind-playback-stutter` is building it (row 9).
- **Tangled, so later:** the send delay, safety chunks, clean-up and send mode live inside the send state machine in `Mic.js`; they stay plain gear settings, not plugins.

Steps 1 to 3 are one merge (a panel with nothing in it shows nothing). Then one plugin per merge, so each reverts cleanly. The reply wait is default off because the brief says on-by-default must equal today; the owner turns it on with one toggle, or tries it with `?vc.reply-wait.on=1`.

## 4. Order and budget

- Plan: this file (≈$4 so far, Opus).
- Merge A (steps 1–3): a Sonnet minion in worktree `worktree/dictate-plugins`, ≈$6, then a review, then merge.
- Merges B–D (steps 4–7): one Sonnet minion, one plugin per commit and merge, ≈$5.
- Merge E (step 8, reply wait): ≈$3.
- Steps 9–10 wait for their owners to land; 11 depends on the census. Queued as child tasks.

Each merge: `node core/Test/run-all.mjs --browser` (TestRunner Servex fence), `node Server/review.mjs`, `node Server/merge.mjs`.
