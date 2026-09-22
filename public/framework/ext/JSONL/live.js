import Socket from "/framework/dev/Socket/Socket.js";

/* The browser half of the .jsonl wire protocol — dev/Socket/doc/wire.md. A path
   can have several readers (a board card and a task page show the same log), so
   the registry holds a Set of subscriptions per url-path. */
const streams = new Map();

// A dev server predating Tail.js answers a subscribe with nothing at all.
const WAIT = 1500;

const each = (path, fn) => streams.get(path)?.forEach(fn);

/* ⚠ THE `streams` MAP MUST BE KEYED BY THE SAME SHAPE THE SERVER ECHOES BACK.
 * `Server/plugins/SocketServer/Tail.js` always replies with a bare url-path
 * (its own `url_path()` — no origin, ever), but a caller here may have built
 * `jsonl.url` with `import.meta.resolve("./board.jsonl")` — the framework's
 * ordinary way to address a module-relative file (`code#4`) — which returns
 * a FULL url WITH an origin. Keyed by that raw string, `each()` above would
 * never find a match for the reply, so `jsonl()`/`jsonl_reset()` below would
 * silently do nothing for that reader, forever: the only thing that ever
 * showed a value was `stream()`'s own 1.5s timeout falling back to a ONE-TIME
 * fetch() — which then reads as "needs a reload" (found from the owner's
 * report, 2026-09-19: `/framework/ai/v/3/page.js`'s board, built exactly this
 * way, confirmed nothing to do with `window.$BLOCKRELOAD` — a bare-pathname
 * subscription, `dev/DevBar/says.js`'s own style, streamed every appended
 * line live with Block on). `key()` reads either shape the same way, so
 * every existing caller now matches what comes back over the wire with no
 * caller-side change. */
const key = url => new URL(url, location.href).pathname;
const subscribe = s => Socket.singleton().send({ method: "subscribe", args: [key(s.jsonl.url), s.jsonl.offset ?? 0] });
const settle = s => { clearTimeout(s.timer); s.first?.(); s.first = null; };

/* ⚠ Both called BY the dev server, through Socket.message()'s method lookup — a
   grep for callers in public/ finds none. Same live path as Socket.reload(). */
Socket.prototype.jsonl = function(path, lines = [], offset){
	each(path, s => {
		// ⚠ A second reader's replay reaches the whole socket: anything already
		// past this offset would apply the same lines twice.
		if (lines.length && offset > (s.jsonl.offset ?? 0)){
			s.jsonl.offset = offset;
			s.jsonl.loaded = true;
			s.jsonl.read(s.jsonl.parse(lines.join("\n")));
			if (!s.first) s.changed?.(s.jsonl);
		}
		if (s.first) settle(s);
	});
};

/* The file shrank, was rewritten, or was never there. ⚠ Re-subscribe only when
   something HAD streamed — a missing file answers every subscribe with another
   reset, and from 0 that is a loop. */
Socket.prototype.jsonl_reset = function(path){
	each(path, s => {
		const streamed = s.jsonl.offset;
		s.jsonl.reset();
		s.jsonl.offset = 0;
		if (s.first) settle(s);
		else if (streamed) subscribe(s);
	});
};

/* ⚠ Chained, not replaced: a reconnect drops every subscription server-side,
   and restarting `node server.js` is routine. ⚠ A stream still waiting for its
   first frame already has a subscribe parked on `Socket.ready`, and that parked
   send flushes at this same open() — re-subscribing it replays the file twice. */
const open = Socket.prototype.open;
Socket.prototype.open = function(){
	open.call(this);
	streams.forEach(set => set.forEach(s => { if (!s.first) subscribe(s); }));
};

/**
 * `JSONL.live()`'s engine — subscribe, replay each streamed batch through the
 * instance's own `read()`, resolve once the server has answered. Off localhost
 * there is no socket and this IS `load()`; fetch stays the static-hosting path.
 */
export function stream(jsonl, changed){
	if (Socket.singleton().disabled) return jsonl.load();

	return new Promise(resolve => {
		const s = { jsonl, changed, first: () => resolve(jsonl) };
		const k = key(jsonl.url);

		s.timer = setTimeout(() => {
			streams.get(k)?.delete(s);
			s.first = null;
			console.warn("JSONL.live(): no answer from the dev server, fetching —", jsonl.url);
			jsonl.load().then(resolve);
		}, WAIT);

		if (!streams.has(k)) streams.set(k, new Set());
		streams.get(k).add(s);
		subscribe(s);
	});
}

/**
 * `JSONL.unsubscribe()`'s engine — stop reading a file that is never going to
 * answer. The `unsubscribe` frame goes only when the LAST reader of that path
 * leaves: a board card and an open task page stream the same log.
 */
export function drop(jsonl){
	const k = key(jsonl.url);
	const set = streams.get(k);
	if (!set) return;

	for (const s of set) if (s.jsonl === jsonl){ settle(s); set.delete(s); }
	if (set.size) return;

	streams.delete(k);
	Socket.singleton().send({ method: "unsubscribe", args: [k] });
}

export default stream;
