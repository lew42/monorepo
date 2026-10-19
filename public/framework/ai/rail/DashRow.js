/** DashRow — the one row of the AI dashboard: `{kind, id, title, state, bucket, when, day, who, home, url, line, needs}`.
 *  Plain code, no DOM and no imports, so Server/State.mjs (cards, asks) and the browser (tasks, sessions) share one mapping. Plan: ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-dashboard/plan.md */
export default class DashRow {
	static KINDS = ["task", "card", "session", "ask"];
	static CARD_BUCKETS = ["open", "working", "needs", "done", "archived"];
	static ASK_BUCKETS = ["queued", "working", "waiting", "stalled", "done", "closed"];
	static AI = "/framework/ai/";

	static line(text){ return String(text ?? "").replace(/\s+/g, " ").trim().slice(0, 200); }

	/** A card waits on the owner while it is open and has status `needs-you`, or an owner note of kind `needs-you` (the rule WaitingOnYou pins). */
	static card_waits(c){ return !["done", "archived"].includes(c.status) && (c.status === "needs-you" || c.owner_note?.kind === "needs-you"); }
	static card_bucket(c){
		if (c.status === "done" || c.status === "archived") return c.status;
		if (this.card_waits(c)) return "needs";
		return ["working", "building"].includes(c.status) ? "working" : "open";
	}
	/** An ask waits on the owner when its status is one of these; `parked` is set aside on purpose, so it does not (WaitingOnYou uses this set too). */
	static ASK_WAITING = new Set(["waiting", "needs-you"]);
	static ask_bucket(a){
		const s = a.status;
		if (s === "landed" || s === "done") return "done";
		if (s === "dropped") return "closed";
		if (s === "stalled") return "stalled";
		if (s === "waiting" || s === "parked" || s === "needs-you") return "waiting";
		return s === "routed" || s === "queued" ? "queued" : "working";
	}

	/** `day` turns a time into the owner's local calendar day (State.day on the server). */
	static of_card(c, day){
		const when = c.last ?? c.created ?? null, bucket = this.card_bucket(c);
		return { kind: "card", id: c.id, type: c.type ?? "card", title: c.title || "Untitled card", state: c.status ?? "open", bucket, when, day: when ? day(when) : null,
			created_day: c.created ? day(c.created) : null, who: c.owner_note?.by ?? null, home: null, url: this.AI + c.id + "/",
			line: this.line(c.owner_note?.text ?? c.preview ?? c.state), needs: bucket === "needs" };
	}
	static of_ask(a, day){
		const when = a.status_at ?? a.at ?? null, bucket = this.ask_bucket(a);
		return { kind: "ask", id: "ask:" + a.id, title: a.title || a.id, state: a.status ?? "open", bucket, when, day: when ? day(when) : null,
			created_day: a.at ? day(a.at) : null, who: a.owner ?? null, home: null, url: a.card ? this.AI + a.card + "/" : this.AI + "asks/",
			line: this.line(a.why ?? a.words), needs: this.ASK_WAITING.has(a.status) };
	}

	/** Browser side: a `state.tasks` row, already folded by Task.replay, in the one shape. */
	static of_task(r){
		const when = r.landed_at ?? r.last ?? r.started ?? null;
		return { kind: "task", id: r.id, title: r.title, state: r.state, bucket: r.bucket, when, day: r.day, created_day: r.started ? r.day : null,
			who: r.agent ?? null, home: r.module ?? null, url: r.url, line: r.line ?? "", needs: r.bucket === "waiting" && r.waiting_on === "owner" };
	}
	/** A session that ran two or more tasks; a one-task session is its task. `title` is its newest task's. */
	static of_session(s){
		const when = s.last ?? s.last_landed ?? null;
		return { kind: "session", id: "session:" + s.id, title: s.title || "Session " + String(s.id).slice(0, 8), state: s.landed === s.tasks ? "complete" : "running",
			bucket: s.landed === s.tasks ? "landed" : "open", when, day: s.day ?? null, created_day: null, who: s.id, home: null, url: DashRow.AI + "sessions/" + s.id + "/",
			line: `${s.tasks} tasks, ${s.landed} landed`, needs: false };
	}

	/** Every row of a state.json, one array. */
	static rows(s){
		return [...(s.tasks ?? []).map(r => this.of_task(r)), ...(s.sessions ?? []).filter(x => x.tasks >= 2).map(x => this.of_session(x)), ...(s.cards ?? []), ...(s.asks ?? [])];
	}
}
