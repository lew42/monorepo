import fs from "fs";
import os from "os";
import path from "path";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/* Serves Claude Code session transcripts to the ext/ai replay viewer, read-only,
 * straight from where the CLI writes them — nothing is copied into the repo.
 * Dev server only: on static hosting /ai-logs/* falls through to index.html,
 * which the viewer treats as "unavailable". */
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
            if (!UUID.test(req.params.id)) return res.status(400).end();

            const file = path.join(this.dir, req.params.id + ".jsonl");
            if (!fs.existsSync(file)) return res.status(404).end();

            res.type("application/x-ndjson");
            fs.createReadStream(file).pipe(res);
        });
    }
}
