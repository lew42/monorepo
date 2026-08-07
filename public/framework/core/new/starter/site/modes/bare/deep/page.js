import { Page, p, a } from "/app.js";
import { code, section } from "../../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Deep, still bare",

	content(){
		p("A child of a bare page. The chrome is still hidden — not because I asked, but because my parent is in the chain and nobody put it back.");

		section("Who owns the class");

		code(`
chain   Home › Modes › Bare › Deep

Bare.activate()     .app gets no-chrome     ← ran when Bare entered
Deep.activate()     (the default)           ← I did nothing
Bare.deactivate()   .app loses no-chrome    ← runs only when BARE leaves`);

		p("`router.activate()` only touches the part of the chain that differs, so walking deeper inside Bare never calls its `deactivate()`. The mode survives exactly as long as the page that declared it stays in the chain — which is the behaviour you want, and it falls out of the diff rather than being implemented.").ac("note");

		a.c("page-link", "← Bare").href("/modes/bare/");
		a.c("page-link", "Home (chrome comes back)").href("/");
	}
});
