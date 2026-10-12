# notes-redactions — `/notes/redactions/`: exactly what was removed from the notebook pages, verbatim, each with a link to its original (Sonnet, group `notes`)

Three laws: less is more (ASAP); clear beats brief, by far; prioritize. Length budget: one page, one entry per reduced image, each entry three lines at most; your report six plain lines.

⚠ **NO INTERNET.** The only server is `http://localhost:8123`; never kill or restart it, never drive the owner's tabs.

Read first: `../mastermind-playwright/minion-rules.md`; `public/notes/readme.md` (the realm; "Some pages are reduced" at line ~47); `public/notes/page.js` (`children:` is how a note is declared); `public/notes/note.js` and one note (`public/notes/we-think/page.js`) for the shape and the voice; the four batch reports that name what was reduced — the `outcome` line (last `assign` with `outcome`) in `public/framework/ai/2026-09-06/notes-pages/task.jsonl`, `notes-pages-2/`, `notes-pages-3/`, `notes-pages-4/`; and every note page that says so itself: `rg -il "local checkout|not transcribed|initials|the owner" public/notes --glob '*.js'`. The originals are `public/notes/inbox/2026-09-06-NNN.jpg` (67 files, gitignored — local only). Skills: `new-task` (this dir, group `notes`), `code`, `new-page`, `documentation`, `finish-task`.

## The owner, 2026-09-08 11:10, verbatim

> make a "notes/redactions/" page that clearly states exactly what was removed (verbatim), with a link to the original image

## Build

`public/notes/redactions/page.js` — a `NotesNote` like its siblings, or a plain `Page` if a note's chrome (the photo slot, the crumbs) gets in the way; say which in the log. The page opens with two sentences: what this is (the list of everything the transcriptions left out, so nothing is hidden from the owner) and the rule the originals follow (a link to `/notes/inbox/<file>.jpg` opens only on a local checkout — the inbox is not in the repo). Then **one entry per reduced image, in image order**, each:

- the image number and the note it became, linked (`/notes/<slug>/`);
- **what was removed, verbatim** — open the original photo with the Read tool and type out the exact words that the note page replaced or dropped: the owner's name where the note says "the owner", each third party's name where the note says initials, the apartment line of 024, the path in 039, the `Name && name` example in 040, the product name in 052, the shopping list of 057, the three margin doodles of 059 (described, since a doodle has no words), the private moral list from batch 1, and anything else the four reports and the pages' own lines name; where the note reduced a whole half-page, say which half and quote it;
- a link to the original image.

**The one thing you do not re-type.** The right-hand pages of 021 and 022 hold a home address, utility account numbers and a password hint. For those two entries, name each item for what it is ("a home address", "two utility account numbers", "a password hint", the apartment logistics), quote NOTHING from them, and link the original — the site deploys publicly and those three would be one commit from the open web. Say so on the page in one plain sentence. The owner can override with a word; you cannot.

Register the page: add `redactions` to `public/notes/page.js` `children:` in the place the realm's order suggests, and change the readme's "Some pages are reduced" bullet to end with a link to `/notes/redactions/`.

## Proof

Headless at 400 and 1920, screenshots into this dir, zero console errors; every `/notes/<slug>/` link on the page resolves (200 and a rendered h1), every `/notes/inbox/…jpg` link returns 200 on `:8123`; print both counts. The number of entries equals the number of reduced images the four reports name — print both, and list any image a note page marks as reduced that the reports did not mention.

## Fences and budget

Write ONLY `public/notes/redactions/**`, one name in `public/notes/page.js` `children:`, one bullet in `public/notes/readme.md`, this dir; scratch named `notes-redactions-*`. Never a note page, never the inbox. Budget ~120k tokens. Report in ≤ 6 plain lines: the url, the entry count, the three items you were least sure you read right from the photo, what you held back and why.
