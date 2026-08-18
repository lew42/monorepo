import { Page, demo, div, span, h1, h2, h3, p, button, icon, input } from "/app.js";
import { site } from "../web.js";
import full from "../full.js";

/* Figma: bold-editorial-wrapper (71:2459) — a row-heading strip over an editorial
   band, four times: hero, services, stats, footer (real names, verified with
   get_metadata; the survey's guess for this node was right for once).

   The comp draws one fixed charcoal page. Here every "dark" pixel is `--surface` /
   `--tint` / `--wash` — the SAME three-step elevation ladder every other layout
   uses — so flipping the site's own light/dark switch repaints the whole page
   correctly with nothing declared per mode. That's the thing worth demonstrating:
   this design tests the theme, not the layout. What does NOT survive the flip is
   in figma/questions.md — there is no token for "one step down from THIS band",
   only "one step down from the page's colour scheme". */

const rowHeading = label => div.c("flex gap v-center pad", () => {
	div.c("wash").style({ width: "0.9em", height: "2px", flex: "0 0 auto" });
	span.c("h4 muted", label);
}).style({ "--gap": "0.6em", "--pad": "1.6em 0 0.6em" });

const model = (n, title, tag) => div.c("flex gap wrap split v-center", () => {
	div.c("flex v gap", () => {
		span.c("h4 muted", `// SYSTEM MODEL 0${n}`);
		h2(title);
	}).style("--gap", "0.4em");
	span.c("h4 muted", tag);
}).style("--gap", "0.5em");

/* A panel recessed INTO a band — one more elevation step, `.wash` sitting on
   `.tint`. Both move with the same colour-scheme axis as the page, so this nesting
   is the one that stays correct in both modes (contrast the "dark" tone case
   noted in questions.md, which does not). */
const recess = (fn, ratio) => div.c("wash flex v-center h-center", fn)
	.style({ aspectRatio: ratio, borderRadius: "var(--radius)" });

const FOOTER_COLS = [
	["INDEX", ["Case Records", "Design Specs", "Component Library", "System Status"]],
	["STUDIES", ["Case Records", "Design Specs", "Component Library", "System Status"]],
	["LEGAL", ["Case Records", "Design Specs", "Component Library", "System Status"]],
];

export default new Page(demo.layout({
	meta: import.meta,
	title: "Bold Editorial",
	description: "Dark contrast, oversized numerals, asymmetric bands — the theme's elevation ladder standing in for a fixed dark palette.",
	icon: "contrast",
	group: "Pages",

	twin: true,
	parts: "header hero services stats footer",

	note: "**Every 'dark' pixel here is a token, never a hex.** `.tint` steps the band down off the page, `.wash` steps the inset numeral down again — the same ladder `sections/` and `home/` already use, so this page needs zero media queries to answer the owner's actual question: does the theme's dark mode hold up under an asymmetric, high-contrast design? Verified both ways at 400/1280/1920/3440 — [figma/](/framework/ai/2026-08-18/figma/).",

	/* A document, not an app shell — bands stack past one screen, so `page full` alone
	   (no `fill`) hands scroll to the document. `fill` here claimed one screen and
	   handed scroll to a `.flex-1` pane instead, which cost the homepage minion 4549px
	   of bands folded into a 284px box (questions.md #15) before this page ever existed
	   to repeat it — so no `flex-1`/`overflow-y` wrapper below either. */
	route(name){ return name === "full" && full(this, () => this.layout().ac("default")); },

	layout(){

		const band = fn => div.c("tint pad flex v gap", fn)
			.style({ "--pad": "clamp(1.5em, 3vw, 3em)", "--gap": "2em", border: "1px solid var(--line)", borderRadius: "var(--radius)" });

		return div.c("page full flex v", () => {

			if (this.shows("header")) site.topbar();

			div.c("measure flow", () => {

				if (this.shows("hero")){
					rowHeading("Asymmetric Hero — Offset Image and Left Text Block");
					band(() => {
						model(1, "Offset Paradigm", "EDIT_SYSTEM_V2");
						div.c("flex auto gap", () => {
							div.c("flex v gap", () => {
								h1("The shift in digital form");
								p.c("muted", "Disruptive spatial structure built for publication and high-impact messaging — the same six primitives as every other page here.");
								button.c("prim", "Explore Thesis");
							}).style("--gap", "0.9em");

							recess(() => span.c("h1", "01").style("color", "var(--prim-ink)"), "3 / 2");
						}).style({ "--column": "24em", "--gap": "2.5em" });
					});
				}

				if (this.shows("services")){
					rowHeading("Services Showcase — Staggered Asymmetric Columns");
					band(() => {
						model(2, "Services Taxonomy", "EDIT_SYSTEM_V2");
						div.c("grid gap auto", () => [
							["01", "Editorial Direction", "Complete visual reinvention through brutalist composition and architectural scale."],
							["02", "Zero Stylesheets", "Every band on this page is a class string — no CSS file lives beside this one."],
							["03", "Two Colour Schemes", "One token set answers both; a hex value never appears in a layout file."],
						].forEach(([n, title, blurb], i) =>
							div.c("tint pad flex v gap", () => {
								div.c("flex split v-center", () => {
									span.c("h1", n).style("color", "var(--prim-ink)");
									icon("north_east");
								});
								div.c("flex v gap", () => { h3(title); p.c("muted", blurb); }).style("--gap", "0.5em");
							}).style({ "--pad": "1.5em", "--gap": "1.5em", border: "1px solid " + (i === 1 ? "var(--prim)" : "var(--line)") })))
							.style({ "--column": "18em", "--gap": "1.5em" });
					});
				}

				if (this.shows("stats")){
					rowHeading("Stats Bar — High Contrast Accent Banner");
					band(() => {
						model(3, "Operational Volume", "METRIC_SYS_V2");
						div.c("grid gap auto", () => [
							["0", "BUILD STEPS, EVER"],
							["6", "TOKENS DEFINE THE THEME"],
							["2", "COLOUR SCHEMES, ONE TOKEN SET"],
						].forEach(([value, caption]) => div.c("flex v gap", () => {
							span.c("h1", value).style("color", "var(--prim-ink)");
							span.c("h4 muted", caption);
						}).style("--gap", "0.2em")))
							.style({ "--column": "12em", "--gap": "2em" });
					});
				}

				if (this.shows("footer")){
					rowHeading("Editorial Footer — Wide Grid & Newsletter Form");
					band(() => {
						model(4, "Platform Blueprint", "EDIT_SYSTEM_V2");
						div.c("flex auto gap", () => {
							div.c("flex v gap", () => {
								site.brand();
								p.c("muted", "Subscribe to the weekly design critique. No fluff, pure logic.");
								div.c("flex gap", () => {
									input().attr("placeholder", "operator@domain.com").style("flex", "1 1 auto");
									button.c("prim", "Join");
								});
							}).style({ "--gap": "1em", "--grow": "0.8" });

							div.c("flex gap wrap", () => FOOTER_COLS.forEach(([head, links]) =>
								div.c("flex v gap", () => {
									span.c("h4", head).style("color", "var(--prim-ink)");
									div.c("flex v gap", () => links.forEach(l => span.c("muted", l))).style("--gap", "0.4em");
								}).style("--gap", "0.6em")))
								.style({ "--gap": "2.5em", "--grow": "1.4" });
						}).style({ "--column": "22em", "--gap": "3em" });
					});
				}

			}).style({ "--measure": "72em", padding: "0 clamp(1em, 4vw, 3em) 3em" });
		});
	},
}));
