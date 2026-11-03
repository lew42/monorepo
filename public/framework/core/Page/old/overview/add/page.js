import { Page, demo, md } from "/app.js";

const manual = () => {
	const site = new Page({
		title: "Manual",

		initialize(){
			this.add("html", {
				title: "HTML",
				content(){
					md("Added in `initialize()`, which runs inside the constructor.");
				},
			});
		},

		content(){
			md("`add(name, config)` is the other way children arrive: one added inside `initialize()`, one from outside, one chained a level deeper.");
			this.previews();
		},
	});

	site.add("css", {
		title: "CSS",
		content(){
			md("Added after `new`, from outside. One more level down:");
			this.previews();
		},
	})
		.add("layout", {
			title: "Layout",
			content(){
				md("`add()` returns the CHILD, so a chain digs — this is `/manual/css/layout/`, and the strip above is `chain()`.");
			},
		});

	return site;
};

export default new Page(demo.tree({
	meta: import.meta,
	group: "Basics",
	tree: manual,
}));
