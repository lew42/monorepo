import Events from "../../Events.js";
import chokidar from "chokidar";
import path from "path";

export default class LiveReload extends Events {

    static setup(socket_server) {
        socket_server.live_reload = new LiveReload({ socket_server });
    }

    initialize() {
		console.log("Initializing LiveReload");
        this.muted = new Map();
        this.watcher = chokidar.watch("public", {
            ignored: (path, stats) => {
                if (stats && stats.isDirectory()) return false;
                return path.endsWith(".json") || path.includes(".git") ||
                    path.includes("node_modules");
            },
            ignoreInitial: true
        });

        this.watcher.on("change", this.changed.bind(this));

        // Without this, chokidar failures are swallowed: a watcher that has
        // wedged into a readdir/ENOENT retry loop (burning a core) looks
        // exactly like a healthy idle one, and the log stays empty.
        this.watcher.on("error", err => console.error("LiveReload watcher error:", err));
    }

    /* A socket that writes a file shouldn't be reloaded by its own write — it
     * already has the content. Everyone else still reloads. */
    mute(file, socket) {
        this.muted.set(path.resolve(file), { socket, at: Date.now() });
    }

    // ⚠ Directory.js calls this with no path — every caller is not a file watcher.
    changed(file) {
        const mute = file && this.muted.get(path.resolve(file));
        const skip = mute && Date.now() - mute.at < 5000 ? mute.socket : null;

        console.log(`File changed: ${file}. Sending reload to ${this.socket_server.sockets.length - (skip ? 1 : 0)} sockets.`);
        for (const socket of this.socket_server.sockets) {
            if (socket !== skip) socket.rpc("reload");
        }
    }
}
