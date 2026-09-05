import { div, p, h2, h3, h4, span, a, label, input, select, option, code, icon, md, ui } from "/app.js";

/* ── WHAT GOES IN THE BOX ──────────────────────────────────────────────────────
   One function per CONTENT word in `blocks.js`. Every one of them draws something
   this site already ships, so a preset is a real page and not a picture of one:

     magazine   /imagine/mag/'s own cover code
     blog       the blog's own hero and its real post manifest
     sections   /framework/styles/sections/ — the same hero and stats bands
     cards      core's own `previews()` card markup
     dashboard  the `ui/` stats tile and `ui.table()`
     settings   the `ui/field` template, verbatim
     article    prose at the reading measure
     docs       prose with a real code block

   ⚠ Two of these imports load a stylesheet as a side effect — `mag/page.js` brings
     `mag.css`, `blog/Post.js` brings `blog.css` (which sets `--column` on
     `.page-previews`). `templates/families.js` has imported both since 2026-09-04
     with no fallout; the card walls below set their own `--column` so the blog's
     value cannot reach them.                                                     */

import mag from "/imagine/mag/page.js";
import { Post } from "/blog/Post.js";
import { featured, listed, url as post_url } from "/blog/posts.js";
import hero from "/framework/styles/sections/hero.js";
import stats from "/framework/styles/sections/stats.js";

/* The words the sample pages are written in. One subject — a small product's own
   site — so every preset reads as the same imaginary thing seen through a different
   page shape, which is what makes the shapes comparable. */
const LEDE = "Northwind is a small tool for keeping notes that other people can read. This page is a real, running example of one page shape — everything on it is drawn by the same code the rest of this site uses.";

export const CONTENT_DRAW = {

	article(){
		h2("Notes that other people can read");
		p(LEDE);
		p("An article is the shape most pages are: one column, one idea after another, capped at a width the eye can track without losing the start of the next line. Everything else on this page — the rail, the bar, the colours — is arrangement around this column.");
		p("Change the room word above and this column stays exactly as wide as it should be; change the content word and this whole block is replaced by something else.");
	},

	cards(){
		h2("Everything in the workspace");

		div.c("page-previews paging-wall", () => [
			["Release notes", "What shipped, and when."],
			["Onboarding", "The first hour for a new teammate."],
			["Runbooks", "What to do when the thing breaks."],
			["Decisions", "Why we chose it, and what we rejected."],
			["Glossary", "The words we use, defined once."],
			["Meeting notes", "Kept short, kept searchable."],
		].forEach(([title, note]) => div.c("page-preview", () => {
			span.c("page-preview-title", title);
			div.c("page-preview-desc", note);
		}))).style("--column", "14em");
	},

	dashboard(){
		h2("This week");

		div.c("grid gap auto paging-tiles", () => [
			["Pages", "182"], ["Readers", "1,204"], ["Edits", "37"], ["Comments", "9"],
		].forEach(([label_text, value]) => div.c("surface pad flex v paging-tile", () => {
			p.c("h4 muted", label_text);
			p.c("h1", value);
		}).style("gap", "0.1em"))).style("--column", "9em");

		ui.table(["page", "readers", "last edit"], [
			["Release notes", "412", "2 hours ago"],
			["Onboarding", "308", "yesterday"],
			["Runbooks", "266", "3 days ago"],
			["Decisions", "218", "last week"],
		]);
	},

	settings(){
		h2("Workspace settings");

		div.c("paging-form flex v gap", () => {
			[["Workspace name", "Northwind"], ["Web address", "northwind.example"]].forEach(([words, value]) =>
				label.c("flex v", () => {
					span.c("h4 muted", words);
					input().attr("value", value);
				}).style("gap", "0.3em"));

			label.c("flex v", () => {
				span.c("h4 muted", "Who can read it");
				select(() => { option("Anyone with the link"); option("The team"); option("Only me"); });
			}).style("gap", "0.3em");

			label.c("flex v-center", () => {
				input().attr("type", "checkbox").attr("checked", "checked");
				span("Email me when someone comments");
			}).style("gap", "0.4em");
		});
	},

	// The magazine's own cover, re-classed: the two column words belong to a
	// full-screen page and this is a box inside one.
	magazine(){
		div.c("paging-mag", () => {
			mag.column().rc("page-column-body", "page-column-full").ac("paging-mag-cover");
		});
	},

	blog(){
		Post.hero(featured());

		div.c("page-previews paging-wall", () => listed().slice(0, 6).forEach(post =>
			a.c("page-preview").href(post_url(post)).append(() => {
				span.c("page-preview-title", post.title);
				div.c("page-preview-desc", post.description);
			}))).style("--column", "14em");
	},

	sections(){
		div.c("paging-bands", () => {
			hero("dark");
			stats("prim");
		});
	},

	docs(){
		h2("Writing a page");
		p("A page is a file. Put it at the address you want it to have, export one object, and the site serves it — there is no build step and no registry to add it to.");

		code.js(`export default new Page({
    meta: import.meta,
    title: "Release notes",
    children: "june july august",
});`);

		p("The line that matters is the last one: a page exists once its parent names it. Nothing crawls the filesystem, so a directory nobody named is a directory nobody can reach.");

		h3("What a child costs");
		p("One fetch, when someone navigates to it. A page declares how deep it wants its own subtree loaded and pays for exactly that.");
	},
};

/* The sample child pages a stage navigates between. A stage needs children before
   `navigation` means anything, and these are them: a title, an icon, and one short
   paragraph each. Deliberately the SAME four everywhere, so the only thing that
   changes between two presets is the shape, never the words. */
export const PAGES = [
	{ title: "Overview", icon: "home",     text: "You are looking at the first child. Click another one and watch the box — its edges do not move." },
	{ title: "Pricing",  icon: "sell",     text: "The second child, in the same box, in the same place, at the same size. Only the words changed." },
	{ title: "Docs",     icon: "menu_book", text: "The third. A page system is exactly this decision: where the next thing appears when you click." },
	{ title: "Contact",  icon: "mail",     text: "The last one. Whatever the navigation word above says, these four children never change." },
];

export const draw_content = (kind, box) => box.empty(() => (CONTENT_DRAW[kind] ?? CONTENT_DRAW.article)());

export default CONTENT_DRAW;
