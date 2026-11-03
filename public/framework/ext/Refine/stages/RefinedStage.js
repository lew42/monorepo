import { div, button } from "../../../core/View/View.js";
import VoiceStage from "./VoiceStage.js";

/** Stage 4 · Refined: the prompt as one tidy brief a session can read, composed by code from the structure (no extra model call). */
export default class RefinedStage extends VoiceStage {
	static key = "refined";
	static label = "4 · Refined prompt";
	static fields = ["refined"];
}

RefinedStage.View = class RefinedStageView extends VoiceStage.View {
	body(){
		const text = this.stage.data.refined;
		div.c("voice-refined", text);
		button("Copy").ac("voice-copy").click(() => navigator.clipboard?.writeText(text));
	}
};
