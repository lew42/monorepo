import { div, span } from "../../../core/View/View.js";
import VoiceStage from "./VoiceStage.js";

/** Stage 5 · Cards: one card per heading, with the Haiku pass's clarity flag and tags once it lands. */
export default class CardsStage extends VoiceStage {
	static key = "cards";
	static label = "5 · Cards";
	static fields = ["cards"];
}

CardsStage.View = class CardsStageView extends VoiceStage.View {
	body(){
		div.c("voice-cards", () => this.stage.data.cards.forEach(c => div.c("voice-card", () => {
			div.c("voice-card-t", () => { span(c.title); if (c.clarity != null && c.clarity < 0.6) span.c("voice-flag", "⚑").attr("title", "Some of this was unclear when spoken"); });
			c.items?.forEach(t => div.c("voice-card-i", "• " + t));
			div.c("voice-card-f muted", () => { span((c.cites ?? []).map(n => "S" + n).join(" ")); (c.tags ?? []).forEach(t => span.c("voice-tag", "#" + t)); });
		})));
	}
};
