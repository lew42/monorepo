import { Page, md, demo, div, label, input, span, select, option } from "/app.js";

// The template, verbatim — rendered on the stage AND printed as the source, so the
// code on the page is the code that ran.
const field = () => label.c("flex v gap", () => {
	div.c("h4", "Email");
	input().attr("type", "email").attr("value", "mike@lew42");
	span.c("muted", "We never send anything.");
}).style("--gap", "0.4em");

const invalid = () => label.c("flex v gap", () => {
	div.c("h4", "Email");
	input().attr("type", "email").attr("value", "mike@lew42")
		.attr("aria-invalid", "true").style("borderColor", "var(--prim)");
	span("That address is missing a domain.").style("color", "var(--prim)");
}).style("--gap", "0.4em");

const chooser = () => label.c("flex v gap", () => {
	div.c("h4", "Tier");
	select(() => { option("core"); option("ext"); option("util"); });
}).style("--gap", "0.4em");

const form = () => div.c("flex v gap", () => { field(); chooser(); });

export default new Page({
	meta: import.meta,
	title: "Form field",
	description: "A template, not a function — the fourth thing your form needs is always different.",
	icon: "input",

	children: [
		demo.page("invalid", invalid, {
			note: "`aria-invalid` is the part a screen reader reads; the colour is for everyone else. There is no `.error` class because there is nothing for one to do — `var(--prim)` on the border and on the message is the whole state." }),

		demo.page("select", chooser, {
			note: "The same three elements with a `select` in the middle. The base theme already fills, pads and borders every text control, so swapping the control changes one line." }),

		demo.page("form", form, {
			note: "Two fields in a `flex v gap` column is a form. Nothing else is needed at that level either — `gap`'s `1em` default is right *between* fields, which is why only the inside of a field retunes it." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(field, steer).ac("bleed"),
			def: field,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**There is no `ui.field()`**, and that is the call this page exists to make. A field is a label, a control and a note — three elements and two utility classes — and every real form immediately wants a fourth thing: a checkbox row, a unit suffix, two controls side by side, a character counter. A function would take an option for each of those, and an option is API surface forever.",
		});

		md("## What the base theme already did");

		md("The `<label>` **wraps** its control, so the whole thing is one click target with no `for`/`id` pair to keep in sync. `input` already fills its container and already has padding and a border. `flex v` stacks it and `--gap: 0.4em` tightens it, because `gap`'s `1em` default is right *between* fields and far too much *inside* one.");

		md("## The message is body size, not `h4`");

		md("`h4` is the type scale's small level and it is `text-transform: uppercase`, so an error written with it reads `THAT ADDRESS IS MISSING A DOMAIN.` — an alarm rather than help. Below body there is nothing else, and *never invent a font-size* means you may not reach for `0.85em` either. **Slightly large beats shouting**, and the gap is on the [record](/framework/ui/).");

		md("Next: [Breadcrumbs](/framework/ui/crumbs/) — a row of links that marks itself.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", field)); },
});
