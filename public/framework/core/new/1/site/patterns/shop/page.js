import { Page, p, div, a, h3 } from "/app.js";
import { code, section } from "../../ui.js";
import { recipe } from "../recipe.js";
import { categories, colours, sizes, items, in_category, find, matching } from "./catalog.js";

/* A storefront: categories, listings, an item, and FILTERS.
 *
 * The first three are ordinary — categories are inline children, items are
 * route()'d, and neither needs anything the framework does not have. The
 * filters are the whole finding: colour, size and availability are state that
 * is not a path segment, and new/1's Router reads location.pathname only.
 */
const nav = () => ({
	meta: import.meta,
	title: "Shop",

	// Three categories, no directories. Each one claims its own items, so the
	// item urls are /shop/<category>/<sku>/ and route() nests one level down.
	initialize(){
		categories.forEach(([name, title, blurb]) => this.add(name, {
			title,
			route(sku){ return find(sku) && item_page(sku); },
			query(params){ draw(this, params); },      // <- what Router does not call
			content(){ listing(this, blurb); },
		}));
	},

	content(){ this.body(); },
});

export default new Page(nav(), {

	body(){
		recipe(nav);

		p("Categories, items and an item page all work with what is already here. Everything below is about the fourth thing.");

		section("Categories");

		this.previews();

		section("The finding: a link with a query string loses it");

		code(`
click(e){
    const link = this.link_clicked(e);
    e.preventDefault();
    this.go(link.pathname);          // <- link.search is never read
}

go(url){
    if (await this.load(url)) history.pushState({}, "", url);
}`, "Router.js, unmodified");

		code(`
cold load   /patterns/shop/outerwear/?colour=oxblood     WORKS
            location.search survives; the walk only ever needed the pathname

click       <a href="?colour=oxblood">                   SILENTLY LOSES IT
            navigates to /patterns/shop/outerwear/ and pushes that url`,
			"measured, both directions");

		p("Reloadable but not clickable is the one combination nothing downstream can fake, because the loss happens inside the framework's own click handler. A site can add links; it cannot stop `Router` from discarding half of one.");

		section("The smallest thing that would fix it");

		code(`
// Router.click — carry the query
this.go(link.pathname + link.search);

// Router.load — walk the path, keep the query
const { pathname, search } = new URL(url, location.origin);
const page = await this.load_segments(pathname);
if (page) this.activate(page, search);

// Router.activate — hand it to the leaf, every time
page.query?.(new URLSearchParams(search));`, "four lines, one new userland hook");

		p("`query(params)` is `route(name)`'s twin: `route()` claims a path segment, `query()` reads the modifier on the segment you already claimed. Both are opt-in, both are invisible to a page that does not define one, and neither adds a property to `Page`.");

		section("Proof: the shim");

		p("Each category below implements `query(params)` and an eight-line shim calls it — a click handler that stops the event before `Router`'s document listener sees it, and a `popstate` listener for Back. Open a category, click a colour, then reload the page: the url is the state.");

		section("…and the same blind spot marks every chip as active");

		code(`
mark_links(here = this.active?.url){
    …
    link.classList.toggle("active", link.pathname === here);   // search, again
}

measured at /patterns/shop/outerwear/?colour=oxblood
    black [.active]  ✓ oxblood [.active]  sand [.active]  olive [.active]
    s [.active]  m [.active]  l [.active]  xl [.active]  in stock [.active]  clear [.active]`,
			"all ten, and only the tick tells you which one is on");

		p("A filter chip's pathname IS the page it sits on, so `mark_links()` calls every one of them the current page. Harmless until `styles.css` gave `.page-link.active` a look — which it now has — and then ten chips light up at once. Same root cause, same four-line neighbourhood: the fix is to compare `link.search` too.").ac("note");

		div.c("row", () => categories.forEach(([name, title]) =>
			a.c("page-link", title).href(`/patterns/shop/${name}/`)));

		p("The shim is not a fix. `stopPropagation()` against the framework's own handler is the escalation smell exactly: it works once, for one page, and the next person who wants filters writes it again.").ac("note");
	},
});

