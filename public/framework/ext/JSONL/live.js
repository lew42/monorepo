import Socket from "/framework/dev/Socket/Socket.js";

/* The browser half of the .jsonl wire protocol — dev/Socket/doc/wire.md. A path
   can have several readers (a board card and a task page show the same log), so
   the registry holds a Set of subscriptions per url-path. */
const streams = new Map();

// A dev server predating Tail.js answers a subscribe with nothing at all; a busy page hears it late. The wait is
// stream.WAIT (1.5 s, below stream()), so a test can shorten it.

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
Socket.prototype.jsonl = function(path, lines = [], offset, from, ends){
	each(path, s => {
		// ⚠ A second reader's replay reaches the whole socket: anything already
		// past this offset would apply the same lines twice. The server says where
		// each line ends (Tail.js), so only the lines past this reader's own offset
		// are read; an older server sends no `ends`, and the whole batch is read.
		const at = s.jsonl.offset ?? 0;
		// A late first answer after the fallback fetch (stream()): the fetched copy has no offset, so the server's lines
		// replace it whole, the same way a rewritten file is read (reset, then one read), and from here the reader streams.
		if (s.fetched && lines.length && offset > at){ s.fetched = false; s.jsonl.reset(); }
		if (lines.length && offset > at){
			const fresh = Array.isArray(ends) && ends.length === lines.length && from < at ? lines.filter((_, i) => ends[i] > at) : lines;
			s.jsonl.offset = offset;
			s.jsonl.loaded = true;
			s.jsonl.read(s.jsonl.parse(fresh.join("\n")));
			if (!s.first) s.changed?.(s.jsonl);
		} else if (s.jsonl.skip){
			// ⚠ A reset's recovery is always exactly ONE read() call (core/Item/doc/reset.md) — even an EMPTY
			// one. A rewrite that leaves the file empty (or with nothing past byte 0) answers the resubscribe
			// with zero lines, which skips the branch above, so without this `s.jsonl.skip` (the Store's pending
			// dedupe copy, set by `reset()`) never got spent and stayed armed: the next ORDINARY append whose
			// text happened to match an old line was silently swallowed as if it were the same line again
			// (found in review, 2026-11-02). `read([])` costs nothing when there is nothing to skip past.
			s.jsonl.loaded = true;
			s.jsonl.read([]);
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
		else if (streamed && !s.paused) subscribe(s);
	});
};

/* ⚠ Chained, not replaced: a reconnect drops every subscription server-side,
   and restarting `node server.js` is routine. ⚠ A stream still waiting for its
   first frame already has a subscribe parked on `Socket.ready`, and that parked
   send flushes at this same open() — re-subscribing it replays the file twice. */
const open = Socket.prototype.open;
Socket.prototype.open = function(){
	open.call(this);
	streams.forEach(set => set.forEach(s => { if (!s.first && !s.paused) subscribe(s); }));
};

/* A stream started while a page is the active one (core/Page sets `$page` in activate())
   is PAUSED when the Router deactivates that page ("left") and resumed when it is shown
   again ("entered"). Paused = the server subscription is released once no live reader
   of that path is left; resume re-subscribes from the stored offset, so only the lines
   missed in between arrive. The page needs no call, and a cached page that streamed
   once at load still streams on return. A stream with no page (dev bar, drawer) is
   never paused. */
const live_readers = set => [...set].filter(s => !s.paused).length;

function pause(jsonl){
	const k = key(jsonl.url), set = streams.get(k);
	const s = set && [...set].find(s => s.jsonl === jsonl);
	if (!s || s.paused) return;
	s.paused = true;
	if (!live_readers(set)) Socket.singleton().send({ method: "unsubscribe", args: [k] });
}

function resume(jsonl){
	const k = key(jsonl.url), set = streams.get(k);
	const s = set && [...set].find(s => s.jsonl === jsonl);
	if (!s || !s.paused) return;
	const others = live_readers(set);
	s.paused = false;
	if (!others) subscribe(s);
}

/* `page` is the page the stream belongs to: by default the active one (`$page`). A page.jsonl page OWNS its own log, so its
   reader starts the stream with `owner: null` and hands it to the page it builds (`adopt(jsonl, page)`, Page/Reader.js). It
   used to fall to `$page`, which while the Router is still loading the next page is the page being LEFT: its "left" paused
   the new page's stream, so the page showed its first load and never another line (fixed 2026-11-06). */
const owned = new WeakSet();
export function adopt(jsonl, page = globalThis.$page){
	if (!page?.on || owned.has(jsonl)) return;
	owned.add(jsonl);
	page.on("left", () => pause(jsonl));
	page.on("entered", () => resume(jsonl));
}

/**
 * `JSONL.live()`'s engine — subscribe, replay each streamed batch through the
 * instance's own `read()`, resolve once the server has answered. Off localhost
 * there is no socket and this IS `load()`; fetch stays the static-hosting path.
 */
export function stream(jsonl, changed, { owner } = {}){
	if (Socket.singleton().disabled) return jsonl.load();

	return new Promise(resolve => {
		const s = { jsonl, changed, first: () => resolve(jsonl) };
		if (owner !== null) adopt(jsonl, owner);
		const k = key(jsonl.url);

		// ⚠ No answer in stream.WAIT: show the file by one fetch, but STAY subscribed. A busy page (a 9 s session page, 2026-11-06)
		// hears the answer late; dropping the reader here meant it never streamed again, so every change needed a reload.
		s.timer = setTimeout(() => {
			s.first = null;
			console.warn("JSONL.live(): no answer from the dev server yet; fetching once, still subscribed —", jsonl.url);
			fallback(s).then(resolve);
		}, stream.WAIT);

		if (!streams.has(k)) streams.set(k, new Set());
		streams.get(k).add(s);
		subscribe(s);
	});
}
stream.WAIT = 1500;

/* The timed-out first read: `load()`'s fetch, skipped when the socket answered while it was in flight (its lines are
   already in, and reading the fetch too would apply them twice). `fetched` marks a copy the late answer replaces. */
async function fallback(s){
	const j = s.jsonl, res = await fetch(j.url).catch(() => null);
	const text = res?.ok && !res.headers.get("content-type")?.includes("html") ? await res.text() : null;
	if (text == null || j.offset) return j;
	s.fetched = true;
	j.loaded = true;
	j.read(j.parse(text));
	return j;
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
