import { Page, p, a, div } from "/app.js";
import { section } from "../../ui.js";
import { probe, snippet, whole } from "../probe.js";
import eager from "./eager/page.js";

export default new Page({
	meta: import.meta,
	title: "Open #2 — a page's own .app",

	// EAGER: imported above, so it is a live Page before anything walks to it
	children: [eager],

	// …and an inline one, constructed in initialize(), where `this.app` is still
	// undefined because I have not been walked to either
	initialize(){
		this.add("inline", () => p("An inline child. `add()` assigned me `app: this.app` — which was `undefined` at the time."));
	},

	content(){
		probe("an eager child you have never visited", (log) => {
			const here = app.router.active;
			const child = here.children.get("eager");

			log("child exists   ", !!child);
			log("child.url      ", child.url);
			log("child.title    ", child.title);
			log("child.parent   ", child.parent === here);
			log("child.app      ", child.app === undefined ? "undefined  ← the gap" : "assigned");
			log("");

			try { child.go(); log("go() worked"); }
			catch (error){ log(`child.go() THREW  ${error.constructor.name}: ${error.message}`); }

			log("");
			log("child.link()   ", child.link().el.outerHTML, "← works, because it is a plain <a href>");
		});

		p("Everything a dormant page needs works. `go()` alone does not, because `.app` is handed down on the walk in `child()` and this child has never been walked to.").ac("note");

		section("It fixes itself the moment you visit — which is the problem");

		probe("visit the child once, then ask again", async (log) => {
			const here = app.router.active;

			log("before:", here.children.get("eager").app === undefined ? "app undefined" : "app assigned");

			await app.router.load("/deep/gap/eager/");
			await app.router.load("/deep/gap/");

			log("after :", here.children.get("eager").app === undefined ? "app undefined" : "app assigned");
			log("");
			log("Same object, same method, two different outcomes — decided by whether");
			log("anyone happened to navigate here first. That is the part worth fixing:");
			log("not that go() throws, but that it throws NON-DETERMINISTICALLY.");
		});

		section("The smallest fix");

		snippet("Page.go — one line, no new state, no new concept", () => {
			class Reachable extends Page {

				// chain()[0] is the root, and the root is the ONE page App assigns
				// `app` to directly — so it is always there, at any depth, visited
				// or not. container() needs no change: it only ever runs from
				// activate(), which only ever runs after the walk.
				go(){
					return (this.app ?? this.chain()[0].app).router.go(this.url);
				}
			}
		});

		p("`link()` genuinely does cover the common case, and the readme is right that it does. It does not cover a button, a redirect, or anything that navigates without an anchor — and the one-line fix has no cost I can find, so 'covered by link()' reads to me as an argument for not fixing something cheap rather than a reason it is fine.").ac("note");

		section("The children");

		div.c("row", () => {
			a.c("page-link", "eager (imported)").href("/deep/gap/eager/");
			a.c("page-link", "inline (add())").href("/deep/gap/inline/");
		});

		whole(import.meta);
	}
});
