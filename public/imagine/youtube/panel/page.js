import { Page, div, span, button, input, md } from "/app.js";
import { Player, clock, TALKS } from "../youtube.js";

/* Container: /imagine/'s column row, so `.page-column-prose` — no page grid, and no
   `bleed`: a row of controls that ends flush against the screen edge reads as clipped,
   and the column's own 14px inset is exactly the fix (measured at 1920, 2026-08-30).
   Size: `large` — measured 400 / 859 / 1024 / 1152. `fill` was tried first and is a NO:
   it hands the column 2936px at 3440 and the seam splits it evenly, so the stage became
   a 2340px video taller than the viewport and the page was one enormous frame with a
   control strip stuck to it (shot, 2026-08-30). `large`'s 64em ceiling IS the answer
   the row already has, and the leftover is drawn as the column slots it is. Own layout:
   one `flex wrap` seam, video and controls, which stacks under ~42em. Regions: one.
   Preview: the default card.

   `default`, so /imagine/youtube/ arrives with something on screen. It costs one
   poster image — the iframe still waits for your click.

   THIS IS THE API, AS CONTROLS. Every method the wrapper exposes has a labelled
   control here and every event it fires lands in the feed. Nothing is simulated: the
   readouts are `getCurrentTime()`, `getPlayerState()`, `getVolume()` read back four
   times a second, because the API has no event that would tell us. */

const STARTER = TALKS.jobs;

