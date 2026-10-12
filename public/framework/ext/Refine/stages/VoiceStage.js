import { View, div, span } from "../../../core/View/View.js";

View.stylesheet(import.meta, "VoiceStage.css");

/**
 * class VoiceStage — ONE step of a spoken prompt as it passes through the pipeline, and how it looks.
 * A subclass names its `key`, its `label`, and the `fields` of the voice-prompt item (VoicePrompt.js) it shows;
 * its `View` draws them. The five: RawStage → CleanStage → StructureStage → RefinedStage → CardsStage.
 *
 *   new CleanStage(voice_prompt).ready      // true once any of its fields has a value
 *   new CleanStage.View({ stage })           // redraws itself with `view.draw()` when its fields change
 *
 * Class map and the wire format: ../doc/voice-to-page.md
 */
export default class VoiceStage {

	static key = "";
	static label = "";
	static hint = "";
	static fields = [];

	constructor(prompt){ this.prompt = prompt; }

	get data(){ return this.prompt.data; }
	get ready(){ return this.constructor.fields.some(f => { const v = this.data[f]; return Array.isArray(v) ? v.length > 0 : !!v; }); }
	/** True while later words may still replace this stage's content. */
	get live(){ return false; }
	/** Milliseconds this stage took (from the server's timing), or null. */
	get ms(){ return this.data.ms?.[this.constructor.key] ?? null; }
}

VoiceStage.View = class VoiceStageView extends View {

	render(){
		const S = this.stage.constructor;
		this.ac("voice-stage").attr("data-stage", S.key);
		div.c("voice-stage-h", () => {
			span.c("voice-stage-label", S.label);
			this.$tag = span.c("voice-stage-tag muted");
		});
		this.$body = div.c("voice-stage-body");
		this.draw();
	}

	draw(){
		const stage = this.stage;
		this.el.hidden = !stage.ready;
		this.$tag.text(stage.live ? "live" : stage.ms != null ? (stage.ms / 1000).toFixed(1) + " s" : "");
		this.$body.empty(() => this.body());
	}

	/** Subclasses draw their fields here (inside the body box). */
	body(){}
};
