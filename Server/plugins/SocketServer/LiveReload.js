import Events from "../../Events.js";
import Tail from "./Tail.js";
import watch from "../../watch.js";
import fs from "fs";
import path from "path";

const PUBLIC = path.resolve("public");

// Every path on the wire is a url-path: forward slashes, no `public/` prefix.
const url_path = file => "/" + path.relative(PUBLIC, path.resolve(file)).replace(/\\/g, "/");

/* fs.watch reports the PARENT DIRECTORY alongside the file that changed inside it.
 * A directory is never a resource a page loaded, so sending one only pads the
 * batch. A path that no longer exists still goes through — it may be a file that
 * was just deleted, and the client wants to hear about that. */
const is_dir = file => { try { return fs.statSync(file).isDirectory(); } catch { return false; } };

export default class LiveReload extends Events {

    static setup(socket_server) {
        socket_server.live_reload = new LiveReload({ socket_server });
    }

    initialize() {
		console.log("Initializing LiveReload");
        this.muted = new Map();
        this.queue = new Set();

        /* Every event, whatever kind: a file appearing matters as much as one
         * changing — a file a page 404-probed earlier is in that page's resource
         * entries, so its arrival is what makes the probe succeed on reload.
         * The watcher is ../../watch.js, ONE recursive fs.watch handle shared with
         * Directory.js; it used to be a chokidar of its own, and a second chokidar
         * in Directory.js, which is what pinned a core (Server/doc/spin.md). */
        watch(file => { if (!is_dir(file)) this.changed(file); });
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
