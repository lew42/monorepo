import { Page, div, a, span, p, pre, code, md, h2, details, summary } from "/app.js";
import Layout, { load, slug, find, numbers } from "./Layout.js";

/* ── /layouts/ — the layout standard ───────────────────────────────────────────
   LAYOUT, the five questions. Container: a top-level page in `app.$pages`, so the
   ordinary page grid — `main` is the reading track, `wide` is every pixel left of
   the gutters. Not under a columns host. Size: the tree is a wall of twelve
   drawings, so it claims `wide`; the sentences stay in `main`. Own layout: one
   branch per column count, each a heading and a `grid auto-fill` wall at
   `--column: 15em` — one thumbnail across at 400, six at 3440. Regions: three — the
   two sentences, the tree, the tag row. Preview: the card the homepage's section
   list draws from `description`.

   WHAT THIS PAGE IS FOR. A reader should be able to point at a screenshot of any web
   page and say its id out loud. So: what an id is, in two sentences, then every
   layout there is, drawn, grouped by how many columns it has.

   ⚠ The layout pages are ROUTED, not declared — `route()` below builds one from
     layouts.json the moment a url asks for it. Twelve `page.js` files that each
     read one object out of a file would be twelve chances for the file and the
     page to disagree; there is one page, and the file is the only copy.          */

// Fired at module eval so a cold deep link usually has the data before route() asks.
let DATA = null;
load().then(data => { DATA = data; });

/* `N-equal` IS A FAMILY, not a list. Any count can be equal, so `5-equal` is a legal id
   the moment a page needs one — and a real footer in the corpus (django-docs-index) is a
   fixed five columns. The book draws the counts real pages use; this answers the rest
   rather than 404ing at a name the standard's own rule says is valid. */
const FAMILY = /^(\d+)-equal$/;

export default new Page({
	meta: import.meta,
	title: "Layouts",
	icon: "dashboard",
	description: "Every layout named, defined and drawn at three widths.",

	children: "browse practice shell labs tag doc",

	/* A layout's page, built from its entry. `route()` sees undeclared names only, so
	   it can never shadow `tag` or `doc`.
	   ⚠ It has to answer SYNCHRONOUSLY and the data arrives over the network, so:
	     once the file is in, an unknown name is refused and gets a real 404; before
	     it is in — only ever a cold deep link — the name is claimed, and the page
	     says so itself if the id turns out not to exist. */
	route(name){
		if (name.includes(".")) return;

		const entry = DATA && find(DATA, name);
		if (DATA && !entry && !FAMILY.test(name)) return;

		return {
			title: entry?.id ?? name,
			content(){ layout_page(name); },
		};
	},

	/* ONE SENTENCE, THEN THE PICTURES. A newcomer arrives here not knowing what a
	   "layout" is supposed to be; the fastest way to tell them is twelve of them,
	   drawn. The rule that makes the ids work sits UNDER the tree, where a reader who
	   has now seen the thing will believe it. */
	content(){
		md("**Every way a web page can divide its room, named and drawn.** An id is `N-name`: the number is how many columns it has on the widest screen it is meant for, and the name says how the room is divided. Point at any screenshot, say the id out loud.");

		div.c("std-tree wide", $tree => {
			load().then(data => { $tree.append(() => { tree(data); }); });
		});

		md("**A flex row and a grid that make the same picture are the same layout.** So `2-sidebar` is a narrow column beside a wide one whatever CSS built it, and the technique is a [tag](/layouts/tag/2-column-flex/) instead — as are paint, proportion, and which side the sidebar sits on. Click any tag and you get every layout that carries it. [The rules in full](/layouts/doc/naming/).");

		md("**[What 47 real sites actually do →](/websites/patterns/)** — these same words, counted across the corpus next door: which arrangements the web really uses, what each one becomes on a phone, and which three are worth copying.");

		md("**[Approve or improve every layout on the site →](/layouts/browse/)** — the twelve above, plus the whole-page shapes, the section templates and the ui and ux components the rest of this site is built from: every one of them a picture, in three tiers, each with a verdict button.");

		md("**[Three of them built big, at 3440 →](/layouts/practice/)** — a workbench, a reader and a catalog: whole pages, filled with this site's own content, each one holding at 400 as well, with every decision behind a fold at the bottom.");

		md("**[A sidebar that never moves, and a tree of homepage designs →](/layouts/shell/)** — drag the sidebar to any width and click a row: the viewport beside it redraws. A base homepage, and seven designs under it, each one the design above it with a single thing added, changed or taken away.");

		md("**[Six labs where a shape got tried before it earned an id →](/layouts/labs/)** — an app shell, what a click does to your screen, a horizontal band, a blog at 3440, a magazine page, a deck cut into regions. Moved here from `/imagine/` on 2026-09-18.");

		div.c("wide", $tags => {
			load().then(data => {
				$tags.append(() => {
					h2("Every tag");
					p.c("std-branch-say", "A tag is the navigation. Each one lists every layout that carries it, and every real website next door that carries it too.");
					Layout.tag_row(data);
				});
			});
		});
	},
});

