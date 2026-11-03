# Dictation: there is always one active session, and dictation goes to it

Budget: $4. Load the `minion` skill first. You are on Sonnet: investigate, then fix.

## The owner's concern (relayed by vscode-mastermind, 2026-11-01)

"There must ALWAYS be one active session, and dictation must route through it after any switch or new session. Check that path."

## The question

Take each of these moments, on the phone or the PC:
1. the owner opens a page for the first time, with no session yet;
2. the owner picks another session in the session switcher;
3. the owner starts a new session;
4. the owner reloads the page.

For each one, answer two things:
- Does the next finished sentence go to the session the chat view shows?
- Does the Sheet's read-aloud follow that same session? It follows through `Sheet.listen` and `Sheet.follow` in `public/framework/ext/drawer/Sheet.js`.

Also check: is there ever a moment with no active session, or with two (the view on session A while sentences go to session B)?

## Where to look (read only these first)

- `public/framework/ux/Dictate/chat.js`: the switcher, new session, `write_saved`
- `public/framework/ext/Session/Session.js`: `say`, `remember`, `last_session`, `recent_project`
- `public/framework/ext/drawer/Sheet.js`: `read_aloud`, `follow`, `listen`, `follow_session`
- `public/framework/ux/Dictate/readme.md` and `doc/chat.md`

## Deliverable

1. **A table, written as `log` lines in your `task.jsonl`** (not a findings.md). One row for each of the four cases, with three columns:
   - where the sentence is sent;
   - where the view points;
   - where read-aloud listens.

   Give the file:line for each, and mark any mismatch.
2. **If there is a mismatch, fix it with the smallest change:** one function that names the active session, used by all three places.
   - Build in a worktree: `node Server/worktree-up.mjs dictation-active-session`.
   - Add a headless check beside the existing Dictate tests in `public/framework/ux/Dictate/test/`. It switches sessions, then asserts which session the sentence went to and which session read-aloud follows.
   - Run `node --check` on every file you touch, commit, and report.
   - Do not merge: the mastermind reviews and merges.
3. **Write the result in `ux/Dictate/doc/chat.md`:** one short section, "The active session".

Never kill or restart the dev server. Never drive the owner's tabs. Never stash; read a diff instead. Commit by path.
