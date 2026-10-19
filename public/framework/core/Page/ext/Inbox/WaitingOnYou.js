import JSONL from "/framework/ext/JSONL/JSONL.js";
import Browse from "/framework/ux/Browse/Browse.js";
import Timeline from "./Timeline.js";
import DashRow from "/framework/ai/rail/DashRow.js";

/** WaitingOnYou — every open owner decision, one line each, its card linked; ticked → gone (the card archived, never deleted).
 *  Pinned at the top of the Inbox (AIRail). Reads ai/cards.jsonl and ai/asks.jsonl, both streamed. Doc: doc/next.md. */
export default class WaitingOnYou extends Browse.Pinned {
	static CARDS = "/framework/ai/cards.jsonl";
	static ASKS = "/framework/ai/asks.jsonl";
	static AI = "/framework/ai/";
	static CLOSED = new Set(["done", "archived"]);
	static ASK_WAITING = DashRow.ASK_WAITING;   // one rule with the dashboard chip "Needs you" (DashRow)

	title = "Waiting on you";
	key = "waiting-on-you";

	constructor(...args){
		super(...args);
		this.cards ??= new Timeline.Cards({ url: WaitingOnYou.CARDS });
		this.asks ??= new WaitingOnYou.Asks({ url: WaitingOnYou.ASKS });
	}

	/** Both files, then every appended line, through the dev socket's tail (`live()`). */
	start(){
		const go = () => this.set(this.compute());
		return Promise.all([this.cards.live(go), this.asks.live(go)]).then(go);
	}
	stop(){ this.cards.unsubscribe(); this.asks.unsubscribe(); }

	/** The rows, newest first: open cards that wait on the owner, then asks whose latest status waits on them. */
	compute(){
		const cards = [...this.cards.by_id.values()].filter(WaitingOnYou.waits).map(c => ({
			id: c.id, card: c.id, title: c.title || "Untitled card", at: c.last ?? c.created,
			sub: WaitingOnYou.line(c.owner_note?.text ?? c.preview ?? c.state ?? ""),
			href: WaitingOnYou.AI + c.id + "/",
		}));
		const seen = new Set(cards.map(r => r.id));
		const asks = [...this.asks.by_id.values()].filter(x => WaitingOnYou.ASK_WAITING.has(x.status) && !seen.has(x.card)).map(x => ({
			id: "ask:" + x.id, card: x.card, title: x.title ?? x.id, at: x.at, sub: WaitingOnYou.line(x.why ?? ""),
			href: x.card ? WaitingOnYou.AI + x.card + "/" : WaitingOnYou.AI + "asks/",
		}));
		return [...cards, ...asks].sort((a, b) => (Date.parse(b.at) || 0) - (Date.parse(a.at) || 0));
	}

	/** A card waits on the owner while it is open and has status `needs-you`, or carries an owner note of kind `needs-you`
	 *  (something only the owner can do: a key, a login, money). A `decision` or `risk` note is an FYI: it stays in the
	 *  Timeline feed and does not wait. The words "for you" / "decision" no longer count (2026-10-16: doc/next.md). */
	static waits(c){ return DashRow.card_waits(c); }

	static line(text){ return String(text).replace(/\s+/g, " ").trim().slice(0, 200); }

	/** asks.jsonl: one `{"ask": {…}}` line per change; the latest line for an id wins, field by field. */
	static Asks = class Asks extends JSONL {
		static verbs = [...JSONL.verbs, "ask"];
		by_id = new Map();
		ask(v){ const k = v?.id ?? v?.card ?? v?.title; if (k) this.by_id.set(k, { ...this.by_id.get(k), ...v, id: k }); }
		reset(){ this.by_id = new Map(); return super.reset(); }
	};
}
