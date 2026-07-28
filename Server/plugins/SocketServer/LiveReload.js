import Events from "../../Events.js";
import chokidar from "chokidar";

export default class LiveReload extends Events {

    static setup(socket_server) {
        socket_server.live_reload = new LiveReload({ socket_server });
    }

    initialize() {
		console.log("Initializing LiveReload");
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

    changed(path) {
        console.log(`File changed: ${path}. Sending reload to ${this.socket_server.sockets.length} sockets.`);
        for (const socket of this.socket_server.sockets) {
            socket.rpc("reload");
        }
    }
}
