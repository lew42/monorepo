import { div, a, time } from "/app.js";
import { tags, neighbors } from "./posts.js";

/* The three views every content index needs, written once.
 *
 * All of them take `base` — the url this list links INTO — because the same rows
 * are drawn by the blog index (`/content/blog/`), by a tag page listing the
 * canonical copies (`/content/blog/` again), and by a tag page that CONTAINS its
 * articles (`/content/tags/graph/`). Same data, three destinations, one renderer.
 *
 * Nothing here fetches, imports a page, or reads window.location. It is array
 * methods over posts.js and `<a href>`, which is why an index of six posts costs
 * the same as an index of six hundred: one module.
 */

export function post_list(list, base){
	return div.c("post-list", () => list.forEach(post =>
		a.c("post", () => {
			time.c("post-date", post.date).attr("datetime", post.date);
			div.c("post-title", post.title);
			div.c("post-blurb", post.blurb);
			div.c("post-tags", () => post.tags.forEach(tag => div.c("post-tag", tag)));
		}).href(base + post.slug + "/")));
}

// A post's own tags, as links. `.page-link` is the site's existing pill — rung 3
// of the CSS ladder, so this adds no stylesheet of its own.
export function tag_links(names, base){
	return div.c("row", () => names.forEach(name =>
		a.c("page-link", name).href(base + name + "/")));
}

// Every tag with its count. The count is free: it is a reduce over the manifest,
// not a question anybody has to import a page to answer.
export function tag_cloud(base){
	return div.c("row", () => tags().forEach(([name, count]) =>
		a.c("page-link", `${name} · ${count}`).href(base + name + "/")));
}

/* The chain, as links — the instrument for the whole tag experiment.
 *
 * `page.chain()` walks `parent` upward, and `parent` is whoever adopted this
 * node. So this renders the path you ARRIVED by, which for a tagged article is
 * not the same as where the article lives. Put it on both copies and the cost
 * of a node-per-path stops being an argument and becomes something you can read.
 */
/* Prev / next through the EDITORIAL order — the sequence in posts.js, which
 * crosses four directories and includes a url with no file behind it.
 *
 * Returns null when this url is not in the sequence, and returns it BEFORE
 * building anything: a factory called and then discarded would already have
 * captured itself into the page.
 */
export function order_nav(url){
	const [prev, next] = neighbors(url);

	if (!prev && !next) return null;

	return div.c("order-nav", () => {
		step(prev, "← Previous", "start of the sequence");
		step(next, "Next →", "end of the sequence");
	});
}

function step(entry, direction, fallback){
	if (!entry) return div.c("order-end", fallback);

	return a.c("order-step", () => {
		div.c("order-dir", direction);
		div.c("order-title", entry.title);
	}).href(entry.url);
}

export function crumbs(page){
	return div.c("crumbs", () => page.chain().forEach(p =>
		a.c("crumb", p.title).href(p.url)));
}
