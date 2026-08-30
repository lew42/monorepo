import { Page, div, span, button, input, md } from "/app.js";
import { Player, clock, TALKS } from "../youtube.js";

/* Container: /imagine/'s column row. Size: `large` — two halves of CONTENT side by side,
   which `layout` Q2 says never live in a prose measure; measured 400 / 859 / 1024 / 1152.
   Not `fill`: at 3440 it would hand one video 2936px (see panel/page.js for the shot).
   The form half is capped at 30em so the video takes the larger share. Own layout: one
   `flex wrap` seam at 22em, so it stacks on a phone and under a narrow row. Regions:
   one. Preview: the default card.

   VIDEO ONE SIDE, A LIVE FORM THE OTHER. The timeline does two things to the form and
   only two: it LIGHTS the field being talked about, and it OFFERS a value.

   ⚠ It offers, it does not overwrite. A prefill lands only in a field that is empty or
     that the timeline itself filled — `this.auto` is the set it remembers — so a value
     you typed survives a rewind, and a value the video suggested is taken back. That
     distinction is the whole difference between a demo and something you could ship. */

const STEPS = [
	{ at: 0,   note: "waiting for the first cue" },
	{ at: 15,  field: "topic",   fill: "Body language",              note: "topic" },
	{ at: 45,  field: "room",    fill: "A 200-seat lecture hall",    note: "the room" },
	{ at: 80,  field: "minutes", fill: "21",                         note: "how long" },
	{ at: 115, field: "pose",    fill: "Two minutes alone, arms up", note: "the last thing before you go on" },
	{ at: 150, note: "done — the brief is yours to edit" },
];

const FIELDS = [
	["topic", "What the talk is about"],
	["room", "Where you are giving it"],
	["minutes", "Minutes on stage"],
	["pose", "What you do beforehand"],
];

export default new Page({
	meta: import.meta,
	title: "Split",
	description: "Video one side, a live form the other — fields light up and prefill as the talk reaches them.",
	icon: "vertical_split",
	width: "large",

	content(){
		this.auto = new Set();

		md("Press play. The brief on the right fills itself in as the talk reaches each part — **type over any of it** and the timeline will not take your words back.");

		div.c("yt-lab yt-split flex wrap gap", () => {
			div.c("yt-side", () => { this.player = new Player({ video: TALKS.cuddy }); });

			div.c("yt-form flex v gap", () => {
				span.c("yt-ctl-label", "your talk, as the video describes it");
				this.$fields = new Map(FIELDS.map(([name, text]) => [name, this.field(name, text)]));

				div.c("yt-now", () => {
					this.$note = span.c("yt-now-chapter", "press play");
					this.$clock = span.c("yt-now-clock", "0:00");
				});

				div.c("yt-keys flex wrap gap", () => STEPS.forEach(step =>
					button.c("yt-btn", clock(step.at)).click(() => this.player.seek(step.at))
				)).style("--gap", "0.4em");
			});
		});

		this.player.cues(STEPS.map(step => ({ at: step.at, fn: () => this.reach(step) })));
		this.player.on("reset", () => this.rewind());
		this.player.on("time", time => this.$clock.text(clock(time) + " / " + clock(this.player.duration())));
	},

	deactivated(){ this.player?.rest(); },

	// Returns the pair, because the LIT mark belongs on the whole field — the label
	// lights with the box — and the value belongs to the input.
	field(name, text){
		const pair = {};

		pair.$field = div.c("yt-field", () => {
			span.c("yt-field-label", text);
			pair.$input = input().attr("type", "text").attr("placeholder", "—")
				// Typing takes the field back off the timeline, for good.
				.on("input", () => this.auto.delete(name));
		});

		return pair;
	},

	// One cue, one absolute state: exactly one field lit, and at most one value offered.
	reach(step){
		this.$fields.forEach((pair, name) => pair.$field.tc("yt-lit", name === step.field));
		this.$note.text(step.note);

		if (!step.field) return;

		const $input = this.$fields.get(step.field).$input;
		if ($input.el.value && !this.auto.has(step.field)) return;   // yours — leave it

		$input.el.value = step.fill;
		this.auto.add(step.field);
	},

	// Scrubbing back: take back only what the timeline put there, then let the replay
	// put back whatever the new position had already offered.
	rewind(){
		this.auto.forEach(name => this.$fields.get(name).$input.el.value = "");
		this.auto.clear();
	},
});
