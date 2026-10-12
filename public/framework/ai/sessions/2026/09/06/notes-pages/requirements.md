# notes-pages — every picture in the inbox becomes a note page you can browse (Opus)

Three laws: less is more (ASAP); clear beats brief, by far; prioritize. Length budget: a note page is one screen — the picture, what it says, what it points at, the thing built to match; the report is 8 lines.

Read first: the repo's `CLAUDE.md` (the Presentation section — the overwhelmed newcomer); the owner's sentence in `../mastermind-graduate/layout-brief.md` under "The notes program"; `../../2026-09-04/mastermind-platform/minion-rules.md`; `public/notes/page.js` and its three existing children (the realm's shape). Skills: `new-task` (this dir, group `notes`), `code`, `layout`, `new-page`, `documentation`, `finish-task`.

## The job

`public/notes/inbox/` holds the owner's photographed notebook pages (`2026-09-06-001.jpg`, more will arrive — this task can be resumed with a message saying "new images in the inbox"). For EACH image:

1. **Read it** with the Read tool (it renders the picture to you). It may be rotated; say the orientation you read it in. Transcribe every mark: words, numbers, boxes, arrows, formulas, the date if there is one. Where a mark is ambiguous, give your best reading and mark it `(?)`.
2. **Name it**: a kebab slug from what it is about (`scale-1920-to-3413`, not `note-001`), and a one-sentence title in the owner's words.
3. **Find what it references** that the site has built: grep titles, docs and `ai/` logs for the numbers and words in the note (a note about 1920 → 3413 points at the 3440 rules in the layout skill, the spacing ceilings page, the size study at `/imagine/design/size/`, the spacing decision). Link each with one sentence saying why.
4. **Build the UI it describes, when it describes one.** A note that works out a calculation gets a tiny live calculator that shows the same numbers; a sketch of a layout gets that layout in a demo box at the note's own width; a list gets the list. When the note describes nothing buildable, say so in one line and build nothing.
5. **The page**: `public/notes/<slug>/page.js` (+ the web-size image beside it) — the picture first, at its natural size (rotated upright), then the transcription as prose, then "what it points at" as a linked list, then the built thing. One screen where possible. Register the slug in `public/notes/page.js` `children:`.
6. **The image file**: the original is 2–3 MB; make a web-size copy (longest side 1600px, JPEG ~80, upright) with a headless Chromium canvas through Playwright — no new dependency — and put THAT in the note dir. The originals stay in `inbox/`, which is git-ignored.

**The index** `/notes/` becomes a wall of previews: each note's card shows its picture and title; keep the three existing notes as cards too.

## Prove it

Every note page and the index at 400 / 1280 / 1920 / 3440, zero console errors, no sideways scroll; the picture upright and readable at 1280; every link on a note page resolves (probe each href). Two numbers that must agree: images in the inbox = note pages created (minus any you could not read at all — name those).

## Fences and budget

Write `public/notes/**` (never `public/notes/auth/`, `git-branch-names/`, `team-note/` beyond their card on the index), this task dir. Private server `PORT=8093 node server.js` (kill the pid you started; never port 80; never the owner's tabs). Never `find /`; never spawn agents; never `git stash`/commit. Budget ~250k tokens for the first batch. Report in ≤ 8 plain lines per batch: each note as "slug — what it says in one sentence — what it links — what was built".
