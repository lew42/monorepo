# Minion brief: the main Dictate demo becomes the workbench (merge 7)

Load the `minion` skill first, then `code`, `ui` and `layout`. Your parent is **task-mastermind-one-dictation**, and its task dir is `public/framework/ai/2026-09-30/one-dictation/`. The owner's words are the last section of `owner-words.md` there ("the Dictate page is the workbench"). Read them first.

## The rule
The main demo on `/framework/ux/Dictate/` is THE workbench. It is where the one chat widget is shown and tested, and a change there must reach every sidebar and sheet. Today it is a bare `new Widget({level, source, debug})` in `ux/Dictate/page.js` with no session, so nobody answers. Every other surface calls `chat(el, opts)` in `ux/Dictate/chat.js`, which draws the same `Widget` and wires it to the session. Read `ux/Dictate/doc/chat.md` first.

## Do (in the worktree `C:\Code\lew42\worktrees\dictate-workbench`, server `http://localhost:51812/`)
1. **The main demo is a `chat()` mount.** `chat.js` passes Widget options through (`level`, `source`, `debug`), so the demo looks as it does now, but answered by the fast/smart pair.
2. **Persistence is an option.** Add `keep` to `chat()`. `keep: true` (the default) is today's global session, kept across pages (the ✦ rail). `keep: false` gives the mount its own page-local session: when you leave the page, the mic stops and the mount is removed, and coming back starts fresh. The demo uses `keep: false`. The global session must never be touched by a `keep: false` mount.
3. **A New session button lives in chat.js**, so every surface gets the same one. The ✦ sheet's own "New session" button in `ext/drawer/rail.js` uses it instead of its own (one of everything). Put it on the demo too.
4. **The interim text.** Whisper's live grey text renders on top of other content and the layout doesn't resize. Fix it so the live text takes its own space and the box grows with it.
5. **The input.** The text area stays as the rough-transcription buffer. Make it FULL width (a little side padding on mobile), auto-height with no empty void, and put the Send button (and mic) BELOW it.
6. **The audit.** List every dictation or chat box on the site (grep `new Widget(`, `chat(`, `new Dictate(`, `dictate(`, the dev bar's ask, the ✦ sheet, the ☰ AI tab, the AI 2 card sidebar and Live card, `ext/Ask`). For each, say which component it uses. Anything that is live and NOT `chat.js` → `Widget` goes in a table in `minion-workbench/audit.md`, with a one-line fix. Fix the ones that are small (a call swap) in this merge; list the rest.

Not this merge: auto-send per sentence, joining sentences into one bubble, modes. Leave them alone.

## Proof
Headless Playwright (import from `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`) on the worktree server. Shots at 400 and 1920 of the Dictate page's demo, and of the ✦ sheet at 400, into `minion-workbench/shots/`. One shot must show interim text in its own space (force the state if you need to: set the Widget's interim text directly). Never `say()` into a live session; never drive the owner's tabs. Check the ✦ rail still opens, sends and keeps its chat across a navigation (never regress the mobile rail).

## Fence
`ux/Dictate/chat.js`, `Widget.js`, `Widget.css`, `page.js`, `doc/chat.md`; `ext/drawer/rail.js` (the New session button only); small call swaps found by the audit (name them in audit.md); your task dir `minion-workbench/`.

## Land
Commit in the worktree by exact path. End your turn with one line per item (1-6), the commit, and the shot paths.
