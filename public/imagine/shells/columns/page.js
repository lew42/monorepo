import { Shell } from "../Shell.js";
import { Page, div, span, demo, md } from "/app.js";

/* Container: the app region, full viewport. Size: a 13em rail, a footer that
   spans the floor, and a columns row filling everything between. Own layout: the
   one grid, `left` + `main` + `foot`; `main` is `shell-stage`, so it hands its
   height to the row and keeps none of its own scrolling. Regions: three, and the
   third is a whole Page tree. Preview: default card.

   ⚠ A real columns host CANNOT be nested here: `column_host()` returns the
     SHALLOWEST columnar ancestor, and /imagine/ is already one — so an inner host
     in the same tree can never win. `demo.app()` is the way, and it is the right
     one: a separate tree with its own root is exactly what "a row inside a shell"
     means. */

const library = new Page({
	title: "Library",
	width: "small",
	initialize(){ this.columns(); },

	children: {
		Verdict: {
			width: "large",
			classes: "default",
			content(){
				md(`### Where they meet

**The row's scrollbar is the row's.** It is drawn on the bottom edge of the columns row, inside the content area — above the app's footer and to the right of the rail. Neither piece of chrome moves when you scroll sideways.

**The content region must clip.** \`shell-stage\` is \`overflow: hidden\`, so the row gets a definite height and the footer keeps its row. Let the content region scroll instead and the row grows to its tallest column and pushes the footer off the screen — the same failure \`.pages\` has without \`min-height: 0\`.

**One seam, not two.** The columns row already ends in a hairline. An app footer directly under it is a second horizontal line 1px away, and the pair reads as a mistake — so the footer here is the app's floor (it spans UNDER the rail) rather than a bar inside the content area.`);
			},
		},

		Guides: {
			width: "small",
			children: {
				Layout: { content(){ md("Five questions before the first factory call."); } },
				Colour: { content(){ md("Three tones: the frame, the paper, a division."); } },
			},
		},

		Components: {
			width: "small",
			children: {
				Rail: { content(){ md("A column of links with a home at the top."); } },
				Bar:  { content(){ md("A row of links that scrolls sideways before it wraps."); } },
			},
		},

		Notes: { width: "small", children: { Seams: { content(){ md("Every seam is one `--line` hairline."); } } } },
	},
});

export default new Shell({
	meta: import.meta,
	title: "Chrome x columns",
	description: "A full-height columns row as the content region — rail, footer, and a row that scrolls sideways.",
	icon: "view_column",
	group: "Chrome x columns",

	left(){ return this.rail("left"); },
	foot(){ return this.bar("foot", this.status); },

	status(){
		span.c("shell-end", "the app's floor — it spans under the rail, the row scrolls above it");
	},

	// ⚠ Opened AT a page, not at the root: `DemoApp.mark()` strips every `.default`
	//   in its region and re-marks only the shown page's own chain, so a `default`
	//   column is only open if it is IN that chain (/imagine/vary/readme.md).
	main(){
		return div.c("shell-main shell-stage", () => {
			demo.app(library.children.get("verdict")).ac("shell-app");
		});
	},

	finding: "a footer and a full-height row can share a shell, but only as the app's FLOOR — spanning under the rail, with the content region clipped so the row has a definite height. A bar placed inside the content area under the row draws a second hairline 1px below the row's own: the same family of don't as `columns and tabs`.",
});