/* ── THE TREE ── one branch per column count: 1, 2, 3, 4, then `n` for the layouts
   whose count is not a number at all. */
export function tree(data){
	numbers(data).forEach(n => {
		const entries = data.layouts.filter(entry => entry.n === n);

		div.c("std-branch", () => {
			div.c("std-branch-head", () => {
				span.c("std-n", String(n));
				span.c("std-branch-say", data.branches?.[String(n)] ?? "");
			});

			div.c("std-thumbs", () => { entries.forEach(entry => Layout.thumb(entry)); });
		});
	});
}

/* ── A LAYOUT'S PAGE ── the drawing at three widths first, because the picture IS
   the definition; the words under it; the CSS one click down.
   ⚠ No DOM after an `await`: every box is captured synchronously here and filled
     inside `.append(callback)`, which re-establishes the captor. */
export function layout_page(name){
	div.c("std-shots wide", $shots => {
		load().then(data => {
			const entry = find(data, name);
			$shots.append(() => { if (entry) Layout.WIDTHS.forEach(size => Layout.shot(entry, size)); });
		});
	});

	/* ⚠ `wide`, not the reading track. Everything under the drawings — the tag row, the
	 * two folds, the list of real websites — is a WALL of little things, and in the
	 * `main` track all of it stood in a 40em column with 2700px of empty screen beside
	 * it at 3440 (measured 2026-09-08). `.std-body` (layouts.css) hands the sentences
	 * their measure back, so the prose still reads at 40em and only the rows spread. */
	div.c("std-body flow wide", $body => {
		load().then(data => { $body.append(() => { body(data, find(data, name), name); }); });
	});
}

function body(data, entry, name){
	if (!entry && FAMILY.test(name)) return family(data, name);
	if (!entry) return void md(`There is no layout called \`${name}\`. [Every one there is](/layouts/) is on the front page.`);

	if (slug(entry.id) !== slug(name))
		md(`\`${name}\` is another name for this one. Its id is \`${entry.id}\`.`);

	md("## " + entry.title);
	md(entry.summary);
	md("**When to use it.** " + entry.when);

	md(`**At 400 it becomes [\`${entry.responds}\`](/layouts/${entry.responds}/).** ${entry.responds_note}`);

	if (entry.why_a_number) md("**Why a number and not a name.** " + entry.why_a_number);

	if (entry.aliases?.length)
		md(`Also called: ${entry.aliases.map(alias => "`" + alias + "`").join(", ")} — and every one of those is a working url, so \`/layouts/${slug(entry.aliases[0])}/\` lands right here.`);

	md("### Tags");
	p.c("std-branch-say", "Each one lists every other layout that carries it.");
	Layout.chips(entry.tags);

	recipes(entry);
	related(data, entry);
}

/* A COUNT THE BOOK DOES NOT DRAW. `equal` is the one word that works at any number, so
   the id is valid and the answer is the family, not a 404 — the two that ARE drawn, and
   the sentence that says when a bigger count is honest. */
