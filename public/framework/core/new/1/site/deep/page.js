import { Page, p } from "/app.js";
import { section } from "../ui.js";
import { probe, whole } from "./probe.js";

export default new Page({
	meta: import.meta,
	title: "Deep",

	// Twelve lazy names. Not one is imported by this page — the cards below are
	// built from the Map's KEYS, which is why they read as names until you have
	// been there. Run the probe: twelve children known, zero modules fetched.
	children: "nesting scale state race gap orphan chrome nav errors alias history edges",

	content(){
		probe("every code block in here is a real function object", (log) => {
			const here = app.router.active;

			log("url            ", here.url);
			log("children known ", [...here.children.keys()].join(" "));
			log("of those, LOADED", [...here.children].filter(([, page]) => page).length);
			log("page nodes in the DOM", document.querySelectorAll(".page").length);
		});

		p("`probe()` renders that function's real source with `code.fn`, then wires Run to the same function object. No second copy, so nothing can drift — which matters more here than anywhere else on the site, because a stale snippet in a defect register documents a bug that no longer exists.").ac("note");

		section("What this section is for");

		p("Steve owns the primitives, Eric owns the combinations. This is where you find out whether the thing survives real content: seven levels of nesting, hundreds of `route()` urls, a running timer, a throwing module — and every item on the readme's Open list reproduced rather than described.");

		p("Each page ends with its own source, fetched. Every claim carries a number or a transcript.").ac("note");

		section("Investigations");

		this.previews();

		p("The ranked register — what breaks, the reproduction, what it costs, the smallest fix — is at /agents/tim/. These pages are the evidence it cites.").ac("note");

		whole(import.meta);
	}
});
