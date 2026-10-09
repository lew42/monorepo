import { View, div, span, p, textarea, button, h4, a } from "../../core/View/View.js";
import ErrorLog from "../ErrorLog/ErrorLog.js";
import VoiceStrip from "../../ux/Dictate/VoiceStrip.js";
import WhisperLog from "../../ux/Dictate/WhisperLog.js";
import DefaultView from "../../ux/Content/Object/DefaultView.js";
import Prompt from "./Prompt.js";
import RefineSystem from "./RefineSystem.js";

View.stylesheet(import.meta, "Prompt.css");

/**
 * class RefineDemo — the working demo on the Refine page: speak (or type) ONE prompt, press
 * Refine, and watch it become raw → clean → refined cards with clarity/weight scores and a
 * yellow flag on anything unclear. "Record next prompt" starts over.
 *
 * Beside the result is the debug view: the live `Prompt` instance drawn property by property
 * (`ux/Content/Object/DefaultView`, the generic tree) and the architecture card (`RefineSystem.parts`).
 * One `Prompt` instance is the single source for all three, so they cannot disagree.
 *
 * The mic is `ux/Dictate` (the same one every page uses; on a phone it needs the https/LAN
 * setup in `dev/mobile`). With no mic engine, the text box does the same job.
 */
export default class RefineDemo extends View {

	render(){
		this.ac("refine-demo");
		this.system = new RefineSystem({ on_change: () => this.draw() });
		this.prompt = this.system.prompt;
		ErrorLog.watch(() => ({ status: this.prompt.status, raw: this.prompt.raw, error: this.prompt.error }));

		div.c("refine-demo-main", () => {
			div.c("refine-input", () => {
				// ux/Dictate/VoiceStrip: the one compact dictation panel (mic, steps, grey guess), fixed size.
				this.strip = new VoiceStrip({
					template: "full", refine: true,
					on_whisper: line => WhisperLog.record(line),
					$input: () => this.$box,   // the View, not its element: Dictate reads `.el` itself
					toolbar: () => {
						this.$go = button("Refine").click(() => this.go());
						button("Record next prompt").click(() => this.next());
					},
				});
				this.dictate = this.strip.dictate;
				this.conn = this.strip.conn;
				this.$note = span.c("refine-input-note");
				this.$box = textarea.c().attr("placeholder", "Speak with the mic, or type or paste a prompt here…");
			});
			this.$result = div.c("refine-result");
		});

		div.c("refine-demo-debug", () => {
			this.card();
			new WhisperLog();
			h4.c("refine-prompt-h", "The live Prompt instance (debug view)");
			this.$debug = div.c("refine-debug");
		});

		this.draw();
	}

	/** The one transcript the owner sees: whatever Dictate has committed into the box, plus the
	 *  grey still-moving guess if the mic has not settled it yet. Reading the box alone missed
	 *  text that was on screen only as that guess (2026-10-09). */
	transcript(){
		const boxed = this.$box.el.value.trim();
		const guess = (this.dictate.partial_text || "").trim();
		return guess && !boxed.endsWith(guess) ? (boxed + " " + guess).trim() : boxed;
	}

	async go(){
		// Stop the mic FIRST and wait: stop() settles the open segment into the box. Reading the
		// box before that (the old order) saw it empty while the transcript was plainly on screen.
		const live = this.dictate.state === "listening" || this.dictate.state === "connecting";
		if (live) this.$note.text("Finishing the last words…");
		if (live) await this.dictate.stop();
		const text = this.transcript();
		if (!text) return this.$note.text("Nothing to refine yet.");
		this.$note.text("");
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
		this.$result.empty(() => new Prompt.View({ subject: prompt }));
		const st = prompt.status;
		this.conn?.set("refine", st === "done" ? "ok" : st === "error" ? "bad" : st === "working" ? "wait" : "idle",
			st === "done" ? `done, ${(prompt.ms / 1000).toFixed(1)} s` : st === "error" ? "error: " + String(prompt.error).slice(0, 60) : st === "working" ? "working…" : "not yet");
		this.$debug.empty(() => new DefaultView({ subject: prompt }));
	}

	/** The class card: icon + name, core API, who calls it. */
	card(){
		div.c("refine-class-card", () => {
			span.c("refine-card-title", "▤ RefineSystem — the boss; the parts it composes");
			RefineSystem.parts.forEach(part => div.c("refine-part", () => {
				a(part.name).href(part.href).ac("refine-class-key");
				span.c("refine-part-job", part.job);
				span.c("refine-s-scores", part.relation);
			}));
		});
	}
}
