import { Page, p } from "/app.js";
import { code, section } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "API reference",

	content(){
		p("I was imported when you clicked my tab, not before.");

		section("Why my tab says “api”, not “API reference”");

		code(`
children: "overview api guide"     // names — nothing imported

bar labels:  Overview   api   guide
             ^ loaded   ^ still just names`);

		p("A label taken from a title depends on whether that page happens to be loaded, which depends on which url you arrived at — that's the bar-reads-differently bug. A declared name never varies. `load_all_children()` in `initialize()` opts into real titles, at the cost of importing everything.").ac("note");
	}
});
