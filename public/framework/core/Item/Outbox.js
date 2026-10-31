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

   This file imports no UI, so a plain node process can be a tab (core/Item/transport.test.mjs). */
export class Outbox extends Events(Object) {

	waiting = [];   // batches not acked yet, oldest first: { n, path, lines, ws, done }
	counter = 0;

	// The one outbox of this page. FsFile.send and Item.Store both use it.
	static shared(){ return this._shared ??= new this(); }

	constructor(...args){ super(); Object.assign(this, ...args); }

	// How many lines are waiting for the server's ack (on a path, or all).
	pending(path){ return this.waiting.filter(batch => !path || batch.path === path).reduce((sum, batch) => sum + batch.lines.length, 0); }

	// Queue a batch and send it when the socket is up. Answers true once the server has the lines, false when it refused them
	// or there is no socket at all (a static host).
	send(path, lines){
		return new Promise(done => {
			this.waiting.push({ n: ++this.counter, path, lines, ws: null, done });
			this.emit("change", this);
			this.drain();
		});
	}

	// The socket, the first time: remember to drain again whenever it (re)opens. null where there is none.
	async socket(){
		if (this._socket) return this._socket;
		const { default: Socket } = await import("../../dev/Socket/Socket.js");
		const socket = Socket.singleton();
		this.client ??= socket.tab() + "." + Math.random().toString(36).slice(2, 6);
		socket.on("open", () => this.drain());
		return this._socket = socket;
	}

	// Send every batch that is not already on the wire of the current connection, oldest first. A closed socket sends nothing:
	// the batches stay in `waiting` and its "open" event calls this again.
	async drain(){
		const socket = await this.socket();
		if (socket.disabled) return this.give_up();
		for (const batch of this.waiting.slice()){
			if (!socket.connected || socket.ws?.readyState !== WebSocket.OPEN) return;
			if (batch.ws === socket.ws) continue;
			batch.ws = socket.ws;
			const frame = { method: "append", args: [batch.path, batch.lines, { client: this.client, n: batch.n }] };
			socket.request(frame).then(reply => reply && this.acked(batch, reply));
		}
	}

	acked(batch, reply){
		const i = this.waiting.indexOf(batch);
		if (i === -1) return;   // a second ack for a batch sent twice
		const ok = reply.response === "append successful" || reply.response === "append empty";
		this.waiting.splice(i, 1);
		if (!ok) console.warn(`Outbox: the server refused ${batch.lines.length} line(s) for ${batch.path} (${reply.response}).`);
		this.emit("change", this);
		batch.done(ok);
	}

	// No socket will ever come (a static host, or a refused peer): there is nowhere to send to, so say so once and let go.
	give_up(){
		if (!Outbox.warned){ Outbox.warned = true; console.warn("Outbox: no dev socket, so nothing is being written."); }
		for (const batch of this.waiting.splice(0)) batch.done(false);
		this.emit("change", this);
	}
}

export default Outbox;