/* A category listing: filters, then results, both redrawn by query(). */
function listing(page, blurb){
	p(blurb);

	page.$filters = div.c("row");
	page.$count = p("").ac("note");
	page.$results = div.c("patterns-grid");

	page.query(new URLSearchParams(location.search));

	shim(page);

	section("What this page already implements");

	code(`
query(params){ draw(this, params); }

draw(page, params){
    const hits = matching(page.name, params);
    page.$filters.empty(() => chips(page, params));
    page.$results.empty(() => hits.forEach(item => card(item, page.name)));
}`, `the category's declaration — if Router called query(), this would be the whole feature`);

	p("Leave with a filter on, come back with a clean url, and the filter is still applied — `content()` ran once and nothing re-runs it. That is the second half of the request: `query()` has to be called on every activation, not only the first.").ac("note");
}

function draw(page, params){
	const hits = matching(page.name, params);

	page.$filters.empty(() => chips(page, params));
	page.$count.text(`${hits.length} of ${in_category(page.name).length}`);
	page.$results.empty(() => hits.forEach(item => card(item, page.name)));
}

// every chip is a plain <a href="?…">, which is the point: with the four-line
// Router change these need no JavaScript at all
function chips(page, params){
	axis(page, params, "colour", colours);
	axis(page, params, "size", sizes);

	const stock = params.get("stock") === "in";
	link(page, params, "stock", stock ? null : "in", stock ? "✓ in stock" : "in stock");
	link(page, params, null, null, "clear");
}

function axis(page, params, key, values){
	values.forEach(value => {
		const on = params.get(key) === value;
		link(page, params, key, on ? null : value, (on ? "✓ " : "") + value);
	});
}

function link(page, params, key, value, text){
	const next = new URLSearchParams(params);

	if (!key) [...next.keys()].forEach(k => next.delete(k));
	else if (value) next.set(key, value);
	else next.delete(key);

	return a.c("page-link", text).href(`${page.url}${next.toString() ? "?" + next : ""}`);
}

/* Eight lines standing in for four. The click handler beats Router's to the
 * event; the popstate handler covers Back and Forward. Both are scoped to this
 * page, and both exist only because Router.click() reads link.pathname. */
function shim(page){
	page.$filters.on("click", e => {
		const clicked = e.target.closest("a[href]");
		if (!clicked) return;

		e.preventDefault();
		e.stopPropagation();                       // Router's document listener never sees it
		history.pushState({}, "", clicked.href);
		page.query(new URLSearchParams(location.search));
	});

	window.addEventListener("popstate", () =>
		location.pathname === page.url && page.query(new URLSearchParams(location.search)));
}

function card(item, category){
	const [sku, name, , colour, sizing, price, stock] = item;

	return div.c("patterns-panel", () => {
		div.c("patterns-swatch").style("background", swatch(colour));
		a.c("page-link", name).href(`/patterns/shop/${category}/${sku}/`);
		p(`${colour} · ${sizing} · £${price}`).ac("note");
		p(stock ? `${stock} in stock` : "out of stock").ac("note");
	});
}

function item_page(sku){
	const [, name, category, colour, sizing, price, stock] = find(sku);

	return {
		title: name,
		content(){
			div.c("patterns-swatch").style("background", swatch(colour));
			h3(`£${price}`);

			code(`
sku       ${sku}
colour    ${colour}
sizes     ${sizing}
stock     ${stock || "none"}`);

			p("Claimed by the category's `route()`. The category is an inline child with no file, and this page is a url under a url that also has no file — two levels, nothing on disk.").ac("note");

			recipe(nav, "the shop's navigation — the route() inside initialize() produced this url");

			div.c("row", () => {
				a.c("page-link", `← ${category}`).href(`/patterns/shop/${category}/`);
				a.c("page-link", "same colour").href(`/patterns/shop/${category}/?colour=${colour}`);
			});
		},
	};
}

// a colour is a rectangle here; this section is about navigation
const swatch = colour => ({
	black: "#23262b", oxblood: "#6b2029", sand: "#cbb894", olive: "#5c6344",
}[colour]);
