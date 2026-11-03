import { div } from "../../../core/View/View.js";
import VoiceStage from "./VoiceStage.js";

/** Stage 1 · Heard: the words exactly as Whisper (or the keyboard) gave them, growing while you talk. */
export default class RawStage extends VoiceStage {
	static key = "raw";
	static label = "1 · Heard";
	static fields = ["raw"];
	get live(){ return !this.data.raw_final; }
}

RawStage.View = class RawStageView extends VoiceStage.View {
	body(){
		div.c("voice-raw", this.stage.data.raw);
	}
};
