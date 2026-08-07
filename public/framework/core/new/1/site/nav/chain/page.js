import { Page, p, a, input } from "/app.js";
import { code, section } from "../../ui.js";
import { source } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "chain()",

	initialize(){
		this.add("deeper", () => {
			p("Going one level deeper touched exactly one page: me. My parent was not deactivated, not emptied and not rebuilt — the Router compared the two chains and left the shared part alone.");
			a.c("page-link", "← chain()").href("/nav/chain/");
		});
	},

	content(){
		source(import.meta);

		p("`chain()` is `[root … me]`, walked up through `parent`. Navigation is the difference between two of them.");

		section("Mine, computed at render");

		// not retyped — this is the array, joined
		code(this.chain().map(page => page.url).join("\n"), "this.chain()");

		section("Only what changed is touched");

		p("`Router.activate()` takes the leading pages the two chains share and leaves them alone. Below that line it deactivates the outgoing pages deepest-first, then activates the incoming ones shallowest-first — so a page's ancestors and their regions always exist before it mounts.").ac("note");

		p("`deactivate()` does nothing by default. There is nothing to undo: the Router drops the classes a moment later and CSS takes the page off screen. Override it to release a socket, a timer, a `<video>`.").ac("note");

		section("Proof");

		p("Type something here, open the child, and come back:");

		input.c("probe").attr("placeholder", "type here…");

		this.deeper.link("Open the child  →");

		p("`render()` returns the view it built the first time, so nothing is ever thrown away and rebuilt. Pages are appended root-to-leaf and never moved, which is also why DOM order is already chain order and no page needs an `order`.").ac("note");

		section("That is all of them");

		a.c("page-link", "← back to the index").href("/nav/");
	}
});
