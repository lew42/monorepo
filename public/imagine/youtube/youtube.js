import { View, div, img, button, icon } from "/app.js";

View.stylesheet(import.meta, "youtube.css");

/* The YouTube IFrame Player API, wrapped once for the whole lab — five pages, one
   module. `Player` is the handle a page keeps; `cues()` is the timeline engine four
   of the five are built out of. doc/api.md, doc/cues.md.

   THREE THINGS THIS FILE EXISTS TO SAY:

   1. The api script is loaded ONCE per document and it announces itself through a
      GLOBAL callback, not a load event — so the promise is resolved by YouTube.
   2. There is NO `timeupdate` event. The timeline is READ BACK by polling
      `getCurrentTime()`, and the poll only exists while something is playing.
   3. Nothing touches Google until you press play. The stage is a poster and a
      button (the pattern from /imagine/feeds/video/); pressing it is also the user
      gesture that lets the player start with sound. */

let loading;

// ⚠ Resolved by `onYouTubeIframeAPIReady`, which YouTube calls on `window` — the
// script's own `load` event fires BEFORE `YT.Player` exists. The previous handler is
// kept and called, so this can never be the thing that breaks another loader.
export function api(){
	if (loading) return loading;

	return loading = new Promise(resolve => {
		if (window.YT?.Player) return resolve(window.YT);

		const before = window.onYouTubeIframeAPIReady;
		window.onYouTubeIframeAPIReady = () => { before?.(); resolve(window.YT); };

		const script = document.createElement("script");
		script.src = "https://www.youtube.com/iframe_api";
		document.head.appendChild(script);
	});
}

export class Player {

	// Four reads a second. The API has no time event, so this number IS the
	// resolution of every cue on every page here — at 250ms a cue fires within an
	// eighth of a second of its mark, which is under the threshold anyone notices.
	tick = 250;

	constructor(...args){
		this.assign(...args);
		this.handlers = {};
		this.marks = [];
		this.crossed = -1;
		Player.all.push(this);
		this.initialize();
	}

	assign(...args){ return Object.assign(this, ...args); }

	// The stage is built NOW, synchronously, into whatever captured it. Everything
	// async fills a box that already exists — the DOM-after-await trap, sidestepped
	// rather than survived.
	initialize(){
		this.$stage = div.c("yt-stage", () => this.poster());
		return this;
	}

	poster(){
		img.c("yt-poster").attr("src", `https://i.ytimg.com/vi/${this.video}/hqdefault.jpg`).attr("alt", "");
		button.c("yt-start", () => icon("play_arrow")).click(() => this.start());
	}

	// Press play → the iframe. Idempotent, because a second click while the api
	// script is still in flight would build two players into one box.
	start(){
		if (this.started) return this;
		this.started = true;

		this.$stage.empty(() => { this.$slot = div.c("yt-slot"); });
		api().then(YT => this.build(YT));
		return this;
	}

	// ⚠ `new YT.Player(el)` REPLACES el with the iframe — so `this.$slot` is stale the
	// moment this runs, and nothing may hold onto it. `getIframe()` is the handle.
	build(YT){
		this.yt = new YT.Player(this.$slot.el, {
			host: "https://www.youtube-nocookie.com",
			videoId: this.video,
			playerVars: { rel: 0, modestbranding: 1, playsinline: 1, autoplay: 1, start: this.from ?? 0 },
			events: {
				onReady: () => { this.ready = true; this.play(); this.fire("ready", this); this.watch(); },
				onStateChange: e => { this.fire("state", e.data); this.watch(); },
				onPlaybackRateChange: e => this.fire("rate", e.data),
				onError: e => this.fire("error", e.data),
			},
		});
		return this;
	}

	// ════ THE POLL ════════════════════════════════════════════════════════════
	// One place decides whether a timer exists, so there is one place a leak could
	// come from. `Player.live` is the count of running polls across the document —
	// it is what a test asserts is back to 0 after you leave a page.
	watch(){
		const playing = this.state() === 1;

		if (playing && !this.timer){
			this.timer = setInterval(() => this.read(), this.tick);
			Player.live++;
		} else if (!playing && this.timer){
			this.stop_watching();
		}

		this.read();
		return this;
	}

	stop_watching(){
		if (!this.timer) return this;
		clearInterval(this.timer);
		this.timer = null;
		Player.live--;
		return this;
	}

	// One tick: what the playhead crossed, and THEN the time. That order, because
	// `current()` must already be right when a `time` handler asks it — the other way
	// round leaves every readout one tick (250ms) behind the cue it is describing.
	read(){
		const time = this.time();
		this.run(time);
		this.fire("time", time);
		return time;
	}

	// ⚠ EVERY SETTER CROSSES INTO THE IFRAME BY postMessage, so the getters do not
	//   answer with the new value on the same turn — `seekTo(360)` then
	//   `getCurrentTime()` returns where you WERE. While playing the poll catches up
	//   250ms later and nobody notices; while PAUSED nothing would ever re-read, so a
	//   typed seek looked like it did nothing at all (measured headless, 2026-08-30).
	//   One delayed read is the whole fix, and one timer, replaced not stacked.
	settle(){
		clearTimeout(this.later);
		this.later = setTimeout(() => this.read(), 350);
		return this;
	}

