import { Page, p } from "/app.js";
import { code, section } from "../../../../ui.js";
import { recipe } from "../../../recipe.js";

const nav = () => ({
	meta: import.meta,
	title: "Install",
	content(){ this.body(); },       // a leaf: no children, no region, nothing
});

export default new Page(nav(), {

	body(){
		recipe(nav);

		p("A leaf. This is what most pages in a documentation site look like — no children, no region, no arrangement — and it is the reason the flat container works: the interesting page is almost always the one with nothing to declare.");

		section("Install");

		code(`
npm install kettle

# Postgres 13+ or SQLite 3.35+
npx kettle migrate`);

		section("Verify");

		code(`
$ npx kettle doctor
  ✓  driver        pg 8.11.3
  ✓  migrations    3 applied, 0 pending
  ✓  clock skew    12ms
  ✓  advisory lock acquired and released`);

		p("Next: Concepts.").ac("note");
	},
});
