/**
 * class CardAsk — turns ONE card of a refined prompt into a board card and an `asks.jsonl` line
 * (Dictate/doc/asks.md, prompt-to-board-cards). The owner's words stay on the board card; the ask line only points at them.
 *
 *   const r = await new CardAsk({ cards: servex.cards, asks: servex.asks }).make({ session, prompt, index, title, items, cites });
 *   // -> { ok, id, card, card_url, fresh }   (a second call for the same card answers fresh: false and adds nothing)
 *
 * Status `queued`: nobody owes a turn yet (`Servex/asks/stalled.js`), so Servex never marks it stalled; the owner or a
 * mastermind picks it up from the board card (its Approve / Improve buttons).
 */
export default class CardAsk {

	constructor({ cards, asks } = {}){
		if (!cards || !asks) throw new Error("CardAsk needs servex.cards and servex.asks");
		this.cards = cards; this.asks = asks;
	}

	/** Same card, same id: a second press finds the first. */
	static id({ session, prompt, index }){ return `voice-${String(session).slice(0, 8)}-${prompt}-c${index}`; }

	async make({ session, prompt, index, title, items = [], cites = [] } = {}){
		if (!/^[0-9a-f-]{36}$/.test(session ?? "") || !/^[\w-]{4,60}$/.test(prompt ?? "") || !Number.isInteger(index) || index < 0) return { ok: false, why: "needs session (uuid), prompt (id) and the card's index" };
		title = String(title ?? "").trim().slice(0, 120);
		if (!title) return { ok: false, why: "the card has no title" };
		const id = CardAsk.id({ session, prompt, index });
		const known = (await this.asks.read())[id];
		if (known) return { ok: true, id, fresh: false, card: known.card ?? null, card_url: known.card ? this.cards.url(known.card) : null };
		const source = `/framework/ai/sessions/${session}/`;
		const made = await this.cards.create({ parent: "today", title, type: "request", by: "refine", tags: ["ask", "voice"] });
		if (!made.ok) return made;
		const text = [`From a spoken prompt (${source}, prompt ${prompt}, card ${index + 1}, sentences ${cites.map(n => "S" + n).join(" ") || "none cited"}):`, ...items.slice(0, 20).map(t => "- " + String(t).slice(0, 300))].join("\n");
		await this.cards.append(made.id, { chat: { level: "summary", text, at: new Date().toISOString(), from: { kind: "system", id: "refine" } } });
		await this.asks.add({ id, title, words: source, card: made.id, owner: null, status: "queued", by: "refine" });
		return { ok: true, id, fresh: true, card: made.id, card_url: made.url };
	}
}
