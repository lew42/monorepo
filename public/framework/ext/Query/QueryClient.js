import Socket from "/framework/dev/Socket/Socket.js";

/* The browser half of ext/Query: asks the dev server (QueryServer.mjs) one query over the socket and hands back the page of rows.
 *   const q = new QueryClient("sessions", { row: item => …, stale: () => … });
 *   const res = await q.ask({ where, sort, offset, limit, sum });   // { rows, total, totals, offset, qid, ms } or { error }
 * The server then pushes `query_row` (a shown row changed) and `query_stale` (the page may have new matches) for the last qid. Doc: doc/architecture.md. */
export default class QueryClient {

	static current = null;
	static counter = 0;

	/** The dev socket, or null off localhost (a static host): the caller falls back to reading files. */
	static socket() {
		if (typeof location === "undefined" || !/^(localhost|127\.0\.0\.1|.*\.localhost)$/.test(location.hostname)) return null;
		try { return Socket.singleton(); } catch { return null; }
	}

	constructor(source, { row, stale } = {}) {
		this.source = source; this.on_row = row; this.on_stale = stale;
		this.qid = 0;
		QueryClient.current = this;
	}

	/** `more`: the next page of the same query (same qid); otherwise a fresh query. */
	async ask(spec, { more = false } = {}) {
		const socket = QueryClient.socket();
		if (!socket) return { error: "no socket" };
		if (!more) this.qid = ++QueryClient.counter + Date.now() % 1e6 * 1e3;
		await Promise.race([socket.ready, new Promise(r => setTimeout(r, 1500))]);
		const answer = await Promise.race([socket.request({ method: "query", args: [{ ...spec, source: this.source, qid: this.qid }] }), new Promise(r => setTimeout(() => r({ response: { error: "timeout" } }), 5000))]);
		return answer?.response ?? { error: "no answer" };
	}
}

Socket.prototype.query_row = function (qid, item) { const q = QueryClient.current; if (q?.qid === qid) q.on_row?.(item); };
Socket.prototype.query_stale = function (qid) { const q = QueryClient.current; if (q?.qid === qid) q.on_stale?.(); };
