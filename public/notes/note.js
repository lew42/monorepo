import { Page, figure, figcaption, img, a } from "/app.js";

/* Every photographed note is the same page: the picture, what it says, what it points
   at, and the thing built to match. Two of those four are identical on all of them —
   the photo and the card thumb — so they live here and a note's own `page.js` is only
   its own words.

   `Page` is a plain class, not a `View`, so a subclass name mints no CSS class and
   `NotesNote` is safe (2026-09-06). `dir` and `shot` collide with nothing core calls
   in `assign() → naming() → declare() → initialize()`. */
export class NotesNote extends Page {

	// My own directory, so `note.jpg` resolves against the module and not the route.
	dir(){ return new URL(".", this.meta.url).pathname; }

	// The card on /notes/: the photo, cropped to the card's 16/10 with the writing kept
	// (notes.css). ⚠ The thumb is inert, so no link may go inside it.
	preview(nav){
		return this.preview_card(nav, () => {
			img.c("notes-thumb").attr("src", this.dir() + "note.jpg").attr("alt", this.title);
		});
	}

	// The picture, upright, linked to the full file — which is how the handwriting stays
	// readable without the page becoming a scroll. Below notes.css's 900px floor it is
	// capped to one fold, full width, then the prose runs under it. Above the floor,
	// notes.css puts it in the left half instead and pins it there (`position: sticky`)
	// while the rest of the page — everything content() draws after this call — scrolls
	// past it in the right half. Nothing here knows which mode is active: the split is
	// pure CSS, scoped to `.notes-shot`, so every note page gets it for free.
	shot(caption = "Open it for the full-size scan."){
		const src = this.dir() + "note.jpg";

		return figure.c("notes-shot flex v v-center gap wide", () => {
			// ⚠ Block body: a captured callback's RETURN VALUE is appended too.
			a(() => { img().attr("src", src).attr("alt", this.title + " — the notebook page"); })
				.href(src).attr("target", "_blank");
			figcaption.c("muted", caption);
		});
	}
}
