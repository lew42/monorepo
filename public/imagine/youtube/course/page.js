import { Page, div, span, a, img, md } from "/app.js";
import { Player, clock, TALKS } from "../youtube.js";

/* Container: /imagine/'s column row. Size: `large` — measured 400 / 429 / 832 / 1152
   with a chapter column open beside it, which is a real video AND room for the notes;
   the chapter columns take the default word (400 / 429 / 640 / 720), because notes are
   prose and prose has a measure. Own layout: the stage, then a segmented bar, then one
   line of state. Regions: one, plus the chapter columns core opens to the right.
   Preview: the default card.

   THE FRAMEWORK IS THE CHAPTER NAV. Each chapter is a real page at a real url with its
   own column of notes, and the two directions are both ordinary framework moves:

     nav -> time   clicking a chapter activates its page; its `activated()` seeks.
     time -> nav   the playhead crosses a boundary; `follow()` routes to that page.

   ⚠ `follow()` asks `player.current()` — the cue engine's INDEX — once per tick, rather
     than navigating from a cue's `fn`. A backward scrub REPLAYS every cue from the
     start (doc/cues.md), which would have fired three `router.go()`s in a row racing
     each other; one derived answer per tick can only ever make one decision.

   ⚠ `index: true` because the bar below already shows every chapter, once. Core's own
     row list would say the same five things a second time. */

const CHAPTERS = [
	{
		name: "opening", short: "Opening", title: "I never graduated from college", at: 0, until: 82,
		note: "The frame for everything after it: **three stories, no more**. Fifteen minutes, told from cards, at Stanford in 2005.",
		links: [["The prepared text", "https://news.stanford.edu/2005/06/12/youve-got-find-love-jobs-says/"]],
	},
	{
		name: "dots", short: "Dots", title: "Connecting the dots", at: 82, until: 360,
		note: "Dropping out, sleeping on floors, and the calligraphy class that had **no practical application whatsoever** — until it did, ten years later.\n\nThe claim: you cannot connect the dots looking forward.",
		links: [["Reed College calligraphy", "https://www.reed.edu/"]],
	},
	{
		name: "loss", short: "Loss", title: "Love and loss", at: 360, until: 585,
		note: "Fired from the company he started. The five years after it — NeXT, Pixar, a marriage — as **the best years of his life**.\n\nThe claim: getting fired was the best thing that could have happened.",
		links: [["Pixar, 1986", "https://www.pixar.com/"]],
	},
	{
		name: "death", short: "Death", title: "Death", at: 585, until: 820,
		note: "The mirror every morning, and a pancreatic cancer diagnosis that turned out to be curable.\n\nThe claim: **death is very likely the single best invention of life.**",
		links: [],
	},
	{
		name: "foolish", short: "Foolish", title: "Stay hungry, stay foolish", at: 820, until: Infinity,
		note: "The Whole Earth Catalog, its final issue, and the back cover of it: a country road, and six words.",
		links: [["The Whole Earth Catalog", "https://wholeearth.info/"]],
	},
];

