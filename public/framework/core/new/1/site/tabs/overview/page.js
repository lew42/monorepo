import { Page, p } from "/app.js";
import { code, section } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Overview",

	content(){
		p("**I am the default tab, and the url is `/tabs/` — not `/tabs/overview/`.** My link in the bar points at my parent.");

		code(`
tabs(names){
    …
    const filling = Promise.resolve(this.loading ?? this.child(list[0])).then(() => { … });
}`, "Page.class.js — one import, not four");

		section("Only I was imported");

		p("The other tabs are still just names in my parent's `children` map. Open the network panel: `api/page.js` and `guide/page.js` are not fetched until you click them.").ac("note");
	}
});
