# Minion brief: chat modes (merge 10)

Load the `minion` skill first, then `code`. Your parent is **task-mastermind-one-dictation**, and its task dir is `public/framework/ai/2026-09-30/one-dictation/`. Read the owner's words first: the last section of `owner-words.md` there, the part that starts "it needs to be configurable".

## What the owner asked
The chat must be configurable: "different modes or different styles". A dictation mode is the Dictate box: entry, Whisper, correction and submission "all in one picture". A chat mode is "more of the chat widget… the full chat experience". The chat on any page can serve users and agents.

## The rule: a mode is a named preset, never a second code path
Law 6. Everything a mode changes already exists: `ext/Chat/Mic.js`'s `SETTINGS` (`send_mode`, `into`, `paragraph_pause_ms`), and `ext/Chat/Chat.js`'s `speak()`, which joins a send into the last bubble from the same sender (`mergeable()`).
1. **The option.** `chat(el, {mode})` in `ux/Dictate/chat.js` and `new Widget({mode})` in `ux/Dictate/Widget.js` take one of two names. The default is `"dictate"`, which is what every surface does today:
   - **`"dictate"`**: voice first. A sentence goes out by itself at its end, and sentences join the last bubble.
   - **`"chat"`**: typed first. Send is Enter or the button (`send_mode: "manual"`), and every send is its own bubble. The mic still works, but it only types into the box.

   Keep the presets in ONE small table (a plain object), so a third mode is one more row. A mode's values apply over the defaults and never write to the owner's saved gear settings. The gear still overrides a mode for that one box.
2. **The bubble rule.** Give `speak()` one opt-out (for example `join: false`), so chat mode never merges. Don't touch anything else in Chat.js.
3. **The demo.** On the Dictate page's main demo (`ux/Dictate/page.js`), put a two-button switch above the chat, Dictate | Chat. It is routed as `?mode=chat` (no query means dictate), so a reload or the back button keeps it. Switching remounts the demo in that mode.
4. **The recommendation.** Write a short section in `ux/Dictate/doc/chat.md`, "Modes, and where the Dictate box sits". Use plain sentences, at most about 120 words. It covers:
   - the Dictate box (entry + Whisper + correction + submit) sits inside the Chat widget, which owns the bubbles;
   - a mode is a preset;
   - the same chat is open to agents, because an agent's reply is a chat line in the same session file, with its own `from`.

   Add one line to `ux/Dictate/readme.md` that links it.

## Proof
- Headless Playwright (import from `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`) on the worktree server (`http://localhost:51812/`), with Servex stubbed as in `minion-chatjoin/proof.mjs`:
  - in dictate mode, two sends make one bubble;
  - in chat mode, two sends make two bubbles;
  - `?mode=chat` survives a reload.
- Shots of the demo in each mode at 400 and 1920, saved in `minion-modes/shots/`.
- Never `say()` into a live session, never drive the owner's tabs, and never restart Servex.

## Fence
`ux/Dictate/chat.js`, `ux/Dictate/Widget.js`, `ux/Dictate/page.js`, `ux/Dictate/doc/chat.md`, `ux/Dictate/readme.md`, `ext/Chat/Chat.js` (the `speak()` opt-out only), `ext/Chat/Mic.js` and `ext/Chat/Composer.js` (only if a preset needs a seam), and your task dir `minion-modes/`.

## Land
Commit in the worktree `C:\Code\lew42\worktrees\dictate-workbench` by exact path. Never commit a `.jsonl` file. End your turn with one line per item (1-4), the commit, and the shot paths.