export default new Page({
	meta: import.meta,
	title: "Course",
	description: "Chapters as real pages: clicking one seeks the video, and the playhead crossing a boundary opens its page.",
	icon: "school",
	width: "large",
	index: true,

	// A real still of the chapter bar on the `/imagine/youtube/` wall, instead of the
	// default icon+description card (2026-09-05 ux-rethink).
	preview(nav){
		return this.preview_card(nav, () => img.c("yt-shot").attr("src", "/imagine/youtube/shots/course.jpg").attr("alt", nav.label));
	},

	content(){
		md("Press play and leave it alone — **the chapter page opens itself** as the talk moves. Or click a chapter and the video jumps to it. Same five urls either way, and the back button walks them.");
		md("On a phone the row only fits one column, so the bar follows the playhead and the automatic nav stands down — the video never scrolls away from you.");

		div.c("yt-lab yt-course", () => {
			this.player = new Player({ video: TALKS.jobs });

			this.bar();
			this.now();

			this.player.cues(CHAPTERS.map(chapter => ({ at: chapter.at, name: chapter.name })));
			this.player.on("ready", () => this.measure());
			this.player.on("time", time => { this.paint(time); this.follow(); });
		});
	},

	deactivated(){ this.player?.rest(); },
	activated(){ if (this.player?.ready) this.player.read(); },

	// ════ the bar — five segments and a playhead ══════════════════════════════
	// The segments are ordinary links, so Router.mark_links() gives the open one
	// `.active` for free: the FILL says where the nav is, the LINE says where time is,
	// and watching them agree is the whole proof.
	bar(){
		div.c("yt-bar", () => {
			this.$segs = CHAPTERS.map(chapter =>
				a.c("yt-bar-seg").href(this.url + chapter.name + "/").attr("title", chapter.title)
					.append(() => span.c("yt-bar-short", chapter.short)));

			this.$head = div.c("yt-bar-head");
		});
	},

	now(){
		div.c("yt-now", () => {
			this.$chapter = span.c("yt-now-chapter", "press play");
			this.$clock = span.c("yt-now-clock", "0:00");
		});
	},

	// The segment widths are the chapters' real durations — unknowable until onReady,
	// because the last one runs to the end of the video.
	measure(){
		const end = this.player.duration();

		this.$segs.forEach(($seg, i) => $seg.style("flexGrow", (Math.min(CHAPTERS[i].until, end) - CHAPTERS[i].at) || 1));
		this.paint(this.player.time());
	},

	paint(time){
		const end = this.player.duration() || 1;
		const chapter = this.player.current();

		this.$head.style("left", (100 * time / end) + "%");
		this.$chapter.text(chapter ? CHAPTERS.find(c => c.name === chapter.name).title : "before the first chapter");
		this.$clock.text(clock(time) + " / " + clock(end));
	},

	// ⚠ Under 32em of ROW the arrangement pages ONE column at a time (core's number —
	//   core/Page/doc/columns.md), so opening a chapter would scroll the video off the
	//   left edge: at 400 the course lost the thing it is about, measured 2026-08-30.
	//   On a phone the bar, the clock and the chapter name still follow time and tapping
	//   a chapter still seeks — only the automatic routing stands down.
	paging(){
		const row = this.column_host()?.$row?.el;
		return !!row && row.clientWidth < 32 * parseFloat(getComputedStyle(row).fontSize);
	},

	// ════ TIME -> NAV ═════════════════════════════════════════════════════════
	follow(){
		// ⚠ Only while this page is on screen. `rest()` pauses on the way out, which
		//   fires one last state change and one last read — without this guard the page
		//   routes the reader straight BACK to a chapter they just navigated away from.
		if (!this.app.router.active?.chain().includes(this)) return;
		if (this.paging()) return;

		const chapter = this.player.current();
		if (!chapter) return;

		const url = this.url + chapter.name + "/";
		if (this.app.router.active?.url !== url) this.app.router.go(url);
	},

	children: Object.fromEntries(CHAPTERS.map(chapter => [chapter.name, {
		title: chapter.title,
		label: clock(chapter.at) + " " + chapter.short,
		at: chapter.at,
		until: chapter.until,

		content(){
			md(chapter.note);

			if (chapter.links.length) div.c("yt-links flex v gap", () => {
				span.c("yt-ctl-label", "resources");
				chapter.links.forEach(([text, href]) => a.c("yt-link", text).href(href).attr("target", "_blank"));
			}).style("--gap", "0.4em");
		},

		// ════ NAV -> TIME ═════════════════════════════════════════════════════
		// ⚠ The guard is what stops the two directions chasing each other: if the
		//   playhead is ALREADY inside this chapter, time is what opened this page and
		//   there is nothing to seek to.
		activated(){
			const player = this.parent.player;
			if (!player) return;

			// Nobody has pressed play yet — hand the mark to the player instead, so the
			// first press starts here rather than at zero. `start` is a playerVar.
			if (!player.ready){
				player.from = this.at;
				return;
			}

			const time = player.time();
			if (time >= this.at && time < this.until) return;

			player.seek(this.at);
		},
	}])),
});
