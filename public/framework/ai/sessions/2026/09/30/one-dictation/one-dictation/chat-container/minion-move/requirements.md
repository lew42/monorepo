# Minion brief: move the chat widget into ext/Chat (merge 1 of 4, with no change in behaviour)

Load the `minion` skill first, then `code` and `naming`. Your parent is **task-mastermind-one-dictation**. Work only in your served worktree (your parent names it and its port). The whole plan is in [../plan.md](../plan.md). This is merge 1 of 4: a MOVE, nothing else.

## Do
1. Move `ux/Dictate/chat.js` (the `chat()` session mount, `new_session_button()`, `current`/`resume`/`reset`) and `ux/Dictate/Widget.js` (the Widget class, `MODELS`, `model()`) into `ext/Chat/`. Follow the naming rule in CLAUDE.md: a class's folder, file and name match, capitalised. Pick the names with the `naming` skill. For example, the Widget class could become `ext/Chat/ChatWidget.js` exporting `class ChatWidget`, and the mount `ext/Chat/mount.js`; write the names you chose and why in your task.jsonl.
2. The Widget's Dictate-only imports (`Dictate.js`'s `remember_device`/`remembered_device`, `playground/Playground.js`'s `pg`, `ux/Understand`'s `marks`) stay imported from their current homes for now. Merge 2 replaces them with a `voice:` seam. Don't do merge 2 here.
3. Leave `ux/Dictate/chat.js` and `ux/Dictate/Widget.js` as one-line re-exports, `export * from` plus `export { default }`, so the 11 importers (ai2/card.js, ai2/rail.js, dev/DevBar/ask.js, ext/Chat/*, ext/drawer/rail.js, ext/drawer/tabs/ai.js, ext/drawer/tabs/sessions.js, ext/Session/Session.js) keep working unchanged.
4. Move the CSS the Widget owns (`ux/Dictate/Widget.css`) with it, keeping its class names (`ux-dictate-widget-*`) so nothing restyles. Renaming the classes is merge 4.
5. Update `ext/Chat/readme.md` and `ux/Dictate/readme.md` in one line each: the chat widget now lives in ext/Chat, and Dictate is the voice input (merge 2 makes that true).
6. Watch for the import cycle: ext/Chat must not import ux/Dictate/chat.js or Widget.js, only Dictate.js and its own siblings.

## Prove (headless only; stub every Servex call, as in ../../minion-core/proof.mjs)
- At 400, the ✦ sheet; at 1920, the ☰ drawer's AI tab; plus the Dictate page and an ai2 card page. Each loads with zero console errors and looks the same as on michael/dev (shoot both, side by side, into `minion-move/shots/`).
- One typed message and one dictated sentence (fake mic, stubbed Whisper) each give exactly one `say` POST.

## Rules
- Commit by exact path; never commit `.jsonl` files. Don't merge; your parent reviews and merges.
- End your turn with the commit hash, the new file names, and the shot paths.
