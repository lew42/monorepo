import { Doc, md, demo, div, label, input, select, option, span, p } from "/app.js";
import { Wizard } from "./Wizard.js";

/* ---- the demo's own step bodies - a project-setup flow, not a signup form -----
   Auth flows belong to ux/Auth; this one collects a name, two options and a
   confirm screen, exactly the shape the brief asked for. */

function step_name(wizard){
	const invalid = wizard.attempted && !(wizard.values.name ?? "").trim();

	label.c("flex v gap", () => {
		div.c("h4", "Project name");

		const $input = input().attr("type", "text").attr("value", wizard.values.name ?? "")
			.on("input", function(){ wizard.values.name = this.el.value; });

		// The ui/field "invalid" pattern, verbatim - there is no ui.field() to
		// import, so this IS the import: aria-invalid + var(--prim) on both ends.
		if (invalid){
			$input.attr("aria-invalid", "true").style("borderColor", "var(--prim)");
			span("A name is required.").style("color", "var(--prim)");
		} else {
			span.c("muted", "Lowercase, no spaces - renameable later.");
		}
	}).style("--gap", "0.4em");
}

function step_options(wizard){
	wizard.values.visibility ??= "private";
	wizard.values.readme ??= true;

	div.c("flex v gap", () => {
		label.c("flex v gap", () => {
			div.c("h4", "Visibility");
			select(() => {
				["private", "public"].forEach(v => {
					const $o = option(v[0].toUpperCase() + v.slice(1)).attr("value", v);
					if (wizard.values.visibility === v) $o.attr("selected", "");
				});
			}).on("change", function(){ wizard.values.visibility = this.el.value; });
		}).style("--gap", "0.4em");

		label.c("flex gap v-center", () => {
			const $box = input().attr("type", "checkbox");
			$box.el.checked = wizard.values.readme;
			$box.on("change", function(){ wizard.values.readme = this.el.checked; });
			span("Add a README");
		}).style("--gap", "0.4em");
	}).style("--gap", "1em");
}

function step_confirm(wizard){
	div.c("flow", () => {
		p("Review, then Finish.");
		div.c("flex v gap", () => {
			[["Name", wizard.values.name], ["Visibility", wizard.values.visibility], ["README", wizard.values.readme ? "Yes" : "No"]]
				.forEach(([k, v]) => div.c("flex split", () => { span.c("muted", k); span(String(v)); }));
		}).style("--gap", "0.3em");
	});
}

const steps = () => [
	{ title: "Name", content: step_name, validate: s => !!(s.values.name ?? "").trim() },
	{ title: "Options", content: step_options },
	{ title: "Confirm", content: step_confirm },
];

// Caption OUTSIDE the box, so it stays put while the words re-skin what's under it.
const half = (caption, build) => div.c("flex v gap", () => { div.c("h4 muted", caption); build(); });

export default new Doc({
	meta: import.meta,
	title: "Wizard",
	description: "The generic multi-step engine - steps, next/back, a validation gate, keyboard, phone to 3440. Lessons, courses and signup all extend this.",
	icon: "checklist",

	files: "Wizard.js page.js readme.md",
	notes: "decisions",

	content(){

		md("A **`ux`** is a class, not a template. `steps` is composition - a title, a `content` function, an optional `validate` gate - and every move (`next() back() go() done()`) is a method, so a subclass overrides one without forking the rest. No persistence, no router coupling: a caller that wants either builds it on the seams below.");

		demo(() => new Wizard.Keys({
			steps: [
				{ title: "Name", content: step_name, validate: s => !!(s.values.name ?? "").trim() },
				{ title: "Options", content: step_options },
				{ title: "Confirm", content: step_confirm },
			],
		}), "Click a step in the rail, or focus anything and press Enter / the arrow keys - `Wizard.Keys`, the winner of the mixin-vs-subclass experiment ([`doc/decisions.md`](/framework/ux/Wizard/doc/decisions/)). Leave the name blank and press Next to see the gate.");

		md("## Same wizard, wearing the config words");

		md("A `ux` never ships its own compact or contrast mode - both tiers read the same tokens, so [`ui-contrast ui-compact`](/framework/ui/words/) re-skins it with zero lines here.");

		div.c("flex auto gap", () => {
			half("default", () => new Wizard({ steps: steps() }));
			half("ui-contrast ui-compact", () => new Wizard({ steps: steps() }).ac("ui-contrast ui-compact"));
		}).ac("bleed").style("--column", "22em");

		md("Next: [Tree](/framework/ux/Tree/) - the other `ux/` candidate this wave, graduating `ui/tree`'s closure into a class.");

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => new Wizard({ steps: steps() }))); },
});
