import fs from "fs";
import AISessionIndex from "./AISessionIndex.mjs";
import AISessionSource from "./AISessionSource.mjs";
import QueryServer from "../../ext/Query/QueryServer.mjs";
import DatedFiles from "../../../../Server/DatedFiles.mjs";

/* Starts the AISessionIndex inside the dev server (ai/AISession/AISessionIndex.mjs): transcripts in, per-session index.json and the
 * day composite files out, snapshot changes pushed to subscribed pages by AISessionSub (below). Runs on the MAIN checkout's
 * server only (its .git is a folder; a worktree's is a file), because every server on this machine would otherwise follow
 * the same transcripts. SESSION_TAIL=1 forces it on (a private proof server), SESSION_TAIL=0 forces it off.
 * SESSION_TAIL_DIR points it at a scratch transcript folder; SESSION_ROOT at a scratch sessions folder. */
export const live = { index: null };

/* The "sessions" query source (ext/Query): the index already holds every snapshot in memory, so load is its `ready` and unload is a no-op.
 * Unavailable on a server with no index (a worktree's): the query answers { error: "no source" } and the page reads the files. */
QueryServer.source("sessions", {
    available: () => !!live.index,
    load: async () => { await live.index.ready; AISessionSource.load(live.index.root); },
    items: () => DatedFiles.sessions.snapshots(),   // the one reader of the session index (Server/doc/dated-files.md); with the live index it answers from memory
    on: fn => live.index.on(fn),
    shape: AISessionSource.shape,
    arrange: AISessionSource.arrange,
});

export default class AISessionTailer {

    static setup(server) {
        const flag = process.env.SESSION_TAIL;
        const main = (() => { try { return fs.statSync(".git").isDirectory(); } catch { return false; } })();
        if (flag === "0" || (flag !== "1" && !main)) return;
        const base = process.env.SESSION_TAIL_DIR || undefined, root = process.env.SESSION_ROOT || undefined;
        live.index = server.session_index = new AISessionIndex({ base, root, log: m => console.log(m) }).start();
        DatedFiles.live = { items: () => live.index.snaps.values(), on: fn => live.index.on(fn) };
    }
}

/* The socket half. A page sends rpc("session_sub", day): it is sent every snapshot of that UTC day ("YYYY-MM-DD") now (from
 * memory, so there is no gap between the composite file and the live feed), then ONLY each snapshot that changes, as
 * socket.session_index(snapshot). Only today is worth subscribing to; an old day is a static file. */
export class AISessionSub {

    static setup(socket) { new AISessionSub(socket); }

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
        this.off = ix.on(snap => { if (AISessionIndex.day_of(snap) === this.day) this.socket.rpc("session_index", snap); });
    }
}
