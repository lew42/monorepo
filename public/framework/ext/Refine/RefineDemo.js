import { View, div, span, p, textarea, button, h4, a } from "../../core/View/View.js";
import Dictate from "../../ux/Dictate/Dictate.js";
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

		div.c("refine-demo-main", () => {
			div.c("refine-input", () => {
				this.$box = textarea.c().attr("placeholder", "Speak with the mic, or type or paste a prompt here…");
				div.c("refine-input-row", () => {
					this.dictate = new Dictate({ $input: () => this.$box.el, on_error: e => this.$note.text(String(e)) });
					this.$go = button("Refine").click(() => this.go());
					button("Record next prompt").click(() => this.next());
					this.$note = span.c("refine-input-note");
				});
			});
			this.$result = div.c("refine-result");
		});

		div.c("refine-demo-debug", () => {
			this.card();
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
