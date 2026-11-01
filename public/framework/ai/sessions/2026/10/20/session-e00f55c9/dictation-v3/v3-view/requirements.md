Budget: $9

# Chat V3: every reply, the live reply, markdown, gray only for unsent words, and one version dropdown

Load the `minion` skill first, then the `code` and `ui` skills. Owner's words: [../requirements.md](../requirements.md) and the V3 trail in [../findings.md](../findings.md) §1. The whole plan, and why: [../plan.md](../plan.md) (you are piece A). Readme first: `public/framework/ext/Chat/v3/readme.md`.

**Worktree:** `C:/Code/lew42/worktrees/dictation-v3` (branch `task/dictation-v3`, its own server at `http://dictation-v3.localhost/`). Work and commit only there, by path, after each working step.

**Fence (only these files):** `public/framework/ext/Chat/v3/*`, `public/framework/ext/drawer/ChatView.js`, the lines in `ext/drawer/Sheet.js` and `ext/drawer/tabs/ai.js` that call `this.v2.chip()`, and the drawer CSS the dropdown needs. Another builder works in `audio/`, `ext/Chat/Mic.js` and `ux/Dictate/chat.js` at the same time: do not edit those.

## Build, in this order

1. **Every reply in its Prompt card (read-only).** V3 also reads `{chat}` lines. An owner `{chat}` line carries `prompt` (the Prompt id) and `at`; a smart reply `{chat}` (`from.kind === "assistant"`) carries `re` = the owner line's `at`. Map `at → prompt`, then draw each reply inside that Prompt's card, after any replies already in the Prompt's own `replies` list, deduped by text. A reply whose `re` names no known line goes to the newest Prompt at that time. Never write to the file. Proof: on a copy of `public/framework/ai/sessions/2026/10/25/v-9dvbbrn/session.jsonl`, count replies drawn vs smart `{chat}` lines (expect at least 300 of 316; today it is about 6%). Put both numbers in your log.
2. **The live reply.** Subscribe to the session's wire the way V1 does (`Session.stream(session, ev)`, see `ux/Dictate/chat.js:300`; `ev.kind === "stream"` carries `role` and the partial `text`) and draw the partial reply in the newest Prompt's card; when the settled `{chat}` arrives, it replaces the partial (no double).
3. **Markdown in replies** through `ext/Chat/md.js` (what V1 uses).
4. **Gray only for unsent words.** The `chat-live` draft (unsent Whisper guesses) stays gray. A sentence written to the file is final: draw it solid at once. Remove the 8-second `MOVING_MS` gray. The owner, 2026-10-26 16:26: "light gray to black should be reserved only for the whisper finalization."
5. **One version dropdown.** Replace the `v2` and `v3` chips with ONE button, `Chat V1 ▾` (the current version's name), that opens a menu of V1, V2, V3. Build it exactly like the session dropdown: `ux/Dictate/chat.js:379` `session_switcher()` uses a `button.c("drawer-ai-switch-btn")` plus `popover_menu` from `ux/Popover`. Same look, same class. Keep the `lew42.sheet.chat_view` storage key; V1 stays the default. The mic must keep recording across a switch (V1 stays mounted underneath today; keep it that way).

## Prove it

- Extend `ChatV3.test.mjs` (keep its 19 checks passing): replies drawn from `{chat}` lines, partial-then-settled reply drawn once, markdown rendered, a written sentence is solid, the dropdown switches V1→V3→V2→V1 with the mic still on.
- Shots at 400 and 1200 of the ✦ sheet with V3 on a real session copy, in `shots/` here. Read them yourself.
- Update `ext/Chat/v3/readme.md` and `ext/drawer/readme.md` in the same commit as the code (what it reads, the dropdown). No dated logs in readmes.

**Never:** restart or kill any server or Servex, drive the owner's tabs, stash, run `python`, or write to any real session file. Log progress lines in your own `task.jsonl` (`node .claude/hooks/append.mjs`). If short of budget, cut step 3 first, then the 400 shot.
