// A store adapter for the framework's JSONL streaming system (core/Item/Store.js), over ONE WebSocket to the document's
// Room Durable Object (worker/room.js). `DocItem.open("doc:<id>")` loads the document's history, replays it onto the item, and from
// then on every `item.set(...)` is one JSONL line sent over the socket; lines other people write arrive as live reads.
//
// Only the holder of the editing lock may write. The lock is requested with request_lock() and kept alive by a heartbeat.
// Subscribe to what the page needs to draw with store.on_state(fn): connection, lock, round trip, last remote edit.
import Item from "./Item.js";

const BEAT = 4000;

export class DocStore extends Item.Store {
	static coalesce = { idle: 60, max: 400 };   // typing is held this long so a burst of keys is one line (Store's own typing fold)

	get writable(){ return true; }
	get via_tool(){ return false; }
	async use_snapshot(){ return null; }   // no snapshot files: the Durable Object hands over the history
	async moved(){ return this; }          // the url is "doc:<id>", not a file to look for

	assign(...args){
		super.assign(...args);
		Object.assign(this, { seq: 0, state_fns: [], connected: false, lock: null, me: null, rtt: null, rtts: [], remote_ms: null, sent_lines: 0, unsent: [] });
		return this;
	}

	get id(){ return this.url.slice(4); }
	get can_edit(){ return !!this.lock && this.lock.holder === this.me && this.lock.expires > Date.now(); }
	on_state(fn){ this.state_fns.push(fn); return () => this.state_fns.splice(this.state_fns.indexOf(fn), 1); }
	changed(){ this.state_fns.forEach(fn => fn(this)); }

	// First open resolves when the history has arrived. The socket then stays open and reconnects by itself.
	open(){
		if (this.opening) return this.opening;
		return this.opening = new Promise((ok, no) => { this.first = { ok, no }; this.connect(); });
	}

	connect(){
		const url = (location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/api/doc/" + this.id + "/ws";
		const ws = this.ws = new WebSocket(url);
		ws.onopen = () => { this.connected = true; ws.send(JSON.stringify({ t: "hello", since: this.seq })); this.changed(); this.ping(); };
		ws.onmessage = e => this.message(JSON.parse(e.data));
		ws.onclose = () => {
			this.connected = false; clearInterval(this.beater); clearTimeout(this.reconnect_timer); this.changed();
			if (this.closed) return;
			if (this.first) { this.first.no(new Error("could not open the document")); this.first = null; this.opening = null; return; }
			this.reconnect_timer = setTimeout(() => this.connect(), 1000);
		};
	}

	message(m){
		if (m.t === "hello"){
			this.lock = m.lock;
			if (m.lines.length) this.seq = m.lines.at(-1).seq;
			const lines = m.lines.map(r => r.line);
			if (this.host) this.read(lines); else this.entries.push(...lines);
			if (this.first){ this.first.ok(this); this.first = null; }
			this.flush_unsent();
		}
		else if (m.t === "lines"){
			this.remote_ms = Date.now() - m.sent;   // meaningful when both ends share a clock (two tabs on one machine); across devices it carries the clock difference
			this.last_by = m.by;
			this.seq = m.from + m.lines.length - 1;
			this.read(m.lines);
		}
		else if (m.t === "ack") this.seq = Math.max(this.seq, m.seq);
		else if (m.t === "lock"){ this.lock = m.lock; this.keep_beating(); }
		else if (m.t === "refused"){ this.lock = m.lock; this.keep_beating(); console.warn("DocStore: write refused: " + m.why); }
		else if (m.t === "pong"){ this.rtt = Date.now() - m.sent; this.rtts.push(this.rtt); if (this.rtts.length > 20) this.rtts.shift(); }
		this.changed();
	}

	ping(){ if (this.ws?.readyState === 1) this.ws.send(JSON.stringify({ t: "ping", sent: Date.now() })); }
	send(m){ if (this.ws?.readyState === 1){ this.ws.send(JSON.stringify(m)); return true; } return false; }

	request_lock(){ this.send({ t: "lock" }); }
	release_lock(){ this.flush_typing_now(); this.send({ t: "unlock" }); }
	flush_typing_now(){ this.end_typing(true); }

	// Leaving the document: send what is typed, give up the lock, close the socket and forget this store so the next open starts clean.
	async close(){
		if (this.closed) return;
		this.closed = true;
		this.end_typing(true);
		await new Promise(done => setTimeout(done, 0));   // let Store.flush hand the last line to deliver()
		this.flush_unsent();
		this.send({ t: "unlock" });
		clearInterval(this.beater); clearTimeout(this.reconnect_timer);
		this.ws?.close();
		Item.Store.instances?.delete(this.url);
	}

	// Keep the heartbeat running exactly while we hold the lock.
	keep_beating(){
		clearInterval(this.beater);
		if (this.can_edit) this.beater = setInterval(() => this.send({ t: "beat" }), BEAT);
		else if (this.unsent.length){ console.warn(`DocStore: lost the editing lock, ${this.unsent.length} line(s) were not saved`); this.unsent = []; }
	}

	// Store.flush hands the lines here (via_tool is false). They go out over the socket in one frame.
	async deliver(path, lines){
		this.sent = [];   // the server never echoes a writer's own lines, so nothing to skip when they come back
		this.unsent.push(...lines);
		return this.flush_unsent();
	}
	flush_unsent(){
		if (!this.unsent.length || !this.can_edit) return false;
		const ok = this.send({ t: "lines", lines: this.unsent, sent: Date.now() });
		if (ok){ this.sent_lines += this.unsent.length; this.unsent = []; }
		return ok;
	}
}

export class DocItem extends Item {}
DocItem.Store = DocStore;
