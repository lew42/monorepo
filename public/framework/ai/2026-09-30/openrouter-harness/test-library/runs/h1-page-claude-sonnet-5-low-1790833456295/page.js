import { Page } from "/app.js";

/* The "here" for the h1-page test (rung 1, the floor every model should pass):
 * a plain landing page with no children yet. The model's job is to add a new
 * child page.js beside this one — library.mjs copies this into a fresh run
 * dir per run, and the run dir itself IS this page (the model may also just
 * edit THIS file directly; either reading is fine, the mechanical check only
 * looks for an H1 saying the right words somewhere reachable from this url). */
export default new Page({
	meta: import.meta,
	title: "Floor test",
	description: "The simplest page in the test library — a home for the h1-page test.",
	children: "hello",

	content(){
		this.previews();
	}
});
