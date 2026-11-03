import { Page, demo, md } from "/app.js";

// Every page in this tree is the same two lines: the trail, then a sentence. The
// trail is DERIVED from chain(), so no page here writes its own ancestors down.
const page = (body, children) => ({
	children,
	content(){
		this.crumbs();
		md(body);
	},
});

const docs = () => new Page({
	title: "Docs",

	...page("Click down. `this.crumbs()` is the whole call — one link per page in `chain()`, which is `[root … me]`.", {
		Guides: page("Nothing is hand-typed: a page that moves takes its trail with it.", {
			Layout: page("Deeper than a tab bar can go, and every step back is a real url.", {
				Grid: page("This is why a columns host draws one: when the row runs out of room, the trail is how you get back."),
			}),
		}),
	}),
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Building blocks",
	description: "The trail to here, derived from chain() — never typed.",
	tree: docs,
}));
