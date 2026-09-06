# Notes — short team notes, and the owner's photographed notebook pages

Two kinds of page live here. Three written notes (branch names, auth, a note to the team),
and one page per photographed notebook spread: the picture, what it says, what it points at
on this site, and the thing built to match when the note described one.

## Use

A new photographed note is a directory with two files.

```js /notes/<slug>/page.js
import { md } from "/app.js";
import { NotesNote } from "../note.js";

export default new NotesNote({
	meta: import.meta,
	title: "Drop target UX",
	icon: "drag_indicator",
	description: "Four moments of a drag, and two different previews.",

	content(){
		this.crumbs();
		this.shot();          // the photo, upright, capped to a fold, linked to the full file
		md("## What the page says\n\n…");
		md("## What it points at\n\n- [Somewhere](/somewhere/) — why.");
		// then the thing built to match, or one line saying the note described none
	}
});
```

Beside it, `note.jpg` — a web-size copy (longest side 1600, JPEG ~0.84) of the original in
`inbox/`. Then add the slug to this directory's `page.js` `children:`; nothing crawls.

`NotesNote` (`note.js`) gives you `shot(caption)` and the photo card on the index. The
picture is capped by **height** so a page is one screen at 400, 1280, 1920 and 3440 alike.

## Watch out

- **`inbox/` is git-ignored.** The originals are 2–3 MB and stay out of the repo, so a link
  to `/notes/inbox/<file>.jpg` opens only on a local checkout. The web-size copy beside the
  page is the one that ships.
- **The photos carry an EXIF orientation flag.** The raw pixels of every one so far are
  already upright; the flag rotates them sideways in most viewers, and Chromium's canvas
  ignores it. Rotate by **0** and read the result back before assuming.
- **Some pages are reduced.** Third parties' names become initials; two spreads (021, 022)
  had a home address, utility account numbers and apartment logistics on the right-hand
  page, so their image is **cropped to the left page** and that half is not transcribed.
  Every reduced page says so in one line and links the original.
- **`notes-` is not yet in `framework/styles/css-scopes.txt`.** The name was censused clean
  on 2026-09-06 (no `.notes*` rule exists in any stylesheet), but the task that opened it
  could only write under `public/notes/**`. One line — `notes-   /notes/` — is owed.
- **A declared child with no `page.js` 404s twice on every page in the realm.** `doodles`
  was left out of `children:` until its `page.js` exists.

## More

- [The realm](/notes/) — the wall of cards
- Files that matter: `note.js` (`NotesNote`: the photo, the card), `notes.css` (three rules —
  the fold-capped picture, the card thumb, the spread marker), `page.js` (the wall)
