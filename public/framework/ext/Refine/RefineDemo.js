import { View, div, span, textarea, button, select, option, details, summary, label } from "../../core/View/View.js";
import ErrorLog from "../ErrorLog/ErrorLog.js";
import VoiceStrip from "../../ux/Dictate/VoiceStrip.js";
import Whisper from "../../audio/Whisper/Whisper.js";
import Prompt from "./Prompt.js";
import RefineSystem from "./RefineSystem.js";
import RefineExplorer from "./RefineExplorer.js";

View.stylesheet(import.meta, "Prompt.css");

/**
 * class RefineDemo — the working demo on the Refine page: speak (or type) ONE prompt and watch it become
 * raw → clean → refined cards with clarity/weight scores.
 *
 * Order of events (the owner, 2026-10-09, `ai/2026-10-09/refine-v3`):
 *   1. every Whisper chunk (or keystroke) → `system.quick()`: the cleaned text appears in about a millisecond;
 *   2. Refine → `system.go()`: ONE server call, each model call its own new session, shown with its model,
 *      time and cost (links to the session page);
 *   3. the Whisper log (`audio/Whisper` `WhisperSession.View`) and the instance explorer (`RefineExplorer`)
 *      update as you dictate.
 * One `Prompt` instance is the single source for all views, so they cannot disagree.
 */
export default class RefineDemo extends View {

	render(){
		this.ac("refine-demo");
		this.system = new RefineSystem({ on_change: () => this.draw() });
		this.prompt = this.system.prompt;
		this.system.whisper.on_change = () => this.draw_whisper();
		ErrorLog.watch(() => ({ status: this.prompt.status, raw: this.prompt.raw, error: this.prompt.error }));

		// ONE workspace (the owner, 2026-10-09): a sticky toolbar on top, the stages side by side, a sticky footer.
		div.c("refine-toolbar", () => {
			// ux/Dictate/VoiceStrip: the one compact dictation panel (mic, steps, grey guess), fixed size.
			this.strip = new VoiceStrip({
				template: "full", refine: true,
				on_whisper: line => this.system.session.record(line),
				on_text: () => this.quick(),
				on_guess: () => this.quick(),
				$input: () => this.$box,   // the View, not its element: Dictate reads `.el` itself
				toolbar: () => {
					this.$go = button("Refine").ac("refine-go").click(() => this.go());
					button("New prompt").click(() => this.next());
					label.c("refine-model", () => {
						span("Model");
						this.$model = select(() => {
							option("Sonnet 5.5 (faster)").attr("value", "claude-sonnet-5-5");
							option("Haiku 5.5 (cheapest)").attr("value", "claude-haiku-5-5");
						});
						this.$model.el.addEventListener("change", () => { this.system.model = this.$model.el.value; });
					});
					this.$cost = span.c("refine-cost");
				},
			});
			this.dictate = this.strip.dictate;
			this.conn = this.strip.conn;
			div.c("refine-said", () => {
				span.c("refine-said-label", "1 · Said: speak, or type or paste here");
				this.$note = span.c("refine-input-note");
			});
			this.$box = textarea.c().attr("placeholder", "Speak with the mic, or type or paste a prompt here…");
			this.$box.el.addEventListener("input", () => this.quick());
		});

		this.$result = div.c("refine-result");
		this.explorer = new RefineExplorer({ subject: this.system });
		div.c("refine-foot", () => { this.$whisper = div.c("refine-whisper"); });

		this.system.whisper.check();
		this.draw();
		this.draw_whisper();
	}

	/** The one transcript the owner sees: whatever Dictate has committed into the box, plus the
	 *  grey still-moving guess if the mic has not settled it yet. */
	transcript(){
		const boxed = this.$box.el.value.trim();
		const guess = (this.dictate?.partial_text || "").trim();
		return guess && !boxed.endsWith(guess) ? (boxed + " " + guess).trim() : boxed;
	}

	/** Instant stage: show the cleaned text now, with no model. */
	quick(){
		const text = this.transcript();
		if (text) this.system.quick(text);
	}

	async go(){
		// Stop the mic FIRST and wait: stop() settles the open segment into the box.
		const live = this.dictate.state === "listening" || this.dictate.state === "connecting";
		this.system.source = live || this.dictate.partial_text ? "dictated" : "typed";   // the raw line of the session log says how the words arrived
		if (live) this.$note.text("Finishing the last words…");
		if (live) await this.dictate.stop();
		const text = this.transcript();
		if (!text) return this.$note.text("Nothing to refine yet.");
		this.$note.text("");
		if (this.prompt.status === "done") this.system.next();   // a new Refine starts a new prompt
		this.system.go(text);
	}

	/** Start over with a fresh prompt and open the mic if it is not already listening. */
	next(){
		this.$box.el.value = "";
		this.$note.text("");
		this.system.next();
		if (this.dictate.state === "idle") this.dictate.start();
	}

	draw(){
		const prompt = this.prompt;
		this.$result.empty(() => new Prompt.View({ subject: prompt, show_raw: false }));
		const st = prompt.status;
		this.conn?.set("refine", st === "done" ? "ok" : st === "error" ? "bad" : st === "working" ? "wait" : "idle",
			st === "done" ? `done, ${(prompt.ms / 1000).toFixed(1)} s` : st === "error" ? "error: " + String(prompt.error).slice(0, 60) : st === "working" ? "working…" : "not yet");
		this.$cost?.text(prompt.runs.length ? "$" + prompt.runs.reduce((n, r) => n + (r.cost_usd || 0), 0).toFixed(3) + " · " + (prompt.ms / 1000).toFixed(1) + " s" : "");
		this.explorer?.draw();
	}

	draw_whisper(){
		this.$whisper.empty(() => new Whisper.View({ subject: this.system.whisper }));
		this.explorer?.draw();
	}
}
