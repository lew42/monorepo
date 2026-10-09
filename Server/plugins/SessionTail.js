import fs from "fs";
import SessionTailer from "../SessionTailer.mjs";

/* Starts the SessionTailer inside the dev server: transcripts in, session-live.jsonl out, which the dev socket
 * then streams to the Sessions tab. Runs on the MAIN checkout's server only (its .git is a folder; a worktree's is a
 * file), because every server on this machine would otherwise follow the same transcripts. SESSION_TAIL=1 forces it on
 * (a private proof server), SESSION_TAIL=0 forces it off. SESSION_TAIL_DIR points it at a scratch transcript folder. */
export default class SessionTail {

    static setup(server) {
        const flag = process.env.SESSION_TAIL;
        const main = (() => { try { return fs.statSync(".git").isDirectory(); } catch { return false; } })();
        if (flag === "0" || (flag !== "1" && !main)) return;
        const base = process.env.SESSION_TAIL_DIR || undefined;
        server.session_tailer = new SessionTailer({ base, log: m => console.log(m) }).start();
    }
}
