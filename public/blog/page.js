import { Page, md, div, a, span, time } from "/app.js";
import { listed, dated } from "./posts.js";

/* THE INDEX. Plain {slug, title, date, description} data, exactly like the homepage's
 * `sections` and for exactly the same reason: declaring the posts as `children` would
 * auto-import every post module — and every markdown fetch in it — just to print a
 * list of titles. The route walk finds a post anyway (`Page.child()` probes the
 * filesystem when a name is not declared), so the manifest is enough to LINK them and
 * the module is only loaded when someone opens one. */
export default new Page({
	meta: import.meta,
	title: "Blog",
	description: "Notes on building a web framework with no build step.",

	content(){
		md("Working notes from a no-build framework — the page system, the layout generators, the panels, and the AI dashboard that watches it all get built. Every post links to the live thing it is about.");

		/* `.page-previews` IS the site's card wall (Page.css) — one arrangement for
		 * every index here. `--column` is the only decision: 24em gives four columns
		 * at 1920 and seven at 3440 rather than one enormous card each. */
		div.c("page-previews bleed", () => listed().forEach(post => {
			a.c("page-preview").href("/blog/" + post.slug + "/").append(() => {
				span.c("page-preview-title", post.title);
				time.c("blog-card-date", dated(post.date)).attr("datetime", post.date);
				div.c("page-preview-desc", post.description);
			});
		})).style("--column", "24em");
	},
});
