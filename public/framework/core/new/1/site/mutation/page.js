import { Page, View, p } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { code, section } from "../ui.js";
import { this_file } from "../forms/this_file.js";

View.stylesheet(import.meta, "mutation.css");

export default new Page({
	meta: import.meta,
	title: "Arriving with work in progress",
	classes: "mutation",

	children: "autosave recovery outliving concurrent undo",

	content(){
		code(`
/forms/     proved LEAVING is safe — render() memoizes, so an in-app
            navigation loses nothing, and the exits that lose everything
            never reach Router.

/mutation/  the other half: ARRIVING. What is already running, already
            typed, or already changed when you get here.`, "the other half");

		p("Same seat, opposite direction. Every page below is a case where the thing that makes leaving safe — `render()` memoizing into `this.view` — is what makes arriving hard.").ac("note");

		section("The four state stores, by how long they live");

		code(`
store              soft nav   Back/Fwd   RELOAD   tab close
─────────────────  ────────   ────────   ──────   ─────────
the url            yes        yes        yes      yes (it is a string)
the memoized view  yes        yes        NO       no
the Page instance  yes        yes        NO       no
module scope       yes        yes        NO       no
sessionStorage     yes        yes        yes      no
localStorage       yes        yes        yes      yes`,
			"reconciled with the async seat's map — measured, both directions");

		md("**Three of those four stores have exactly one lifetime between them.** The memoized view, the Page instance and module scope are all just *the heap*, and they die together at one boundary. For deciding where to PUT something the four-way split is the right map; for deciding whether it SURVIVES there are only three tiers — the url, the heap, and storage.").ac("note");

		p("That is the whole design rule of this section. Pick the cheapest tier that outlives the boundary you actually care about, and know which boundary that is.").ac("note");

		section("What each page settles");

		code(`
autosave/     the reference implementation, and the storage decision
recovery/     the tab was closed, the draft survived — what restores it, when?
outliving/    an upload still running three navigations later
concurrent/   two urls, one record, and BOTH views mounted at once
undo/         Ctrl-Z after you have moved. A surprising yes, and a firm no.`);

		this.previews();

		section("The one that surprised me");

		md("Because the DOM node survives a navigation, **the browser's own native undo history survives with it.** Type, navigate away, come back, press Ctrl-Z, and your typing is undone — no framework, no undo stack, nothing anybody wrote. Measured on `/mutation/undo/`. Nobody knew, because nobody had a reason to press Ctrl-Z after navigating.").ac("note");

		this_file(import.meta);
	},
});
