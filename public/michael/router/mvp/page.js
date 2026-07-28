import { Page, p, pre } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "MVP",
	description: "On by default; opt out with router: false.",
	content(){
		p("The App wires the Router for you in `config_router` — it's on by default. Opt out and every link becomes a full page load (still perfectly functional — bare pages, plain `href`s all work):");

		pre(`config_router(){
    if (this.router !== false)
        this.router = new Router(this.router);
}

// opt out:
new App({ router: false });`);

		p("It never renders — on a navigation it calls `app.load_page(url)`, which imports the page and renders it into `$app`. Back/forward work because it listens to `popstate` and re-loads from the URL.");

		p("Anything can navigate programmatically:");

		pre(`app.router.go("/docs/elements/");`);

		p("(That's what a ColumnPager's ✕ close button calls to climb to the parent.)");
	}
});
