import { div, span } from "../../../core/View/View.js";
import VoiceStage from "./VoiceStage.js";

/** Stage 5 · Cards: one card per heading, with the Haiku pass's clarity flag and tags once it lands. */
export default class CardsStage extends VoiceStage {
	static key = "cards";
	static label = "5 · Cards";
	static fields = ["cards"];

	/** How much of what you said this card covers (0-1): the share of the prompt's sentences it cites. Computed, never guessed. */
	weight(card){ const n = this.data.clean?.length || 0; return n ? Math.min(1, (card.cites?.length ?? 0) / n) : null; }
}

CardsStage.View = class CardsStageView extends VoiceStage.View {
	/** Two thin bars: how much of the prompt this card is (importance) and how clear it was (confidence, once the Haiku pass lands). */
	meters(card){
		const w = this.stage.weight(card), bar = (label, v) => v == null ? null : div.c("voice-meter", () => { span.c("muted", label); div.c("voice-bar", $b => $b.el.style.setProperty("--v", Math.round(v * 100) + "%")).attr("title", Math.round(v * 100) + "%"); });
		bar("importance", w); bar("confidence", card.clarity);
	}

	body(){
		div.c("voice-cards", () => this.stage.data.cards.forEach(c => div.c("voice-card", () => {
			div.c("voice-card-t", () => { span(c.title); if (c.clarity != null && c.clarity < 0.6) span.c("voice-flag", "⚑").attr("title", "Some of this was unclear when spoken"); });
			c.items?.forEach(t => div.c("voice-card-i", "• " + t));
			this.meters(c);
			div.c("voice-card-f muted", () => { span((c.cites ?? []).map(n => "S" + n).join(" ")); (c.tags ?? []).forEach(t => span.c("voice-tag", "#" + t)); });
		})));
	}
};
