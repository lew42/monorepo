import { Page, p, a, div } from "/app.js";
import { code, section } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Dynamic urls",

	// /dynamic/42/ has no page.js. child("42") misses the filesystem and
	// falls through to here, which builds a page on the spot.
	route(name){
		return new Page({
			title: `Item ${name}`,
			content(){
				p(`This page does not exist on disk. It was built by route("${name}").`);
				code(`
route(name){
    return new Page({ title: \`Item \${name}\`, content(){ … } });
}`, "…by this");
				p("Reload the url. Same page — the walk doesn't care whether a page came from a file or from a method.").ac("note");
				a.c("page-link", "back to Dynamic urls").href("/dynamic/");
			}
		});
	},

	content(){
		p("No file exists for any of these. Click one, then reload it.");

		div.c("page-previews", () => {
			[1, 7, 42].forEach(n => a.c("page-preview", `Item ${n}`).href(`/dynamic/${n}/`));
		});

		section("How the fallback works");

		code(`
async child(name){
    const known = this.children.get(name);
    if (known) return known;                                 // 1. what I already have

    const page = await Page.import(this.url + name + "/")   // 2. the filesystem
              ?? this.route?.(name);                         // 3. …or me

    return page ? this.add(name, page) : null;               // 4. …or 404
}`, "Page.class.js");

		p("`route()` writes no url either — its result goes through `add()`, which derives one from the segment. See **Inline pages**.").ac("note");

		p("Three answers in order, and the page decides the second one. Nothing is registered anywhere — a url is valid if the walk can complete it.");

		section("Why waterfall loading is required");

		p("You cannot fetch these in parallel, because you have to load `/dynamic/page.js` before you can know it has a `route()` at all. Loading down the path one step at a time is what lets a page claim the rest of it — and why there are zero 404 requests here.");

		section("Same instance on revisit");

		code(`
const known = this.children.get(name);
if (known) return known.assign({ parent: this, app: this.app });`);

		p("`route()` builds a new Page every call, so without that memo `/dynamic/42/` would be a different object each visit and the chain diff would think everything changed. Filesystem pages need no memo — the browser's module cache already returns the same instance.").ac("note");
	}
});
