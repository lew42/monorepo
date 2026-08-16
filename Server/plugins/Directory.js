import fs from "fs";
import path from "path";
import chokidar from "chokidar";

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
        this.watcher = chokidar.watch("public", {
            ignored: (path, stats) => {
                if (stats && stats.isDirectory()) return false;
                return path.endsWith(".json") || path.includes(".git") || path.includes("node_modules");
            },
            ignoreInitial: true
        });

        this.watcher.on("add", this.update.bind(this));
        this.watcher.on("unlink", this.update.bind(this));

        // see LiveReload — an unobserved "error" makes a wedged watcher
        // indistinguishable from an idle one.
        this.watcher.on("error", err => console.error("Directory watcher error:", err));

        this.update();
    }

    update(e) {
        if (this.rebuilding) return;
        this.rebuilding = setTimeout(() => {
            console.log("Rebuilding Framework Directories");
            fs.writeFileSync("./public/directory.json", JSON.stringify({ files: this.build_dir("./public/") }, null, "\t"));
            fs.writeFileSync("./public/framework/directory.json", JSON.stringify({ files: this.build_dir("./public/framework/") }, null, "\t"));

            const live_reload = this.server.socket_server?.live_reload;
            if (live_reload) {
                live_reload.changed("./public/directory.json");
                live_reload.changed("./public/framework/directory.json");
                if (e) live_reload.changed(e);
            }

            this.rebuilding = null;
        }, 100);
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
