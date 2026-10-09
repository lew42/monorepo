import fs from "fs";
import SessionIndex from "../SessionIndex.mjs";

/* Starts the SessionIndex inside the dev server (Server/SessionIndex.mjs): transcripts in, per-session index.json and the
 * day composite files out, snapshot changes pushed to subscribed pages by SessionSub (below). Runs on the MAIN checkout's
 * server only (its .git is a folder; a worktree's is a file), because every server on this machine would otherwise follow
 * the same transcripts. SESSION_TAIL=1 forces it on (a private proof server), SESSION_TAIL=0 forces it off.
 * SESSION_TAIL_DIR points it at a scratch transcript folder; SESSION_ROOT at a scratch sessions folder. */
export const live = { index: null };

export default class SessionTail {

    static setup(server) {
        const flag = process.env.SESSION_TAIL;
        const main = (() => { try { return fs.statSync(".git").isDirectory(); } catch { return false; } })();
        if (flag === "0" || (flag !== "1" && !main)) return;
        const base = process.env.SESSION_TAIL_DIR || undefined, root = process.env.SESSION_ROOT || undefined;
        live.index = server.session_index = new SessionIndex({ base, root, log: m => console.log(m) }).start();
    }
}

/* The socket half. A page sends rpc("session_sub", day): it is sent every snapshot of that UTC day ("YYYY-MM-DD") now (from
 * memory, so there is no gap between the composite file and the live feed), then ONLY each snapshot that changes, as
 * socket.session_index(snapshot). Only today is worth subscribing to; an old day is a static file. */
export class SessionSub {

    static setup(socket) { new SessionSub(socket); }

    constructor(socket) {
        this.socket = socket; this.day = null; this.off = null;
        socket.on("rpc:session_sub", args => this.subscribe(args[0]));
        socket.on("closed", () => this.off?.());
    }

    async subscribe(day) {
        const ix = live.index;
        this.off?.(); this.off = null;
        if (!ix || !/^\d{4}-\d{2}-\d{2}$/.test(String(day))) return this.socket.rpc("session_index_off", day);
        await ix.ready;
        this.day = day;
        this.socket.rpc("session_index_bulk", day, ix.bundle(day).snapshots);
        this.off = ix.on(snap => { if (SessionIndex.day_of(snap) === this.day) this.socket.rpc("session_index", snap); });
    }
}