	// Leaving the page. The poll dies HERE and not in a state handler, because a page
	// can be left while PAUSED and an orphan interval is invisible. The iframe stays,
	// so coming back finds the video where you left it.
	rest(){
		this.yt?.pauseVideo?.();
		clearTimeout(this.later);
		return this.stop_watching();
	}

	// ════ THE CUE ENGINE ══════════════════════════════════════════════════════
	// cues([{ at, fn }]) — the whole timeline vocabulary. doc/cues.md.
	cues(list){
		this.marks = [...this.marks, ...list].sort((a, b) => a.at - b.at);
		return this;
	}

	// ONE comparison: how many cues are behind the playhead. Moving forward runs the
	// ones just crossed — which is also what makes a forward SCRUB fast-forward the
	// room. Moving back fires `reset` and replays from the start, so scrubbing lands
	// on exactly the screen a playthrough would have built. No cue needs an undo.
	run(time){
		let to = -1;
		while (this.marks[to + 1] && this.marks[to + 1].at <= time) to++;
		if (to === this.crossed) return this;

		let from = this.crossed;
		if (to < from){ this.fire("reset"); from = -1; }

		this.crossed = to;

		for (let i = from + 1; i <= to; i++){
			this.fire("cue", this.marks[i], i);
			this.marks[i].fn?.(this.marks[i], this);
		}

		return this;
	}

	// The cue the playhead is inside — the "which chapter am I in" question, which is
	// the same question as "what was the last thing crossed".
	current(){ return this.marks[this.crossed]; }

	// ════ EVENTS ══════════════════════════════════════════════════════════════
	// ready · state · rate · error · time · cue · reset
	on(name, fn){ (this.handlers[name] ??= []).push(fn); return this; }
	fire(name, ...args){ this.handlers[name]?.forEach(fn => fn(...args)); return this; }

	// ════ THE API, one method per exposed call ════════════════════════════════
	// Every one is null-safe: a control can be pressed before the iframe exists and
	// the page must not throw at the reader.
	play(){ this.yt?.playVideo?.(); return this.settle(); }
	pause(){ this.yt?.pauseVideo?.(); return this.settle(); }
	stop(){ this.yt?.stopVideo?.(); this.stop_watching(); return this.settle(); }

	// `true` = seek even while paused; without it the player waits for the next play.
	seek(s){ this.yt?.seekTo?.(Math.max(0, s), true); this.read(); return this.settle(); }

	rate(r){
		if (r === undefined) return this.yt?.getPlaybackRate?.() ?? 1;
		this.yt?.setPlaybackRate?.(r);
		return this.settle();
	}
	rates(){ return this.yt?.getAvailablePlaybackRates?.() ?? [1]; }

	volume(v){
		if (v === undefined) return Math.round(this.yt?.getVolume?.() ?? 0);
		this.yt?.setVolume?.(v);
		return this.settle();
	}
	mute(on = true){ on ? this.yt?.mute?.() : this.yt?.unMute?.(); return this.settle(); }
	muted(){ return !!this.yt?.isMuted?.(); }

	time(){ return this.yt?.getCurrentTime?.() ?? 0; }
	duration(){ return this.yt?.getDuration?.() ?? 0; }
	loaded(){ return this.yt?.getVideoLoadedFraction?.() ?? 0; }
	state(){ return this.yt?.getPlayerState?.() ?? -1; }
	said(){ return Player.states[this.state()] ?? String(this.state()); }

	// Swapping the video resets the timeline — the cues belong to the old one.
	// `cue` loads without playing, which is the pair the API draws a line between.
	swap(id, cue){
		this.video = id;
		this.crossed = -1;
		this.fire("reset");
		cue ? this.yt?.cueVideoById?.(id) : this.yt?.loadVideoById?.(id);
		return this.settle();
	}
}

Player.all = [];      // every player on the page — also how you reach one from the console
Player.live = 0;      // running polls, document-wide. 0 after you leave a page, or it leaked.
Player.states = { "-1": "unstarted", 0: "ended", 1: "playing", 2: "paused", 3: "buffering", 5: "cued" };

// 92.4 → "1:32". The one formatter, so five pages cannot disagree about it.
export function clock(s){
	s = Math.max(0, Math.floor(s || 0));
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// The five talks, shared with /imagine/feeds/video/ — known-good public embeds.
export const TALKS = {
	jobs:     "UF8uR6Z6KLc",   // Steve Jobs, Stanford 2005 — three stories, so three chapters
	robinson: "iG9CE55wbtY",   // Ken Robinson, Do Schools Kill Creativity?
	cuddy:    "Ks-_Mh1QhMc",   // Amy Cuddy, Your Body Language
	sinek:    "qp0HIF3SfI4",   // Simon Sinek, How Great Leaders Inspire Action
	brown:    "iCvmsMzlF7o",   // Brene Brown, The Power of Vulnerability
};
