import { Doc, md, demo, div, span } from "/app.js";
import Tags from "./Tags.js";

/* The card's own context — a live readout under the chips, so a screenshot proves
 * the wire without a console open. */
const editor = () => {
	let $out;

	const $box = div.c("flex v gap", () => {
		new Tags({ tags: ["core", "no-build", "esm"], onChange: tags => $out.text(tags.join(", ") || "(none)") });
		$out = span.c("muted", "core, no-build, esm");
	}).style("--gap", "0.5em");

	return $box;
};

/* The words proof: both tiers read the same tokens, so ONE class on the section
 * re-skins the ui/ template and the ux/ class in one pass. */
const words = () => div.c("flex v gap-2em", () => {
	div.c("flex v gap", () => { div.c("h4 muted", "default"); editor(); }).style("--gap", "0.5em");
	div.c("flex v gap", () => { div.c("h4 muted", "ui-contrast ui-compact"); editor().ac("ui-contrast ui-compact"); }).style("--gap", "0.5em");
});

export default new Doc({
	meta: import.meta,
	title: "Tags",
	description: "ui/tags's chip row, opened up — the × and the field were inert in the template; this is what wiring them looks like.",
	icon: "local_offer",

	files: "Tags.js page.js readme.md",
	notes: "decisions",

	children: [
		demo.page("words", words, {
			note: "The same editor twice, the lower one wearing `ui-contrast ui-compact`. A **ux never ships a compact mode** — both tiers read the same framework tokens, so a [config word](/framework/ui/words/) on the section re-skins the class and the template it composed in one pass." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(editor, steer).ac("bleed"),
			def: editor,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**Type a tag and press Enter; click a × to remove one.** The field refocuses itself after each add, so typing several tags in a row never needs a click back into the box. `onChange(tags)` hands out the plain array — the readout below is just `.join(\", \")`.",
		});

		md("## What actually moved");

		md("`ui/tags`'s own page named it plainly: what the template built was **inert** — the `×` had no listener, the field had no handler — so the first real use would have rewritten every line anyway. `class Tags` is that rewrite: `add()` and `drop()` hold the list and fire `onChange`; the one thing the template got right, `.ui-tags-input` (the opt-out that lets a field sit inside a field), is unchanged and still lives in `parts.js`.");

		md("**The CSS did not move.** `.ui-pill` and `.ui-tags-input` still live in [`ui/parts.js`](/framework/ui/), and this class wears those same classes — `Tags.Chip` is the one real part here, because a chip owns its own × listener rather than a state the parent toggles centrally (unlike Menu's items or Pagination's buttons). Full reasoning: [`doc/decisions.md`](/framework/ux/Tags/doc/decisions/).");

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => new Tags({ tags: ["core", "no-build", "esm"] }))); },
});
