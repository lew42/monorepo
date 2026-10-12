import { a, button, div, span } from "../../../core/View/View.js";
import VoiceStage from "./VoiceStage.js";

/** Stage 5 · Cards: one card per heading, with the Haiku pass's clarity flag and tags once it lands. */
export default class CardsStage extends VoiceStage {
	static key = "cards";
	static label = "5 · Cards";
	static fields = ["cards"];

	/** How much of what you said this card covers (0-1): the share of the prompt's sentences it cites. Computed, never guessed. */
	/** Cards already sent to the board, by index: { url } once it landed, { error } if it did not. */
	sent = {};

	/** Make this card a board card and an ask in asks.jsonl (Servex/ext/refine/CardAsk.js). Pressing it twice finds the same card. */
	async send(card, index){
		const session = this.prompt.session;
		if (!session) return { error: "this page does not know its session" };
		try {
			const { servex_url } = await import("/framework/dev/servex_url.js");
			const res = await (await fetch(servex_url("/api/voice/card"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session, prompt: this.prompt.id.replace(/^voice-/, ""), index, title: card.title, items: card.items ?? [], cites: card.cites ?? [] }) })).json();
			return res.ok ? { url: res.card_url } : { error: res.why ?? "Servex said no" };
		} catch (e){ return { error: "Servex is not reachable" }; }
	}

	weight(card){ const n = this.data.clean?.length || 0; return n ? Math.min(1, (card.cites?.length ?? 0) / n) : null; }
}

CardsStage.View = class CardsStageView extends VoiceStage.View {
	/** Two thin bars: how much of the prompt this card is (importance) and how clear it was (confidence, once the Haiku pass lands). */
	meters(card){
		const w = this.stage.weight(card), bar = (label, v) => v == null ? null : div.c("voice-meter", () => { span.c("muted", label); div.c("voice-bar", $b => $b.el.style.setProperty("--v", Math.round(v * 100) + "%")).attr("title", Math.round(v * 100) + "%"); });
		bar("importance", w); bar("confidence", card.clarity);
	}

	/** The "To board" button, or the link to the board card once it exists. */
	board(card, i){
		const done = this.stage.sent[i];
		if (done?.url) return a.c("voice-board", "On the board").attr("href", done.url);
		const btn = button.c("voice-board", done?.error ? "Retry: " + done.error : "To board").attr("title", "Make this a card on the AI board and an ask in the ledger");
		btn.click(async () => { btn.el.disabled = true; this.stage.sent[i] = await this.stage.send(card, i); this.draw(); });
	}

	body(){
		div.c("voice-cards", () => this.stage.data.cards.forEach((c, i) => div.c("voice-card", () => {
			div.c("voice-card-t", () => { span(c.title); if (c.clarity != null && c.clarity < 0.6) span.c("voice-flag", "⚑").attr("title", "Some of this was unclear when spoken"); });
			c.items?.forEach(t => div.c("voice-card-i", "• " + t));
			this.meters(c);
			div.c("voice-card-f muted", () => { span((c.cites ?? []).map(n => "S" + n).join(" ")); (c.tags ?? []).forEach(t => span.c("voice-tag", "#" + t)); this.board(c, i); });
		})));
	}
};
