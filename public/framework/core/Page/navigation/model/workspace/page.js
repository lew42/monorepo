import { Page, View, div, span, a } from "/app.js";

View.stylesheet(import.meta, "../model.css");

// A workspace page (NavModel.KINDS.workspace): fills, zero padding, its parts are panes, not nav items. Docs: ../readme.md
export default new Page({
	meta: import.meta,
	title: "A workspace page",
	description: "The workspace kind, live: fills the screen, no padding, three panes that are not pages.",
	icon: "dashboard",
	kind: "workspace",

	render(){
		return this.view ??= div.c("page page-navm-workspace", () => {
			div.c("page-navm-wpane", () => {
				span.c("page-navm-wtitle", "List");
				span.c("muted", "A pane, not a page: it never appears in the left tree.");
				a("Back to the model").href("../");
			});
			div.c("page-navm-wpane page-navm-wcanvas", () => {
				span.c("page-navm-wtitle", "Canvas");
				span.c("muted", "kind: \"workspace\" — the page fills the room beside the left tree, edge to edge, with no padding.");
			});
			div.c("page-navm-wpane", () => {
				span.c("page-navm-wtitle", "Properties");
				span.c("muted", "The left tree shows this page as one row; the panes are its own business.");
			});
		});
	},
});
