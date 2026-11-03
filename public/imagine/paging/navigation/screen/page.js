import { md } from "/app.js";
import { PagingNavScreen } from "../screen.js";

/* ── layout ────────────────────────────────────────────────────────────────────
   1 CONTAINER  none of /imagine/'s — this page mounts in `app.$pages` and IS the
                screen (screen.js, `container()`). The site's own strip is hidden.
   2 SIZE       the viewport: 1280x900 and 3440x1400 in the proofs. The rail is
                clamp(11rem, 16vw, 20rem) — 205px at 1280, 320 at 3440 — and the
                centre takes everything left.
   3 OWN LAYOUT one flex row, two boxes: rail, centre. The centre scrolls.
   4 REGIONS    ONE, and it is the point: every child mounts in the centre.
   5 PREVIEW    core's default card, on /imagine/paging/navigation/'s wall.        */

export default new PagingNavScreen({
	meta: import.meta,
	title: "Full screen",
	description: "A whole screen whose sub pages never move the rail.",
	icon: "web_asset",
	children: "overview activity settings",

	content(){ md("The rail is on the left; this is the centre."); },
});
