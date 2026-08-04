import { Page, div, a, button, input } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { show, raw, folded, section } from "../../show.js";
import { post, canonical } from "../../posts.js";
import { tag_links } from "../../list.js";

const entry = post("2026-04-02-a-post-that-outgrew-markdown");

export default new Page({
	meta: import.meta,
	title: entry.title,

	content(){
		div.c("post-meta", entry.date);

		md("Every other post on this blog is a `.md` file claimed by `route()`. This one is a real directory with a real `page.js`, because it wanted a thing markdown cannot do:");

		div.c("code", () => {
			div.c("code-label", "live, in the post");
			div.c("content-peek", () => {
				const $count = div.c("post-title", "0");
				let n = 0;

				div.c("row", () => {
					button("−").click(() => $count.text(--n));
					button("+").click(() => $count.text(++n));
					input.c("search-field").attr("placeholder", "…and an input that keeps its value across navigation");
				});
			});
		});

		md("Nothing about the blog changed to allow it. `child(\"2026-04-02-a-post-that-outgrew-markdown\")` found the name **declared** in `children`, so it imported this module instead of offering the name to `route()`. The manifest still supplies the title and blurb the index drew before you clicked.");

		show(() => {
			// blog/page.js — the two tiers, side by side and not interacting
			const blog = new Page({
				children: "2026-04-02-a-post-that-outgrew-markdown",   // -> this file
				route(name){ return post(name) && { /* everything else */ }; },
			});

			// child(name):  a Page -> use it
			//               null   -> declared, import it        <- this post
			//               undef  -> never declared, route() may claim it
		}, "why this one is different");

		md("The trade is that this post's title now lives in two places — the manifest and this module — and nothing catches the drift. That is the same duplication the recipe list on [/content/](/content/) admits to, and it is the price of an escape hatch that needs no flag.").ac("note");

		section("Tags");

		tag_links(entry.tags, "/content/tags/");

		md(`Canonical: [${canonical(entry.slug)}](${canonical(entry.slug)}) — and for this post that is not a choice, because a directory has exactly one place to be.`).ac("note");

		folded("this page.js, verbatim", () => raw(import.meta, "page.js"));
	}
});
