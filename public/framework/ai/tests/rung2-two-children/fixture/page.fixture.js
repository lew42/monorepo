import { Page } from "/app.js";

/* Rung 2 of the framework-literacy ladder (public/framework/ai/sessions/2026/10/03/model-weights/model-weights/
 * requirements.md): a page with TWO declared children — one step up from rung 1's single
 * "hello" child. The model's job: add "first" and "second" as real child pages, each with its
 * own exact H1, both declared in THIS page's children list. */
export default new Page({
	meta: import.meta,
	title: "Rung 2 floor test",
	description: "Two children, this folder's own job: add 'first' and 'second' as real pages.",

	content(){
		this.previews();
	}
});
