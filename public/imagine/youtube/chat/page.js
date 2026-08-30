import { Page, div, span, button, md } from "/app.js";
import { Player, clock, TALKS } from "../youtube.js";

/* Container: /imagine/'s column row. Size: `large` — measured 400 / 859 / 1024 / 1152;
   a room is narrow by nature and does not want `fill`. Own layout: one `flex wrap` seam
   at 18em. Regions: one. Preview: the default card.

   ⚠ The log is the ONE scrolling box on this page and it is deliberate — a room is a
     scroller, that is what a room is. Its height is capped so it cannot grow the column.

   TIME-BASED CHAT, AND THE SCRUB IS THE POINT. Each message is a cue. Playing forward
   they arrive one at a time; scrubbing FORWARD they arrive all at once — the room
   catches up; scrubbing BACK the log is emptied and replayed from the start, so you see
   exactly the room that position had. That is the shared engine's rule, unmodified:
   forward runs what was crossed, backward resets and replays. doc/cues.md. */

const ROOM = [
	{ at: 8,   who: "mara",   text: "here we go" },
	{ at: 14,  who: "dev",    text: "first time watching this one" },
	{ at: 22,  who: "jules",  text: "the opening joke gets me every time" },
	{ at: 31,  who: "mara",   text: "ha" },
	{ at: 40,  who: "sam",    text: "wait what did he say about the education system" },
	{ at: 49,  who: "jules",  text: "that we educate people out of their creativity" },
	{ at: 58,  who: "dev",    text: "^ that is the whole talk in one line" },
	{ at: 70,  who: "ilya",   text: "joining late, what did I miss" },
	{ at: 76,  who: "mara",   text: "nothing, 1 min in" },
	{ at: 88,  who: "sam",    text: "the nativity play story" },
	{ at: 97,  who: "jules",  text: "'frankincense'" },
	{ at: 106, who: "ilya",   text: "lol" },
	{ at: 120, who: "dev",    text: "if you are not prepared to be wrong you will never be original" },
	{ at: 129, who: "mara",   text: "writing that one down" },
	{ at: 141, who: "sam",    text: "children are not frightened of being wrong" },
	{ at: 152, who: "ilya",   text: "by the time they are adults most have lost that" },
	{ at: 163, who: "jules",  text: "companies do it too" },
	{ at: 175, who: "dev",    text: "mistakes are the worst thing you can make, yeah" },
];

export default new Page({
	meta: import.meta,
	title: "Chat",
	description: "A chat replay keyed to timestamps — scrub back and the room replays, scrub forward and it catches up.",
	icon: "forum",
	width: "large",

	content(){
		md("Press play, then **drag the video's own scrubber**. The room below is 18 messages with timestamps and nothing else — every message you see is one the playhead has passed.");

		div.c("yt-lab yt-chat flex wrap gap", () => {
			div.c("yt-side", () => { this.player = new Player({ video: TALKS.robinson }); });

			div.c("yt-room flex v gap", () => {
				div.c("yt-now", () => {
					this.$count = span.c("yt-now-chapter", "0 of " + ROOM.length);
					this.$clock = span.c("yt-now-clock", "0:00");
				});

				this.$log = div.c("yt-log");

				div.c("yt-keys flex wrap gap", () => [0, 60, 120, 180].forEach(at =>
					button.c("yt-btn", clock(at)).click(() => this.player.seek(at))
				)).style("--gap", "0.4em");
			});
		});

		this.player.cues(ROOM.map(line => ({ at: line.at, fn: () => this.said(line) })));
		this.player.on("reset", () => this.$log.empty());
		this.player.on("time", time => {
			this.$clock.text(clock(time) + " / " + clock(this.player.duration()));
			this.$count.text(this.$log.el.children.length + " of " + ROOM.length);
		});
	},

	deactivated(){ this.player?.rest(); },

	// ⚠ Through `$log.append(fn)`, never a bare factory call: a cue runs from an
	//   interval, long after render() left the captor on the app's `$pages`, so the row
	//   would be built at the document root and only then moved.
	said(line){
		this.$log.append(() => div.c("yt-line", () => {
			span.c("yt-line-at", clock(line.at));
			span.c("yt-line-who", line.who);
			span.c("yt-line-text", line.text);
		}));

		this.$log.el.scrollTop = this.$log.el.scrollHeight;
	},
});
