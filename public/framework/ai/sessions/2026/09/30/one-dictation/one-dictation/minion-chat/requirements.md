# Minion brief: one chat module, and the vanishing-messages bug

Load the `minion` skill first, then `code`. Your parent is **task-mastermind-one-dictation**; its task dir is `public/framework/ai/2026-09-30/one-dictation/` (read its `requirements.md`, and the owner's words in `../audio-consolidate/owner-words.md` from "hamburger menu" on).

## The owner's words (2026-09-30)
"I don't want two user interfaces. I don't want two systems… we want to have one set of code… one system that works the same everywhere, whether it's the mobile rail or the right sidebar here."
"We're not doing per directory assistants anymore. We're doing global dictation assistance… you don't want to cut off the user's transcription just because they clicked on a link."

## The live bug, first (the owner, 16:33)
On the AI 2 Now card (`/framework/ai2/2026/09/30/now/`) the owner dictated in voice session `v-gck9buj`. The pair answered: the whole exchange is in `public/framework/ai/2026/09/30/now/ai/v-gck9buj.jsonl`. Then **the messages vanished from the sidebar**, and **the Sessions tab doesn't list the session**. The owner concluded "no one's responding".

**The cause, as I read it** (confirm it headless before you fix it):
- `ext/drawer/tabs/ai.js`'s card branch builds a NEW `Widget` every time the tab renders (a card redraw, a card switch, a reopen), and it only starts watching the session file inside `deliver`, so a rebuilt widget is empty until the owner speaks again.
- `rail.js`'s `build_voice_panel()` has the same fault: a rebuilt panel only gets lines that are new to the old watch cursor, never the history.
- The Sessions tab (`tabs/sessions.js`) lists only the dev bar's Ask threads, never voice sessions.

## Build (worktree `C:\Code\lew42\worktrees\one-dictation`, branch `worktree/one-dictation`, its server at http://localhost:62912/)

1. **`public/framework/ux/Dictate/chat.js`**: default export `chat(el, { path, card, placeholder })`. It draws a `Widget` into `el`, takes its size from `el`, and returns `{ remove(), panel, session() }`.
   - It holds ONE session controller per browser tab, at module level (the start/ensure, say, watch, stream, report_quiet, floor, react, resume-offer and own-ats dedupe that `rail.js`'s `DrawerRailSheetPanel` has today, moved here, not copied). The saved slot is the same `sessionStorage` key, `lew42-voice-session`.
   - **The session is GLOBAL, never keyed by card.** A saved session is reused whatever card or page is open now. `card` and `path` are only the target: pass `card` to `start()` on the first sentence only, and every `say()` carries the current `path`.
   - **Every mount redraws the session's whole history from its file** (read from line 0 into the new Widget), then follows new lines and the stream. Several mounts at once (the sheet and the drawer) all get every line. `remove()` detaches that mount only; the session and its watch carry on.
   - A route change or card selection while a session is open sends `Session.nav({session, from, to})` once, from the controller, not per mount.
   - No model picker (`models` stays off).
2. **`ext/drawer/rail.js`**: a new sheet class that extends `DrawerRailSheetPanel` and fills `$slot` with `chat()` instead of its own wiring; `DrawerRail.Sheet` points at it. Keep `DrawerRailSheetPanel` itself reachable, unchanged (the owner: never destroy a viable version). The mobile sheet must look and behave exactly as today: the inbox line, the "More" links, the resize handle, the mic released on close, the resume offer, reactions and threaded replies.
3. **`ext/drawer/tabs/ai.js`**: the default export uses `chat()` for a plain page AND a card; the model chooser and the `page-ai`/`send({card})` paths leave the default. Keep today's default reachable as a named export `aiV2`. `send()` and `new_session()` stay exported for their other callers; grep before you change them.
4. **`ext/drawer/tabs/sessions.js`**: the live voice session first (marked live, from `chat.js`), then this page's recent voice sessions (`Session.recent`), then the existing Ask threads. Clicking a voice session resumes it into the chat.
5. **The font:** the chat must show the site's Montserrat on every surface. Its CSS says `font: inherit`, so fix it by mounting inside the element that sets the font. Don't add a `font-family`.

## Prove it (headless Playwright, a script in the scratchpad named `od-chat-probe.mjs`; never drive the owner's tabs)
- Reproduce the bug first on the live site (`http://monorepo.localhost`): open `/framework/ai2/2026/09/30/now/` at 1920, set `sessionStorage["lew42-voice-session"]` to `{"session":"v-gck9buj","file":"/framework/ai/2026/09/30/now/ai/v-gck9buj.jsonl","card":"2026/09/30/now"}`, open the ☰ drawer's AI tab, and count bubbles. Log the "before" count in your task.jsonl.
- Then the same on your worktree server. The session file is not in git, so copy it into the worktree at the same path to test, and never commit that copy. The bubbles must show, and still show after: a switch to another card and back, a close and reopen of the drawer, and a reload.
- Session calls go to the real Servex. Don't say anything into a live session in the proof: seeding and reading is enough, and `say()` spawns real agents.
- Shots at **400 and 1920**, saved in your task dir: the phone ✦ sheet open on a card page, the ☰ drawer AI tab on a card page, the ☰ drawer AI tab on a plain page (`/framework/ux/Dictate/`), and the Sessions tab. Also log the computed `font-family` of a bubble on each surface.

## Fence
You may write: `ux/Dictate/chat.js` (new), `ux/Dictate/Widget.js` (only if chat.js truly needs a hook), `ext/drawer/rail.js`, `ext/drawer/tabs/ai.js`, `ext/drawer/tabs/sessions.js`, `ext/drawer/drawer.css` (only if needed), and your own task dir. Nothing under `Servex/`, `ext/Session/`, `ai2/`, `dev/`.

## Land
Commit in the worktree by exact path after each finished piece. **Don't merge**: end your turn with the shots listed in your task.jsonl and one line saying what you proved. Every process you spawn sets `windowsHide: true`; stop any server you start.
