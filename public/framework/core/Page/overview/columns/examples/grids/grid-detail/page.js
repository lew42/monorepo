import { Page, md } from "/app.js";

/* Large grid → small detail. `column()` (Page.css) already lists my children as
   rows below content() — restyling THOSE rows into a grid (grids.css,
   `.page--grid-detail`) is the whole trick, so nothing here draws a second copy. */

export default new Page({
	meta: import.meta,
	title: "Grid → Detail",
	description: "A large grid of small tiles; each opens a small detail column.",
	width: "large",

	initialize(){ this.columns(); },

	content(){
		md("A **large** grid of small tiles below — click one to try it, its detail opens as a **small** column to the right. **Verdict:** large grid + small detail works — the grid stays wide enough for real tiles, and the small column reads like a drawer, not a squeeze.");
	},

	children: {
		Photo:  { icon: "image",         content(){ md("Photo detail: file name, size, taken date — one line each."); } },
		Video:  { icon: "movie",         content(){ md("Video detail: duration, codec, resolution."); } },
		Audio:  { icon: "music_note",    content(){ md("Audio detail: track, artist, length."); } },
		Doc:    { icon: "description",   content(){ md("Document detail: pages, size, owner."); } },
		Map:    { icon: "map",           content(){ md("Location detail: place name, coordinates."); } },
		Note:   { icon: "sticky_note_2", content(){ md("Note detail: one short paragraph, nothing else."); } },
	},
});
