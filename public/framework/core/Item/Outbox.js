import { Events } from "../Events/Events.js";

/* The OUTBOX: every line a tab appends to a .jsonl file leaves through here, over the dev server's socket, and stays here
   until the server says it has written it. It is the wire half of `FsFile.append` and of `Item.Store.flush` (doc/transport.md).

   Each send is one numbered batch: `{method: "append", args: [path, lines, {client, n}]}`.
     client   this page load's id (the tab id plus a few random letters, so a reload never reuses a number)
     n        1, 2, 3 ... this client's own counter, one per batch
   The server (Server/plugins/SocketServer/Append.js) writes the batch once and answers
     {index, response: "append successful", client, n, offset}     offset = the file's size after the batch
   and a batch it has already written answers the same thing again, writing nothing (`dup: true`). That is the whole trick:
   a batch can be sent as often as needed, so every send after a doubt (the socket dropped, an ack never came) is safe.

   - Down socket: the batch waits in `waiting` (see `pending`), and goes out when the socket opens again.
   - Unacked batch: sent again on every reconnect, in order, until acked.
   - Refused batch (the server read it and said no): dropped with a warning; sending it again would be refused again.
   - Failed batch (the server could not write it for now, e.g. a file another program holds open: "append failed"): kept, and sent
     again after `Outbox.retry_after` ms with the same client and n. The server does not remember a failed write, so the retry is safe.

   Two more things keep a batch from being lost:
   - Reload: every unacked batch is also kept in `localStorage` (`outbox:<client>:<path>` -> [{n, lines}]), and dropped when acked. The
     next load of the same tab (same `sessionStorage` tab id) finds the keys that start with its tab id, queues those batches with
     their OLD client and n, and sends them: if the server had already written one, it answers `dup`. Storage can be missing or full:
     every read and write is in a try/catch, and without it the outbox simply stays in memory.
   - Heartbeat: while batches wait on a connected socket, a ping goes out every `heartbeat.every` ms and must be answered within
     `heartbeat.wait` ms (worst case about 20 s). No answer: the socket is dead without the browser knowing, so it is restarted,
     and the new connection's "open" sends the batches again.

   This file imports no UI, so a plain node process can be a tab (core/Item/transport.test.mjs). */
export class Outbox extends Events(Object) {

	waiting = [];   // batches not acked yet, oldest first: { client, n, path, lines, ws, done }
	counter = 0;
	static heartbeat = { every: 10000, wait: 10000 };   // ms between pings while something waits, and how long a pong may take
	static retry_after = 3000;   // ms before a batch the disk could not take ("append failed") is sent again

	// The one outbox of this page. FsFile.send and Item.Store both use it.
	static shared(){
		if (this._shared) return this._shared;
		this._shared = new this();
		if (this._shared.stored()) this._shared.drain();   // lines left by a page that was reloaded: bring them back and send
		return this._shared;
	}

	// Is there an outbox left in storage? (a cheap look; no socket needed)
	stored(){
		try { for (let i = 0; i < localStorage.length; i++) if (localStorage.key(i).startsWith("outbox:")) return true; } catch {}
		return false;
	}

	// Write this batch's file-and-client group to storage (or remove the key when nothing of it waits any more).
	save(batch){
		try {
			const key = `outbox:${batch.client}:${batch.path}`;
			const group = this.waiting.filter(b => b.client === batch.client && b.path === batch.path);
			if (group.length) localStorage.setItem(key, JSON.stringify(group.map(b => ({ n: b.n, lines: b.lines }))));
			else localStorage.removeItem(key);
		} catch {}
	}

	// Take back what an earlier load of THIS tab left in storage (tab id = the part of the client id before the dot).
	restore(){
		try {
			const mine = `outbox:${this.tab_id}.`;
			const keys = [];
			for (let i = 0; i < localStorage.length; i++) if (localStorage.key(i).startsWith(mine)) keys.push(localStorage.key(i));
			const old = [];
			for (const key of keys){
				const [, client, ...rest] = key.split(":");
				const path = rest.join(":");
				for (const { n, lines } of JSON.parse(localStorage.getItem(key))) old.push({ client, n, path, lines, ws: null, done: () => {}, saved: true });
			}
			this.waiting.unshift(...old.sort((a, b) => a.n - b.n));
		} catch {}
	}

