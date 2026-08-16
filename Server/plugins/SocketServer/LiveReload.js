import Events from "../../Events.js";
import Tail from "./Tail.js";
import chokidar from "chokidar";
import path from "path";

const PUBLIC = path.resolve("public");

// Every path on the wire is a url-path: forward slashes, no `public/` prefix.
const url_path = file => "/" + path.relative(PUBLIC, path.resolve(file)).replace(/\\/g, "/");

export default class LiveReload extends Events {

    static setup(socket_server) {
        socket_server.live_reload = new LiveReload({ socket_server });
    }

    initialize() {
		console.log("Initializing LiveReload");
        this.muted = new Map();
        this.queue = new Set();
        this.watcher = chokidar.watch("public", {
            ignored: (path, stats) => {
                if (stats && stats.isDirectory()) return false;
                return path.endsWith(".json") || path.includes(".git") ||
                    path.includes("node_modules");
            },
            ignoreInitial: true
        });

        // A file a page 404-probed earlier is in that page's resource entries, so
        // "add" has to reach the client too — that's what makes the probe succeed.

        /* ⚠ Seen once (2026-08-15): a file created in a NEVER-EXISTED directory
         * emitted its "add" and then nothing — no "change" for the next append, no
         * "unlink" for the delete. Reading: the new dir's own watcher lost the race.
         * Unreproduced in 28 later runs; a browser recovers by re-subscribing (a
         * reload). public/framework/dev/Socket/doc/wire.md. */
        for (const event of ["change", "add", "unlink"])
            this.watcher.on(event, this.changed.bind(this));

        // Without this, chokidar failures are swallowed: a watcher that has
        // wedged into a readdir/ENOENT retry loop (burning a core) looks
        // exactly like a healthy idle one, and the log stays empty.
        this.watcher.on("error", err => console.error("LiveReload watcher error:", err));
    }

    /* A socket that writes a file shouldn't be reloaded by its own write — it
     * already has the content. Everyone else still reloads. */
    mute(file, socket) {
        this.muted.set(url_path(file), { socket, at: Date.now() });
    }

    // ⚠ Directory.js calls this with no path — every caller is not a file watcher.
    changed(file) {
        if (file && file.endsWith(".jsonl")) return Tail.changed(file);

        this.queue.add(file ? url_path(file) : null);   // null — unknown, reload everything
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.flush(), 300);
    }

    flush() {
        const paths = [...this.queue];
        this.queue.clear();

        console.log(`Changed: ${paths.join(" ")} → ${this.socket_server.sockets.length} sockets.`);
        for (const socket of this.socket_server.sockets) {
            const send = paths.filter(file => !this.silent(file, socket));
            if (send.length) socket.rpc("changed", send);
        }
    }

    silent(file, socket) {
        const mute = this.muted.get(file);
        return !!mute && mute.socket === socket && Date.now() - mute.at < 5000;
    }
}
