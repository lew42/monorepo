import AISession from "./AISession.js";

// The detail view's tail (doc/realtime.md). The grid row for a session comes from a snapshot the server rewrites every second or
// so, so it can be a moment stale. A session's own page therefore reads the session's real log, /ai-logs/<id>, folds every line
// through AISession.apply_line (the very code the server runs), and keeps reading only the bytes added since (an HTTP Range request).
// After each batch it corrects the grid row for the same id, through AISession.apply_delta, so the page and the grid agree.
//
// The browser cannot see what Servex configured for a session (an OpenRouter price), so it only corrects the cost of a session the
// log itself prices: provider "claude". For any other it leaves the server's number alone.
export default class AISessionFollow {

	static EVERY_MS = 3000;

	constructor(id, { subagents = true } = {}){
		this.id = id;
		this.session = new AISession(id);
		this.parts = new Map();      // part name -> { url, off }
		this.subagents = subagents;
		this.timer = null;
		this.stopped = false;
	}

	/** Read the whole log once, correct the row, then keep tailing. Returns this. */
	async start(){
		await this.pull();
		if (this.stopped) return this;
		this.timer = setInterval(() => this.pull(), AISessionFollow.EVERY_MS);
		return this;
	}

	stop(){ this.stopped = true; clearInterval(this.timer); }

	async discover(){
		if (!this.parts.has("main")) this.parts.set("main", { url: `/ai-logs/${this.id}`, off: 0 });
		if (!this.subagents || this.found) return;
		this.found = true;
		try {
			const r = await fetch(`/ai-logs/${this.id}/subagents/`);
			if (r.ok) for (const f of await r.json()){ const name = f.file ?? f.name ?? f; if (typeof name === "string") this.parts.set(name.replace(/.jsonl$/, ""), { url: `/ai-logs/${this.id}/subagents/${name}`, off: 0 }); }
		} catch {}
	}

	/** Fetch every part's new bytes (complete lines only) and fold them in. Returns the number of lines applied. */
	async pull(){
		await this.discover();
		let n = 0;
		for (const [part, p] of this.parts){
			let res; try { res = await fetch(p.url, { headers: p.off ? { Range: `bytes=${p.off}-` } : {}, cache: "no-store" }); } catch { continue; }
			if (res.status === 416 || !res.ok) continue;
			const bytes = new Uint8Array(await res.arrayBuffer()), whole = res.status === 200;   // a server that ignores Range sends everything
			const text = new TextDecoder().decode(bytes), cut = text.lastIndexOf("\n") + 1;
			if (!cut) continue;
			if (whole && p.off){ if (bytes.length <= p.off) continue; }   // nothing new, or we already have these bytes
			const fresh = whole && p.off ? new TextDecoder().decode(bytes.slice(p.off)) : text;
			const upto = fresh.lastIndexOf("\n") + 1;
			if (!upto) continue;
			n += this.session.apply_text(fresh.slice(0, upto), part);
			p.off += new TextEncoder().encode(fresh.slice(0, upto)).length;
		}
		if (n) this.correct();
		return n;
	}

	/** Lay what the log says over the grid's row for this id. */
	correct(){
		const pv = this.session.preview();
		if (pv.provider !== "claude") return null;
		const s = this.session.s;
		return AISession.apply_delta({
			id: this.id, usd: Math.round(pv.usd * 1e4) / 1e4, model: pv.model === "unknown" ? null : pv.model, effort: pv.effort ?? null,
			wall_ms: Math.round(pv.wall_ms), flags: pv.flags.length, first_at: s.first_at ?? null, last_activity: s.last_at ?? null,
		});
	}
}
