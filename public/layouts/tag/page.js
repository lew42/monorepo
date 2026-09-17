import { Page, div, a, span, p, md, h2 } from "/app.js";
import Layout, { load, slug, tagged, word_of, find, is_tag } from "../Layout.js";

/* ── /layouts/tag/ — the navigation ────────────────────────────────────────────
   LAYOUT. Container: a child of `/layouts/`, so the ordinary page grid again —
   sentences in `main`, the wall of drawings in `wide`. Size: a `grid auto-fill`
   wall at `--column: 15em`, one across at 400 and six at 3440. Own layout: chips,
   then a wall. Regions: two. Preview: the default card.

   WHAT THIS IS FOR — the owner's own sentence: "maybe i just want to be able to
   click through these tags, and see other layouts that fit that tag". Every id,
   every word, every technique and every trait in layouts.json is a tag, and every
   tag chip anywhere on the site comes here.

   ⚠ The tag pages are ROUTED from the data, like the layout pages one level up. A
     tag that no layout carries gets a real 404 rather than an empty page.        */

let DATA = null;
load().then(data => { DATA = data; });

export default new Page({
	meta: import.meta,
	title: "Tags",
	icon: "sell",
	description: "Click a tag, get every layout that carries it.",

	route(name){
		if (name.includes(".")) return;
		if (DATA && !tagged(DATA, name).length && !word_of(DATA, name)) return;

		return {
			title: name.replace(/-/g, " "),
			content(){ tag_page(name); },
		};
	},

	content(){
		md("Every id, every word, every CSS technique and every trait in the standard is a **tag**. A tag page lists every layout that carries it — and, once the corpus beside this one is filled, every real website too.");

		div.c("wide", $all => {
			load().then(data => {
				$all.append(() => {
					Layout.tag_row(data);

					h2("The words");
					p.c("std-branch-say", "A word earns its place by describing MANY layouts. These are the ones that do.");

					div.c("std-words", () => {
						data.words.forEach(word => div.c("std-word", () => {
							a.c("std-word-name", word.word).href("/layouts/tag/" + slug(word.word) + "/");
							span.c("std-word-kind", word.kind + (word.candidate ? " · candidate" : ""));
							span.c("std-branch-say", word.means);
						}));
					});
				});
			});
		});
	},
});

/* ONE TAG. What it means if it is a defined word, then every layout carrying it,
   then every real site — and the whole tag row at the bottom with this one lit, so
   a reader can keep clicking without going back.
   ⚠ No DOM after an `await`: the boxes are captured here and filled in callbacks. */
function tag_page(name){
	div.c("flow", $intro => {
		load().then(data => { $intro.append(() => { meaning(data, name); }); });
	});

	div.c("std-thumbs wide", $wall => {
		load().then(data => { $wall.append(() => { tagged(data, name).forEach(entry => Layout.thumb(entry)); }); });
	});

	/* ⚠ `wide`: this is the chip list of every real website carrying the tag, and in the
	 * reading track twelve chips wrapped to three lines inside an 800px column with
	 * 2600px of empty screen beside them at 3440. `.std-body` gives the sentences
	 * their 40em back and lets only the chips spread (layouts.css). */
	div.c("std-body flow wide", $sites => { sites(name, $sites); });

	div.c("wide", $rest => {
		load().then(data => {
			$rest.append(() => {
				h2("Every other tag");
				Layout.tag_row(data, name);
			});
		});
	});
}

function meaning(data, name){
	const word = word_of(data, name);
	const carried = tagged(data, name);
	const entry = is_tag(data, name) ? null : find(data, name);

	if (word){
		md(`**${word.word}** — *${word.kind}${word.candidate ? ", a candidate name only" : ""}.* ${word.means}`);
		if (word.answers) md(`This one answers ${word.answers}`);
	}

	/* An ID reached through the tag door. The corpus next door writes ids into a site's
	   tag list, so `/layouts/tag/4-equal/` is a url a reader really does try; say plainly
	   that it is a layout, not a tag, and send them to the layout's own page. */
	if (entry) return void md(`\`${name}\` is a layout **id**, not a tag — ${slug(entry.id) === slug(name) ? "" : `it is another name for \`${entry.id}\`, and `}its own page, drawn at three widths, is [/layouts/${entry.id}/](/layouts/${entry.id}/). A tag describes a layout; an id **is** one.`);

	md(carried.length === 1
		? "One layout in the standard carries this tag."
		: `${carried.length} layouts in the standard carry this tag.`);
}

/* The corpus, if it is there. `/websites/site/index.json` is a sibling's file and
   may not exist yet — a missing corpus draws nothing at all rather than an empty
   heading, so this page is never half a promise. */
function sites(name, $sites){
	fetch("/websites/site/index.json")
		.then(res => res.ok ? res.json() : null)
		.then(index => {
			const all = index?.sites ?? (Array.isArray(index) ? index : []);
			const hits = all.filter(site => (site.tags ?? []).some(tag => slug(tag) === slug(name)));
			if (!hits.length) return;

			$sites.append(() => {
				h2("Real sites with this tag");
				div.c("std-tags", () => {
					hits.forEach(site => a.c("std-tag")
						.href("/websites/" + slug(site.name ?? site.id) + "/")
						.append(() => { span(site.name ?? site.id); }));
				});
			});
		})
		.catch(() => {});
}
