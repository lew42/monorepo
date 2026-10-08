import { Page } from "/app.js";

/* Child "first" of rung 2 (see ../page.js). `title` is already drawn as this page's
 * H1 by the page chrome, so content() doesn't draw a second one. */
export default new Page({
	meta: import.meta,
	title: "First child",
	description: "The first of rung 2's two declared child pages.",
});
