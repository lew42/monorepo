import { div, md, h2 } from "/app.js";
import { Paging } from "../../paging.js";
import { PagingNavStack } from "../lab.js";

/* ── layout ────────────────────────────────────────────────────────────────────
   1 CONTAINER  the paging realm's middle. Prose in `main` (40em); the demo boxes
                claim `wide`.
   2 SIZE       `wide` is ~1000px at 1280 and ~2950px at 3440.
   3 OWN LAYOUT prose, two tab sets, the rule, the proposal for ext/tabs.
   4 REGIONS    one — core's.
   5 PREVIEW    core's default card.

   ⚠ SAME WIDGET AS `stage/`, one flag different (`tabbed`). That is the finding:
     a tab strip is not a different mechanism, it is a different picker on the same
     box — so the fix is the same fix. (/imagine/paging/mechanisms/swap/ makes the
     same argument from the other side.)                                          */

export default new Paging({
	meta: import.meta,
	title: "Reserved tabs",
	description: "The tab strip never moves; make the panel behave too.",
	icon: "tab",

	takeaway: "**A tab strip is already stable — it is the panel under it that jumps.** Press the tabs in both boxes: the strip holds still in each, but in the first box the panel under it becomes a different height every time, and everything below it moves.",

	content(){
		this.lede();

		div.c("grid auto gap paging-nav-pair wide", () => {
			this.box("Tabs as they work today", "The panel holds one page at a time and takes its height from it. On the site's own tabs page, switching `Overview` to `API` changes the panel's height by 1720px at 1280 and 1933px at 3440 — the worst vertical jump measured anywhere on the site.", false);

			this.box("Tabs with a reserved panel", "The same strip, over a panel that is always as tall as its tallest tab. Nothing below the set moves, and the scrollbar stops jumping.", true);
		});

		h2("The rule");

		md("The same two lines as [the reserved stage](/imagine/paging/navigation/reserved/) — a tab panel is a stage with a strip on top of it:\n\n```css\n.paging-nav-reserve { display: grid; }\n.paging-nav-reserve > * { grid-area: 1 / 1; }\n.paging-nav-hidden { visibility: hidden; }\n```");

		h2("Why the real tabs cannot just wear it yet");

		md("[`ext/tabs`](/framework/ext/tabs/) mounts **one page at a time** into its panel: the tab you have not opened does not exist, so there is nothing to measure and nothing to reserve. Making it reservable means mounting every tab's page up front, which is the right trade for four small panels and the wrong one for a forty-member rail. The proposal — an opt-in word on the set rather than a change to every tab set on the site — is in [the task log](/framework/ai/2026-09-05/nav-stability/), with the diff.");

		md("Until then the cheap fix that needs no new machinery is a floor: `min-height` on `.tab-panel` sized to the set's usual panel. It does not remove the jump, it caps it.");

		md("Measured, pressing the `Pricing` tab in each box: the dashed line moved **252px at 1280 and 302px at 3440** in the first box, and **0px at both** in the second. [How every number was taken](/imagine/paging/navigation/doc/measurements/).");
	},

	box(name, says, reserved){
		return div.c("paging-nav-demo").ac(reserved && "paging-nav-reserved").append(() => {
			div.c("paging-nav-demo-name", name);
			div.c("paging-nav-demo-body", () => {
				md(says);
				new PagingNavStack({ reserved, tabbed: true });
			});
		});
	},
});
