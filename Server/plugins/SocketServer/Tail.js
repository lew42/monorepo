import fs from "fs";
import path from "path";

const PUBLIC = path.resolve("public");
/* abs file -> Map<socket, offset | null>: ONE OFFSET PER SOCKET. A single offset per file, shared by every socket, lost
 * lines: socket A subscribed, a line was appended, socket B subscribed from 0 before the watcher fired and moved the
 * shared offset to the end, so the change event found nothing new and A never got the line (seat e, race.mjs;
 * Tail.test.mjs). `null`: a reset went out to that socket, and it streams again only after it subscribes again. */
const subs = new Map();

/* ⚠ Browser input reaches fs.read here: a subscribed path must resolve under
 * public/ and name a .jsonl.
 *
 * ⚠ A caller may hand this a bare url-path ("/framework/ai/v/3/board.jsonl",
 * what dev/DevBar/says.js sends) OR a full absolute url WITH an origin
 * ("http://localhost:8140/framework/ai/v/3/board.jsonl" — what
 * `import.meta.resolve(".../board.jsonl")` returns, the framework's own
 * ordinary way to build a module-relative url, per `code#4`). The old version
 * here only ever stripped a LEADING SLASH before handing the string to
 * `path.resolve`, so an absolute url's `http:` prefix survived and
 * `path.resolve(PUBLIC, "http://localhost:8140/…")` built a nonexistent path
 * UNDER public/ that still happened to end in ".jsonl" and so still passed
 * the checks below — subscribe() then answered with THAT bogus path, which
 * never matched the reader's own `streams` map key back in ext/JSONL/live.js,
 * so a subscribe on that url got NO live frames, ever. The only thing that
 * ever produced a value was live.js's own 1.5s client-side timeout, which
 * falls back to a ONE-TIME plain fetch() AND — this is what made it read as
 * "needs a reload" — removes the reader from the live registry at that same
 * moment, so it never hears another append until the next full page load
 * creates a brand-new subscribe. Bug found from the owner's report (2026-09-19,
 * "my chat stream doesn't update without reloading"): confirmed nothing to do
 * with `window.$BLOCKRELOAD` (a live probe of the WORKING pattern — a bare
 * pathname, exactly what says.js already sends — delivered every appended
 * line instantly with Block on, zero reloads); `/framework/ai/v/3/page.js`'s
 * own `import.meta.resolve("./board.jsonl")` was the one call site using the
 * broken form. `new URL(url, "http://x/")` reads either shape the same way —
 * an absolute input keeps its own origin and this base is never used; a bare
 * path resolves against the placeholder base — so `.pathname` is always just
 * the path, and every existing caller (bare paths and `import.meta.resolve()`
 * alike) now resolves correctly with no caller-side change. */
function resolve(url){
    let pathname;
    try { pathname = new URL(String(url ?? ""), "http://x/").pathname; }
    catch { pathname = String(url ?? ""); }

    const file = path.resolve(PUBLIC, pathname.replace(/^[\\/]+/, ""));
    return file.startsWith(PUBLIC + path.sep) && file.endsWith(".jsonl") ? file : null;
}

const url_path = file => "/" + path.relative(PUBLIC, file).replace(/\\/g, "/");

/* ⚠ An offset always lands just past a `\n`, so a half-written trailing line is
 * left unread and every offset a client echoes back is resumable. */
function read(file, from){
    let size;
    try { size = fs.statSync(file).size; } catch { return null; }
    if (size < from) return null;

    const buf = Buffer.alloc(size - from);
    if (buf.length){
        const fd = fs.openSync(file, "r");
        try { fs.readSync(fd, buf, 0, buf.length, from); } finally { fs.closeSync(fd); }
    }

    const end = buf.lastIndexOf(10) + 1;
    const lines = [], ends = [];
    for (let at = 0; at < end;){
        const nl = buf.indexOf(10, at);
        if (nl > at){ lines.push(buf.subarray(at, nl).toString("utf8")); ends.push(from + nl + 1); }
        at = nl + 1;
    }
    return { lines, ends, offset: from + end };
}

/* The frame: the lines, the offset after them, where they began, and where each one ends (a byte offset). A reader that
 * is already past `from` (a second reader in the same tab asked for the file from 0) applies only the lines that end
 * past its own offset (ext/JSONL/live.js); before, it applied the whole batch again. */
const send = (socket, file, chunk, from) => socket.rpc("jsonl", url_path(file), chunk.lines, chunk.offset, from, chunk.ends);

/* Streams appended `.jsonl` lines to the sockets that asked for them, so a log
 * grows in the browser without a reload. Dev server only; see
 * public/framework/dev/Socket/doc/wire.md. */
export default class Tail {

    static setup(socket){ new Tail(socket); }

    /* ⚠ chokidar double-fires `change` on Windows; the second read starts where
     * the first one stopped, so it finds nothing — never debounce this path. */
    static changed(file){
        const abs = path.resolve(file);
        const sockets = subs.get(abs);
        if (!sockets?.size) return;

        const chunks = new Map();   // offset -> chunk: sockets at the same offset share one read
        for (const [socket, from] of sockets){
            if (from === null) continue;   // a reset already went out to this socket
            if (!chunks.has(from)) chunks.set(from, read(abs, from));
            const chunk = chunks.get(from);
            if (!chunk){ sockets.set(socket, null); socket.rpc("jsonl_reset", url_path(abs)); continue; }
            sockets.set(socket, chunk.offset);
            if (chunk.lines.length) send(socket, abs, chunk, from);
        }
    }

    constructor(socket){
        this.socket = socket;
        this.files = new Set();
        socket.on("rpc:subscribe", (args = []) => this.subscribe(...args));
        socket.on("rpc:unsubscribe", (args = []) => this.drop(resolve(args[0])));
        socket.on("closed", () => [...this.files].forEach(file => this.drop(file)));
    }

    subscribe(url, from = 0){
        const file = resolve(url);
        if (!file) return console.warn("Tail: refusing subscribe", url);

        this.files.add(file);
        if (!subs.has(file)) subs.set(file, new Map());
        const sockets = subs.get(file);

        /* ⚠ A file that doesn't exist yet is an empty one — the subscription stands
         * and streams when it appears. Answering `jsonl_reset` here ping-pongs with
         * a client that re-subscribes on reset. */
        const start = Number(from) || 0;
        const chunk = fs.existsSync(file) ? read(file, start) : { lines: [], ends: [], offset: 0 };
        if (!chunk){ sockets.set(this.socket, null); return this.socket.rpc("jsonl_reset", url_path(file)); }

        sockets.set(this.socket, chunk.offset);
        send(this.socket, file, chunk, start);
    }

    drop(file){
        const sockets = file && subs.get(file);
        if (!sockets) return;

        this.files.delete(file);
        sockets.delete(this.socket);
        if (!sockets.size) subs.delete(file);
    }
}
