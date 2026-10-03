# Chat is the container, Dictate is its voice input

**The owner's direction** (via vscode-mastermind, 2026-10-02): today the chat is built INTO Dictate. Flip it. The CHAT widget is the container, the one component that goes in the drawer, the dev bar, a card or the sheet. Dictate is only its voice input (mic, segments, live clean), plugged into the chat's composer. The fast assistant refines the owner's messages with the `prompt-refine` skill, using `ext/Refine/engine.js`.

**Today:**
- `ux/Dictate/chat.js` holds the session mount, `chat()` and `new_session_button()`.
- `ux/Dictate/Widget.js` holds the thread and the composer shell, built on `ext/Chat`'s `speak`, `composer` and `sticky_scroll`.
- `ext/Chat/Mic.js`'s `ComposerMic` extends `ux/Dictate/Dictate.js`. So the chat lives under Dictate, and the voice code lives under Chat.

## Small merges, in order
1. **Move (no change in behaviour).** `chat()`, `new_session_button()` and the Widget move into `ext/Chat`. The old `ux/Dictate/chat.js` and `Widget.js` paths become one-line re-exports, so all 11 importers keep working. Proof: every surface (the ✦ sheet, the ☰ drawer, the Dictate page, an ai2 card, the dev bar Ask) looks the same and sends once. [brief](minion-move/requirements.md)
2. **Voice plugs in.** `Mic.js`'s `ComposerMic` moves to `ux/Dictate` as the voice input. The composer gets an input seam (`voice:`), and `chat()` plugs Dictate's voice in by default. The chat no longer imports Dictate except through that one seam.
3. **Refine.** Dictate's live clean step calls `ext/Refine/engine.js`'s `clean(text, {prev, model: "deepseek/deepseek-v4.1-flash"})` (Haiku took 123 s a call). `Servex/agents/session-fast.md` loads the `prompt-refine` skill. This merge also covers checklist item 6 (Clean transcribe) and the mobile Raw/Clean tabs bug. It waits for engine.js to land.
4. **Tidy.** Point the importers at the new paths, delete the re-export files, and make the Dictate page show the voice input on its own, inside the chat.
