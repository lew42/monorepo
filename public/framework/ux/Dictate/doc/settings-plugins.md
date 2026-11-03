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

## Reachable by the item tool

The owner's ask: a Servex side setting as the bridge, so an agent (or a future cross-device sync) can flip a setting with a plain `item` delta like `{plugins:{Interrupt:{enabled:false}}}` on the voice session.

- **Today's bridge, already built**: `POST /api/session/settings {session, gap_ms?, every?, tail?, assistant?}` (`Servex/agents/Sessions.js:355`, called from `Mic.js:388`) — per-session, Servex-side, exactly the shape needed for wake policy. It is the model to extend, not a new mechanism: add a plugin's `{enabled, ...config}` to the same route's body, keyed by plugin id, rather than inventing a second settings endpoint.
- **The gap**: everything else (Recite's parts, most of `SETTINGS`) is `localStorage` only, browser-side, invisible to Servex and to `item`. Wiring a plugin group onto `core/Plugin`'s `Host.use` doesn't by itself make it `item`-reachable — that needs the group's `set_config` to also `POST /api/session/settings` (or a sibling route) so the session record carries it, the way wake policy already does.
- **The per-device open item stands**: ([`ux/Dictate/readme.md`](/framework/ux/Dictate/readme.md#one-session-across-tabs-and-settings-per-device)) "a settings record in Servex, read at load, with the browser's copy as a cache" — this doc's Servex bridge is the mechanism that item already needs; building it answers both asks at once.

## Known gap: core/Plugin's on/off is class-wide

`Host.use(P)`/`unuse(P)` installs or removes the hook for **every future instance of the class** — it does not reach already-live instances. A toggle in the gear panel must change the *live* Recite/Mic instance on this page right now, not just future ones. Another minion is adding per-instance rows to `core/Plugin` for this; this settings panel build should wait on that landing (or, if it lands first, use whatever per-instance mechanism it adds) rather than reinventing live-toggle plumbing here.

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
| Recite | No-flood (hold updates) | `turn_wait_ms` | 2500 | Hold back-to-back replies this long so they read as one. |
| Recite | Interrupt | `quiet_ms` (BargeIn) | — (census: partly wired) | Quiet time after you stop talking before reading resumes. |
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

Five features the census found with **no switch at all** (word highlight is listed above as it has a class but per the census its row is missing; the rest have neither a class nor a setting): the send cursors (✓/🧠), Whisper repeat collapse. These need a plugin class built from scratch, not just a panel row — out of scope for this doc, noted for the build.

## Build order

1. Wait for (or coordinate with) the per-instance `core/Plugin` fix — a toggle must reach the live instance.
2. Port the paused branch's `BargeIn`/`Highlight`/`Tap`/`Bubble`/thinking-cue wrapping onto `core/Plugin.use`, keeping their existing `static id/label/defaults/fields`.
3. Group `Mic.js`'s `SETTINGS` keys into plugin-shaped classes (send timing, wake policy, clean-up) rather than one flat object — each becomes a `fields` list under one toggle, reusing `panel_sections` (`Mic.js:314`) as the insertion point.
4. Extend `POST /api/session/settings` to carry plugin config, so `item` deltas and cross-device sync have one real bridge instead of `localStorage` alone.
