# notes-split — a note page is half picture, half prose, and the picture stays put (Sonnet)

The owner, 2026-09-06 11:05: *"make the notes pages use 50% for image, 50% for prose, make the image sticky."*

Read first: `../../2026-09-04/mastermind-platform/minion-rules.md`; `public/notes/note.js` (`NotesNote` — the one component every note page uses), `public/notes/notes.css`, `public/notes/readme.md`, and two note pages (`public/notes/layouts-need-fit/page.js`, `public/notes/scale-1920-to-3413/page.js`). Skills: `new-task` (this dir, group `notes`), `layout` (answer its five questions in one line each in your log before editing — which track the note page sits in decides how wide "50%" is), `css`, `finish-task`.

## The change

On a note page, the picture takes the left half and everything else (the transcription, "what it points at", the thing built to match) takes the right half. The picture is `position: sticky` under the page's top padding, so it stays in view while the prose scrolls. Below a floor where two halves cannot both be read (pick it with the `layout` skill — the picture needs ~400px to read, so around 900px total), the page stacks: picture first, prose under it, nothing sticky. At 3440 the two halves fill the page's `wide` track, the prose keeps its measure inside its half (it may centre or left-align in the half — say which and why), and the picture scales to its half without exceeding one viewport height (`max-height: calc(100vh - 2 * pad)`, `object-fit: contain`).

Change `note.js` and `notes.css` only. Every note page inherits it — that is the point of the shared component. If a page's own `page.js` fights the split (an inline width, a wall inside the prose that needs the full width), list it in the log; do not edit it.

## Prove it

Two note pages and the doodles page at 400 / 900 / 1280 / 1920 / 3440: the split holds from the floor up, stacks below it; the picture is sticky — scroll the prose 800px at 1280 and screenshot: the picture is still fully visible; no sideways scroll; zero console errors; the prose never exceeds its measure. Screenshots in your task dir.

## Fences and budget

Write `public/notes/note.js`, `public/notes/notes.css`, one line in `public/notes/readme.md`, this task dir. Three other minions are adding note dirs under `public/notes/` right now — never touch any note dir or `public/notes/page.js`. Shared server `http://localhost:8123/` — start none, kill none. Never `find /`; never spawn agents; never `git stash`/commit. Budget ~80k tokens. Report in ≤ 6 plain lines: the floor you chose and why, the track, the sticky proof, anything a page fights.
