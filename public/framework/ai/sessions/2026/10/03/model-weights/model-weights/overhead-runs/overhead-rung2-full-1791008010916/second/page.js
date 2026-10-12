import { Page } from "/app.js";

/* Child "second" of rung 2 (see ../page.js). `title` is already drawn as this page's
 * H1 by the page chrome, so content() doesn't draw a second one. */
export default new Page({
	meta: import.meta,
	title: "Second child",
	description: "The second of rung 2's two declared child pages.",
});
