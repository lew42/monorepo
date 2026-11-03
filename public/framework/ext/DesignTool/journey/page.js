import { Page, View, div, h3, a, img, md } from "/app.js";
import { journey } from "./journey-data.js";

/* css: .journey-shot */
View.stylesheet(import.meta, "journey.css");

const here = new URL(".", import.meta.url).pathname;

// One card: the shot IS the page-preview thumb, the url IS the link.
const card = shot =>
	div.c("page-preview", () => {
		div.c("page-preview-thumb", () => img.c("journey-shot").attr("src", here + "shots/" + shot.file).attr("alt", ""));
		a.c("page-preview-link").href(shot.url).append(() => div.c("page-preview-title", shot.url));
	});

/**
 * The journey — a headless camera walked every reachable page (2026-09-01) and this is
 * everything it saw, one viewport jpeg each, grouped by realm. `journey-data.js` fetches
 * `shots.json` once at module scope so `content()` never touches DOM after an `await`;
 * `shots.json` and the files in `shots/` are the crawl's own output, not hand-written.
 */
export default new Page({
	meta: import.meta,
	title: "Journey",
	description: `Every reachable page, screenshotted headless — ${journey.shot} shot, ${journey.skipped} skipped.`,
	icon: "photo_library",
	width: "full",

	// A real screenshot instead of the default icon+description card, on the design/
	// index only (2026-09-05 ux-rethink) — one of journey's own 451 shots.
	preview(nav){
		return this.preview_card(nav, () => img.c("design-shot").attr("src", here + "shots/alex-framework.jpg").attr("alt", nav.label));
	},

	content(){
		md(`**${journey.shot} pages shot, ${journey.skipped} skipped** (dead links and orphaned sandbox pages the SPA fallback catches as \`Page Load Error\`) — one viewport jpeg each, 1280×800.`);

		journey.realms.forEach(realm => {
			h3(`${realm.name} — ${realm.shots.length}`);
			div.c("grid auto gap", () => realm.shots.map(card)).style("--column", "11em");
		});

		if (journey.skipped_urls.length){
			md("#### Skipped\n\n" + journey.skipped_urls.map(u => `- \`${u}\``).join("\n"));
		}
	},
});
