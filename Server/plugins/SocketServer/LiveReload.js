import Events from "../../Events.js";
import Tail from "./Tail.js";
import watch from "../../watch.js";
import * as Hold from "../../hold.mjs";
import fs from "fs";
import path from "path";

const PUBLIC = path.resolve("public");

// Every path on the wire is a url-path: forward slashes, no `public/` prefix.
const url_path = file => "/" + path.relative(PUBLIC, path.resolve(file)).replace(/\\/g, "/");

/* fs.watch reports the PARENT DIRECTORY alongside the file that changed inside it.
 * A directory is never a resource a page loaded, so sending one only pads the
 * batch. A path that no longer exists still goes through — it may be a file that
 * was just deleted, and the client wants to hear about that. */
const is_dir = file => { try { return fs.statSync(file).isDirectory(); } catch { return false; } };

export default class LiveReload extends Events {

    static setup(socket_server) {
        socket_server.live_reload = new LiveReload({ socket_server });
    }

    initialize() {
		console.log("Initializing LiveReload");
        this.muted = new Map();
        this.queue = new Set();

        /* Every event, whatever kind: a file appearing matters as much as one
         * changing — a file a page 404-probed earlier is in that page's resource
         * entries, so its arrival is what makes the probe succeed on reload.
         * The watcher is ../../watch.js, ONE recursive fs.watch handle shared with
         * Directory.js; it used to be a chokidar of its own, and a second chokidar
         * in Directory.js, which is what pinned a core (Server/doc/spin.md). */
        watch(file => { if (!is_dir(file)) this.changed(file); });

        /* THE HOLD — Server/hold.mjs, ai/2026-09-19/reload-hold/requirements.md.
         * `.reload-hold.json` lives OUTSIDE public/ (the repo root), so nothing in
         * watch.js's own handle ever sees it — it needs its own way to notice a
         * change, and a poll is that way, not a second fs.watch handle. Why a poll
         * and not `fs.watch(LOCK_PATH)`: a hold also has to EXPIRE on its own after
         * five minutes with NO file write at all — that needs a timer regardless,
         * so one 500ms poll both notices `on`/`off` and checks expiry, instead of a
         * watch handle plus a separate expiry timer doing overlapping jobs. 500ms
         * on one file costs nothing (contrast the 8,532-handle chokidar history
         * this file's sibling comment tells above).
         *
         * `holders` is the live holder list this instance trusts between polls —
         * flush() reads it instead of hitting the disk on every debounce, so a
         * batch of ten quick writes costs one extra stat every 500ms, not one per
         * write. It is the LIST, not a boolean, because since 2026-09-22 each
         * holder carries the fence it is writing inside and flush() needs it.
         * `holders_seen` is a signature of the last broadcast `hold` frame —
         * `who`, `until` AND `paths` — so sockets hear about a hold only when it
         * really changes, and a holder narrowing its own fence counts as a change.
         *
         * A hold already on disk when this plugin boots (the supervisor
         * restarting the child mid-hold) is picked up on the very first tick,
         * so "stay held across a restart" needs no special boot-time code of
         * its own. What a restart DOES lose is this process's in-memory
         * `queue` — a fresh process has an empty Set — but that only matters
         * for a change that happened in the few hundred ms before the
         * restart; the hold itself, read fresh off disk, is what "stay held"
         * actually promises.
         *
         * ⚠ THE FIRST POLL MUST NOT RUN HERE, SYNCHRONOUSLY, IN initialize().
         * `LiveReload.setup()` runs from `DevSocket`'s static "new" event —
         * `Events.js`'s constructor fires `emit("new", this)` BEFORE its own
         * `instantiate()` (which calls `initialize()`), so at the moment this
         * very `initialize()` runs, the SocketServer instance that will own
         * `this.socket_server` has not reached ITS `initialize()` yet either —
         * `this.socket_server.sockets` does not exist. A poll that finds a
         * live hold tries to broadcast over `this.socket_server.sockets` and
         * throws `TypeError: … is not iterable`, crashing the child at boot —
         * every time a hold happens to be on disk when the server starts.
         * Found 2026-09-19 when it took the mastermind's own supervised
         * :8123 down. Fixed two ways: wait for the main Server's own
         * "listening" event (Server.js emits it once `http.listen()`'s
         * callback fires, well after SocketServer's `initialize()` has long
         * since set `sockets`) before ever polling, and — belt and suspenders —
         * `?? []` below survives even if some future caller polls earlier
         * still. `node --check` only proves a file PARSES; it does not run
         * `initialize()`, so it never caught this — after any Server/ edit,
         * boot it on a private port and curl it before moving on. */
        this.holders = [];
        this.holders_seen = "";
        this.socket_server.server.on("listening", () => {
            if (process.env.BOOT_TEST) return;   // a candidate boot test must never touch the shared reload-hold lock
            this.poll_hold();
            this.hold_timer = setInterval(() => this.poll_hold(), 500);
        });
    }

