import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. Photo, the table and the strip all
   take `wide`; prose keeps the measure. Two regions, no children.

   Two buildable bits: the rig constraint is a 2x2 (mic x camera count) and the lyric
   build-up is three ordered steps. Both are read-only pictures of what the note says —
   there is no choice to make here, only a constraint to see. */

const RIG = [
	["", "One camera", "Multicam"],
	["Shotgun", "Works. One track, one device.", "Multitrack — and that needs a second device."],
	["Lav", "Works, and it is the better handheld mic.", "Multitrack — same second device."],
	["Both", "No. The note is explicit: shotgun OR lav.", "No. Not without multi-device."],
];

const BUILDUP = [
	["1", "Finalise the full chorus", "Write the thing you are building toward first."],
	["2", "Reduce the line length", "The same chorus, shorter — this is the middle rung."],
	["3", "Build up to the full chorus", "And bring all the best parts back."],
];

function rig_table(){
	return div.c("surface pad flex v gap wide").append(() => {
		span().style("fontWeight", "700").text("Shotgun OR lav, can't use both");
		div.c("grid gap").style("gridTemplateColumns", "minmax(4em, 6em) 1fr 1fr")
			.append(() => RIG.forEach((row, r) => row.forEach((cell, c) => {
				const head = r === 0 || c === 0;
				div.c(head ? "" : "muted").style({ fontWeight: head ? "700" : "400",
					fontSize: "0.9em", padding: "0.35em 0" }).text(cell);
			})));
		span.c("muted").text("Recording is on/off, on/off, twice — which is the note's own "
			+ "word for it: a pain.");
	});
}

function buildup_strip(){
	return div.c("flex gap wrap wide").append(() => BUILDUP.forEach(([n, title, says]) => {
		div.c("surface pad flex v gap flex-1").style("minWidth", "12em").append(() => {
			span.c("muted").text("Step " + n);
			span().style("fontWeight", "700").text(title);
			span.c("muted").text(says);
		});
	}));
}

export default new NotesNote({
	meta: import.meta,
	title: "Shotgun or lav",
	icon: "mic",
	description: "You cannot have both — and the lyric build-up is three steps.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**Left page — the rig, as a set of constraints.**

- **Selfie:** needs angle · **Selfie + HD Cam?** *+ Phone…*
- **Tripod:** probably don't want angle?
- **How hard is it to maintain the frame in selfie mode?** → *with a heavy camera?*
- **Record w/ music?** *Maybe it doesn't matter?* → might need music from a 2nd device…?
  → and visually synced… *show song to cam…?*
- Beside a camera sketch: **Shotgun OR lav, can't use both…** — *if multicam ⇒ multitrack…*
  — *can't have both w/o multi-device… recording = pita? on/off/on/off ×2*

**Right page — content and lyrics.** At the top: *grad, star balloons, ear cones 3:15 (?)*

> **Create content w/ more purpose** → *No script, just a specific point*, usually
> *"follow for more!"*, *"give me a like if you agree, & don't forget to subscribe"*,
> *"I'm looking for people willing to help me grow."*

- **Just create real content?** ☑ Biblical ☑ US History
- **How to make catchy beats** — *verse(s) → chorus*
- **Narrated? Sung?**
- **Lyrics &lt;buildup&gt;:** ① finalise full chorus ② reduce the line length? ③ build up to
  the full chorus → *and bring all the best parts back*
- **FAILURE TO LAUNCH**
- *If they're the same BPM, the lyrics from one song should work? → lyrics are often
  **syncopated***`);

		md(`## What it points at

- [Video research](/imagine/platform/research/video/) — the platform's own verdict on
  video: what it needs before any of this gear matters.
- [Feeds · video](/imagine/feeds/video/) — the realm that renders video here today.
- Companions in this notebook: [Record long, cut to 60s](/notes/record-long-cut-to-60s/)
  is the edit, [Anchor point, optional](/notes/anchor-point-optional/) is the gear list
  and the view counts, and [One video, everywhere](/notes/one-video-everywhere/) is where
  the finished cut goes.`);

		md("## The rig constraint");

		rig_table();

		md("## The lyric build-up");

		buildup_strip();

		md(`Neither of these is an interface — they are a constraint and an order of work.
Drawing them is the whole point: the note's "can't use both" is a rule you can see in one
glance, and the build-up is three steps that only make sense in that sequence.`);
	}
});
