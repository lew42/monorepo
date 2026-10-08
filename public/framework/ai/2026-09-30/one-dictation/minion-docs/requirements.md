# Minion brief: one-dictation docs pass

Load the `minion` skill first, then `documentation` and `content`. Your parent is **task-mastermind-one-dictation**, and its task dir is `public/framework/ai/2026-09-30/one-dictation/`. Skim its `task.jsonl` for what was built.

## What landed (all in michael/dev)
- `ux/Dictate/chat.js`, `chat(el, {path, card, placeholder})` → `{remove(), panel, session(), nav(path, card)}`, is the one chat on every surface (the ✦ sheet, the ☰ AI tab, the AI 2 card sidebar and Live card, the dev bar), on one global session per tab.
- `ux/Dictate/surfaces/` shows the one chat live, then each surface.
- `ext/Session` + `Servex/agents/Sessions.js` write invisible `nav` (page and card), pause start/end and `select` lines. Refinement goes to the card selected when the words were said. `GET /api/sessions?project=1` gives the project-wide list.
- The Widget bubbles are tinted (no orange border), with icons and markdown.

## Do (work in the main tree; these are doc files only, so no worktree is needed)
1. **`ux/Dictate/readme.md`**: an index, not a log. One line for chat.js (what it is, how to call it, with a link to a new `doc/chat.md`), one for Surfaces, and the past problems in one line each (the vanishing messages, the drawer font race) linked to the doc. Cut what the doc now holds, and keep everything else that was there.
2. **`ux/Dictate/doc/chat.md`** (new): the call, the global session, why every mount redraws from line 0, nav(path, card) (null means no card, undefined means unchanged), remove(), and the v1s kept reachable (`aiV2`, `DrawerRail.SheetPanel`, `askV1`, `chat_v1`, `foot()`).
3. **`ext/Session/readme.md`** + a `doc/markers.md` (new): the invisible nav, pause and select lines, card attribution, and the project list.
4. **`ext/drawer/readme.md`**: check that it says the AI tab and the ✦ sheet are chat.js mounts, and that the sheet collapses to one line.
5. **Long code comments**: the 20+ line comments in `ext/drawer/tabs/ai.js` (live_chat), `ext/drawer/drawer.js` (build), and `ux/Dictate/chat.js` (the class doc) go down to a few lines, each with a link to the doc. Change comments only, never code.
6. Run `node Server/docs-check.mjs` if it exists (look in `Server/`) and fix what it flags in these modules.

## Rules
Before writing, hold reloads: `node Server/hold.mjs on "minion-docs — one-dictation docs"`. When done, release them with `node Server/hold.mjs off "minion-docs"`. Load each page you touched once, headless (import Playwright from `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`, on `http://monorepo.localhost`), and check for console errors. Commit by exact path. Plain sentences for a new coder, and no names of people.

## Fence
The readmes and `doc/` of `ux/Dictate`, `ext/Session` and `ext/drawer`; comments only in `tabs/ai.js`, `drawer.js` and `chat.js`; your task dir.

## Land
End your turn with one line per item.

