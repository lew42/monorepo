# Minion brief: merge 13, clean transcribe

Load the `minion` skill first. Your parent is **task-mastermind-one-dictation**. Read `public/framework/ai/2026-09-30/one-dictation/checklist-2026-10-01.md`: you own item **6**. Merges 11 (one widget) and 12 (the dot) have landed.

## Why
The owner's words: a "clean UI" checkbox, a toggle in settings. While it's on, speech is transcribed straight into the outgoing chat bubble, with no text area and no Send button. Today's text-area mode works and stays as the other choice. The owner said it is "maybe the default".

## What exists (finish it, don't start a second one: law 6)
`ai/2026-10-01/clean-dictate-mode/` ended without landing because it had no shell. It left this behind:
- `MODES.live = { into: "chat", bubble: true }` in `ux/Dictate/Widget.js`;
- `Widget.Thread.live()`, which draws the words being spoken as a growing bubble;
- the `on_live` hook passed to the composer.

None of it was ever run. Read that task's task.jsonl first.

## Do
1. **The checkbox:** a "Clean" checkbox in the mic's gear (`ext/Chat/Mic.js`, the settings rows around line 342), saved in `SETTINGS` like every other setting, so it holds on every surface at once. Its label: "Clean: words go straight into the chat, no text box". It is **off by default** for now. (The alternative was on by default. That was rejected until the owner has tried it, because the text box is the mode that's proven to work.)
2. **When it's on:**
   - Every `chat()` mount (the demo, the ✦ sheet, the ☰ drawer) behaves like `mode: "live"`. Read the setting where the mode preset is applied (`Widget.js`, around line 820), not as a second code path.
   - The text area and the Send button are hidden, and the mic and the dot stay.
   - Spoken words grow in an outgoing bubble and send on the same pause rule (autosend).
   - Turning it off brings the box back at once, with no reload.
3. **Keep `mode: "live"` as the only name for this inside the code.** The gear setting just switches it on. Update `ux/Dictate/doc/chat.md`'s modes section and `doc/widget.md`.

## Prove (headless Playwright, never the owner's tabs; stub every Servex call as `minion-chatjoin/proof.mjs` does)
- **Checkbox on:** feed the mic a partial result and then a final transcript through the same path real recognition takes. A growing bubble shows, then one sent bubble after the pause. No text area or Send button is in the DOM, or they're hidden. Check the demo and the ✦ sheet.
- **Checkbox off:** the box is back, and the same words land in it.
- **Shots** of both states at 400 and 1920 (`minion-clean/shots/`).

## Rules
- Work in your worktree only. Commit by exact path, and never commit `.jsonl` files.
- Run `node Server/review.mjs` on your task dir and answer every finding.
- End your turn with the commit hash and the shot paths.
