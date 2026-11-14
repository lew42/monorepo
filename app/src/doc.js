// One Durable Object per document: its JSONL history (one line per row in its own SQLite), the single-editor lock, and
// the live sockets (WebSocket Hibernation API: the object sleeps between messages while the sockets stay open).
//
// Wire (JSON text frames):
//   client -> {t:"hello", since}        server -> {t:"hello", seq, lines:[{seq,line}], lock}
//   client -> {t:"lock"} {t:"beat"} {t:"unlock"}      server -> {t:"lock", lock}   (to everyone, when it changes)
//   client -> {t:"lines", lines:[obj], sent}          server -> {t:"ack", seq, sent}  and to the others {t:"lines", from, lines, sent, by}
//   client -> {t:"ping", sent}          server -> {t:"pong", sent}
import { DurableObject } from "cloudflare:workers";
import { migrate, meta_get, meta_set } from "./dostorage.js";
import { acquire, beat, release, can_write, live } from "./lock.js";

const STEPS = [
	sql => sql.exec("CREATE TABLE lines (seq INTEGER PRIMARY KEY AUTOINCREMENT, line TEXT NOT NULL, at INTEGER NOT NULL, author INTEGER)"),
];
const SNAPSHOT_AFTER = 20_000;   // ms after the first unsaved change

export class DocDO extends DurableObject {
	constructor(ctx, env){
		super(ctx, env);
		this.sql = ctx.storage.sql;
		ctx.blockConcurrencyWhile(async () => { migrate(this.sql, STEPS); });
	}

	get lock(){ const raw = meta_get(this.sql, "lock"); return raw ? JSON.parse(raw) : null; }
	set lock(value){ meta_set(this.sql, "lock", value ? JSON.stringify(value) : ""); }
	get seq(){ return this.sql.exec("SELECT COALESCE(MAX(seq), 0) AS n FROM lines").one().n; }

	async fetch(request){
		if (request.headers.get("upgrade") !== "websocket") return new Response("expected a WebSocket", { status: 426 });
		const who = { id: Number(request.headers.get("x-user-id")), name: request.headers.get("x-user-name") || "someone" };
		meta_set(this.sql, "doc_id", request.headers.get("x-doc-id") || "");
		const pair = new WebSocketPair();
		this.ctx.acceptWebSocket(pair[1]);
		pair[1].serializeAttachment(who);
		return new Response(null, { status: 101, webSocket: pair[0] });
	}

	send(ws, message){ try { ws.send(JSON.stringify(message)); } catch {} }
	broadcast(message, except){ for (const ws of this.ctx.getWebSockets()) if (ws !== except) this.send(ws, message); }

	async webSocketMessage(ws, raw){
		let m;
		try { m = JSON.parse(raw); } catch { return; }
		const who = ws.deserializeAttachment(), now = Date.now();

		if (m.t === "hello"){
			const rows = this.sql.exec("SELECT seq, line FROM lines WHERE seq > ? ORDER BY seq", Number(m.since) || 0).toArray();
			return this.send(ws, { t: "hello", seq: this.seq, lines: rows.map(r => ({ seq: r.seq, line: JSON.parse(r.line) })), lock: live(this.lock, now), now });
		}
		if (m.t === "ping") return this.send(ws, { t: "pong", sent: m.sent });

		if (m.t === "lock"){
			const next = acquire(this.lock, who, now);
			if (next){ this.lock = next; this.broadcast({ t: "lock", lock: next }); this.schedule(); }
			else this.send(ws, { t: "lock", lock: live(this.lock, now) });
			return;
		}
		if (m.t === "beat"){
			const next = beat(this.lock, who, now);
			if (next){ this.lock = next; this.schedule(); }
			else this.send(ws, { t: "lock", lock: live(this.lock, now) });   // you lost it: here is who has it
			return;
		}
		if (m.t === "unlock"){
			const held = this.lock;
			if (live(held, now)?.holder === who.id){ this.lock = release(held, who); this.broadcast({ t: "lock", lock: null }); }
			return;
		}
		if (m.t === "lines"){
			if (!can_write(this.lock, who, now)) return this.send(ws, { t: "refused", why: "you do not hold the editing lock", lock: live(this.lock, now) });
			const lines = (Array.isArray(m.lines) ? m.lines : []).slice(0, 200);
			let first = 0, last = 0;
			for (const line of lines){
				const row = this.sql.exec("INSERT INTO lines (line, at, author) VALUES (?, ?, ?) RETURNING seq", JSON.stringify(line), now, who.id).one();
				first ||= row.seq; last = row.seq;
			}
			if (!last) return;
			this.lock = beat(this.lock, who, now) ?? this.lock;   // writing counts as a heartbeat
			if (!meta_get(this.sql, "dirty_since")) meta_set(this.sql, "dirty_since", now);
			this.send(ws, { t: "ack", seq: last, sent: m.sent });
			this.broadcast({ t: "lines", from: first, lines, sent: m.sent, by: who.name }, ws);
			this.schedule();
		}
	}

	async webSocketClose(ws, code){ ws.close(code, "bye"); this.drop(ws); }
	async webSocketError(ws){ this.drop(ws); }
	drop(ws){
		const who = ws.deserializeAttachment(), held = this.lock;
		const others = this.ctx.getWebSockets().filter(w => w !== ws && w.deserializeAttachment()?.id === who?.id);
		if (!others.length && held?.holder === who?.id){ this.lock = null; this.broadcast({ t: "lock", lock: null }, ws); }   // the editor left
	}

	// The next moment something needs doing: the lock running out, or the saved copy being due.
	async schedule(){
		const times = [], held = live(this.lock, Date.now()), dirty = Number(meta_get(this.sql, "dirty_since")) || 0;
		if (held) times.push(held.expires + 50);
		if (dirty) times.push(dirty + SNAPSHOT_AFTER);
		if (times.length) await this.ctx.storage.setAlarm(Math.min(...times));
	}

	async alarm(){
		const now = Date.now(), held = this.lock;
		if (held && held.expires <= now){ this.lock = null; this.broadcast({ t: "lock", lock: null }); }
		const dirty = Number(meta_get(this.sql, "dirty_since")) || 0;
		if (dirty && dirty + SNAPSHOT_AFTER <= now) await this.snapshot();
		await this.schedule();
	}

	// The whole history as one JSONL file in R2 (the durable copy and the thing to read without waking the object).
	async snapshot(){
		if (!this.env.SNAPSHOTS) return meta_set(this.sql, "dirty_since", "");   // no bucket bound: nothing to save, and no alarm loop
		const rows = this.sql.exec("SELECT line FROM lines ORDER BY seq").toArray();
		const name = meta_get(this.sql, "doc_id") || this.ctx.id.toString();
		await this.env.SNAPSHOTS.put(`docs/${name}.jsonl`, rows.map(r => r.line).join("\n") + "\n", { customMetadata: { seq: String(this.seq), at: String(Date.now()) } });
		meta_set(this.sql, "dirty_since", "");
		meta_set(this.sql, "snapshot_at", Date.now());
	}
}
