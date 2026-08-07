import { Page, p, h2, div, a } from "/app.js";
import { code, section } from "../../ui.js";
import { this_file, when, cost } from "../../compound/recipe.js";

const DATA = {
	latency:    { label: "Latency",    value: "84ms",   note: "p95, last hour." },
	errors:     { label: "Errors",     value: "0.02%",  note: "5xx over all routes." },
	uptime:     { label: "Uptime",     value: "99.98%", note: "Rolling 30 days." },
	throughput: { label: "Throughput", value: "1.2k/s", note: "Claimed by route(), not declared — I appear when you ask for me." },
};

/* THE ANSWER TO "where does the parameter live": on the instance, put there by
 * the constructor. `render()` caches per INSTANCE, so building once is a limit
 * on instances, not on components — a component is this function, and it can be
 * called as often as you like. */
function stat(data){
	return {
		title: data.label,
		content(){
			h2(data.value);
			p(data.note).ac("note");
			this.link("this card's own url");
		}
	};
}

export default new Page({
	meta: import.meta,
	title: "A page as a component",

	initialize(){
		// three instances of one function, each with its own data and its own url
		["latency", "errors", "uptime"].forEach(name => this.add(name, stat(DATA[name])));
	},

	// …and a fourth from the same factory, claimed rather than declared
	route(name){ return DATA[name] && stat(DATA[name]); },

	content(){
		when("one shape of content appears several times on a screen with different data — stat tiles, product cards, a row of environments — and each one also deserves to be linkable.");

		p("All three cards below are `Page` instances. Each is a real url. All three are on screen at once, which `Router.mark()` cannot express — it marks exactly one leaf — so a single CSS rule in `compose.css` says show every page in this region, and the marking still says which one you are actually on.");

		code(`
.show-all > .page { display: block; }`, "the entire mechanism");

		// My region, and I place all my children in it myself. activate() finds
		// them already here, so navigating to one moves nothing.
		this.$pages = div.c("pages cols show-all cards", () => {
			this.children.forEach(child => child.render());
		});

		div.c("row", () => {
			["latency", "errors", "uptime"].forEach(name =>
				a.c("page-link", name).href(this.url + name + "/"));
			a.c("page-link", "throughput (route)").href(this.url + "throughput/");
		});

		section("Declared, or claimed — same factory");

		p("Three of these were built in `initialize()`. The fourth, `throughput`, was never declared: `route()` hands it to the same `stat()` function the moment you ask for its url, and it joins the grid as a fourth card. One function, two ways in, no second definition of what a card is.");

		section("Why 'builds once' is not the limit it sounds like");

		code(`
render(){ if (this.view) return this.view; … }   ← per INSTANCE

one instance   = one view = one place = one url
one factory    = as many instances as you have data`);

		p("The question was where a parameter can live given that `render()` caches forever. It lives where every other property lives — on the instance, assigned by the constructor, read by `content()` through the closure or through `this`. Nothing had to be added, because a parameterised page was always just a function that returns options.").ac("note");

		section("The file");

		this_file(import.meta);

		cost("every card you render is a permanent page: `add()` puts it in the children map and its view is never thrown away. Three tiles is free; three thousand rows is a leak, and that is the point at which the row should be data being rendered by one page, not a page each.");
	}
});