export default new Page({
	meta: import.meta,
	title: "Control panel",
	description: "Every exposed method as a labelled control, every event in a feed — the API explorer.",
	icon: "tune",
	width: "large",
	classes: "default",

	content(){
		md("Press play, then drive it. Every control below is one API call; every event the player fires lands in the feed at the bottom.");

		div.c("yt-lab yt-panel flex wrap gap", () => {
			div.c("yt-side", () => { this.player = new Player({ video: STARTER }); });
			div.c("yt-controls flex v gap", () => this.controls());
		});

		md("The player is also on the console: `(await import('/imagine/youtube/youtube.js')).Player.all.at(-1)`.");
	},

	// ⚠ The poll must not outlive the page. `rest()` pauses and clears the interval;
	// `Player.live` is back to 0 the moment you leave. The iframe stays, so coming
	// back finds the video where you left it.
	deactivated(){ this.player?.rest(); },

	// Coming back: one read, so the readouts are not showing where the playhead was
	// when you left. Nothing starts — the poll waits for a state change.
	activated(){ if (this.player?.ready) this.player.read(); },

	controls(){
		this.readouts();
		this.seeking();
		this.transport();
		this.speed();
		this.sound();
		this.source();
		this.feed();

		this.player.on("ready", () => this.ready());
		this.player.on("state", code => this.say(`onStateChange — ${Player.states[code] ?? code}`));
		this.player.on("rate", r => this.say(`onPlaybackRateChange — ${r}x`));
		this.player.on("error", code => this.say(`onError — ${code}`));
		this.player.on("time", t => this.tick(t));
	},

	// onReady is the first moment the getters have anything to say — the duration, the
	// rate list and the volume are all unknowable before it.
	ready(){
		this.say("onReady — player built");
		this.$seek.attr("max", Math.round(this.player.duration()));
		this.$rates.empty(() => this.player.rates().forEach(r => this.key(`${r}x`, () => this.call("setPlaybackRate", () => this.player.rate(r)))));
		this.$volume.el.value = this.player.volume();
		this.tick(0);
	},

	// ════ the readouts ════════════════════════════════════════════════════════
	readouts(){
		div.c("yt-reads", () => {
			this.$state = this.read("state");
			this.$time = this.read("currentTime");
			this.$duration = this.read("duration");
			this.$rate = this.read("rate");
			this.$vol = this.read("volume");
			this.$buffer = this.read("loaded");
		});
	},

	read(name){
		let $value;
		div.c("yt-read", () => {
			span.c("yt-read-label", name);
			$value = span.c("yt-read-value", "--");
		});
		return $value;
	},

	// Four a second while playing, once per state change otherwise.
	tick(time){
		const player = this.player;

		this.$state.text(player.said());
		this.$time.text(clock(time) + "." + Math.floor((time % 1) * 10));
		this.$duration.text(clock(player.duration()));
		this.$rate.text(player.rate() + "x");
		this.$vol.text(player.muted() ? "muted" : player.volume() + "%");
		this.$buffer.text(Math.round(player.loaded() * 100) + "%");

		// ⚠ Never while the reader is dragging it — a 4Hz write would fight the thumb.
		if (!this.dragging) this.$seek.el.value = time;
	},

	// ════ seek ════════════════════════════════════════════════════════════════
	seeking(){
		div.c("yt-ctl", () => {
			span.c("yt-ctl-label", "seekTo(seconds, true)");

			this.$seek = input.c("yt-seek").attr("type", "range").attr("min", 0).attr("max", 100).attr("step", 0.25)
				.on("pointerdown", () => this.dragging = true)
				.on("input", e => this.player.seek(+e.target.value))
				.on("change", () => this.dragging = false);

			div.c("yt-keys flex wrap gap", () => {
				this.$to = input.c("yt-to").attr("type", "text").attr("placeholder", "6:00 or 360").attr("value", "6:00");
				this.key("Go", () => this.call("seekTo", () => this.player.seek(seconds(this.$to.el.value))));
				this.key("-10s", () => this.call("seekTo", () => this.player.seek(this.player.time() - 10)));
				this.key("+10s", () => this.call("seekTo", () => this.player.seek(this.player.time() + 10)));
			}).style("--gap", "0.4em");
		});
	},

	// ════ transport ═══════════════════════════════════════════════════════════
	transport(){
		div.c("yt-ctl", () => {
			span.c("yt-ctl-label", "playVideo / pauseVideo / stopVideo");
			div.c("yt-keys flex wrap gap", () => {
				this.key("Play", () => this.call("playVideo", () => this.player.play()));
				this.key("Pause", () => this.call("pauseVideo", () => this.player.pause()));
				this.key("Stop", () => this.call("stopVideo", () => this.player.stop()));
			}).style("--gap", "0.4em");
		});
	},

	// ════ rate ════════════════════════════════════════════════════════════════
	speed(){
		div.c("yt-ctl", () => {
			span.c("yt-ctl-label", "setPlaybackRate — from getAvailablePlaybackRates()");
			this.$rates = div.c("yt-keys flex wrap gap").style("--gap", "0.4em");
		});
	},

	// ════ volume ══════════════════════════════════════════════════════════════
	sound(){
		div.c("yt-ctl", () => {
			span.c("yt-ctl-label", "setVolume / mute / unMute");

			this.$volume = input.c("yt-volume").attr("type", "range").attr("min", 0).attr("max", 100).attr("value", 100)
				.on("input", e => this.call("setVolume", () => this.player.volume(+e.target.value)));

			div.c("yt-keys flex wrap gap", () => {
				this.key("Mute", () => this.call("mute", () => this.player.mute(true)));
				this.key("Unmute", () => this.call("unMute", () => this.player.mute(false)));
			}).style("--gap", "0.4em");
		});
	},

	// ════ the source ══════════════════════════════════════════════════════════
	// load plays, cue only prepares — the one distinction the API draws a line under.
	source(){
		div.c("yt-ctl", () => {
			span.c("yt-ctl-label", "loadVideoById / cueVideoById");
			div.c("yt-keys flex wrap gap", () => {
				this.$id = input.c("yt-id").attr("type", "text").attr("value", TALKS.sinek).attr("placeholder", "video id");
				this.key("Load", () => this.call("loadVideoById", () => this.swap(false)));
				this.key("Cue", () => this.call("cueVideoById", () => this.swap(true)));
			}).style("--gap", "0.4em");
		});
	},

	swap(cue){
		this.player.swap(this.$id.el.value.trim(), cue);
		this.$seek.attr("max", 100);
	},

	// ════ the feed ════════════════════════════════════════════════════════════
	// Newest first, so it needs no scroll-to-bottom and cannot fight the reader.
	feed(){
		div.c("yt-ctl", () => {
			span.c("yt-ctl-label", "events + calls");
			this.$feed = div.c("yt-feed");
		});
	},

	// ⚠ Through `$feed.append(fn)`, never a bare `div.c(…)` — a factory called from a
	// click handler runs under whatever captor render() left behind (the app's `$pages`),
	// so the row would be built into the document root and only then moved. A callback
	// re-establishes the captor, which is the whole of the capturing contract.
	say(text){
		if (!this.$feed) return;

		const at = clock(this.player.time());

		this.$feed.append(() => div.c("yt-feed-row", () => {
			span.c("yt-feed-at", at);
			span.c("yt-feed-msg", text);
		}));

		while (this.$feed.el.children.length > 40) this.$feed.el.firstElementChild.remove();
		this.$feed.el.scrollTop = this.$feed.el.scrollHeight;
	},

	// A control invocation IS an event worth logging — half of what this page shows is
	// the order calls and callbacks arrive in.
	call(name, fn){ this.say(name + "()"); fn(); },

	key(text, fn){ return button.c("yt-btn", text).click(fn); },
});

// "6:00" and "360" both mean the same second.
function seconds(text){
	const parts = String(text).trim().split(":").map(Number);
	return parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0] || 0;
}
