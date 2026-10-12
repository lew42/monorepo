import { div, span } from "../../../core/View/View.js";
import VoiceStage from "./VoiceStage.js";

/** Stage 2 · Clean: numbered sentences, near-verbatim. A mechanical draft shows at once; the model's final replaces it. */
export default class CleanStage extends VoiceStage {
	static key = "clean";
	static label = "2 · Clean";
	static fields = ["clean"];
	get live(){ return !this.data.clean_final; }
}

CleanStage.View = class CleanStageView extends VoiceStage.View {
	body(){
		this.stage.data.clean.forEach((text, i) => div.c("voice-sentence", () => { span.c("voice-s-num muted", "S" + (i + 1)); span(text); }));
	}
};
