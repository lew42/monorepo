import { Page, md } from "/app.js";

/* Container: /imagine/'s column row — this page is a column of it, not a host of its
   own (`column_host()` returns the SHALLOWEST columnar ancestor, so a `columns()` call
   here would be inert — core/Page/doc/columns.md). Size: `small`, a 14em picker rail.
   Own layout: core's `previews()` wall, five real stills — `index: true` because
   `panel` is already open beside this column, the same reasoning `course/`'s own
   `index: true` uses for its chapter bar (2026-09-05 ux-rethink: the five were plain
   icon+word rows — Course, Yield, Split, Chat, Marks say nothing until you click one;
   a screenshot of each lab's own distinguishing UI does, at no core change). Regions:
   one, core's. Preview: the default card.

   `panel` is the `default` column so the lab opens with something on screen instead of
   a grey row. It costs one poster image: no page here loads a Google iframe until you
   press play. */

export default new Page({
	meta: import.meta,
	title: "YouTube",
	description: "Five labs on the IFrame Player API — a control panel, a course, and three ways a timeline can drive the UI.",
	icon: "smart_display",
	index: true,

	content(){
		md("Five labs on the **IFrame Player API**. Press play on any of them — nothing here touches Google until you do.");
		md("The API has no time event, so every timeline below is one polled read of `getCurrentTime()` and one shared `cues()` engine ([how it works](/imagine/youtube/readme/)) — the same engine [the 3D pager's tour](/imagine/scenes/tour/) runs on a wall clock.");
		md("**Marks** is the stopwatch the other five were written with: watch, press M at each boundary, copy out the array.");

		// `panel` is already open beside this column — the wall shows only the five it
		// is not, each a real screenshot of its own distinguishing UI (2026-09-05).
		this.previews(new Map([...this.children].filter(([name]) => name !== "panel")));
	},

	// ⚠ `panel` is shown as the `default` column WITHOUT ever being routed to, and
	//   Page.class.js's `render_column()` only `render()`s a default column — it never
	//   `activate()`s it (core/Page/Page.class.js:307). Landing here cold, `panel`'s own
	//   `activated()` never ran, so its keydown listener was never attached: every key on
	//   the legend (Space, arrows, J/L, M, 0-9) did nothing at all, and the reverse bug
	//   was worse — pressing play then leaving for another page never called `rest()`,
	//   so the 4×/second poll ran forever (`Player.live` never dropped back to 0).
	//   `uses/split`'s parent already carries this exact workaround for a never-routed
	//   region (Page.class.js:60); this mirrors it for a never-routed COLUMN. Once you
	//   actually navigate to `/panel/` the router activates/deactivates it normally and
	//   this is a harmless no-op re-entry (`render()`/`activate()` are both idempotent).
	//   The real fix belongs in `render_column()` — proposed in doc/decisions.md.
	activated(){ this.default_column()?.activate(); },
	deactivated(){ this.default_column()?.deactivate(); },

	children: "panel course yield split chat marks",
});
