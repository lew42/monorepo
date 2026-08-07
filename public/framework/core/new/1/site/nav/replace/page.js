import { Page, p, a } from "/app.js";
import { section } from "../../ui.js";
import { source } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Replace",

	// "deeper", not "child" — `alias()` skips a name that Page already uses, and
	// `child` is a method. See /nav/inline/ for the rule.
	initialize(){
		this.add("deeper", () => {
			p("I replaced my parent, and neither of us said so. My parent is still in the DOM, one element to the left, still built and still holding whatever it held. It just isn't the leaf.");
			a.c("page-link", "← Replace").href("/nav/replace/");
		});
	},

	content(){
		source(import.meta);

		p("Nothing on this page opts into replacement. Replacement is what is left when nothing opts into anything else.");

		section("Try it");

		this.deeper.link("Open the child  →");

		section("The whole mechanism is two CSS rules");

		source("/styles.css");

		p("`.page { display: none }`, then `.page.active-page { display: block }`. Every page mounts as a sibling in one flat container at every depth, so an arrangement is a rule about siblings — there is nothing nested to dissolve and nothing to propagate downward.").ac("note");

		p("`Router.mark()` writes exactly two classes: `.active-page` on the leaf, `.active-ancestor` on everything above it. That is the whole of what the framework says about appearance.").ac("note");

		section("Next");

		a.c("page-link", "children  →").href("/nav/children/");
	}
});
