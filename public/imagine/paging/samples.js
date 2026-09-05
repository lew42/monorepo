import { div, h3, p, span, a } from "/app.js";
import { MECHANISMS, CONTENT } from "./words.js";
import { listed, url as post_url } from "/blog/posts.js";

/* ── THE SAMPLE — one thing, at five sizes ─────────────────────────────────────
   Every demo page in this realm shows the SAME sample, and the content chips
   (`xs` `s` `m` `l` `xl`) decide how much of it you see. The rule that makes the
   axis mean "size":

     ⚠ EVERY RUNG KEEPS EVERYTHING THE RUNGS BELOW IT SHOWED.

   Going up adds; it never replaces. So the title that was there at `xs` is still
   the first line at `xl`, and the only thing that changed is how tall the box got.
   (Before 2026-09-04 each rung drew DIFFERENT words, and the owner read the chips
   as a content switcher rather than a size — which is exactly what they were.)

   The last two rungs are REAL THINGS THE SITE ALREADY BUILT, not placeholder
   prose:

     `l`   four cards in the `ui/` card template, verbatim — /framework/ui/card/
     `xl`  the blog's own posts, drawn in core's own `page-previews` card wall

   ⚠ The blog's MANIFEST is imported (`/blog/posts.js`, data only) but its Post
     CLASS is not: `Post.js` loads `blog.css` as a side effect, and that sheet sets
     `--column` on `.page-previews` — it would quietly re-size every card wall on
     the page that imported it. The two classes below are core's own (Page.css),
     which is what `Post.wall()` draws too, so the cards look the same without the
     stylesheet coming along.                                                    */

// Which rung a word is, 1–5. An unknown word is the smallest, never nothing.
export const rank = size => Math.max(1, CONTENT.indexOf(size) + 1);

const LINE = "Four answers, and every item on this site wears one of them.";

const PARAGRAPH = "A page is an icon, some content, and children you can navigate. That is the whole shape, and every page on this site is it. What a page SYSTEM adds is two decisions on top: where a child goes when you click it, and what the surface looks like while it goes there.";

/* THE LADDER. Read it top to bottom and you can say what each chip adds — which is
   the one thing the reader has to be able to do. */
export function sample(size, title = "What does a click do?"){
	const n = rank(size);

	return div.c("paging-sample", () => {
		h3.c("paging-word", title);

		if (n >= 2) p.c("paging-line", LINE);
		if (n >= 3) p(PARAGRAPH);
		if (n >= 4) cards();
		if (n >= 5) wall();
	});
}

/* `l` — FOUR CARDS, in the `ui/` card template exactly as that page hands it to you:
   `div.c("surface pad flex v gap")`, an `h4 muted` eyebrow, a heading, a line of
   prose, and `--gap: 0.5em`. Copied rather than imported on purpose: `ui/card` is a
   template tier — there is nothing to import, and the markup IS the component
   (/framework/ui/readme.md). */
export function cards(){
	return div.c("paging-cards", () => Object.entries(MECHANISMS).forEach(([word, mech]) =>
		div.c("surface pad flex v gap", () => {
			div.c("h4 muted", "mechanism");
			h3(word);
			p(mech.does);
		}).style("--gap", "0.5em")));
}

/* `xl` — A WALL, and the things in it are real: every listed post in the blog's
   manifest, in core's own card wall. A wall is what a wide column is FOR — the
   content earns the width, not the page. */
export function wall(){
	return div.c("page-previews paging-postwall", () => listed().forEach(post =>
		a.c("page-preview").href(post_url(post)).append(() => {
			span.c("page-preview-title", post.title);
			div.c("page-preview-desc", post.description);
		})));
}

export default sample;
