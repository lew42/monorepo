import { Page2, p, View } from "/app.js";
import elements from "./elements/page.js";
import layout from "./layout/page.js";
import components from "./components/page.js";
import sections from "./sections/page.js";
import branding from "./branding/page.js";

// michael-specific doc styles (demo boxes, cards); the generic shell CSS
// (Page2.css) is loaded by the Page2 class itself.
View.stylesheet(import.meta, "styles.css");

export default new Page2({
	meta: import.meta,
	title: "Michael",
	description: "A live, categorized tour of the framework's essential styles.",
	children: [elements, layout, components, sections, branding],
	content(){
		p("Four buckets, only what's essential: elements, layout, components, sections. Pick one from the sidebar, or a card below — it opens in a column to the right, and that page becomes the nav for its own children.");
		p("Every link is hybrid: left-click navigates here without a reload; right-click (or ctrl/⌘-click) opens it isolated in a new tab. Reloading any URL rebuilds the same columns.");
		this.previews();
	}
});
