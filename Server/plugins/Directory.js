import fs from "fs";
import path from "path";
import watch from "../watch.js";

export default class Directory {

    static setup(server) {
        new Directory(server);
    }

    constructor(server) {
        this.server = server;
		this.server.directory = this;
        this.initialize();
    }

    initialize() {
        /* Only a "rename" changes the SHAPE of the tree — a file or directory
         * created, deleted or renamed. A write into an existing file leaves both
         * directory.json files byte-identical, and rebuilding them costs ~110ms of
         * blocking walk, so those are dropped here. (This also fixes an old gap:
         * a new EMPTY directory used to appear in directory.json only once a file
         * landed in it.) The watcher itself: ../watch.js. */
        watch((file, kind) => { if (kind === "rename") this.update(); });

        this.update();
    }

    /* Trailing debounce. One tool writing one file is three renames — temp file in,
     * temp file out, target replaced — and they arrive inside a few milliseconds;
     * this collapses them into a single rebuild AFTER the burst. `since` is the
     * ceiling: a stream of renames that never pauses still rebuilds every second,
     * instead of starving the timer for ever. */
    update() {
        this.since ??= Date.now();
        clearTimeout(this.rebuilding);

        if (Date.now() - this.since > 1000) return this.rebuild();
        this.rebuilding = setTimeout(() => this.rebuild(), 100);
    }

    rebuild() {
        clearTimeout(this.rebuilding);
        this.rebuilding = this.since = null;

        console.log("Rebuilding Framework Directories");
        fs.writeFileSync("./public/directory.json", JSON.stringify({ files: this.build_dir("./public/") }, null, "\t"));
        fs.writeFileSync("./public/framework/directory.json", JSON.stringify({ files: this.build_dir("./public/framework/") }, null, "\t"));

        /* Both files are `.json`, which watch.js ignores — so nothing else will
         * announce them, and a board that lists files would never hear. The file
         * that CAUSED this rebuild needs no forwarding: LiveReload is on the same
         * watcher and already has it. */
        const live_reload = this.server.socket_server?.live_reload;
        if (live_reload) {
            live_reload.changed("./public/directory.json");
            live_reload.changed("./public/framework/directory.json");
        }
    }

    build_dir(dir) {
        const data = fs.readdirSync(dir, { withFileTypes: true });
        return data.map(file => {
            const entry = {
                name: file.name,
                path: file.parentPath.replace(/\\/g, '/').replace("public/", ''),
                type: file.isFile() ? "file" : "dir"
            };
            entry.full = path.join(entry.path, entry.name).replace(/\\/g, '/');

            if (file.isDirectory() && file.name !== ".git" && file.name !== "node_modules") {
                entry.children = this.build_dir(path.join(dir, file.name));
            } else if (file.isDirectory()) {
                entry.children = [];
            }

            return entry;
        });
    }
}
