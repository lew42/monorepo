# Minion brief: the one chat, merge 2 (every surface looks right)

Load the `minion` skill first, then `code`, `css` and `ui-test`. Your parent is **task-mastermind-one-dictation**, and its task dir is `public/framework/ai/2026-09-30/one-dictation/`. Read `owner-words.md` and `requirements.md` there first.

## Where it stands
Merge 1 is in michael/dev (5ccef5eb). [`ux/Dictate/chat.js`](/framework/ux/Dictate/)'s `chat(el, {path, card, placeholder})` is now the one chat on the ✦ phone sheet (`ext/drawer/rail.js`), the ☰ drawer's AI tab (`ext/drawer/tabs/ai.js`) and the AI 2 card's own sidebar (`ai2/card.js`). Don't change its API. If it needs a change, extend it and say so.

## Build, in this order (commit each one by exact path)
Work in worktree `C:\Code\lew42\worktrees\one-dictation`. Run `git merge michael/dev` there first.
1. **Text size at wide screens.** At 3440 the drawer chat's text and composer are tiny (see `shots/after-drawer-ai-3440.png` beside `shots/before-drawer-ai-3440.png`). Use the site's existing scaling tokens, not a new px size.
2. **One frame around the card chat.** On the card sidebar, the "Talking into this card — …" head sits above a second framed box. Make it one frame.
3. **The Live card's old fold.** `ai2/page.js` ~line 1207 draws "Assistant: ask it about what is running", the old per-card assistant. Make it a `chat()` mount, or remove it if the card's sidebar chat already covers it. Keep the old one reachable as a named v1.
4. **Markdown in replies.** Replies show raw backticks around paths (`minion-card/shots/now-1920.png`). Render them the way the site already renders markdown in chat (look in `ext/Chat` and `ux/Dictate`, and reuse what exists).
5. **Icons on the owner's bubbles.** The owner: the bubbles "used to have icons". Look at `git show a7050005^1:public/framework/ext/Chat/Chat.css` and the matching Chat.js to see what they were, and bring them back in `ux/Dictate/Widget.js`/`Widget.css`.
6. **The phone sheet collapses to one line.** The owner: "a resizable sheet that can collapse to one line". Dragging the ✦ sheet's top edge down leaves only the composer row (box, mic and Send on one line). Never regress the rail: `?sheet=open` / `?sheet=full` and the phone's back button keep working.
7. **The dev bar's chat mode** (`dev/DevBar/`, look at `ask.js`/`says.js`) mounts `chat()` instead of its own chat, and keeps the old one reachable as a v1.

## Prove it
Use headless Playwright only (import it from `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`), with a script in your scratchpad. Never drive the owner's tabs, and never `say()` into a live session. Seed `sessionStorage["lew42-voice-session"]` with `{"session":"v-gck9buj","file":"/framework/ai/2026/09/30/now/ai/v-gck9buj.jsonl","card":"2026/09/30/now"}`. Copy that file into the worktree at the same path, and never commit the copy. Shoot each surface at 400, 1920 and 3440×1440, plus the collapsed sheet at 400. Report the computed font and bubble count on each, and save the shots in your task dir.

## Fence
`ux/Dictate/*`, `ext/drawer/rail.js`, `rail.css`, `drawer.css`, `tabs/ai.js`, `ai2/card.js`, `ai2/page.js` (the Live fold only), `ai2/ai2.css` (the chat column only), `dev/DevBar/*` (its chat mode only), and your task dir. Keep code comments to a few lines each.

## Land
**Don't merge.** End your turn with one line per item and the shots listed.

