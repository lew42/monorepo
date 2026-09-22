import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const HOME = process.env.WHISPER_HOME || path.join(process.env.LOCALAPPDATA || "", "lew42", "whisper");
const EXE = path.join(HOME, "bin", "whisper-server.exe");
const MODEL = path.join(HOME, "models", "ggml-large-v3-turbo.bin");
const PORT = process.env.WHISPER_TEST ? 8179 : 8178;
const OWNER_FACING = !process.env.PORT || Number(process.env.PORT) === 80;
const MAX_RESTARTS = 3;
const LINES_SHOWN = 20;   // whisper.cpp logs its startup banner to STDERR, not stdout -- both streams share this cap

/* Starts `whisper-server` (whisper.cpp's own HTTP server) so ux/Dictate's local
 * engine just works, with nobody starting it by hand -- see
 * public/framework/ux/Dictate/readme.md and its doc/decisions.md ("Who starts
 * whisper-server?", option (a), chosen 2026-09-19).
 *
 * Exactly one of four things happens on boot, each ONE plain line prefixed
 * `[whisper]` (never a stack, never more than a line):
 *   1. not installed (no whisper-server.exe or no model under WHISPER_HOME) --
 *      nothing spawned; Dictate falls back to the browser engine on its own.
 *   2. already running (something answers the port) -- left alone, not managed:
 *      this plugin only ever kills a whisper-server IT spawned. That single rule
 *      is the safety net that keeps exactly one process alive across a supervisor
 *      restart even in the case this plugin cannot control: measured 2026-09-19,
 *      killing run.js (Node on Windows puts a spawned child in a job object tied
 *      to its parent) already takes the whisper-server it spawned down with it
 *      most of the time -- but if a future Node or a plain `taskkill` without
 *      `/T` ever leaves it orphaned instead, the NEW run.js finds it already
 *      answering on boot and starts nothing more rather than risking a second one.
 *   3. spawned fresh -- becomes this plugin's own child, killed when THIS
 *      process exits (SIGINT, SIGTERM, or a plain `exit`), restarted up to
 *      3 times if it crashes, then one line and silence.
 *   4. skipped -- `NO_WHISPER=1`, or a private server (`PORT` set and not 80)
 *      that would otherwise fight the owner's server over the port; the
 *      private-server case logs nothing at all, so a second dev server on the
 *      side stays quiet about a decision that was never its to make.
 *
 * Only the owner-facing server (no PORT, or PORT=80) starts it. `WHISPER_TEST=1`
 * is a test-only escape hatch: it forces this on for a private server too, and
 * points it at port 8179 instead of 8178, so a proof run never touches the real
 * whisper-server the owner may already have running.
 *
 * Every path here is wrapped so a dev server dependency (Express, the socket,
 * every other plugin) keeps working even if whisper-server cannot be found,
 * cannot start, or dies mid-session -- this must never be able to take the dev
 * server down. */
export default class Whisper {

    static setup(server) { new Whisper(server); }

    constructor(server) {
        this.server = server;
        this.child = null;
        this.restarts = 0;
        this.stopping = false;
        server.on("listening", () => this.start());
    }

    async start() {
        try {
            if (process.env.NO_WHISPER) return console.log("[whisper] NO_WHISPER=1 -- skipping.");
            if (!OWNER_FACING && !process.env.WHISPER_TEST) return;   // a private server -- quiet; it would fight over the port

            if (await this.already_running()) return console.log(`[whisper] already running on 127.0.0.1:${PORT} -- leaving it alone.`);

            if (!fs.existsSync(EXE) || !fs.existsSync(MODEL)) {
                return console.log(`[whisper] not installed (looked for ${EXE}) -- Dictate will fall back to the browser engine.`);
            }

            this.spawn_it();
            this.watch_lifecycle();
        } catch (e) {
            console.error("[whisper] setup failed, continuing without it:", e?.message || e);
        }
    }

    /* A plain GET / is enough: whisper-server answers 200 with its own small HTML
     * form the instant it is up, and a refused or timed-out connection means the
     * port is free. 1.5s is generous -- the real server answers in well under
     * 100ms once it is actually listening. */
    async already_running() {
        try {
            const res = await fetch(`http://127.0.0.1:${PORT}/`, { signal: AbortSignal.timeout(1500) });
            return !!res;
        } catch {
            return false;
        }
    }

    spawn_it() {
        try {
            this.child = spawn(EXE, ["-m", MODEL, "--host", "127.0.0.1", "--port", String(PORT)], { windowsHide: true });
        } catch (e) {
            console.error("[whisper] spawn failed:", e?.message || e);
            this.child = null;
            return;
        }
        console.log(`[whisper] starting whisper-server on 127.0.0.1:${PORT} (pid ${this.child.pid})`);

        /* One shared counter -- whisper.cpp's own startup banner (CUDA device,
         * model load) comes out on STDERR, not stdout, so capping stdout alone
         * let all of it straight through (found the hard way: proof run logged
         * 40 lines with the cap never firing). Past the cap both streams go
         * quiet together -- a crash still gets its own line from the `exit`
         * handler below, which is the signal that actually matters. */
        let shown = 0;
        const relay = line => {
            if (shown >= LINES_SHOWN) return;
            if (++shown === LINES_SHOWN) return console.log("[whisper] (quieting further output -- it is chatty)");
            console.log("[whisper]", line);
        };
        this.child.stdout?.on("data", d => String(d).split("\n").forEach(l => l.trim() && relay(l)));
        this.child.stderr?.on("data", d => String(d).split("\n").forEach(l => l.trim() && relay(l)));
        this.child.on("error", e => console.error("[whisper] process error:", e?.message || e));

        this.child.on("exit", (code, signal) => {
            this.child = null;
            if (this.stopping) return;   // we asked it to stop -- not a crash, nothing to restart

            this.restarts++;
            if (this.restarts > MAX_RESTARTS) {
                console.log(`[whisper] whisper-server keeps exiting (code ${code}) -- gave up after ${MAX_RESTARTS} restarts. Dictate falls back to the browser engine.`);
                return;
            }
            console.warn(`[whisper] whisper-server exited (code ${code}, signal ${signal}) -- restarting (${this.restarts}/${MAX_RESTARTS}).`);
            this.spawn_it();
        });
    }

    /* Killed together with the process that spawned it. `child.kill()` on
     * Windows is an unconditional terminate regardless of the signal name --
     * there is no graceful shutdown to ask whisper-server for, so this is the
     * best available, and it is only ever called on a child THIS plugin spawned. */
    watch_lifecycle() {
        const shutdown = () => { this.stop(); process.exit(0); };
        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);
        process.on("exit", () => this.stop());
    }

    stop() {
        if (this.stopping) return;
        this.stopping = true;
        try { this.child?.kill(); } catch {}
        this.child = null;
    }
}
