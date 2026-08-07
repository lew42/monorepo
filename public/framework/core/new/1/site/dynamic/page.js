import { Page, p, a, div } from "/app.js";
import { code, section } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "route()",

	// No children declared at all. Any segment under me is mine to claim.
	route(name){
		return { title: `Item ${name}`, content(){ p(`No file, no declaration. route("${name}") built me on the spot.`); } };
	},

	content(){
		code(`
route(name){
    return { title: \`Item \${name}\`, content(){ … } };
}`, "dynamic/page.js — the whole thing");

		p("`/dynamic/42/` has no `page.js` and is in no `children` map.");

		div.c("row", () => [7, 42, 99].forEach(n =>
			a.c("page-link", `item ${n}`).href(`/dynamic/${n}/`)));

		section("It runs after the DECLARATION, not after the filesystem");

		code(`
children.get(name)  ->  a Page     use it
                    ->  null       declared: import it
                    ->  undefined  never declared: route() may claim it`);

		p("starter tried the filesystem first and fell back to `route()`, so every dynamic url paid a doomed 404 before being claimed. Here only declared names ever hit the network — and `route()` cannot shadow a `page.js`, because a file you want is a file you declared.").ac("note");
	}
});
