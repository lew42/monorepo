import { Page, md } from "/app.js";

/* Container: /imagine/'s column row — this page is a column of it, not a host of its
   own (`column_host()` returns the SHALLOWEST columnar ancestor, so a `columns()` call
   here would be inert — core/Page/doc/columns.md). Size: `small`, a 14em picker rail.
   Own layout: core's, unchanged — five children, five rows. Regions: one, core's.
   Preview: the default card.

   `panel` is the `default` column so the lab opens with something on screen instead of
   a grey row. It costs one poster image: no page here loads a Google iframe until you
   press play. */

export default new Page({
	meta: import.meta,
	title: "YouTube",
	description: "Five labs on the IFrame Player API — a control panel, a course, and three ways a timeline can drive the UI.",
	icon: "smart_display",

	content(){
		md("Five labs on the **IFrame Player API**. Press play on any of them — nothing here touches Google until you do.");
		md("The API has no time event, so every timeline below is one polled read of `getCurrentTime()` and one shared `cues()` engine ([how it works](/imagine/youtube/readme/)) — the same engine [the 3D pager's tour](/imagine/scenes/tour/) runs on a wall clock.");
		md("**Marks** is the stopwatch the other five were written with: watch, press M at each boundary, copy out the array.");
	},

	children: "panel course yield split chat marks",
});
