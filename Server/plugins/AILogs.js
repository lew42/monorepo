import fs from "fs";
import os from "os";
import path from "path";
import { loopback } from "./MCP.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/* Serves Claude Code session transcripts to the ext/ai replay viewer, read-only,
 * straight from where the CLI writes them — nothing is copied into the repo.
 * Dev server only: on static hosting /ai-logs/* falls through to index.html,
 * which the viewer treats as "unavailable".
 *
 * ⚠ The id alone is not a fence: session_ids are written in plain text into
 * task.jsonl files under public/framework/ai, which are served as static
 * assets to the same LAN — so loopback() is the actual guard. */
export default class AILogs {

    static setup(server) {
        new AILogs(server);
    }

    constructor(server) {
        this.server = server;
        this.server.ai_logs = this;
        this.dir = path.join(os.homedir(), ".claude", "projects",
            process.cwd().replace(/[^a-zA-Z0-9]/g, "-"));
        server.on("express", () => this.route());
    }

    route() {
        this.server.router.get("/ai-logs/:id", (req, res) => {
            const from = req.socket.remoteAddress;
            if (!loopback(from)) {
                console.warn(`AILogs: REFUSED /ai-logs/${req.params.id} from ${from} — loopback only.`);
                return res.status(403).end();
            }
            if (!UUID.test(req.params.id)) return res.status(400).end();

            const file = path.join(this.dir, req.params.id + ".jsonl");
            if (!fs.existsSync(file)) return res.status(404).end();

            // Range: bytes=<from>- → 206 with only the tail; the feed polls this
            // way instead of re-downloading the whole transcript every poll (3 MB).
            const size = fs.statSync(file).size;
            const m = /^bytes=([0-9]+)-$/.exec(req.headers.range ?? "");
            const start = m ? Math.min(Number(m[1]), size) : 0;
            res.type("application/x-ndjson");
            res.set("Accept-Ranges", "bytes");
            res.set("Content-Length", String(size - start));
            if (m){ res.status(206); res.set("Content-Range", `bytes ${start}-${Math.max(size - 1, 0)}/${size}`); }
            if (start >= size) return res.end();
            fs.createReadStream(file, { start }).pipe(res);
        });
    }
}
