import JSONL from "/framework/ext/JSONL/JSONL.js";
import FsFile from "/framework/ext/filesystem/FsFile.js";
import Day from "/framework/core/Session/Day.js";

/** Approvals — which of one day's sessions the owner approved. Approving writes two lines through FsFile.append (the one file API):
 *  `{"approve":{"at","by":"owner"}}` in the session's own record (`<day>/<folder>/session.jsonl`, the fact), and one pointer line in
 *  that day's log (`<day>/day.jsonl`, `{"log":{…,"approve":{"session","record","by"}}}`), which is what this class streams: one file
 *  per day instead of probing every session's record (most have none, and each miss is a 404). Doc: readme.md, "Review". */
export default class Approvals extends JSONL {
	static ROOT = new URL("../sessions/", import.meta.url).pathname;
	static day_url(day){ return `${Approvals.ROOT}${Day.path(day)}/day.jsonl`; }
	/** The session's own record. `dir` is the folder the store found its snapshot under; `day` may be written with dashes. */
	static record(s){ return `${Approvals.ROOT}${(s.day ?? s.dir ?? "").replaceAll("-", "/")}/${s.folder ?? s.id}/session.jsonl`; }

	got = new Map();   // session id -> { at, by } of its approval
	listeners = new Set();

	static of_day(day){ return new Approvals({ url: Approvals.day_url(day), day }).live(); }

	on(fn){ this.listeners.add(fn); return () => this.listeners.delete(fn); }
	of(id){ return this.got.get(id) ?? null; }

	read(entries){
		for (const e of entries){ const a = e?.log?.approve; if (a?.session) this.got.set(a.session, { at: e.log.at, by: a.by ?? "owner" }); }
		this.listeners.forEach(fn => fn(this));
		return this;
	}
	reset(){ this.got = new Map(); return super.reset(); }
	live(){ super.live(() => {}); return this; }

	/** Approve sessions (snapshots): shown at once, then written; put back if a write is refused. Returns true when every line was written. */
	async approve(snaps){
		const at = new Date().toISOString(), was = new Map(snaps.map(s => [s.id, this.got.get(s.id)]));
		snaps.forEach(s => this.got.set(s.id, { at, by: "owner" }));
		this.listeners.forEach(fn => fn(this));
		const own = await Promise.all(snaps.map(s => FsFile.append(Approvals.record(s), { approve: { at, by: "owner" } }).catch(() => false)));
		const kept = snaps.filter((s, i) => own[i]);
		const day = kept.length ? await FsFile.append(this.url, kept.map(s => ({ log: { at, task: s.id, msg: "approved by the owner: " + (s.title ?? s.agent ?? s.id), approve: { session: s.id, record: Approvals.record(s), by: "owner" } } }))).catch(() => false) : true;
		snaps.forEach((s, i) => { if (!own[i] || !day) was.get(s.id) ? this.got.set(s.id, was.get(s.id)) : this.got.delete(s.id); });
		if (own.includes(false) || !day) this.listeners.forEach(fn => fn(this));
		return !own.includes(false) && !!day;
	}
}
