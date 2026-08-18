import fs from "fs";
import os from "os";
import path from "path";
import { loopback } from "./MCP.js";

const ROOT = path.resolve(os.tmpdir());
const TYPES = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif" };

/* Screenshots a worker takes (Shot.js, ad hoc Playwright) never enter the repo
 * (CLAUDE.md RULE#12) — they land under the OS temp root, and this route is the
 * only way the dashboard can reach them. Same loopback() guard as AILogs.js, and
 * the path is confined to ROOT AFTER path.resolve — a prefix check done before
 * resolution is defeated by `..` and by symlinks. */
export default class Screenshots {

    static setup(server){ new Screenshots(server); }

    constructor(server){
        this.server = server;
        server.on("express", () => this.route());
    }

    route(){
        this.server.router.get("/screenshot", (req, res) => {
            const from = req.socket.remoteAddress;
            if (!loopback(from)){
                console.warn(`Screenshots: REFUSED /screenshot from ${from} — loopback only.`);
                return res.status(403).end();
            }

            const type = TYPES[path.extname(String(req.query.path ?? "")).toLowerCase()];
            if (!type) return res.status(400).end();

            const file = path.resolve(String(req.query.path));
            if (file !== ROOT && !file.startsWith(ROOT + path.sep)){
                console.warn(`Screenshots: REFUSED ${file} — outside the permitted root.`);
                return res.status(403).end();
            }
            if (!fs.existsSync(file)) return res.status(404).end();

            res.type(type);
            fs.createReadStream(file).pipe(res);
        });
    }
}
