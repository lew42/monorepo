import { Page, p, div, a, h3 } from "/app.js";
import { code, section } from "../../ui.js";
import { recipe } from "../recipe.js";
import { albums, find_album, find_frame } from "./albums.js";

/* A gallery, and the navigation shape none of the other seven products has: a
 * url that renders OVER the url above it rather than instead of it.
 *
 * Two pages visible at once, one on top, the grid behind still scrolled where
 * it was, Escape and Back both closing it. That is a modal route, it is
 * everywhere in real products, and the surprising result is that it needs no
 * framework support at all — an album claims a region, the frame is positioned
 * over it, and `.active-ancestor:has(.active-page)` keeps the grid alive.
 */
const nav = () => ({
	meta: import.meta,
	title: "Gallery",

	initialize(){
		albums.forEach(([name, title, blurb, frames]) => this.add(name, {
			title,

			// A frame is a page over its album, so the album must CONTAIN it —
			// which is what claiming a region does. Without the region the frame
			// lands in app.$pages as the album's sibling, and a sibling cannot
			// be behind anything.
			route(id){ return find_frame(name, id) && frame_page(name, id); },

			content(){
				this.$pages = div.c("pages");
				grid(name, blurb, frames);
			},
		}));
	},

	content(){ this.body(); },
});

export default new Page(nav(), {

	body(){
		recipe(nav);

		p("Open an album, click a frame, then press Escape. The grid never went anywhere.");

		section("Albums");

		this.previews();

		section("The recipe: a region, plus one class");

		code(`
content(){ this.$pages = div.c("pages"); }        // the album CONTAINS its frames
route(id){ return { classes: "patterns-overlay", … }; }

.page.patterns-overlay.active-page {
    position: fixed; inset: 0; z-index: 20; overflow-y: auto;
    background: rgba(255,255,255,.96);
}`, "the whole of a modal route");

		p("Measured: opening a frame leaves the album at `display: block` with its scroll offset unchanged, and closing it costs zero renders because neither page was ever thrown away. `.active-ancestor:has(.active-page)` was written for tabs and covers this without knowing it exists.").ac("note");

		section("What is missing");

		code(`
router.back()      does not exist — Escape calls history.back() directly
inert              the grid behind is still tabbable and still read aloud
"full" vs this     .full sets an opaque background, so it can never be a modal:
                   one class doing two jobs, exactly like fills-vs-fixed`);

		p("The accessibility cost is the same one the readme already records for `full`, and a modal makes it concrete rather than theoretical: a screen reader walks straight from the frame into the grid underneath it. That is a site's job to fix with `inert`, but nothing tells the site it has one.");

		div.c("row", () => {
			a.c("page-link", "Harbour").href("/patterns/gallery/harbour/");
			a.c("page-link", "straight to a frame").href("/patterns/gallery/harbour/harbour-05/");
			a.c("page-link", "← Applied IA").href("/patterns/");
		});
	},
});

function grid(name, blurb, frames){
	p(blurb);

	div.c("patterns-grid", () => frames.forEach(([id, caption, colour]) =>
		a.c("patterns-panel", () => {
			div.c("patterns-swatch").style("background", colour);
			p(caption).ac("note");
		}).href(`/patterns/gallery/${name}/${id}/`)));
}

function frame_page(album, id){
	const frames = find_album(album)[3];
	const at = frames.findIndex(frame => frame[0] === id);
	const [, caption, colour, exif] = frames[at];

	return {
		title: caption,
		classes: "patterns-overlay",

		content(){
			div.c("row", () => {
				a.c("page-link", "← close").href(`/patterns/gallery/${album}/`);
				if (frames[at - 1]) a.c("page-link", "previous").href(`/patterns/gallery/${album}/${frames[at - 1][0]}/`);
				if (frames[at + 1]) a.c("page-link", "next").href(`/patterns/gallery/${album}/${frames[at + 1][0]}/`);
			});

			div.c("patterns-swatch").style("background", colour).style("max-width", "44rem");
			h3(caption);
			p(`${exif} · frame ${at + 1} of ${frames.length}`).ac("note");
			p("Scroll the grid before you open a frame, then close this. The offset is exactly where you left it, because nothing here was rebuilt.").ac("note");

			recipe(nav, "the gallery's navigation — the album's route() produced this url");
		},
	};
}

/* Escape closes the top page. One listener for the whole gallery, and it asks
 * the DOM rather than the Router because the Router has nothing to ask: there
 * is no `router.back()`, and a modal is the first thing that wants one. */
document.addEventListener("keydown", e => {
	if (e.key === "Escape" && document.querySelector(".patterns-overlay.active-page"))
		history.back();
});
