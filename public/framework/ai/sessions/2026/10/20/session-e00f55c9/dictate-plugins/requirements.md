# Voice Chat: every feature is a plugin you can switch on and off (you are a mastermind, on Opus: an architecture decision across Dictate, Recite and the chat views)

**The owner (2026-11-02, about 14:20, dictated; verbatim in the tab's prompt log):** "Build this dictation system in a very modular way where we can turn most of these features on and off… our server has a plugin system where we can `class.use` another class. That might be the right shape: each modular feature is a class that hooks into the dictation system… you can reconfigure the plugins via the UI even, and it can rebuild itself dynamically… little toggles for each class. Let's build that." And: "We need to do better at planning."

**The name:** the owner asked for one specific name for the in-browser voice conversation, so it isn't confused with the other voice systems (the Claude app's cloud voice agent, the voice bridge). It is **Voice Chat**: the browser page where you talk (Dictate), it listens (Whisper), the assistants answer, and the replies are read aloud (Recite). Write the name into `ux/Dictate/readme.md` and the map (`ux/Dictate/doc/map.md`). Name the alternative ("voice session" is the record's `kind: "voice"`, and stays the data word).

## Plan first (the owner asked for it). Build nothing until `plan.md` is written.
1. **Find what exists:**
   - the `use()` plugin pattern (`Server/plugins/`, and any `static use` in `public/framework/core`);
   - every feature in Dictate, Recite and the chat views that is a candidate plugin;
   - the settings panel (`ux/Dictate/doc/settings.md`, `Mic.js`), and whether each setting is actually wired up. The owner isn't sure they are.
2. **Write `plan.md`:**
   - the plugin shape: one class, how it hooks in, how it's switched on and off at runtime, how its settings and its toggle show up in the UI;
   - the list of features to move, cheapest and most useful first;
   - for each, its setting, its default and how to test it.
   - Then file each step as a child task of this task (`item` tool, `tasks.add`), so the plan is referenceable.
3. **Candidate plugins:**
   - barge-in: `volume`, or `words` (Whisper text as the interrupt). `mastermind-playback-stutter` is building the `words` option as one class right now ([its brief](../playback-stutter/requirements.md)); fold it in after it lands;
   - the reply wait: about 1 s of quiet to start, longer the longer the owner has been talking ("the longer I talk, the longer the pause should be");
   - the thinking cue;
   - no-flood and agent updates as one line;
   - read-aloud and its highlight;
   - tap to pause;
   - per-bubble replay;
   - the send cursor (`mastermind-v1-2`, [its brief](../v1-2/requirements.md)).
4. **A temporary override that isn't saved:** a URL parameter (for example `?dictate.wake_every=1`) or a console call that changes a setting for this page load only, never written to `localStorage`. The owner: "do a code override to swap to a new setting, without it being permanent."

## Then build, in small merges
The plugin base first, then a settings panel that lists the plugins with a toggle each and rebuilds live, then move features over one merge at a time. Run the browser tests after each merge: `node core/Test/run-all.mjs --browser` (TestRunner Servex fence; never the live Servex). Each merge is one plugin, so it reverts cleanly.

## Do (worktree; `node Server/review.mjs <this dir> <worktree>`; `node Server/merge.mjs`; never commit straight to `michael/dev`)

**Fences:** commit by path; no `python -`. Don't change V1's behaviour by default: a plugin that is on by default does exactly what the code does today. Coordinate with `mastermind-chat-layout`, `mastermind-v1-2` and `mastermind-playback-stutter` (`send_to_agent`) before you touch their files. **Budget:** about $25 (plan about $6, then the plugin base and the settings panel; move the rest as budget allows, and queue what's left as child tasks). Report to vscode-mastermind in 3 lines after the plan, and after each merge.
