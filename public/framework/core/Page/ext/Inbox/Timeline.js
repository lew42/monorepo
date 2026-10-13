import JSONL from "/framework/ext/JSONL/JSONL.js";
import { Inbox } from "./Inbox.js";

/** Timeline — the inbox as one ranked list: every landed task, every owner note, every open needs-you card.
 *  Two streamed indexes in, rows out; each row says which file it came from and its score. Doc: doc/inbox-data.md. */
export default class Timeline {
	static LANDINGS = new URL("./timeline/landings.jsonl", import.meta.url).pathname;
	static CARDS = "/framework/ai/cards.jsonl";
	static AI = "/framework/ai/";
	static OPEN = new Set(["needs-you", "blocked"]);

	constructor(...args){
		Object.assign(this, ...args);
		this.landed ??= new Timeline.Landed({ url: Timeline.LANDINGS });
		this.cards ??= new Timeline.Cards({ url: Timeline.CARDS });
		this.readers = new Set();
	}

	on(fn){ this.readers.add(fn); return () => this.readers.delete(fn); }
	changed(){ this._rows = null; this.readers.forEach(fn => fn(this)); }

	/** Both files, then every appended line, through the dev socket's tail (`live()`); off localhost it is one fetch. */
	start(){ return Promise.all([this.landed.live(() => this.changed()), this.cards.live(() => this.changed())]).then(() => this.changed()); }
	stop(){ this.landed.unsubscribe(); this.cards.unsubscribe(); }

	/** Every row, highest rank first (ties: newest first). `big` keeps landed tasks with a page or a card, and every card row. */
	rows({ big = false, now = Date.now() } = {}){
		const all = this._rows ??= [
			...this.landed.rows.map((r, n) => Timeline.from_landing(r, n)),
			...[...this.cards.by_id.values()].map(Timeline.from_card).filter(Boolean),
		].map(r => Object.assign(r, { score: Math.round(Inbox.rank(r, now) * 10) / 10 }))
			.sort((a, b) => b.score - a.score || Date.parse(b.at) - Date.parse(a.at));
		return big ? all.filter(r => r.big) : all;
	}

	row(row_key){ return this.rows().find(r => r.row_key === row_key) ?? null; }

	/** A landing line → a row. `row_key` is its line number in landings.jsonl: append-only, so it never moves. */
	static from_landing(r, n){
		return { row_key: String(n), kind: "landed", at: r.at, title: r.title, sub: r.sub, big: !!(r.page || r.card),   // the test Landings.big() counts
			page: r.page, dir: r.id.split("#")[0], card: r.card,
			card_url: r.card ? Timeline.AI + r.card + "/" : null, source: "landings.jsonl:" + (n + 1) };
	}

	/** A card index row → a row, only when it is an owner note or still waits on the owner. */
	static from_card(c){
		const note = c.owner_note, open = Timeline.OPEN.has(c.status);
		if (!note && !open) return null;
		if (c.status === "done" || c.status === "archived") return null;
		return { row_key: "card-" + c.id.replaceAll("/", "-"), kind: note ? "owner_note" : "card", owner_kind: note?.kind ?? "needs-you",
			reviewed: c.reviewed ?? null, status: c.status, at: c.last ?? c.created, title: c.title || "Untitled card",
			sub: note?.text ?? c.preview ?? c.state ?? "", big: true, card: c.id, card_url: Timeline.AI + c.id + "/",
			source: "cards.jsonl" };
	}

	/** landings.jsonl: one `{"landed": {…}}` line per landed task, appended by Landings.mjs. */
	static Landed = class Landed extends JSONL {
		static verbs = [...JSONL.verbs, "landed"];
		rows = [];
		landed(v){ this.rows.push(v); }
		reset(){ this.rows = []; return super.reset(); }
	};

	/** cards.jsonl: one card summary per line, no verb (Cards.js rewrites it whole, so live() replays it as a reset). */
	static Cards = class Cards extends JSONL {
		by_id = new Map();
		apply(entry){ if (entry?.id) this.by_id.set(entry.id, entry); return this; }
		reset(){ this.by_id = new Map(); return super.reset(); }
	};
}
