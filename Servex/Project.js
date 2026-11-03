import fs from "fs";
import path from "path";
import Events from "../Server/Events.js";

const NPM = process.platform === "win32" ? "npm.cmd" : "npm";
const ENTRIES = ["server.js", "index.js", "app.js"];

/* A DIRECTORY SERVEX FOUND — anything under the scan root with a package.json.
 * It knows its name, its port, and how to start itself. It does not run
 * anything: that is Process's job. */
export default class Project extends Events {

    initialize(){
        const pkg = this.pkg();
        this.name ??= pkg.name || path.basename(this.dir);
        this.scripts = pkg.scripts ? Object.keys(pkg.scripts) : [];
    }

    pkg(){
        try { return JSON.parse(fs.readFileSync(path.join(this.dir, "package.json"), "utf8")); } catch { return {}; }
    }

    /* A plain `node server.js` is preferred over `npm start`, which is the
     * reverse of what the old Servex did, for two reasons that both bit real
     * projects here:
     *
     *   - `npm start` is TWO processes (npm, then node), and on Windows the npm
     *     one is a `.cmd`, which modern Node refuses to spawn without a shell —
     *     so it is really three. Killing a tree three deep is how a port ends up
     *     held by a process nobody can find.
     *   - `node server.js` is exactly what this monorepo's own dev server wants,
     *     PORT and all, and its root package.json has no `start` script at all.
     *
     * `npm start` is still the fallback for a project that has no recognisable
     * entry file, and it gets `shell: true` so the `.cmd` resolves. */
    /* An externally-registered project (a worktree that started its own
     * server) already has a running process Servex did not spawn — Servex
     * must never try to start a second one on the same port. */
    start_command(){
        if (this.external) return null;
        for (const entry of ENTRIES){
            if (fs.existsSync(path.join(this.dir, entry))) return { command: process.execPath, args: [entry] };
        }
        if (this.scripts.includes("start")) return { command: NPM, args: ["start"], shell: true };
        return null;
    }

    toJSON(){
        return {
            name: this.name, dir: this.dir, port: this.port, self: !!this.self, external: !!this.external,
            scripts: this.scripts, can_start: !this.self && !!this.start_command()
        };
    }
}
