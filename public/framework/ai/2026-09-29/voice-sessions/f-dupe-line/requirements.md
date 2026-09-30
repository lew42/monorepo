# Last fixes before merge: the double line, and the second review

Load the `minion`, `code` and `ui-test` skills. Your parent is task-mastermind-voice-sessions-2. Worktree `C:/Code/lew42/worktrees/voice-fixes` (site http://localhost:50881/). Commit by exact path. Never stash, never restart Servex. **Every proof POST is stubbed** (see `../e-fixes/proof/ui.mjs`, which already does it). Budget: $3.

**Fence:** `public/framework/ext/drawer/rail.js`, `Servex/agents/Sessions.js`, `Servex/agents/directory.js`, `Servex/agents/roles.js` (the directory-mastermind row only), `public/framework/ai/2026-09-22/tiers-design/doc/roles.md`, `public/framework/ext/Session/**`. Not `Assistant.js`, not `ext/Chat`.

## A. The double line (first)

On the ✦ sheet, each thing the owner says shows TWICE (`../e-fixes/sheet-held-reply-400.png`). The cause: rail.js ~733 draws the owner's line locally with `r.at` after `say()`, and the session-file watch (~711) draws the same line again. The fix: keep a Set of the `at` values drawn locally, and have the watch skip a chat line whose `at` is in it.

## B. The second review ([../review.jsonl](../review.jsonl), phase 1 at 12:46 on 2026-09-30): fix these

1. A "New session" press must always start fresh: `/new` takes `fresh: true` (skips the one-hour resume), `Session.start({path, fresh})` passes it through, and rail.js's New session button sends it.
4. When a session wakes and passes a visited folder again, write a new `started` there (not only at home), so the latest line is true.
5. `directory.js` `dir_of()` refuses a folder outside the repo, the same check `Sessions.folder()` makes.
6. The `directory-mastermind` row in roles.js says `permission_mode: "plan"`, since that's what `ask()` uses.
7. roles.md: the Directory mastermind row says it's built (`ask_directory`, `Servex/agents/doc/directory.md`), and drops "until a real tool exists" and the live `page-mastermind`/`manager` wording. The Smart assistant row says the pair hears by direct send (decision `d-hear`), and that `follow` is for a mastermind echoing a session.
8. One line in `ext/Session/doc/sessions.md`: while the owner is speaking only the newest fast reply is kept, and earlier ones are dropped on purpose.
9. `ext/Session/page.js`: the chat pane shows a placeholder ("Replies appear here") before Start, so the two-column layout is visible.
10. Move the Recent list's inline `.style()` flex into a class in the module's CSS (load the `new-css-class` skill for the prefix).
11. In the ✦ sheet, show the "Pick up where you left off" line only for a session older than an hour, since a newer one continues by itself, and label it with its age ("· 1 day ago").

## Proof (each one an `experiment` line in your task.jsonl)

- The sheet at 400px, stubbed: a sentence shows ONCE; the resume line appears only when the stubbed `previous` is more than an hour old; New session sends `fresh: true`. Save the shots to this folder.
- `/framework/ext/Session/` at 1920: a shot showing the placeholder and the Recent list (this retakes finding 2), with zero console errors.
- `node --check` on every JS file you touched.
Commit, then message me the commit.

**Fence note (mastermind-servex-8):** task-mastermind-audio-consolidate is building the one dictation widget in `ux/Dictate/` and `ext/drawer/`. In those two folders, touch ONLY `ext/drawer/rail.js` (and `ux/Dictate/floor.js` if you must). Nothing else there.
