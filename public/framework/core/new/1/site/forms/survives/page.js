import { Page, p, a, button } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { code, section } from "../../ui.js";
import demo from "/framework/ext/demo/demo.js";
import { field } from "../field.js";
import { this_file } from "../this_file.js";

export default new Page({
	meta: import.meta,
	title: "What survives today",
	classes: "forms",

	// Two tab sets, to reproduce the readme's accidental measurement — "input
	// value survives switching between SETS, not just tabs" — on purpose.
	initialize(){
		this.add("keep", () => field("This input lives inside a tab panel", { name: "kept" }));
		this.add("spare", "A second tab in the same set. Selecting me takes `keep` off screen — its input is still in the document.");
		this.add("other", "A second SET. A url selects one tab at a time, so whichever set has nothing in the chain falls back to its first.");
	},

	content(){
		demo(() => {
			this.$essay = field("Type a known value here — every measurement below uses it", {
				name: "essay", rows: 4 });
		}, "No autosave, no storage, no guard. Just an input inside a page that `render()` built once.");

		section("Ask the document, don't take my word for it");

		demo(() => {
			const $out = p.c("forms-status", "not probed yet");

			button("probe the document").click(() => {
				const node = document.querySelector(".forms-input.essay");
				$out.text(node
					? `1 node · connected ${node.isConnected} · visible ${!!node.offsetParent} · value ${JSON.stringify(node.value)}`
					: "0 nodes — the page was never rendered");
			});
		}, "Navigate away, come back, and probe again. `connected` stays true and the value is unchanged; only `visible` ever flips — and it flips because CSS sets `display:none` on a page that is not in the chain, not because anything was thrown away.");

		section("Across a tab set");

		this.$tabs = this.tabs("keep spare");
		this.$more = this.tabs("other");

		p("Type into the tab's input, click `spare`, then click back. Same node, same value — a tab panel is an ordinary region and its pages are memoized like any other.").ac("note");

		section("Measured");

		code(`
type "alpha" into .essay at /forms/survives/, then:

sibling hop    /forms/exit/            connected=true  visible=false  value="alpha"
back to it     /forms/survives/        connected=true  visible=true   value="alpha"
deep hop       /forms/wizard/step-2/   connected=true  visible=false  value="alpha"
Back button    /forms/survives/        connected=true  visible=true   value="alpha"
Forward        /forms/wizard/step-2/   connected=true  visible=false  value="alpha"

type "beta" into .kept, inside a tab panel:

tab-SET hop    /forms/survives/spare/  connected=true  visible=false  value="beta"
back to it     /forms/survives/        connected=true  visible=true   value="beta"

RELOAD         /forms/survives/        connected=true  visible=true   value=""`,
			"Playwright 1.62, Chromium, 1400x800");

		p("Every row but the last says the same thing: navigation moves what you can see, not what exists. `connected` never once goes false.").ac("note");

		md("The last row is the one to read twice. After a reload the node is `connected=true` and `visible=true` — it looks *identical* to the first row — and the value is gone. It is not the same element: the module graph was rebuilt, `render()` ran again, and this is a brand new input that has never been typed into. **The failure looks exactly like success.**").ac("note");

		section("Where it stops");

		code(`
survives   in-app click · Back · Forward · deep hop · tab switch · tab-SET switch
DIES       reload · closing the tab · an external link · location.assign()`,
			"the boundary is the JS heap, not the router");

		p("Memoization is a property of the *module instance*. Every path in the second row throws the whole heap away — `this.view` included — so there is nothing left to memoize. This is why `beforeunload` and a router guard protect disjoint sets of exits: see `/forms/unload/`.").ac("note");

		a.c("page-link", "next: the unguarded exit →").href("/forms/exit/");

		this_file(import.meta);
	},
});
