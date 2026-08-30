import { Page, p, div } from "/app.js";

// The one content tree all three "look" variants wear — same words, same
// depth, so only the CSS (colstyles.css) differs between them. Returns the
// DEEPEST page: `demo.app()` marks the chain it is HANDED, so passing the
// root would build "Selected" but never mark it active (doc/columns.md,
// the `default_column` warning about `render_column()` said again here for
// a plain 3-deep chain).
export function tree(variant){
	const root = new Page({
		title: "Shelf", width: "small", classes: "vary-colstyles-look-" + variant,
		initialize(){ this.columns(); },
		content(){ p("Three shelves; one book is out."); },

		children: {
			Fiction: {
				content(){ p("A shelf of six. One is pulled."); },

				children: {
					Selected: {
						width: "large",
						content(){
							p("The book you pulled — the site's own 40em reading measure, same as any page.");
							div.c("bleed vary-colstyles-figure", "a bled figure — reaches the column's own edge");
							p("Back on the measure to close.");
						},
					},
					Returned: { content(){ p("Back on the shelf."); } },
				},
			},

			Nonfiction: { content(){ p("Nonfiction."); } },
			Poetry: { content(){ p("Poetry."); } },
		},
	});

	return root.children.get("fiction").children.get("selected");
}
