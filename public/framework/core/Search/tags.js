/* Which axis each tag belongs to — the ONLY thing Search needs to know about the
 * tag vocabulary, so that a page's `tags: ["docs", "rail-and-content"]` becomes two
 * chips in two different groups instead of one flat row.
 *
 * What each tag MEANS is one page, and that page is the source of truth for the
 * vocabulary itself: /imagine/design/vocabulary/. This file deliberately carries no
 * definitions — core may not import a page module, and a second copy of 29
 * definitions is a second thing to keep true. When a tag is added over there, add
 * its one line here; a tag with no line lands in "Other" rather than disappearing.
 *
 * Next step, when someone owns that file: `/imagine/design/vocabulary/tags.js`
 * imports AXES from here and reads the axis off it, so even the grouping has one copy.
 */

export const AXES = {
	// how you move, and what remembers where you are
	"rail-nested": "navigation",
	"crumbs": "navigation",
	"tabs": "navigation",
	"preview-wall": "navigation",
	"prev-next": "navigation",
	"toc-rail": "navigation",
	"rail-scroll": "navigation",
	"top-nav": "navigation",
	"hamburger": "navigation",
	"mega-menu": "navigation",
	"footer-nav": "navigation",

	// the page's own region layout
	"rail-and-content": "shell",
	"docs-three-region": "shell",
	"columns-row": "shell",
	"holy-grail": "shell",
	"single-column": "shell",
	"split-view": "shell",
	"solo-bespoke": "shell",

	// what the page does as you move down it
	"infinite-scroll": "scroll",
	"horizontal-scroll": "scroll",
	"sticky-header": "scroll",

	// what the section IS, not how it is built
	"landing": "content-kind",
	"blog": "content-kind",
	"docs": "content-kind",
	"dashboard": "content-kind",
	"gallery": "content-kind",
	"notes": "content-kind",
	"personal": "content-kind",
	"resume": "content-kind",
};

// The chip group's heading — the axis name said in words a reader has not met before.
export const AXIS_LABELS = {
	"navigation": "How you move",
	"shell": "Its regions",
	"scroll": "Scrolling",
	"content-kind": "What it is",
	"other": "Other tags",
};

// Group order on screen, which is the vocabulary page's order.
export const AXIS_ORDER = ["navigation", "shell", "scroll", "content-kind", "other"];

export default AXES;
