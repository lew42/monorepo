import { Page, demo, div, span, h2, p, button, icon, code, table, thead, tbody, tr, th, td } from "/app.js";
import { site } from "../web.js";

const TIERS = [
	["Starter", "For personal test beds", "$0", "/month", "",
		"One standard wrapper|Basic grid config|Community support"],
	["Professional", "For scaling design networks", "$49", "/month", "Popular",
		"Every standard wrapper|Comprehensive specs|Priority channel|Advanced minimaps"],
	["Enterprise", "Global layout compliance", "Custom", "", "",
		"Custom breakpoints|Dedicated consultant|SLA guarantee|Tailored theme sync"],
];

const SPECS = [
	["--column", "17em", "The track floor. Every count from one to five is this number and the width."],
	["--gap", "1em", "Symmetric card separation, and the only spacing the wall declares."],
	["stretch", "default", "Grid's own alignment gives three tiers of different length one height."],
];

export default new Page(demo.layout({
	meta: import.meta,
	title: "Pricing",
	description: "Three tiers on one token — the wall counts its own columns and the emphasized one is two classes.",
	icon: "sell",
	group: "Pages",

	twin: true,
	parts: "header specs footer",

	note: "**One token does what the design file spells three times.** `grid gap auto` on `--column: 17em` is three tiers on a laptop, two on a tablet and one on a phone, and it is five across a 3440 monitor — the same wall, never told about any of those widths. The emphasized tier is `surface wash` plus a `prim` button: no accent stroke, no modifier class, nothing this page had to name.",

	layout(){

		const tier = ([name, blurb, price, per, tag, has]) =>
			div.c("surface pad flex v gap", () => {

				div.c("flex gap v-center split", () => {
					span.c("h3", name);
					if (tag) span.c("h4 muted", tag);
				});
				span.c("muted", blurb);

				div.c("flex gap v-center", () => {
					span.c("h1", price);
					if (per) span.c("muted", per);
				}).style("--gap", "0.3em");

				/* `flex-1` on the list, so three lists of different length still land
				   their buttons on one line. */
				div.c("flex v gap flex-1", () => has.split("|").forEach(line =>
					div.c("flex gap v-center", () => { icon("check"); span(line); }).style("--gap", "0.4em")))
					.style("--gap", "0.4em");

				button("Select plan").ac(tag && "prim");

			}).ac(tag && "wash").style("--gap", "0.7em");

		return div.c("page full fill flex v", () => {

			if (this.shows("header")) site.topbar();

			div.c("flex-1 flex v gap pad", () => {

				div.c("flex v gap", () => {
					h2("One wall, three tiers");
					p(site.blurb);
				}).style({ "--gap": "0.4em", maxWidth: "34em" });

				div.c("grid gap auto", () => TIERS.forEach(tier)).style("--column", "17em");

				if (this.shows("specs"))
					div.c("flex auto gap", () => {

						div.c("flex v gap", () => {
							span.c("h4 muted", "Markup");
							code.js('div.c("grid gap auto", tiers)\n\t.style("--column", "17em");\n\ndiv.c("surface pad flex v gap", tier)\n\t.ac(popular && "wash");');
						}).style("--gap", "0.5em");

						div.c("flex v gap", () => {
							span.c("h4 muted", "Guideline");
							p("The emphasized tier borrows two classes it already had. A modifier that only exists to draw a stroke is a name the whole system has to carry, and the wall behind it re-counts columns either way.")
								.style("max-width", "34em");
						}).style("--gap", "0.5em");

						div.c("flex v gap", () => {
							span.c("h4 muted", "Properties");
							table(() => {
								thead(() => tr(() => { th("Property"); th("Value"); th("What it decides"); }));
								tbody(() => SPECS.forEach(([prop, value, note]) =>
									tr(() => { td(() => code(prop)); td(value); td(note); })));
							});
						}).style("--gap", "0.5em");

					}).style({ "--column": "21em", "--gap": "2em" });

			}).style({ minHeight: "0", overflowY: "auto", "--gap": "2em", "--pad": "2em clamp(1em, 3%, 3.5em)" });

			if (this.shows("footer")) site.footer();
		});
	},
}));
