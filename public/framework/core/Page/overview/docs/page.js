import { Page, demo, md } from "/app.js";

const docs = () => {

	// every page of a docs site is the same shape, so the shape is written once
	const doc = {
		icon: "article",

		content(){
			md(this.body);

			const next = this.parent.children.get(this.next);
			if (next) next.link("Next: " + next.title);
		},
	};

	return new Page({
		title: "Docs",

		children: {
			Install: {
				...doc,
				icon: "download",
				next: "pages",
				body: "Clone it and open it. **There is no build step**, so the source you read is the source that runs.",
			},
			Pages: {
				...doc,
				next: "styling",
				body: "A folder with a `page.js` in it is a url. The parent declares the name; the child derives the address.",
			},
			Styling: {
				...doc,
				icon: "palette",
				next: "deploy",
				body: "Four layers — `base, theme, site, util` — and a rule that tells you which one you are in.",
			},
			Deploy: {
				...doc,
				icon: "cloud_upload",
				body: "Static hosting and one fallback document. The last page has no `next`, so nothing is linked.",
			},
		},

		content(){
			md("Four pages, one shape: `const doc = { … }` spread into every child, so the half they share is written **once, where you can see it**. The link at the foot of each page is the reading order.");
			this.previews();
		},
	});
};

export default new Page(demo.tree({
	meta: import.meta,
	group: "Sites",
	tree: docs,
	rail: true,
}));
