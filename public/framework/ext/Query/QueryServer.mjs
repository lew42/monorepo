import Query from "./Query.js";

/* The node half of ext/Query: a registry of named SOURCES (each holds items in memory) and a socket plugin that answers
 * rpc:query for them and keeps each browser's shown page current. Doc: doc/architecture.md, core/Page/doc/server.md.
 *   QueryServer.source("sessions", { load, items, on, unload, unload_after, available })
 *     load()          async; run on the first query, never again while loaded
 *     items()         an iterable of plain objects (each with an `id`)
 *     on(fn)          subscribe to changes: fn(item, changed, before); returns the unsubscribe
 *     unload()        drop what load() built (optional); runs after `unload_after` ms (default 5 min) with no query and no watcher
 *     available()     false = answer { error: "no source" } (optional) */
export default class QueryServer {

	static sources = new Map();
	static STALE_MS = 1000;
	static counter = 0;

	static source(name, def) {
		const src = new QueryServer.Source(name, def);
		QueryServer.sources.set(name, src);
		return src;
	}

	static setup(socket) { new QueryServer(socket); }

	constructor(socket) {
		this.socket = socket;
		this.last = null;       // { qid, src, query, ids:Set } - the one query this browser is showing
		this.src = null; this.off = null;
		this.stale_at = 0; this.stale_timer = null;
		socket.on("rpc:query", (args, index) => this.answer(args?.[0] ?? {}, index));
		socket.on("closed", () => this.close());
	}

	async answer(spec, index) {
		const t0 = performance.now(), src = QueryServer.sources.get(spec.source);
		if (!src || src.available?.() === false) return this.socket.send({ response: { error: "no source", source: spec.source }, index });
		try {
			await src.ensure();
			const query = new Query(spec), res = query.run(src.items());
			const same = this.last?.qid === spec.qid && this.last?.src === src;
			const qid = spec.qid ?? ++QueryServer.counter;
			const ids = same ? this.last.ids : new Set();
			res.rows.forEach(r => ids.add(r.id));
			this.last = { qid, src, query, ids };
			this.watch(src);
			this.socket.send({ response: { ...res, qid, ms: +(performance.now() - t0).toFixed(1) }, index });
		} catch (e) {
			this.socket.send({ response: { error: e.message }, index });
		}
	}

	/** One change listener per browser, on the source it last asked. */
	watch(src) {
		if (this.src === src) return;
		this.close();
		this.src = src;
		this.off = src.subscribe(item => this.changed(item));
	}

	changed(item) {
		const last = this.last;
		if (!last) return;
		if (last.ids.has(item.id)) return this.socket.rpc("query_row", last.qid, item);
		if (last.query.matches(item)) this.stale(last.qid);
	}

	/** query_stale at most once a second; the browser re-asks for its page. */
	stale(qid) {
		const wait = QueryServer.STALE_MS - (Date.now() - this.stale_at);
		const send = () => { this.stale_timer = null; this.stale_at = Date.now(); this.socket.rpc("query_stale", this.last?.qid ?? qid); };
		if (wait <= 0) return send();
		this.stale_timer ??= setTimeout(send, wait);
	}

	close() {
		this.off?.(); this.off = null; this.src = null;
		clearTimeout(this.stale_timer); this.stale_timer = null;
	}
}

/* One named source: loads on demand, unloads when idle. */
QueryServer.Source = class Source {

	constructor(name, { load, items, on, unload, unload_after = 5 * 60000, available }) {
		Object.assign(this, { name, load, items, on, unload, unload_after, available });
		this.loaded = null; this.watchers = 0; this.timer = null;
	}

	ensure() {
		this.loaded ??= Promise.resolve(this.load?.());
		this.idle();
		return this.loaded;
	}

	/** (Re)start the idle clock; at the end, unload if nobody is watching. */
	idle() {
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			if (this.watchers > 0) return this.idle();
			this.loaded = null;
			this.unload?.();
		}, this.unload_after);
		this.timer.unref?.();
	}

	subscribe(fn) {
		this.watchers++;
		const off = this.on?.(fn);
		let done = false;
		return () => { if (done) return; done = true; this.watchers--; off?.(); };
	}
};
