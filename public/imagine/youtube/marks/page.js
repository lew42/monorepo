import { Page, div, span, button, input, pre, md, ui } from "/app.js";
import { Player, Cues, clock, seconds, TALKS } from "../youtube.js";

/* Container: /imagine/'s column row. Size: `large`, like its four siblings — a real
   video AND an editor beside it. Own layout: one `flex wrap` seam, video and marks,
   which stacks under ~42em. Regions: one. Preview: the default card.

   THE HAND-TYPED SECONDS, ANSWERED. Every other lab here carries a table of numbers
   somebody watched a video with a stopwatch to write: `course/`'s five chapters,
   `yield/`'s seven beats, `chat/`'s eighteen lines. doc/decisions.md files that under
   "open". This page is the stopwatch — watch, press M at each boundary, name them, and
   copy out the array.

   ⚠ The marks you are making ARE the live timeline. This page owns a `Cues` of its own
     (cues.js) and runs it off the player's clock, so the "now showing" line under the
     video is derived from the very array in the box below it. There is no separate
     preview to disagree with the output, and nothing to press to "apply".

   ⚠ It reads the engine's INDEX (`current()`), never a cue's `fn` — the rule
     doc/cues.md draws for anything idempotent. Editing a time re-sorts the list under a
     running playhead, and one derived answer per tick cannot be confused by that. */

const HERE = TALKS.jobs;   // the talk `course/` is built on, so the output is pasteable there

const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "chapter";

export default new Page({
	meta: import.meta,
	title: "Marks",
	description: "Watch, press M at each boundary, and copy out the cues array the other labs are hand-typed from.",
	icon: "playlist_add",
	width: "large",

	content(){
		this.rows = [];
		this.marks = new Cues();

		md("Press play, then press **M** — or the Mark button — at every boundary you want. Name them as you go. The line under the video is read back from the array in the box, so what you copy is what you just watched working.");

		div.c("yt-lab yt-marks flex wrap gap", () => {
			div.c("yt-side", () => { this.player = new Player({ video: HERE }); });

			div.c("yt-form flex v gap", () => {
				div.c("yt-now", () => {
					this.$chapter = span.c("yt-now-chapter", "press play");
					this.$clock = span.c("yt-now-clock", "0:00");
				});

				div.c("yt-keys flex wrap gap", () => {
					this.key("Mark here", () => this.mark());
					this.key("Clear", () => { this.rows = []; this.draw(); });

					// The same pair the panel's legend is built from, so a key looks
					// like a key on both pages.
					div.c("yt-shortcut flex v-center gap", () => {
						ui.keys("M");
						span.c("yt-shortcut-say", "mark here");
					}).style("--gap", "0.4em");
				}).style("--gap", "0.6em");

				this.$list = div.c("yt-mark-list");
				this.output();
			});
		});

		this.player.on("time", time => this.tick(time));
		this.draw();
	},

	// The poll and the key listener both die with the page — the panel's contract.
	deactivated(){
		this.player?.rest();
		document.removeEventListener("keydown", this.keyed);
	},

	activated(){
		if (this.player?.ready) this.player.read();
		this.keyed ??= e => this.pressed(e);
		document.addEventListener("keydown", this.keyed);
	},

	// ⚠ Not while you are naming a mark: every row holds two text inputs, and an `m`
	//   typed into one of them must stay an `m`.
	pressed(e){
		if (e.key !== "m" && e.key !== "M") return;
		if (e.metaKey || e.ctrlKey || e.altKey) return;
		if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;

		e.preventDefault();
		this.mark();
	},

	mark(){
		this.rows.push({ at: Math.max(0, Math.floor(this.player.time())), title: "" });
		this.draw();
	},

	// ════ the list ════════════════════════════════════════════════════════════
	// Redrawn whole on add, delete and re-sort — never on a keystroke, which would
	// take the caret out from under you mid-word.
	draw(){
		this.rows.sort((a, b) => a.at - b.at);

		this.$list.empty(() => {
			if (!this.rows.length) return span.c("yt-mark-empty", "No marks yet.");
			this.rows.forEach((row, i) => this.line(row, i));
		});

		return this.sync();
	},

	line(row, i){
		div.c("yt-mark", () => {
			input.c("yt-mark-at").attr("type", "text").attr("value", clock(row.at)).attr("aria-label", "time")
				.on("change", e => { row.at = seconds(e.target.value); this.draw(); });

			input.c("yt-mark-title").attr("type", "text").attr("value", row.title).attr("placeholder", "name this chapter")
				.on("input", e => { row.title = e.target.value; this.sync(); });

			button.c("yt-mark-go", "▶").attr("title", "seek here").click(() => this.player.seek(row.at));
			button.c("yt-mark-off", "×").attr("title", "remove").click(() => { this.rows.splice(i, 1); this.draw(); });
		});
	},

	// ════ the output — and the live timeline, from one source ═════════════════
	output(){
		div.c("yt-ctl", () => {
			span.c("yt-ctl-label", "player.cues(...) — copy this");
			this.$out = pre.c("yt-out");
			div.c("yt-keys flex wrap gap", () => this.$copy = this.key("Copy", () => this.copy())).style("--gap", "0.4em");
		});
	},

	sync(){
		this.marks.set(this.rows.map(row => ({ at: row.at, name: slug(row.title), title: row.title })));
		this.$out.text(this.emit());
		return this;
	},

	emit(){
		if (!this.rows.length) return "[]";

		const wide = Math.max(...this.rows.map(row => String(row.at).length));

		return "[\n" + this.rows.map(row =>
			`\t{ at: ${String(row.at).padStart(wide)}, name: "${slug(row.title)}", title: "${row.title || "Untitled"}" },`
		).join("\n") + "\n]";
	},

	// ⚠ The clipboard is permissioned and can simply refuse. Say so on the button
	//   rather than throwing at a reader who can select the text perfectly well.
	copy(){
		const said = ok => { this.$copy.text(ok ? "Copied" : "Select it"); setTimeout(() => this.$copy.text("Copy"), 1400); };

		Promise.resolve(navigator.clipboard?.writeText(this.emit())).then(() => said(true), () => said(false));
	},

	// ════ the proof — the array below IS what is driving this line ════════════
	tick(time){
		this.marks.run(time);

		const at = this.marks.current();

		this.$chapter.text(at ? (at.title || "unnamed mark at " + clock(at.at)) : this.rows.length ? "before the first mark" : "no marks yet");
		this.$clock.text(clock(time) + " / " + clock(this.player.duration()));
	},

	key(text, fn){ return button.c("yt-btn", text).click(fn); },
});
