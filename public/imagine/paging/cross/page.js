import { div, span, md } from "/app.js";
import { Paging, Stage } from "../paging.js";
import { DEFAULT, title_of } from "../blocks.js";

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  the app's middle. One region, like every page in the realm.
   2 SIZE       the grid takes the whole middle; the prose keeps the 40em measure.
   3 OWN LAYOUT one sentence, one grid of nine live pages, one line out.
   4 REGIONS    one. Nothing here navigates.
   5 PREVIEW    core's card, in the rail's Cross section.

   ── WHY THIS PAGE EXISTS ──────────────────────────────────────────────────────
   Every other page in the realm shows ONE stage. So comparing two arrangements
   meant clicking one, remembering it, and clicking the other — the comparison
   happened in your head, which is the one place it cannot be checked
   (paging-audit-2b, Q2: "comparing two arrangements is an act of memory").

   This is the crossing, drawn: navigation across, arrangement down, nine real pages
   at once. `/templates/theming/` is the same idea for the other two words — five
   surfaces by three type scales — and the two of them are the realm's Cross section. */

const NAVIGATIONS = ["tabs", "rail", "columns"];
const ARRANGEMENTS = ["plain", "bar-top", "rail-right"];

export default new Paging({
	meta: import.meta,
	title: "Cross",
	icon: "compare_arrows",
	description: "Two words at once: navigation across, arrangement down, nine real pages.",

	content(){
		this.lede("Read across for the **navigation** word and down for the **arrangement** word. Every cell is a real page, running.");

		div.c("paging-cross wide", () => {
			span.c("paging-cross-corner");
			NAVIGATIONS.forEach(id => span.c("paging-cross-head", title_of("navigation", id)));

			ARRANGEMENTS.forEach(arrangement => {
				span.c("paging-cross-side", title_of("arrangement", arrangement));

				/* ⚠ `inner: true` on every one of the nine. A nested stage draws no
				     caption, cannot take the screen, and never touches the address bar —
				     nine stages writing one url would fight over it. */
				NAVIGATIONS.forEach(navigation => div.c("paging-shot-frame", () => {
					new Stage({
						config: { ...DEFAULT, navigation, arrangement, content: "article", room: "wide" },
						inner: true,
					});
				}));
			});
		});

		md("The other crossing is colour by type: [the theming wall](/imagine/paging/templates/theming/) puts fifteen of those on one screen. "
			+ "One cell on its own, full size and configurable, is any page in [the library](/imagine/paging/library/).");
	},
});