	constructor(...args){ super(); Object.assign(this, ...args); }

	// How many lines are waiting for the server's ack (on a path, or all).
	pending(path){ return this.waiting.filter(batch => !path || batch.path === path).reduce((sum, batch) => sum + batch.lines.length, 0); }

	// Queue a batch and send it when the socket is up. Answers true once the server has the lines, false when it refused them
	// or there is no socket at all (a static host).
	send(path, lines){
		return new Promise(done => {
			this.waiting.push({ client: null, n: ++this.counter, path, lines, ws: null, done });
			this.emit("change", this);
			this.drain();
		});
	}

	// The socket, the first time: remember to drain again whenever it (re)opens. null where there is none.
	async socket(){
		if (this._socket) return this._socket;
		const { default: Socket } = await import("../../dev/Socket/Socket.js");
		const socket = Socket.singleton();
		this.tab_id = socket.tab();
		this.client ??= this.tab_id + "." + Math.random().toString(36).slice(2, 6);
		this.restore();
		socket.on("open", () => this.drain());
		return this._socket = socket;
	}

	// Send every batch that is not already on the wire of the current connection, oldest first. A closed socket sends nothing:
	// the batches stay in `waiting` and its "open" event calls this again.
	async drain(){
		const socket = await this.socket();
		if (socket.disabled) return this.give_up();
		for (const batch of this.waiting){
			batch.client ??= this.client;
			if (!batch.saved){ batch.saved = true; this.save(batch); }
		}
		for (const batch of this.waiting.slice()){
			if (!socket.connected || socket.ws?.readyState !== WebSocket.OPEN) return;
			if (batch.ws === socket.ws) continue;
			batch.ws = socket.ws;
			const frame = { method: "append", args: [batch.path, batch.lines, { client: batch.client, n: batch.n }] };
			socket.request(frame).then(reply => reply && this.acked(batch, reply));
		}
		this.beat();
	}

	// The heartbeat (see the top): one timer, alive only while something waits.
	beat(){
		if (this.timer || !this.waiting.length) return;
		this.timer = setTimeout(() => { this.timer = null; this.ping(); }, Outbox.heartbeat.every);
	}

	async ping(){
		const socket = this._socket;
		if (!this.waiting.length) return;
		if (socket.connected && socket.ws?.readyState === WebSocket.OPEN){
			const ws = socket.ws;
			const silence = Symbol();
			const reply = await Promise.race([socket.request({ method: "ping", args: [] }), new Promise(r => setTimeout(r, Outbox.heartbeat.wait, silence))]);
			if (reply === silence && socket.ws === ws && this.waiting.length){
				console.warn("Outbox: the server stopped answering; opening a new connection.");
				socket.restart();
			}
		}
		this.beat();
	}

	acked(batch, reply){
		const i = this.waiting.indexOf(batch);
		if (i === -1) return;   // a second ack for a batch sent twice
		// "append failed" (the disk said no for now) or no answer text at all: not a verdict on the lines. Keep the batch and try again.
		if (reply.response === "append failed" || !reply.response){
			batch.ws = null;
			console.warn(`Outbox: the server could not write ${batch.lines.length} line(s) for ${batch.path} (${reply.response ?? "no answer"}); trying again in ${Outbox.retry_after / 1000} s.`);
			clearTimeout(this.retrying);
			this.retrying = setTimeout(() => this.drain(), Outbox.retry_after);
			return;
		}
		const ok = reply.response === "append successful" || reply.response === "append empty";
		this.waiting.splice(i, 1);
		this.save(batch);
		if (!ok) console.warn(`Outbox: the server refused ${batch.lines.length} line(s) for ${batch.path} (${reply.response}).`);
		this.emit("change", this);
		batch.done(ok);
	}

	// No socket will ever come (a static host, or a refused peer): there is nowhere to send to, so say so once and let go.
	give_up(){
		if (!Outbox.warned){ Outbox.warned = true; console.warn("Outbox: no dev socket, so nothing is being written."); }
		for (const batch of this.waiting.splice(0)){ this.save(batch); batch.done(false); }
		this.emit("change", this);
	}
}

// Loading this file is the page load: if a reloaded tab left lines behind, bring them back and send them now (a no-op otherwise).
try { if (typeof localStorage !== "undefined") Outbox.shared(); } catch {}

export default Outbox;
