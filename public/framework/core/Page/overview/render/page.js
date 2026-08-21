import { Page, demo, md, div, h4 } from "/app.js";

const correct = () => new Page({
	title: "Correct",
	render(){
		return this.view ??= div.c("page flow tint", () =>
			md("Sets `this.view`, wears `.page` once — never a second.")).ac("standard");
	},
});

const broken = () => new Page({
	title: "Broken",
	render(){
		return this.view ??= div.c("page flow tint", () =>
			div.c("page standard default surface", () =>
				md("A **second** `.page`, nested — its grid pads again, inside the first."))
		).ac("standard");
	},
});

const column = (label, tree) => div.c("flex v gap").append(() => {
	h4(label);
	tree().render().ac("default");
});

const board = () => div.c("flex gap wrap", () => { column("Correct", correct); column("Broken — never do this", broken); });

export default new Page({
	meta: import.meta,
	title: "Render",
	group: "JS, last",
	description: "render() owes three things: set this.view, carry .page, never nest a second one.",

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-25", board)); },

	content(){
		md("Overriding `render()` owes three silent things: set `this.view`, carry the `.page` class, and never nest a second `.page` — a nested one pads its grid again, inside the first. **Broken** is labelled below; look at its doubled padding.");

		demo.stage(board).ac("bleed");
		demo.source(board, "Source");
	},
});
