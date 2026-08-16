import fs from "fs";
import path from "path";

const PUBLIC = path.resolve("public");
const files = new Map();   // abs file -> { offset }
const subs = new Map();    // abs file -> Set<socket>

/* ⚠ Browser input reaches fs.read here: a subscribed path must resolve under
 * public/ and name a .jsonl. */
function resolve(url){
    const file = path.resolve(PUBLIC, String(url ?? "").replace(/^[\\/]+/, ""));
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
    return {
        lines: buf.subarray(0, end).toString("utf8").split("\n").filter(Boolean),
        offset: from + end
    };
}

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
        if (!sockets?.size || !files.has(abs)) return;   // no offset — a reset already went out

        const chunk = read(abs, files.get(abs).offset);
        if (!chunk){
            files.delete(abs);
            return sockets.forEach(socket => socket.rpc("jsonl_reset", url_path(abs)));
        }

        files.set(abs, { offset: chunk.offset });
        if (chunk.lines.length)
            sockets.forEach(socket => socket.rpc("jsonl", url_path(abs), chunk.lines, chunk.offset));
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
        if (!subs.has(file)) subs.set(file, new Set());
        subs.get(file).add(this.socket);

        /* ⚠ A file that doesn't exist yet is an empty one — the subscription stands
         * and streams when it appears. Answering `jsonl_reset` here ping-pongs with
         * a client that re-subscribes on reset. */
        const chunk = fs.existsSync(file) ? read(file, Number(from) || 0) : { lines: [], offset: 0 };
        if (!chunk) return this.socket.rpc("jsonl_reset", url_path(file));

        files.set(file, { offset: chunk.offset });
        this.socket.rpc("jsonl", url_path(file), chunk.lines, chunk.offset);
    }

    drop(file){
        const sockets = file && subs.get(file);
        if (!sockets) return;

        this.files.delete(file);
        sockets.delete(this.socket);
        if (sockets.size) return;

        subs.delete(file);
        files.delete(file);
    }
}
