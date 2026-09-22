import { View, div, a, span, p, h1, h2, h3, details, summary, icon, md } from "/app.js";

View.stylesheet(import.meta, "practice.css");

/* ── /layouts/practice/ — the parts the three practice layouts share ───────────
   THE POINT OF THIS FILE. Three whole-page layouts are three different pictures,
   but they answer the same questions and they wear the same navigation, so the
   navigation and the "why it is the way it is" fold are written ONCE here and
   each layout hands them its own data. If the rail drifted between layouts, a
   reader could not tell whether the nav was stable — which is the very thing
   these three pages exist to demonstrate.

   Statics rather than instances: there is nothing to keep, only markup to draw,
   and a static travels down a subclass chain if one of these ever needs its own
   version of a part. No `class Rail`, no `class Wall` — a View subclass's NAME
   becomes a CSS class (`View.classify()`), and `.rail` / `.wall` are two of the
   framework's own five layout words.                                           */

export default class Practice {

	/* THE SITE'S REAL TOP-LEVEL SECTIONS, taken from `public/page.js`'s own
	   `sections` list. Real titles, real urls — the brief asks for real content
	   so the judgement is honest, and a nav of invented names would hide the one
	   problem a nav really has, which is that labels are longer than you hoped. */
	static SECTIONS = [
		{ title: "Home",      url: "/",           icon: "home" },
		{ title: "Framework", url: "/framework/", icon: "widgets" },
		{ title: "Web",       url: "/web/",       icon: "public" },
		{ title: "Imagine",   url: "/imagine/",   icon: "auto_awesome" },
		{ title: "Layouts",   url: "/layouts/",   icon: "view_quilt" },
		{ title: "Websites",  url: "/websites/",  icon: "language" },
		{ title: "Notes",     url: "/notes/",     icon: "sticky_note_2" },
		{ title: "Blog",      url: "/blog/",      icon: "rss_feed" },
	];

	/* THE THREE LAYOUTS, described once. The index draws its cards from this list
	   and every layout page draws its own head from the same entry, so the name
	   and the sentence on the card and the name and the sentence on the page can
	   never disagree. */
	static LAYOUTS = [
		{
			id: "practice-workbench", name: "Workbench", url: "/layouts/practice/workbench/",
			say: "A rail you navigate with, a wall of things to pick from, and a panel that answers — and nothing above or left of the panel moves when you pick.",
			card: "Pick a thing, read about it. The nav never moves.",
			layout: "3-holy-grail",
			approved: "2 (Docs three-region), with 4 (Tile wall) inside its middle track",
			widths: "Three regions at 3440, 1920 and 1440. Two at 1280 — the panel drops under the wall and keeps the rail, capped at the measure so it is never a painted box wider than its own words. At 400 the rail is a strip across the top and the wall is a two-column picker of names, a fifth of the height the full tiles were.",
		},
		{
			id: "practice-reader", name: "Reader", url: "/layouts/practice/reader/",
			say: "An article held at the measure, with the leftover on a wide screen spent on contents, figures and notes instead of grey.",
			card: "One article, one measure, and the wide screen's leftover put to work.",
			layout: "3-holy-grail",
			approved: "2 (Docs three-region)",
			widths: "Three regions at 3440, 1920 and 1440. Two at 1280 — the margin folds under the article, capped at the measure so its two edges land on the article’s. One column at 400. Above the width its three tracks need, the layout holds them and CENTRES rather than stretching: two equal 792px margins at 3440 instead of one grey hole.",
		},
		{
			id: "practice-catalog", name: "Catalog", url: "/layouts/practice/catalog/",
			say: "A hero you can see over, a wall of twelve cards that has no hole at any width, and a footer of real links.",
			card: "Bands, not columns — and a wall whose count always divides twelve.",
			layout: "1-bands",
			approved: "1 (the page grid), with 4 (Tile wall) inside its middle band",
			widths: "Bands at every width; a band never becomes a column. The wall is 6 columns at 3440, 4 at 1920, 3 at 1440, 2 at 1280 and at 1000, and 1 at 400 — every one of those divides 12, so no row is short at ANY width, not just at the four it was proved at.",
		},
	];

