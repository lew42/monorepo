import { Page, p, a, input } from "/app.js";
import { section } from "../../ui.js";
import { source } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Tabs",

	initialize(){
		this.add("what", "A tab bar is links. A tab panel is a region. Nothing on this page says \"I am a tab\" — and this one is a bare string.");

		this.add("why", () => {
			p("Which children are tabs is decided at placement, in the `tabs(\"…\")` call — not marked on the child. That is what lets one page have several sets, and lets a child be in none of them.");
		});

		this.add("state", {
			title: "State",
			content(){
				p("Type something, switch tabs, come back:");
				input.c("probe").attr("placeholder", "type here…");
				p("Nothing is ever unmounted or rebuilt. `render()` returns the view it built the first time, so the DOM node and its form state stay put.").ac("note");
			}
		});

		// No backticks in a string child: a string IS the content and is appended
		// raw. Only p() runs the backtick pass, so they would render literally.
		this.add("notes", "Second set, second panel. Each set claims its own children by name, which is why a single region could not have done this — it would have caught them all.");

		this.add("extra", "And its sibling. Notice the url: every tab in a second set links to its own, because this page's url already means the first set's first tab.");
	},

	content(){
		source(import.meta);

		p("`this.tabs(\"what why state\")` returns a `.tabs` view holding a bar and a panel, and writes one `regions` entry per name so those children mount in the panel.");

		section("One set");

		this.$tabs = this.tabs("what why state");

		section("…and another, on the same page");

		this.$more = this.tabs("notes extra");

		section("Read the labels");

		p("Every tab above is labelled by its declared NAME, including `state`, which has a title and has been in memory since this page was constructed. The rule is not \"loaded, so use the title\" — it is \"the first tab, or `load_all_children()`\". A label that appears only when you happen to have visited that tab is the bar-reads-differently bug, and a label that depends on whether a child was inline is the same bug wearing a different hat.").ac("note");

		p("`load_all_children()` in `initialize()` is the opt-in: it imports every declared child, and then every label is a real title. It costs the laziness, which is why it is not the default.").ac("note");

		section("Read the urls");

		p("The first tab of the FIRST set links to `/nav/tabs/` itself — this page's url is the default tab, so there is no redirect and no second url showing the same thing. A page's url means one thing, so only one set can claim it; the second set links every tab to its own url.").ac("note");

		p("A url selects one tab. Every other set therefore has nothing of its own in the chain and falls back to its first, so no panel is ever blank — and the whole state is read off the url, which means a reload reproduces exactly what clicking produced.").ac("note");

		section("Next");

		a.c("page-link", "full  →").href("/nav/full/");
	}
});
