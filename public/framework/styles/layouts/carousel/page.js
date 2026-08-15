import { Page, demo, div, span, h2, p, icon, code, table, thead, tbody, tr, th, td } from "/app.js";
import { site } from "../web.js";

const QUOTES = [
	["Jane Doe", "Design systems, TechCorp", "The width documentation made responsive handoffs painless — engineering and design finally read the same sentence."],
	["Ravi Menon", "Platform lead, Northwind", "We deleted four breakpoint files the week we adopted this. The tracks were already doing the work."],
	["Ana Silva", "Principal designer, Kelp", "A layout that answers to its own box is the only kind that survives being dropped in a sidebar."],
	["Tom Blake", "Frontend, Halcyon", "One class string reads correctly on a phone and across a monitor, and there is nothing to keep in step."],
	["Mei Lin", "Head of design, Orbit", "The catalog is the spec. Nobody redraws a hero at four widths any more."],
	["Iris Okafor", "Staff engineer, Fathom", "Six slides fill a 3440 monitor and one fills a phone, and the rail was never told about either number."],
];

const SPECS = [
	["flex", "0 0 min(26em, 82%)", "A slide is a fixed track, so the rail never re-flows into rows."],
	["scroll-snap-align", "center", "Keeps whichever quote you land on centred at any width."],
	["overflow-x", "auto", "On the track itself — a wrapping line is sized by its content and never scrolls."],
];

export default new Page(demo.layout({
	meta: import.meta,
	title: "Carousel",
	description: "A rail that scrolls sideways and snaps — one slide on a phone, six across a monitor, no arrows.",
	icon: "view_carousel",
	group: "Streams",

	twin: true,
	parts: "header specs footer",

	note: "**The only layout here that does not wrap.** Every other row in this catalog answers a shortage of width by starting a new line; a rail answers it by moving the overflow onto an axis you can drag. `min(26em, 82%)` is the whole responsive rule — a full-width card on a phone, a comfortable column everywhere above it.",

	layout(){

		const slide = ([who, role, text]) =>
			div.c("surface pad flex v gap", () => {

				div.c("flex", () => { for (let i = 0; i < 5; i++) icon("star"); });

				p(text);

				div.c("flex gap v-center", () => {
					div.c("wash").style({ flex: "0 0 auto", width: "2.2em", height: "2.2em", borderRadius: "50%" });
					div.c("flex v", () => { span.c("h3", who); span.c("muted", role); });
				}).style("--gap", "0.6em");

			}).style({ flex: "0 0 min(26em, 82%)", minWidth: "0", scrollSnapAlign: "center", "--gap": "0.8em" });

		return div.c("page full fill flex v", () => {

			if (this.shows("header")) site.topbar();

			div.c("flex-1 flex v gap", () => {

				div.c("flex v gap pad", () => {
					h2("What teams say");
					p(site.blurb);
				}).style({ "--gap": "0.4em", "--pad": "2em clamp(1em, 3%, 3.5em) 0", maxWidth: "34em" });

				/* ⚠ No `wrap` on the track, and the scroller IS the track: a wrapping
				   flex line is sized by its content, so `overflow-x` one level out
				   never engages.
				   ⚠ The inset is the WRAPPER's. A scroller clips at its own padding
				     box, so padding on the track would put the cut-off slide flush
				     against the page edge instead of on the page's own left line. */
				div.c("pad", () => div.c("flex gap", () => QUOTES.forEach(slide))
					.style({ overflowX: "auto", scrollSnapType: "x mandatory", "--gap": "1em" }))
					.style("--pad", "0 clamp(1em, 3%, 3.5em) 1em");

				if (this.shows("specs"))
					div.c("flex auto gap pad wash", () => {

						div.c("flex v gap", () => {
							span.c("h4 muted", "Usage");
							p("Keep a quote inside three lines at the widest slide. A rail that has to be dragged twice to reach its last card wants fewer cards, not a smaller track.")
								.style("max-width", "34em");
						}).style("--gap", "0.5em");

						div.c("flex v gap", () => {
							span.c("h4 muted", "Track variables");
							table(() => {
								thead(() => tr(() => { th("Property"); th("Value"); th("What it decides"); }));
								tbody(() => SPECS.forEach(([prop, value, note]) =>
									tr(() => { td(() => code(prop)); td(() => code(value)); td(note); })));
							});
						}).style("--gap", "0.5em");

					}).style({ "--column": "24em", "--gap": "2em", "--pad": "2em clamp(1em, 3%, 3.5em)" });

			}).style({ minHeight: "0", overflowY: "auto", "--gap": "1.5em" });

			if (this.shows("footer")) site.footer();
		});
	},
}));