	static shot(id, size){ return "/layouts/practice/shots/" + id + "-" + size + ".jpg"; }

	static find(name){ return Practice.LAYOUTS.find(entry => entry.name === name); }

	/* ── THE RAIL ── one list of links, the same markup in all three layouts. The
	   CSS turns it into a column beside the content on a wide screen and a strip
	   across the top at 400; the MARKUP never changes, so a reader's eye finds
	   the same eight words in the same order either way.
	   ⚠ No inner scrolling and no `overflow` of its own: eight links fit inside
	     one fold at all four widths, and a scrollbar nobody asked for is a size
	     that was fixed where it should have been left auto. */
	static rail(current){
		return div.c("std-practice-rail", () => {
			a.c("std-practice-brand").href("/layouts/practice/").append(() => {
				span.c("std-practice-brand-mark", "L42");
				span.c("std-practice-brand-name", "Practice");
			});

			div.c("std-practice-rail-links", () => {
				Practice.SECTIONS.forEach(section => {
					const $link = a.c("std-practice-rail-link").href(section.url).append(() => {
						icon(section.icon);
						span.c("std-practice-rail-label", section.title);
					});
					if (section.title === current) $link.ac("std-practice-rail-on");
				});
			});
		});
	}

	/* ── THE HEAD ── the layout's own title, where the layout wants it, because
	   the page's own `.page-title` is hidden on these three (practice.css). A
	   whole-page layout with somebody else's heading bolted above it would not be
	   a whole-page layout. */
	static head(entry){
		return div.c("std-practice-head", () => {
			h1.c("std-practice-title", entry.name);
			p.c("std-practice-say", entry.say);
			div.c("std-practice-crumbs", () => {
				a.c("std-practice-crumb").href("/layouts/practice/").append(() => { span("All three"); });
				a.c("std-practice-crumb").href("/layouts/" + entry.layout + "/").append(() => { span(entry.layout); });
			});
		});
	}

	/* THE EIGHT CHECKS, named once so three folds print the same eight words in
	   the same order and can be read as one table. */
	static CHECKS = [
		"no text or framed box at x:0",
		"no prose past the measure",
		"no constant where a spacing token exists",
		"a background implies padding; no padding without one",
		"one left axis per region",
		"3440 uses ≥ 0.9 of the viewport",
		"the first nav element above the fold",
		"every overflow box named and wanted",
	];

	/* ── THE FOLD ── "why it is the way it is", shut. Nine answers, one line each,
	   then the four-width line and one line of polish. This is the iceberg: the
	   surface above it is the layout itself, and not one decision is deleted — it
	   is one click down, which is where a decision belongs.
	   ⚠ A `<details>` on the page, not a link to another page: the answers are
	     ABOUT the thing you are looking at, and a reader who has to leave to read
	     them will not read them. */
	/* ⚠ `toc-skip` is `ext/toc`'s documented opt-out, and it is load-bearing on the
	     Reader: toc() scans every `h2`/`h3` inside the page, so without it these
	     answers would appear in the article's table of contents as though they
	     were sections of the article. */
	static fold(entry, answers, polish){
		return details.c("std-practice-why toc-skip").append(() => {
			summary(() => {
				span.c("std-practice-why-mark", "Why it is the way it is");
				span.c("std-practice-why-hint", "nine answers, the four widths, the polish line");
			});

			div.c("std-practice-why-body", () => {
				div.c("std-practice-answers", () => {
					answers.forEach(([question, answer]) => {
						div.c("std-practice-answer", () => {
							h3.c("std-practice-answer-q", question);
							p.c("std-practice-answer-a", answer);
						});
					});
				});

				h2("The four widths");
				p.c("std-practice-widths", entry.widths);

				h2("Polish, measured");
				p.c("std-practice-polish", polish);
				div.c("std-practice-chips", () => {
					Practice.CHECKS.forEach((name, i) => {
						span.c("std-practice-chip", String.fromCharCode(97 + i) + " · " + name);
					});
				});
				md("The whole table — eight checks × four widths × three layouts, read back by headless Chromium — is in [this task's log](/framework/ai/2026-09-17/practice-layouts/).");
			});
		});
	}
}
