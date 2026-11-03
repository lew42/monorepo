# The gear panel, organized: Recite and Dictate, one plugin group each

**The problem:** the gear ("Dictation settings") is one flat list of unrelated knobs — send delay, wake timing, Recite's voice, barge-in's threshold — mixed together in `ext/Chat/Mic.js`. A feature's on/off switch and its config are not grouped, and nothing says which knob belongs to which feature.

**The fix:** two sections, **Recite** and **Dictate**, each a list of plugin groups built on [`core/Plugin`](/framework/core/Plugin/readme.md). Each group is one row: a live on/off switch first, its config fields under it when on, and a one-line plain-words description that opens when you click the plugin's name.

## Reuse: the dictate-plugins worktree

A paused build already did most of this design: `worktree/dictate-plugins` (plan at [`/framework/ai/sessions/2026/10/20/session-e00f55c9/dictate-plugins/plan.md`](/framework/ai/sessions/2026/10/20/session-e00f55c9/dictate-plugins/plan.md)), finished and tested but never merged — paused 2026-11-02 when the owner moved the plugin base into the framework as `core/Plugin`, superseding that branch's own registry (`VoiceChat.js`/`Plugin.js`). Still good:

- **The feature census**, 21 features, which settings are wired/partly-wired/missing (`census/census.jsonl` beside the plan).
- **The shape of a plugin class**: `static id`, `static label`, `static defaults` (`{on, ...config}`), `static fields` (what the panel draws), `start()`/`stop()` wrapping an existing object (Recite's `BargeIn`, `Highlight`, `Tap`, `Bubble` parts already have most of this — `BargeIn.js:25-27` already has `static id = "barge"`, `static label = "Interrupt"`, `static defaults = {on: true, mode: "volume"}`).
- **The override rule**: a URL param or console call for one page load only, never saved — still the right answer, now expressed as `core/Plugin`'s `Plugin.store`.
- **The panel-fits-in-an-existing-panel rule**: the new grouping is a section inside `ComposerMic.settings_panel()` (`ext/Chat/Mic.js:314`), not a second panel.

**Not reused:** the branch's own `VoiceChat` registry class — `core/Plugin` replaces it. Delete/ignore `ux/Dictate/VoiceChat/VoiceChat.js` and `Plugin.js` on that branch; keep `ThinkingCue.js` and the test shapes as a worked example to port onto `core/Plugin`.

## The two sections

- **Recite** (`audio/Recite/`): the parts that are already separate classes — `BargeIn` (interrupt), `ReciteHighlight` (read-aloud highlight), `ReciteTap` (tap to pause), `ReciteBubble` (per-bubble replay) — plus `thinking_cue` (today a flag on `Recite` itself, `Recite.js:47`) and `turn_wait_ms`/`cue_repeat_ms` (today loose numbers, no panel row at all per the census).
- **Dictate** (`ext/Chat/Mic.js` `SETTINGS`): send mode, pause/sentence timing, fillers, clean-up, wake policy (`wake_gap_s`, `wake_every`), assistant pick. Most of these are really one plugin each ("pause send", "wake policy") rather than loose keys; group by feature, not by field.

## core/Plugin as the base (read `core/Plugin/readme.md` before building)

Each group becomes `static attach(instance)` / `detach(instance)` plus `static defaults` and `static fields`, used as `Host.use(Plugin)`. Key facts from the live system (not the paused branch's own words):

- The row key the panel writes is **`enabled`**, not `on` — `Item.set` reads a bare `on` as a call to `Events.on`. The plugin classes above (`BargeIn.defaults = {on: true, ...}`) predate this and use `on`; wrapping them as a `core/Plugin` means the **row** says `enabled`, and the row's `set_config`/`set_enabled` is what calls into the wrapped object's own `on` field — don't conflate the two.
- Saved state: `Plugin.store`, key `plugin.<Host>.<Plugin>` = `{on, config}`, only written when changed through a row — so per-device for now, which matches the open item below.
- A plugin can have its own sub-plugins (`row.plugins`), which is one way to nest "Recite → BargeIn → mode" if a group ever needs it, but a flat `fields` list (as `BargeIn.defaults.mode` already works today) is simpler and should be tried first.

## Reachable by the item tool: built by mastermind-chat-settings, not here

`mastermind-chat-settings` built this bridge on `michael/dev` (`7d32afd51`): a voice session's plugin switches are one plain object, `{Name: {enabled?, config?}}`, kept in the session record (`POST /api/session/settings {session, plugins}`, `GET /api/session/<id>`) so a phone and a PC read the same, plus shared defaults ("Make default": `POST`/`GET /api/session/defaults`). Full shape, both checked by `checked_plugins()` in `Servex/agents/Sessions.js`, and the page-side read-at-load (not yet built, Servex side only): [`ux/Dictate/doc/settings.md`](settings.md#plugin-settings-per-session-and-make-default-servex-side). This doc does not design a second bridge — the panel this doc builds is the page side that calls it, same as the owner-feedback "Overlap" bullet says (plugins and settings are chat-settings' to build).

## The per-instance toggle: built, in core/Plugin itself

`Host.use(P)`/`unuse(P)` is class-wide and does not reach an already-live instance on its own, but a panel does not need to solve that: `core/Plugin` now has `inst.plugins` for exactly this ([`core/Plugin/readme.md`](/framework/core/Plugin/readme.md), "`inst.plugins`") — one row per class-level plugin, starting unset so it follows the class row, switched for just this instance with `toggle_plugin` the moment the panel's row is touched, and that instance's own wish then wins over a later class-wide `enable()`/`disable()`. The gear panel's "live on/off switch" (above) is this: `inst.plugins.find(name).set({enabled})`, same `PluginEntry` shape as the class list.

## The settings table (today's knobs, as the build starts from)

| Section | Plugin / group | Setting | Default | Description |
|---|---|---|---|---|
| Recite | Interrupt (`BargeIn`) | `enabled` | on | Stop reading aloud when you start talking. |
| Recite | Interrupt | `mode` | `"volume"` | Detect you talking by loudness, or by recognized words. |
| Recite | Read-aloud highlight (`ReciteHighlight`) | `enabled` | on | Highlight the words as they're read aloud. |
| Recite | Tap to pause (`ReciteTap`) | `enabled` | on | Tap a reply to pause or resume reading it. |
| Recite | Per-bubble replay (`ReciteBubble`) | `enabled` | on | Show a ▶/⏸ and ↺10 control on every reply. |
| Recite | Thinking cue | `enabled` | on | Play a soft tone while a reply is on its way. |
| Recite | Thinking cue | `cue_repeat_ms` | 2000 | How often the tone repeats while still waiting. |
| Recite | Turn-taking | `turn_wait_ms` | 2500 | Quiet needed before a freshly queued reply starts over you (the 1 s floor, `Recite.min_quiet_ms()`). |
| Recite | No-flood (hold updates) | `update_hold_ms` | 4000 | How long an agent update waits for the direct answer before it is queued anyway. |
| Recite | Interrupt | `quiet_ms` (BargeIn) | — (census: partly wired) | Quiet time after you stop talking before reading resumes. |
| Recite | Interrupt | `resume_after_cut` | off | When you cut a reply off, pick it back up once you're quiet, instead of cancelling it outright (console-only today: `Recite.set_resume_after_cut`). |
| Dictate | Send timing | `send_mode` | `"pause"` | Send on a pause, or send each finished sentence. |
| Dictate | Send timing | `pause_send_ms` | 2000 | Quiet before everything on screen is sent. |
| Dictate | Send timing | `paragraph_pause_ms` | 2000 | Quiet after a finished sentence that sends everything so far. |
| Dictate | Send timing | `sentences_per_send` | 1 | Send after this many finished sentences. |
| Dictate | Send timing | `early_sentences` | true | Send a sentence the moment it ends, not only at the pause. |
| Dictate | Punctuation cuts | `send_on_period` / `send_on_question` / `send_on_comma` | true / true / false | Which punctuation marks end a send. |
| Dictate | Clean-up | `clean` | true | Tidy up filler and false starts before showing your words. |
| Dictate | Clean-up | `fillers` | "ah uh um er erm hmm mm" | Words dropped as filler. |
| Dictate | Wake policy | `wake_gap_s` | null (Servex default 12s) | Quiet seconds before the smart assistant hears a batch. |
| Dictate | Wake policy | `wake_every` | null (Servex default 1) | Or this many sentences, whichever comes first. |
| Dictate | Wake policy | `assistant` | undefined | Which assistant seat answers this session. |
| Dictate | Box | `box_lines` | 3 | How many lines the growing text box shows before scrolling. |
| Dictate | Destination | `into` | `"chat"` | Dictated words go into the chat log, or into a plain text box. |
| Dictate | Server answer wait | `answer_quiet_ms` | 2500 | Quiet before a spoken line reaches the fast seat (Servex-side, `Sessions.js:246`). |

Five features the census (`wired: false`) found with **no switch at all**: word highlight, tap-a-bubble-to-play/pause and per-bubble replay (all three already have a class — `ReciteHighlight`, `ReciteTap`, `ReciteBubble`, listed above — just no setting or panel row yet), plus the send cursors (✓/🧠) and Whisper repeat collapse (neither has a class or a setting). The first three are a panel row each, reusing the existing class; the last two need a plugin class built from scratch — out of scope for this doc, noted for the build.

## Build order

1. Port the paused branch's `BargeIn`/`Highlight`/`Tap`/`Bubble`/thinking-cue wrapping onto `core/Plugin.use`, keeping their existing `static id/label/defaults/fields` — the per-instance toggle they need (`inst.plugins`) is already there.
2. Group `Mic.js`'s `SETTINGS` keys into plugin-shaped classes (send timing, wake policy, clean-up) rather than one flat object — each becomes a `fields` list under one toggle, reusing `panel_sections` (`Mic.js:314`) as the insertion point.
3. Call the bridge `mastermind-chat-settings` already built (above) from each plugin group's `set_config`/`set_enabled`, so `item` deltas and cross-device sync reach it instead of `localStorage` alone.
