import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { rewrite_links } from "../../../public/framework/core/Page/tools/links.mjs";

const PUBLIC = path.resolve("public");

export default class Runtime {

    static setup(socket) {
        new Runtime(socket);
    }

    constructor(socket) {
		console.log("Runtime constructor");
        this.socket = socket;
		this.server = socket.server;
        this.initialize();
    }

    initialize() {
		console.log("Runtime initialized");
        this.socket.on("rpc:write", (args, index) => this.write(...args, index));
        this.socket.on("rpc:ls", (args, index) => this.ls(...args, index));
        this.socket.on("rpc:rm", (args, index) => this.rm(...args, index));
        this.socket.on("rpc:move", (args, index) => this.move(...args, index));
        this.socket.on("rpc:cmd", (args) => this.cmd(...args));
    }

    write(file, data, index) {
        const full_path = path.resolve("./public/", this.to_relative(file));
		try {
			fs.mkdirSync(path.dirname(full_path), { recursive: true });
			// A browser saving a watched file must not reload its own tab mid-edit —
			// the same mute Ask.js and Start.js already use (found by the CMS slice).
			this.socket.socket_server?.live_reload?.mute(full_path, this.socket);
			fs.writeFileSync(full_path, data);
			this.socket.send({ index, response: "write successful" });
		} catch (e) {
			console.error(e);
			this.socket.send({ index, response: "write failed" });
		}
    }

    ls(dir = "./", index) {
        const full_path = path.resolve("./public/", this.to_relative(dir));
        try {
            const files = this.server.directory.build_dir(full_path); // This is a bit messy, build_dir should maybe be in a util
            this.socket.send({ response: files, index });
        } catch (e) {
            if (e.code === "ENOENT") {
                fs.mkdirSync(full_path);
                this.ls(dir, index);
            }
        }
    }

    rm(dir, index) {
        const full_path = path.resolve("./public/", this.to_relative(dir));
        try {
            fs.rmSync(full_path, { recursive: true });
			this.socket.send({ index, response: "rm successful" });
        } catch (e) {
            console.error("Error removing directory:", e);
			this.socket.send({ index, response: "rm failed" });
        }
    }

    /* ── MOVING A DIRECTORY ───────────────────────────────────────────────────
       `rpc:move(from, to)` renames one path to another, and that is the whole of it.
       `fs.rename` on a single volume is ATOMIC: the directory is either at `from` or at
       `to`, never half-copied, so a page being moved is never a page that is missing.
       The caller is Make's real-page drag (`public/imagine/paging/make/real.js`).

       ⚠ THE GUARD IS THE SOCKET, and it is already on. Every rpc in this file arrives
         through the one WebSocket upgrade `SocketServer.js` refuses unless the peer
         address is loopback AND the `Origin` is a local one (`Server/README.md`).
         `inside()` below is the SECOND lock, not the first: it refuses a path that
         escapes `public/` even from a caller that is allowed to be here at all.

       Three refusals, each a different mistake, each said in a sentence the browser
       can show the person who dragged the row:

         either path outside `public/`   the caller asked for something off the site
         nothing at `from`               the page is already gone
         something already at `to`       `fs.rename` REPLACES an empty target directory
                                         on POSIX, and a page is never worth overwriting

       The reply carries the REVERSE move, so a caller can undo without working anything
       out: `{ ok: true, from, to, undo: { from: to, to: from } }`. */
    move(from, to, index) {
        const src = this.inside(from), dest = this.inside(to);

        if (!src || !dest)
            return this.answer(index, { ok: false, reason: `move refused — both paths must be under public/ (${from} → ${to})` });
        if (!fs.existsSync(src))
            return this.answer(index, { ok: false, reason: `move refused — nothing at ${from}` });
        if (fs.existsSync(dest))
            return this.answer(index, { ok: false, reason: `move refused — ${to} already exists` });

        /* ⚠ LINKS ARE REWRITTEN BEFORE THE DIRECTORY MOVES, on purpose — `links.mjs`
           (`core/Page/tools/`) reads its census for `from` while every file it names,
           `from` itself included, is still at the path the census recorded. A page that
           imports one of its own siblings by absolute path gets that text corrected here,
           and the correction rides along a moment later when `fs.renameSync` relocates the
           whole directory — there is no separate "the file I just fixed also moved" step.
           `rewrite_links()` regenerates the census first if it is stale (older than the
           newest `page.js` on the site — public/framework/ai/2026-09-18/link-tracking/
           doc/decisions.md has the measured cost), so this is always working off the
           CURRENT tree, not a snapshot some earlier move already outdated. */
        const links = rewrite_links(from, to);

        try {
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.renameSync(src, dest);
            console.log(`move: ${from} → ${to} (${links.count} links in ${links.files} files rewritten)`);
            return this.answer(index, { ok: true, from, to, undo: { from: to, to: from }, links });
        } catch (e) {
            console.error(`move FAILED: ${from} → ${to} —`, e.message);
            return this.answer(index, { ok: false, reason: `move failed — ${e.message}` });
        }
    }

    /* A url-path becomes an absolute path, and then has to PROVE it is still under
       `public/` — `path.resolve` walks out of a directory any `..` asks it to leave.
       The same shape `Append.resolve()` uses, for the same reason. */
    inside(url) {
        const full = path.resolve(PUBLIC, String(url ?? "").replace(/^[\\/]+/, ""));
        return full.startsWith(PUBLIC + path.sep) ? full : null;
    }

    answer(index, response) { this.socket.send({ index, response }); return response; }

    cmd(command) {
        exec(command, (error, stdout, stderr) => {
            this.socket.rpc("cmd", stdout || stderr);
        });
    }

    to_relative(filePath) {
        if (path.isAbsolute(filePath)) return `.${filePath}`;
        if (!filePath.startsWith('./') && !filePath.startsWith('../')) return `./${filePath}`;
        return filePath;
    }
}
