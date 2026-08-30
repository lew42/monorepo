import { Page, div, span, button, input, label, md } from "/app.js";
import { Player, clock, TALKS } from "../youtube.js";

/* Container: /imagine/'s column row. Size: `large` — measured 400 / 859 / 1024 / 1152;
   the stage is a 16:9 box with a 20em floor, so it is a real video at 1024 and still a
   usable form at 400. Own layout: one stage box holding two absolutely-positioned
   layers. Regions: one. Preview: the default card.

   THE VIDEO STEPS ASIDE, IT DOES NOT LEAVE. At a cue the player is TRANSFORMED into
   the corner — scaled and translated, never `display: none` and never re-created — so
   it keeps playing and the audio never breaks. The UI it was narrating takes the whole
   stage, and it is the real thing: type in it, and what you typed is still there three
   beats later.

   ⚠ A player you hide with `display: none` is destroyed and rebuilt by the browser's
     layout — the sound stops and the position is lost. A transform is a paint, not a
     re-attach, which is why this shape is the one that works.

   Honest about the audio: this is a real talk, so it is not narrating this form. The
   MECHANISM is what the page shows — swap in narration recorded for your own UI and
   nothing here changes but the cue table. */

const BEATS = [
	{ at: 0,   step: 0, say: "video on stage" },
	{ at: 25,  step: 1, say: "step 1 — the video stepped aside" },
	{ at: 65,  step: 0, say: "video back on stage" },
	{ at: 80,  step: 2, say: "step 2 — aside again" },
	{ at: 120, step: 0, say: "video back on stage" },
	{ at: 135, step: 3, say: "step 3 — aside again" },
	{ at: 175, step: 0, say: "video back for the close" },
];

export default new Page({
	meta: import.meta,
	title: "Yield",
	description: "At a cue the video shrinks to a corner and keeps playing, and the real interactive UI takes the stage.",
	icon: "picture_in_picture",
	width: "large",

	content(){
		this.answers = {};

		md("Press play. At **0:25** the video steps aside and the form takes over — it is still playing, still audible, and the form is real. Or jump straight to a beat below.");

		div.c("yt-lab yt-yield", () => {
			this.$stage = div.c("yt-yield-stage", () => {
				div.c("yt-yield-video", () => { this.player = new Player({ video: TALKS.sinek }); });
				div.c("yt-yield-ui", () => this.wizard());
			});

			div.c("yt-now", () => {
				this.$note = span.c("yt-now-chapter", "press play");
				this.$clock = span.c("yt-now-clock", "0:00");
			});

			div.c("yt-keys flex wrap gap", () => BEATS.forEach(beat =>
				button.c("yt-btn", clock(beat.at) + " " + (beat.step ? "aside" : "back")).click(() => this.player.seek(beat.at))
			)).style("--gap", "0.4em");

			this.$sum = div.c("yt-sum", "Nothing entered yet.");

			this.player.cues(BEATS.map(beat => ({ at: beat.at, fn: () => this.step(beat.step, beat.say) })));
			this.player.on("reset", () => this.step(0, "rewound"));
			this.player.on("time", time => this.$clock.text(clock(time) + " / " + clock(this.player.duration())));
		});
	},

	deactivated(){ this.player?.rest(); },

	// ════ the one state change ════════════════════════════════════════════════
	// Every cue sets an ABSOLUTE state, never a delta — which is the whole reason a
	// backward scrub can be answered by replaying the cues from the start.
	step(n, say){
		this.$stage.tc("yt-aside", !!n);
		this.$steps.forEach(($step, i) => $step.tc("yt-on", i === n - 1));
		this.$note.text(say);
	},

	// ════ the UI that takes the stage ═════════════════════════════════════════
	// A real three-step form. The ANSWERS are yours and the TIMELINE only decides which
	// step is on screen, so scrubbing never eats what you typed.
	wizard(){
		this.$steps = [
			this.card("Who is taking this", () => {
				this.field("name", "your name");
				this.field("email", "email", "email");
			}),

			this.card("What you want out of it", () => {
				this.check("why", "Find my why");
				this.check("talk", "Talk to a room");
				this.check("team", "Lead a team");
			}),

			this.card("How fast", () => {
				this.pick("pace", "A weekend");
				this.pick("pace", "Four weeks");
				this.pick("pace", "No hurry");
			}),
		];
	},

	card(title, fn){
		return div.c("yt-step", () => {
			span.c("yt-ctl-label", title);
			div.c("flex v gap", fn).style("--gap", "0.6em");
		});
	},

	field(name, text, type = "text"){
		div.c("yt-field", () => {
			span.c("yt-field-label", text);
			input().attr("type", type).attr("placeholder", text)
				.on("input", e => this.answered(name, e.target.value));
		});
	},

	check(name, text){
		label.c("yt-check", () => {
			input().attr("type", "checkbox").on("change", e => this.answered(name, e.target.checked ? text : ""));
			span(text);
		});
	},

	pick(name, text){
		label.c("yt-check", () => {
			input().attr("type", "radio").attr("name", name).on("change", () => this.answered(name, text));
			span(text);
		});
	},

	answered(name, value){
		if (value) this.answers[name] = value;
		else delete this.answers[name];

		const said = Object.entries(this.answers).map(([k, v]) => `${k}: ${v}`).join("  ·  ");
		this.$sum.text(said || "Nothing entered yet.");
	},
});
