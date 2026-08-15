import { Page, demo, div, span, h2, p, icon } from "/app.js";
import { site } from "../web.js";

const OPTIONS = [
	["High density", "Comfortable", true],
	["Standard scale", "The catalog default", false],
	["Compact system", "For dense boards", false],
];

export default new Page(demo.layout({
	meta: import.meta,
	title: "Overlay",
	description: "A sheet on one edge, a menu on the other — a panel that covers the page instead of taking a column from it.",
	icon: "layers",
	group: "Apps",

	twin: true,
	parts: "header scrim sheet menu",

	/* The two the design file draws separately — a bottom sheet and an expanded
	   hamburger — are one mechanism at two edges, so they are two chips. */
	off: new Set(["menu"]),

	note: "**The page is the containing block, not the window.** `position: absolute` against the `.page`, never `fixed`, is what lets a whole overlay render inside a stage, a card and a 3440 monitor and mean the same thing in all three. The sheet is `.measure` with `inset-inline: 0`, so its auto margins centre it on a monitor and its `100%` fills a phone — the one class covers both drawings.",

	layout(){

		const row = (title, note, on) =>
			div.c("flex gap v-center split pad", () => {
				div.c("flex v flex-1", () => { span(title); span.c("muted", note); });
				if (on) icon("check");
			/* No side pad: a row inset inside an already-padded sheet puts two left
			   edges a reader has to choose between. */
			}).ac(on && "wash").style({ "--pad": "0.55em 0", borderRadius: "var(--radius)" });

		return div.c("page full fill flex v", () => {

			if (this.shows("header")) site.topbar();

			div.c("flex-1", () => {
				site.toolbar();
				site.rows(7);
			}).style({ minHeight: "0", overflowY: "auto" });

			/* The one colour this page writes, and it is mixed from a token rather
			   than picked: a scrim has to darken whatever theme is under it. */
			if (this.shows("scrim"))
				div().style({
					position: "absolute", inset: "0",
					background: "color-mix(in srgb, var(--bg) 55%, transparent)",
				});

			if (this.shows("sheet"))
				div.c("surface measure pad flex v gap", () => {

					div.c("wash").style({ width: "2.4em", height: "0.28em", borderRadius: "1em", alignSelf: "center" });

					div.c("flex v", () => {
						h2("Configure global viewport");
						span.c("muted", "Choose the layout density this account renders at.");
					});

					div.c("flex v gap", () => OPTIONS.forEach(o => row(...o))).style("--gap", "0.3em");

				}).style({ position: "absolute", insetInline: "0", insetBlockEnd: "0", "--gap": "1em" });

			if (this.shows("menu"))
				div.c("surface pad flex v gap", () => {

					div.c("flex gap v-center split", () => { site.brand(); icon("close"); });

					div.c("flex v gap", () => site.topics.split(" ").forEach((word, i) =>
						row(word, "", i === 0))).style("--gap", "0.2em");

				}).style({
					position: "absolute", insetBlock: "0", insetInlineStart: "0",
					width: "min(20em, 100%)", "--gap": "1.2em",
				});

		}).style("position", "relative");
	},
}));