    poll_hold() {
        const { alive, expired } = Hold.prune();

        for (const holder of expired)
            console.log(`Hold: "${holder.who}" lapsed (its 5 minutes ran out) — flushing what queued.`);

        // `holders` — not just a boolean — because flush() needs each holder's
        // FENCE, not merely the fact that somebody is holding something.
        this.holders = alive;

        const signature = alive.map(h => `${h.who}:${h.until}:${(h.paths ?? []).join("|")}`).join(",");
        const changed = signature !== this.holders_seen;
        if (changed) this.holders_seen = signature;

        /* ⚠ "only on change" is not enough on its own — a tab that connects AFTER
         * a hold was already taken (the owner opening a fresh tab while an agent
         * is mid-batch) would never get a `hold` frame at all, because the global
         * signature it would compare against has not moved since the LAST tab
         * connected. `known` tracks which sockets have ever been sent a frame at
         * all, so a brand-new one is synced on its first poll regardless of
         * whether the signature changed this tick — the dev-bar readout is
         * otherwise silently wrong for the first person to open it after a hold
         * is already on (found proving this exact case, 2026-09-19). */
        this.known ??= new WeakSet();
        for (const socket of this.socket_server.sockets ?? []) {
            const is_new = !this.known.has(socket);
            if (is_new) this.known.add(socket);
            if (changed || is_new) socket.rpc("hold", alive);
        }

        /* Any change to WHO holds WHAT must act, not only the old held → free
         * edge: a holder dropping out of three, or narrowing its own fence,
         * frees paths that are sitting in the queue right now, and waiting for
         * the next unrelated write to notice would strand them. One flush, here;
         * `flush()` re-partitions and keeps whatever is still fenced. */
        if (changed) {
            clearTimeout(this.timer);
            this.flush();
        }
    }

    /* A socket that writes a file shouldn't be reloaded by its own write — it
     * already has the content. Everyone else still reloads. */
    mute(file, socket) {
        this.muted.set(url_path(file), { socket, at: Date.now() });
    }

    // ⚠ Directory.js calls this with no path — every caller is not a file watcher.
    changed(file) {
        if (file && file.endsWith(".jsonl")) return Tail.changed(file);

        this.queue.add(file ? url_path(file) : null);   // null — unknown, reload everything
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.flush(), 300);
    }

    /* ⚠ A HOLD IS A FENCE, NOT A SWITCH (2026-09-22). This used to be
     * `if (this.held_state) return;` — one agent holding stopped EVERY reload on
     * this whole checkout, so while a minion wrote its batch the owner's own save
     * did not reload the owner's own tab. The owner, 17:51: "it says live reload
     * is held by board-declutter for 220 seconds. My page didn't live reload.
     * This is crazy and bad."
     *
     * So the queue is PARTITIONED on every flush. A path inside some live
     * holder's fence stays queued, exactly as before. Everything else goes out
     * now, to everyone — the hold was never meant to reach it. The glob rules
     * live in Server/hold.mjs's `matches()`, nowhere else. */
    flush() {
        const queued = [...this.queue];
        if (!queued.length) return;   // a force-flush with nothing queued — the common case

        const holders = this.holders ?? [];
        const held = [], paths = [];

        for (const file of queued) {
            /* ⚠ `null` means "the server does not know what changed", which no
             * fence can answer. Nothing calls changed() that way today, but if
             * anything ever does, holding it while ANY fence is live is the safe
             * reading: a reload-everything that escapes mid-batch is the exact
             * flash the hold exists to prevent. */
            const fenced = file === null ? holders.length > 0 : Hold.matches(holders, file).length > 0;
            (fenced ? held : paths).push(file);
        }

        this.queue = new Set(held);
        if (!paths.length) return;

        let told = 0;
        for (const socket of this.socket_server.sockets) {
            const send = paths.filter(file => !this.silent(file, socket));
            if (send.length) { socket.rpc("changed", send); told++; }
        }

        /* ⚠ ONE LINE PER BROADCAST, and it is the only census there is — nothing
         * captures this server's stdout, so a question like "why does my tab keep
         * reloading?" can otherwise only be answered by reconstructing it from file
         * mtimes after the fact (which is how ai/2026-09-22/reload-rethink/ had to
         * answer it: 215 reloads that day, 203 of them directory.json). First three
         * paths only — a `git checkout` batch is hundreds and would bury the line.
         * `told` is sockets actually SENT to, not sockets connected: a socket that
         * wrote the file itself is muted and hears nothing. */
        const first = paths.slice(0, 3).join(" ");
        const fenced = held.length ? `, ${held.length} held by ${holders.map(h => h.who).join(", ")}` : "";
        console.log(`[reload] ${paths.length} path${paths.length === 1 ? "" : "s"} ${first}${paths.length > 3 ? " …" : ""} → ${told} socket${told === 1 ? "" : "s"} told${fenced}`);
    }

    silent(file, socket) {
        const mute = this.muted.get(file);
        return !!mute && mute.socket === socket && Date.now() - mute.at < 5000;
    }
}