function family(data, name){
	const n = name.match(FAMILY)[1];
	const drawn = data.layouts.filter(entry => entry.name === "equal");

	md(`**${n} columns, every one the same width.** There is no drawing of this count, and there does not need to be: \`equal\` is a *family*, not a list. Any number of columns can share the room evenly, so \`${name}\` is a legal id the moment a page needs it — the corpus next door has exactly one, a footer of five columns that never wraps.`);
	md(`**Past three, ask first.** A fixed count above three is nearly always a card wall that was written the hard way, and [\`n-wall\`](/layouts/n-wall/) is what was wanted: it names a column *width* and lets the room decide. A footer is the honest exception, because there the count really is deliberate. \`4-equal\` was drawn once and then deleted for this reason — it now lands on \`n-wall\`, and [\`doc/decisions\`](/layouts/doc/decisions/) says why.`);

	md("### The counts the book does draw");
	div.c("std-thumbs", () => { drawn.forEach(entry => Layout.thumb(entry)); });
	md("The division is the same at every count; only the number changes. [How the namespace works](/layouts/doc/naming/).");
}

/* THE CSS, one click down. The framework word that already makes this picture, then
   the grid rule, the flex rule, and what wrap does to the flex one. What is shown is
   ONE WAY to get the picture — never the definition of the layout. */
function recipes(entry){
	return details.c("std-details", () => {
		summary("How to build it — grid, flex, and what wrap does");

		div.c("std-recipes", () => {
			if (entry.framework) div.c("std-recipe", () => {
				div.c("std-tags", () => { span.c("std-tag", "this framework"); });
				pre(() => { code(entry.framework.recipe); });
				md.c("std-recipe-note", `${entry.framework.note} [The reference](${entry.framework.href}).`);
			});

			entry.css.forEach(recipe => div.c("std-recipe", () => {
				Layout.chips([recipe.tag]);
				pre(() => { code(recipe.rules); });
				if (recipe.note) md.c("std-recipe-note", recipe.note);
				if (recipe.wrap) md.c("std-recipe-note", "**What wrap does.** " + recipe.wrap);
			}));
		});
	});
}

/* THE EXAMPLES — every other layout that shares this one's division word or falls
   back to it, plus the real websites tagged with this id once /websites/ exists.
   Nothing is drawn when the corpus is not there yet; a sibling is building it. */
function related(data, entry){
	const kin = data.layouts.filter(other =>
		other.id !== entry.id && (other.name === entry.name || other.responds === entry.id));

	return details.c("std-details", () => {
		summary("Where else this shows up — its kin here, and the real websites that use it");

		div.c("flow", () => {
			if (kin.length){
				md("Layouts that share this one's name, or fall back to it when the room runs out:");
				div.c("std-thumbs", () => { kin.forEach(other => Layout.thumb(other)); });
			} else {
				md("No other layout in the book shares this one's name.");
			}

			div.c("flow", $sites => {
				fetch("/websites/site/index.json")
					.then(res => res.ok ? res.json() : null)
					.then(index => {
						const sites = (index?.sites ?? (Array.isArray(index) ? index : [])).filter(site =>
							(site.tags ?? []).some(tag => slug(tag) === slug(entry.id)));
						if (!sites.length) return;
						$sites.append(() => {
							md("### Real sites using it");
							div.c("std-tags", () => {
								sites.forEach(site => a.c("std-tag")
									.href("/websites/" + slug(site.name ?? site.id) + "/")
									.append(() => { span(site.name ?? site.id); }));
							});
						});
					})
					.catch(() => {});
			});

			/* SECTIONS. `index.mjs` also keys the manifest by every id that turns up as a
			   SECTION layout (`sections[].layout`, tools/index.mjs), not just a whole page's
			   own. A section may write a modifier (`2-sidebar right`), so this resolves each
			   section key through the alias table before comparing — the same fold `find()`
			   already does for a plain tag. */
			div.c("flow", $sections => {
				fetch("/websites/site/index.json")
					.then(res => res.ok ? res.json() : null)
					.then(index => {
						const keys = Object.keys(index?.sections ?? {}).filter(key => (find(data, key)?.id ?? key) === entry.id);
						const names = new Set(keys.flatMap(key => index.sections[key]));
						if (!names.size) return;
						const sites = (index.sites ?? []).filter(s => names.has(s.name));
						$sections.append(() => {
							md("### As a section, on:");
							p.c("std-branch-say", "Not the whole page's layout — this id shows up somewhere inside these pages.");
							div.c("std-tags", () => {
								sites.forEach(site => a.c("std-tag")
									.href("/websites/" + slug(site.name) + "/")
									.append(() => { span(site.name); }));
							});
						});
					})
					.catch(() => {});
			});
		});
	});
}
