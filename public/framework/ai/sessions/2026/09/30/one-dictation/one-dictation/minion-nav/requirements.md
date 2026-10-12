# Minion brief: the session knows where the owner is (merge 3), then one page shows every surface (merge 4)

Load the `minion` skill first, then `code`. Your parent is **task-mastermind-one-dictation**, and its task dir is `public/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/`. Read `owner-words.md` and `requirements.md` there first.

## Where it stands
All four surfaces (the ✦ phone sheet, the ☰ drawer's AI tab, the AI 2 card sidebar and the Live card, and the dev bar) mount [`ux/Dictate/chat.js`](/framework/ux/Dictate/)'s `chat(el, {path, card})` on one global fast/smart session (merges 5ccef5eb and a77bb94e).

## Merge 3: build (worktree `C:\Code\lew42\worktrees\one-dictation`; run `git merge michael/dev` first)
1. **Nav carries the card.** `chat.js`'s `report_nav` sends `Session.nav({session, from, to})` with the page only. Add the selected card (`card` id, or none) and a timestamp, and make `Servex/agents/Sessions.js` write it as an invisible `nav` line into the fast assistant's context.
2. **Pause events.** When the mic stops listening, and when it starts again, write an invisible `pause start` / `pause end` line with a timestamp. Reuse `Session.report_quiet` if it already covers this, and only add what is missing.
3. **Refinement goes to the card selected at the time.** When the smart assistant refines something into a card, it uses the card named by the latest `nav` line before the words were said, not the card that is open now.
4. **The Sessions tab is project-wide.** Add a project-wide recent-sessions endpoint in `Sessions.js` (the `project(s)` helper exists), and use it in `ext/drawer/tabs/sessions.js` instead of the two-query merge.
5. Tests: extend the Sessions test file beside `Sessions.js` (or `layers.test.mjs` if that's where sessions are tested), and run it.

## Merge 4: one page showing every surface
On [`/framework/ux/Dictate/`](/framework/ux/Dictate/), make a child page `surfaces/`, and declare it in the parent's `children:`. It shows the live `chat()` widget mounted the way each surface mounts it: the ✦ sheet, the ☰ drawer tab, the card sidebar and the dev bar. Beside each one, show the one line of code that surface calls (link the source file second). Show it, don't tell it. Load the `page` and `new-page` skills for this part.

## Prove it
Use headless Playwright only (import it from `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`). Never drive the owner's tabs, and never `say()` into a live session: use a fresh test session on the worktree's own server. Shoot the new page at 400, 1920 and 3440. Never restart Servex: say in your report that a restart is needed.

## Fence
`ux/Dictate/chat.js`, `ux/Dictate/page.js`, `ux/Dictate/surfaces/`, `ext/Session/*`, `Servex/agents/Sessions.js` and its test, `ext/drawer/tabs/sessions.js`, and your task dir.

## Land
**Don't merge.** End your turn with one line per item and the shots listed.

