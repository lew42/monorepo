import { Page, p, div, a, span, input } from "/app.js";
import { code, section } from "../../ui.js";
import { recipe } from "../recipe.js";
import { symbols, modules, find, of_module, members_of } from "./symbols.js";

/* An API reference for "Strand" — 115 symbols, 32 of them with members.
 *
 * This is route()'s case, and the reason is arithmetic: 115 directories is
 * filing, and `children: "Strand Signal Computed …"` would be 115 requests just
 * to print an index. One data module, one route(), and the index knows every
 * name, kind, module and member before it paints.
 */
const nav = () => ({
	meta: import.meta,
	title: "Strand API",

	// No children at all: every segment under me is mine to claim. The claimed
	// page claims its own members the same way — route() nests, because what it
	// returns is just another set of Page options.
	route(name){
		const symbol = find(name);
		return symbol && {
			title: name,
			route(member){ return members_of(name).includes(member) && member_page(symbol, member); },
			content(){ symbol_page(symbol); },
		};
	},

	classes: "patterns-fills",

	content(){
		this.$pages = div.c("pages cols", () => div.c("col", () => this.index()));
	},
});

export default new Page(nav(), {

	index(){
		recipe(nav);

		p(`${symbols.length} symbols, 0 files, 0 declared children. Type in the box: the filter runs over data that is already in memory, which is the whole difference between this page and a nav over unimported children.`);

		this.search();

		code(`
type "query"        115 -> 27
open a symbol, come back        still 27, still typed
reload                          back to 115
location.search                 "" the whole time`, "measured — this filter is DOM state, deliberately");

		p("It survives a round trip for free, because pages are built once and only hidden. It does not survive a reload and is not in the url — which is right here, since nobody links a colleague to a half-typed search. The catalogue's filters are the same mechanism with the opposite requirement, and that pair is the whole argument for `query()` being an opt-in hook rather than a behaviour.").ac("note");

		section("What a nav over DATA knows, and a nav over FILES does not");

		code(`
children: "Strand Signal …"   names       115 requests to learn 115 titles
route() + symbols.js          objects     1 request, and it knows kind, module,
                                          signature, summary and members too

measured   /patterns/api/Store/subscribe/   3 page.js, 14 js in total`);

		p("The docs site pays for laziness in labels — `previews()` prints `reference` or `Config reference` depending on how you arrived, and a tab bar prints declared names for the same reason. An index built from data has no such problem, because the knowledge arrived with the module. Laziness costs you knowledge; data costs you the download. At 115 symbols the download is cheaper, and it is not close.").ac("note");

		section("route() nests");

		code(`
/patterns/api/Store/            api.route("Store")     -> a page
/patterns/api/Store/subscribe/  that page.route("sub…") -> a page

children.get(name)  ->  undefined  ->  route() may claim it
                                       …and what it returns is Page options,
                                       so it may carry a route() of its own`);

		div.c("row", () => {
			a.c("page-link", "Store").href("/patterns/api/Store/");
			a.c("page-link", "Store.subscribe").href("/patterns/api/Store/subscribe/");
			a.c("page-link", "a symbol that does not exist").href("/patterns/api/Nope/");
		});

		p("That last link 404s, and the cost is worth knowing: `Router.go()` hands an unresolved url to `location.assign()`, so a dead in-app link costs a full page reload before the error appears. An API reference is exactly where stale links accumulate.").ac("note");
	},

	/* A live filter over the whole surface. It is DOM state, not url state —
	 * which is not a shortcut, it is the honest reading: this box is the same
	 * question the catalogue's filters ask, and here the answer is different
	 * because nobody links a colleague to a half-typed search. */
	search(){
		let $field, $count;

		div.c("row", () => {
			$field = input().attr("type", "search").attr("placeholder", "filter…").attr("size", 22);
			$count = span(this.tally());
		});

		const groups = modules.map(name => {
			const links = [];
			const $heading = section(`${name} · ${of_module(name).length}`);
			const $list = div.c("page-previews", () => of_module(name).forEach(symbol =>
				links.push({ symbol, $link: a.c("page-preview", symbol[0]).href(`/patterns/api/${symbol[0]}/`) })));

			return { $heading, $list, links };
		});

		$field.on("input", () => this.filter(groups, $field.el.value.trim().toLowerCase(), $count));
	},

	filter(groups, query, $count){
		let hits = 0;

		groups.forEach(group => {
			const shown = group.links.filter(({ symbol }) => matches(symbol, query));

			group.links.forEach(({ symbol, $link }) => matches(symbol, query) ? $link.show() : $link.hide());
			[group.$heading, group.$list].forEach($view => shown.length ? $view.show() : $view.hide());

			hits += shown.length;
		});

		$count.text(query ? `${hits} of ${symbols.length} match "${query}"` : this.tally());
	},

	tally(){ return `${symbols.length} symbols in ${modules.length} modules`; },
});

// name, module or kind — an API filter is three fields, not a search engine
function matches([name, kind, module], query){
	return !query || `${name} ${kind} ${module}`.toLowerCase().includes(query);
}

/* The symbol page and the member page. Both are plain content functions: they
 * are handed a row of the data module and render it, and neither knows it was
 * reached through a url. */
function symbol_page(symbol){
	const [name, kind, module, signature, summary, members] = symbol;

	code(`${signature}\n\n${kind} · ${module}`, `${module}.${name}`);
	p(summary);

	if (members){
		section("Members");
		div.c("page-previews", () => members.split(" ").forEach(m =>
			a.c("page-preview", m).href(`/patterns/api/${name}/${m}/`)));
		p("Each of those is a real url with nothing on disk behind it, claimed by a `route()` that this page carries.").ac("note");
	}

	section("See also");
	div.c("page-previews", () => of_module(module).filter(s => s[0] !== name).slice(0, 6)
		.forEach(s => a.c("page-preview", s[0]).href(`/patterns/api/${s[0]}/`)));

	section("What produced this page");
	recipe(nav, "no file, no declaration — my parent's navigation is the whole of it");
}

function member_page(symbol, member){
	const [name, , module] = symbol;

	return {
		title: `${name}.${member}`,
		content(){
			code(`${name}.${member}(…)\n\nmember of ${module}.${name}`, "deep link");
			p(`Reached at /patterns/api/${name}/${member}/ — three columns, and the middle one is itself a page that was invented on the way past.`);
			div.c("row", () => a.c("page-link", `← ${name}`).href(`/patterns/api/${name}/`));
		},
	};
}
