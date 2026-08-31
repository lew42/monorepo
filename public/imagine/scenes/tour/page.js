import { div, span, a, button, md } from "/app.js";
import { Scene, HINT } from "../Scene.js";
import { Cues, Clock, clock } from "/imagine/youtube/cues.js";

/* THE TOUR — and the one page here that is not a world.

   It has no `slot` and no `build()`, so `compose()` never asks it for anything and the
   foyer stands behind it untouched. What it owns is a CLOCK, and the clock walks the
   urls: every waypoint below is a page that already exists, and the tour arrives at it
   by `router.go()` — the same navigation a click makes. So the url is always the
   waypoint, the back button walks the tour backwards, and stopping halfway leaves you
   standing in a real place rather than in a mode.

   THE ENGINE IS THE YOUTUBE LAB'S. `Cues` and `Clock` are imported from
   /imagine/youtube/cues.js unchanged — the same twenty lines that fire `chat/`'s
   messages and open `course/`'s chapter pages, driven here by wall time instead of by
   `getCurrentTime()`. Lifting the engine out of the player is what made that possible;
   before it, a timeline needed a video. /imagine/youtube/doc/cues.md

   ⚠ THE TOUR MUST SURVIVE ITS OWN PAGE. Every other timed thing on this site stops in
     `deactivated()`; this one is deactivated by its own first waypoint. A page object
     is a module singleton and outlives its view, so the clock keeps its own time and
     the ticker asks the ROUTER where the reader is — the guard is "did they leave the
     subtree", not "is my page on screen". */

const HERE = "/imagine/scenes/";
const DWELL = 5.5;   // seconds per waypoint — long enough for the camera lerp to land

const STOPS = [
	["", "The foyer. Five doors, and every one of them is drawn by the world behind it."],
	["worlds/dawn/", "Grain one, the full swap: floor, fog, light and weather all belong to this page."],
	["worlds/dusk/", "The same eleven lines of builder. Nothing of Dawn survived."],
	["plinth/knot/", "Grain two. The room and the ring overhead were never rebuilt — only the mesh changed."],
	["quarters/dock/", "Grain three. One corner of the plate was built; the beacon never stopped turning."],
	["quarters/works/", "A second corner. The smoke starts from zero because this corner is new."],
	["gallery/motes/", "Grain four, the smallest: nothing is created at all. A light, and where you stand."],
	["observatory/vela/", "All four at once — and the telescope aims itself by reading the chain."],
	["observatory/daybreak/", "One light claims the hour, and eleven hundred stars go out without being touched."],
	["", "Back to the foyer. Eight worlds, one mechanism, and the url walked every one of them."],
];

export default new Scene({
	meta: import.meta,
	title: "Tour",
	description: "The YouTube lab's cue engine on a wall clock, walking the worlds this module already has.",
	classes: "scene-note",

	// ⚠ No `slot` and no `build()`: `compose()` only asks pages that have a builder, so
	//   arriving here composes nothing and the foyer behind stays exactly as it was.
	camera: { eye: [0, 2.8, 6.6], aim: [0, 2.3, 0] },

	content(){
		md("**The cue engine, driving a 3D pager.** Press **Start the tour** in the row above and the clock walks these ten stops by `router.go()` — real navigation, so the url is always where you are and the back button walks it backwards. Stop any time and you are standing in that world.");

		div.c("scene-tour", () => STOPS.forEach((stop, i) => this.row(stop, i)));
	},

	// The itinerary is also ten real links — the tour walked by hand is the same walk.
	row([where, say], i){
		div.c("scene-tour-stop", () => {
			span.c("scene-tour-at", clock(i * DWELL));
			a.c("scene-tour-where", where ? where.replace(/\/$/, "") : "foyer").href(HERE + where);
			span.c("scene-tour-say", say);
		});
	},

	// ════ THE TOUR ════════════════════════════════════════════════════════════
	// The host names me (`tour:` in ../page.js), so its nav row can reach these.
	start(){
		this.clock = new Clock();
		this.cues = new Cues({ fire: (name, mark) => name === "cue" && this.arrive(mark) })
			.set(STOPS.map(([where, say], i) => ({ at: i * DWELL, where, say })));

		this.touring = true;
		this.clock.start();
		this.timer ??= setInterval(() => this.beat(), 250);   // the poll rate the youtube labs use
		return this.beat();
	},

	stop(){
		clearInterval(this.timer);
		this.timer = null;
		this.touring = false;
		this.host().$hint?.text(HINT);
		this.host().recompose();
		return this;
	},

	host(){ return this.parent; },

	/* One beat. Three questions in this order, because the last two are only meaningful
	   while the first is true: did they leave, is the tour over, and where should we be.
	   ⚠ Never `this.view` — by the second waypoint this page is deactivated and its
	     view is off screen. Everything reads from the host and the router. */
	beat(){
		if (!this.app.router.active?.chain().includes(this.host())) return this.stop();

		const now = this.clock.time();

		if (now > (STOPS.length - 1) * DWELL + DWELL) return this.stop();

		this.cues.run(now);
		this.host().$hint?.text(this.cues.current()?.say ?? HINT);
		return this;
	},

	// A waypoint. `router.go()` is what a click does, so nothing here is a special case
	// — and the guard is the one `course/` needs for the same reason: arriving at the
	// url we are already on would be a navigation that changed nothing.
	arrive(mark){
		const url = HERE + mark.where;
		if (this.app.router.active?.url !== url) this.app.router.go(url);
		return this;
	},

	/* The controls, rendered INTO the host's nav row (see Scene.nav_row) — so they are
	   on screen in every world the tour passes through, and gone the moment it ends.
	   ⚠ Start lives here too, and not in my own note: the stage is a 66vh clamp, so at
	     1080 the note begins below the fold and the one button this page exists for
	     would have needed a scroll to find. The row of doors is already the module's
	     control surface; the tour is one more way through the same doors. */
	controls(){
		if (!this.touring) return this.app.router.active === this &&
			button.c("scene-nav-link scene-tour-key", "Start the tour").click(() => this.start());

		const at = (this.cues.crossed ?? -1) + 1;

		span.c("scene-nav-label", "Tour " + at + " / " + STOPS.length);
		button.c("scene-nav-link scene-tour-key", this.clock.running() ? "Pause" : "Resume")
			.click(() => { this.clock.toggle(); this.host().recompose(); });
		button.c("scene-nav-link scene-tour-key", "Stop").click(() => this.stop());
	},
});
