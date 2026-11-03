# Voice Chat: every feature a plugin, set per session, in one Chat settings panel (you are a mastermind, on Sonnet, high effort)

**The owner (2026-11-03, VS Code tab; verbatim in the tab's prompt log).** The dictation and read-aloud systems hold many small rules and thresholds: when to interrupt, when to send, which messages go out. The owner wants each one to be an event-driven plugin that can be switched on and off and configured, and adds:
- **Two levels.** The class registers its plugins (and their defaults) once, so instances don't each do it. Each **instance** can switch and configure them on its own.
- **One panel: "Chat settings".** The gear in Chat (today "Dictation settings") becomes Chat settings, and Recite's settings move into it. The plugin configurators live there.
- **Per session.** The settings belong to the voice session. Configure a session and its settings persist with it. A new session (the **New session** button) starts from the defaults. That lets the owner compare two setups by keeping two sessions.
- **"Make default".** A button that copies the current session's settings to the defaults. The owner says this may be tricky but should be possible.
- Not the session and task systems: this is about Dictate, Recite and Chat.

## What exists (read these first; don't rebuild them)
- **`core/Plugin`** (merged 3b31a21fb): `Host.use(P)`, `Host.plugins` (a List of `PluginEntry` rows with `enabled` and `config`), `Plugin.store`. Today it is **class-level only**. Readme: `core/Plugin/readme.md`.
- **Merge A of the earlier build, never merged:** branch `worktree/dictate-plugins` (worktree `C:/Code/lew42/worktrees/dictate-plugins`, 3 commits ending c7330581d). It has a Voice Chat registry, a Features section in the gear and ThinkingCue as the first plugin, built before core/Plugin existed. Its plan, with the census of 21 features and 29 settings and what Voice Chat needs from a plugin system: `../dictate-plugins/plan.md`. Port it onto core/Plugin; don't keep two registries (law 6).
- **Per-session settings already exist on Servex:** `POST /api/session/settings {session, ...}` holds the assistant mode (`single` or `voice`) and the wake knobs (`Servex/agents/Sessions.js`). The gear's new "voice assistants" row uses it (4dabb5990).
- **The gear panel:** `ComposerMic.settings_panel()` in `ext/Chat/Mic.js` (doc `ux/Dictate/doc/settings.md`). Recite's own settings: `audio/Recite/`.

## Build (follow `core/Task/processes/build.md` by hand; each phase should take minutes, not half an hour)
1. **Instance-level plugins in core/Plugin.** The class keeps the registry and the defaults. An instance gets its own view of the list: an instance's `enabled` and `config` override the class's, and anything it doesn't set falls back to the class. Add `make_default()` (copy an instance's overrides to the class defaults). Tests first, in `Plugin.test.mjs`.
2. **Voice Chat on core/Plugin.** Port Merge A. Then turn the census features into plugins, most valuable first: barge-in (interrupt), send on each sentence end, the thinking cue, word highlight, tap to pause, and the pause and threshold timings. Each threshold is a config field (slider or a number you drag).
3. **One "Chat settings" panel.** Rename the gear, move Recite's rows in, and add a Features section: one toggle per plugin, with its settings one tap down. Phone first (360×740).
4. **Saved with the session.** A voice session's plugin settings persist on that session, readable from the phone and the PC. A new session starts from the defaults. Pick the store: Servex's per-session settings, or the session's own record. Say why in the plan.
5. **"Make default".** One button in the panel, plus a "Reset to default" for the session.

## Plan first, then build
- Write `plan.md` beside this brief: the class sketch for step 1, the files, the tests named before code, and the cost and time.
- Send vscode-mastermind one line when it's written. Don't wait more than 10 minutes for an answer: if none comes, build.
- Merge in small pieces, one for each step above. Each merge must leave Voice Chat working.

**Do:** test first; worktrees; `node Server/review.mjs <this dir> <worktree>`; `node Server/merge.mjs <worktree folder>`; never commit straight to `michael/dev`. In a fresh worktree, run `npm ci` in `Servex/` before a Servex test. **Fences:** commit by path; no `python -`; never test against the live Servex with a real session. **Budget:** about $20. If you're stuck after two honest tries, say so. Report to vscode-mastermind (`send_to_agent` with `id: "vscode-mastermind"`; it reaches the tab's inbox) in 3 lines per merge. At the end, complete your own task and stop.

## The owner's asks (tick only with proof)
- [ ] the dictation and recite rules and thresholds as plugins you can switch on and off
- [ ] registered at the class level, toggled and configured per instance
- [ ] one Chat settings panel (the gear), with Recite's settings in it
- [ ] settings persist with the session; a new session starts from the defaults
- [ ] a "Make default" button
