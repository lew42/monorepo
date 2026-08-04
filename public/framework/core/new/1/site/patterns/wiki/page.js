import { Page, p, div, a, span } from "/app.js";
import { code, section } from "../../ui.js";
import { recipe } from "../recipe.js";
import { notes, find, links_from, links_to, orphans } from "./notes.js";

/* A notebook: sixteen notes, arbitrary cross-links, no hierarchy.
 *
 * The recipe is one line long and that is the finding. `chain()` is a tree walk,
 * `container()` is a tree walk, and `url = parent.url + name` is a tree. A graph
 * gets nothing from any of them, so it goes FLAT and builds its own navigation
 * out of the data — backlinks, orphans, recently edited. That works, the
 * framework does not fight it, and it should not grow a graph mode.
 */
const nav = () => ({
	meta: import.meta,
	title: "Notebook",

	// Every note is one segment under me. Not because they are shallow — some
	// are five hops from the index — but because depth is not a property a graph
	// has, and inventing one would mint a second url for every second path in.
	route(slug){ return find(slug) && note_page(slug); },

	content(){ this.body(); },
});

export default new Page(nav(), {

	body(){
		recipe(nav);

		p("Sixteen notes, one level, no tree. `idempotency` is reached from three other notes and `partitioning` and `ordering` reference each other — a cycle, which a path cannot express and a flat url does not notice.");

		section("All notes");

		div.c("page-previews", () => notes.forEach(([slug, title]) =>
			a.c("page-preview", title).href(`/patterns/wiki/${slug}/`)));

		section("Navigation a tree cannot give you");

		code(`
backlinks   who links HERE          computed from the graph, both directions
orphans     nobody links here       ${orphans().join(", ")}
cycles      ordering <-> partitioning`);

		p("None of those three is expressible as a parent. All three are one pass over a data module, which is the same bargain the API reference made: a graph app is a data-driven app, always, because backlinks need the whole graph and a lazily-imported page tree can never have it.").ac("note");

		section("What breaks");

		code(`
chain()      always [root, patterns, wiki, note] — depth 4 for every note
crumbs       "Notebook › Leases" is true and useless
cols         two columns, forever, whatever the content means
previews()   empty: route()-claimed children are not in the map until visited
"up"         has no meaning; "back" does, and the browser already has it`);

		p("Nothing here is a bug — it is the tree assumption being honest about itself. The one thing worth asking for is that the cost be written down: a page whose children come from `route()` gets no `previews()`, no crumb trail and no column arrangement, and has to build all three from its data. Every product in this section that used `route()` hit the same wall.");

		section("The alternative, and why not");

		code(`
/wiki/leases/idempotency/retries/    a path through the graph

- the same note gets a different url per route in — duplicate content
- moving a note breaks every link that walked through it
- chain() would finally be true, and would still be a reading history`);

		div.c("row", () => {
			a.c("page-link", "start at Leases").href("/patterns/wiki/leases/");
			a.c("page-link", "onboarding →").href("/patterns/onboarding/");
		});
	},
});

function note_page(slug){
	const [, title, date, paragraphs] = find(slug);

	return {
		title,
		content(){
			p(date).ac("note");

			paragraphs.forEach(text => p(() => wikilinks(text)));

			const back = links_to(slug);
			const out = links_from(slug);

			if (out.length){
				section("Links to");
				div.c("page-previews", () => out.forEach(ref => note_link(ref)));
			}

			section(back.length ? "Linked from" : "Linked from — nothing yet");
			if (back.length) div.c("page-previews", () => back.forEach(ref => note_link(ref)));
			else p("An orphan. It is reachable, indexed and perfectly real; it just has no way in except the index.").ac("note");

			section("What produced this page");

			recipe(nav, "no file, no declaration — my parent's navigation is the whole of it");

			div.c("row", () => a.c("page-link", "← Notebook").href("/patterns/wiki/"));
		},
	};
}

// [[slug]] becomes a link, everything else becomes text — the whole of wiki syntax
function wikilinks(text){
	text.split(/(\[\[[\w-]+\]\])/).forEach(part => part.startsWith("[[")
		? a(title_of(part.slice(2, -2))).href(`/patterns/wiki/${part.slice(2, -2)}/`)
		: span(part));
}

function note_link(slug){
	return a.c("page-preview", title_of(slug)).href(`/patterns/wiki/${slug}/`);
}

const title_of = slug => find(slug)?.[1] ?? slug;
