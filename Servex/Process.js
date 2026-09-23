import fs from "fs";
import net from "net";
import { spawn, spawnSync } from "child_process";
import Events from "../Server/Events.js";

const MAX_RESTARTS = 8;

/* ONE SUPERVISED CHILD PROCESS — a dev server, whisper-server, anything.
 *
 * This is what Servex uses instead of pm2. pm2 is a second always-on daemon
 * running underneath an always-on process, and everything Servex actually needs
 * from it fits here: spawn with PORT in the environment, stop, restart,
 * restart-on-crash with a backoff, and every line the child prints going into
 * the log writer. The decision, with pm2 as the named alternative, is the
 * `supervisor` decision line in this task's log.
 *
 * FOUR FAILURES IT IS BUILT TO SURVIVE, each one proven in
 * Servex/proof.mjs (`node Servex/proof.mjs`, with Servex running):
 *
 *   1. restart() when the child is already dead — stop() finds nothing to kill
 *      and returns at once, start() spawns a fresh one. No wait-forever, which
 *      is the exact wedge that kept the site down on 2026-09-19.
 *   2. a child that exits immediately, forever — each crash waits twice as long
 *      as the last (0.5s, 1s, 2s … capped at 30s), and after 8 in a row Servex
 *      stops trying and says so. Never a tight loop.
 *   3. the port is already held by a stranger — checked BEFORE spawning, so we
 *      never start a process that is only going to die on EADDRINUSE. Status
 *      reads `port-taken` and nothing is restarted.
 *   4. a healthy process that crashes a week later — `settled_after` resets the
 *      backoff once a child has stayed up ten seconds, so one crash after a week
 *      of uptime restarts instantly instead of waiting 30 seconds.
 *
 * Servex only ever stops a process IT started. That single rule (borrowed from
 * Server/plugins/Whisper.js) is why the "already running" case below is safe. */
export default class Process extends Events {

    initialize(){
        this.args ??= [];
        this.env ??= {};
        this.autorestart ??= true;
        this.backoff_min ??= 500;
        this.backoff_max ??= 30000;
        this.settled_after ??= 10000;

        this.status = "stopped";
        this.child = null;
        this.restarts = 0;
        this.stopping = false;
        this.timer = null;
        this.said = "";
    }

    async start(){
        if (this.child) return this.status;
        this.stopping = false;

        if (await this.stranger()) return this.settle("port-taken",
            `port ${this.port} is already held by something Servex did not start — not spawning ${this.name}.`);

        return this.spawn();
    }

    /* Is somebody already listening on our port? A plain TCP connect is enough
     * and costs nothing — we do not care what answers, only that something does. */
    stranger(){
        if (!this.port) return Promise.resolve(false);

        return new Promise(done => {
            const socket = net.connect({ host: "127.0.0.1", port: this.port });
            const answer = hit => { socket.destroy(); done(hit); };
            socket.on("connect", () => answer(true));
            socket.on("error", () => answer(false));
            socket.setTimeout(700, () => answer(false));
        });
    }

    spawn(){
        const env = { ...process.env, ...this.env };
        if (this.port) env.PORT = String(this.port);

        try {
            this.child = spawn(this.command, this.args, { cwd: this.cwd, env, shell: !!this.shell });   // inherit Servex's hidden console — see sustain.mjs
        } catch (e){
            return this.settle("errored", `spawn failed: ${e.message}`);
        }

        this.started_at = Date.now();
        this.status = "launching";
        this.say(`started: ${[this.command, ...this.args].join(" ")} (pid ${this.child.pid}${this.port ? `, PORT ${this.port}` : ""})`);

        this.relay("stdout");
        this.relay("stderr");
        this.child.on("error", e => this.say(`process error: ${e.message}`));
        this.child.on("exit", (code, signal) => this.exited(code, signal));
        this.ready();

        return this.status;
    }

    /* `launching` → `online`. With a port that means the port answers; without
     * one it means the process is simply still alive a second later. Either way
     * the dashboard stops saying "launching" only when there is a reason to. */
    async ready(){
        const child = this.child;
        const deadline = Date.now() + 30000;

        while (this.child === child && Date.now() < deadline){
            await new Promise(done => setTimeout(done, this.port ? 300 : 1000));
            if (this.child !== child) return;
            if (!this.port || await this.stranger()){
                this.status = "online";
                return this.emit("status", this.status);
            }
        }
    }

    exited(code, signal){
        const alive_for = Date.now() - this.started_at;
        this.child = null;

        if (this.stopping) return this.settle("stopped", `stopped (code ${code}).`);
        if (alive_for >= this.settled_after) this.restarts = 0;   // it was healthy; this is a fresh crash, not a loop
        if (!this.autorestart) return this.settle("stopped", `exited (code ${code}, signal ${signal}) — autorestart is off.`);

        if (++this.restarts > MAX_RESTARTS) return this.settle("errored",
            `exited (code ${code}) ${MAX_RESTARTS} times in a row without staying up — Servex has stopped trying. Fix it, then start it again.`);

        const wait = Math.min(this.backoff_min * 2 ** (this.restarts - 1), this.backoff_max);
        this.status = "restarting";
        this.say(`exited (code ${code}, signal ${signal}) — restarting in ${wait}ms (${this.restarts}/${MAX_RESTARTS}).`);
        this.timer = setTimeout(() => { this.timer = null; this.start(); }, wait);
    }

    /* Synchronous, so it still runs from a `process.on("exit")` handler — that is
     * the only shutdown hook Node guarantees, and it cannot await anything. */
    terminate(){
        this.stopping = true;
        clearTimeout(this.timer);
        this.timer = null;
        if (this.child) this.kill(this.child.pid);
    }

    async stop(){
        const child = this.child;
        this.terminate();
        if (!child) return this.settle("stopped", this.status === "stopped" ? "already stopped." : "stopped.");

        await new Promise(done => {
            const give_up = setTimeout(done, 5000);
            child.once("exit", () => { clearTimeout(give_up); done(); });
        });

        this.child = null;
        this.status = "stopped";
        return this.status;
    }

    async restart(){
        await this.stop();
        this.restarts = 0;
        return this.start();
    }

    /* ⚠ On Windows `child.kill()` kills the child and leaves its GRANDCHILDREN
     * running — and every dev server here is `node server.js`, a supervisor that
     * forks the real server as a child of its own. Killing only the supervisor
     * would leave the real server holding the port forever. `taskkill /t` takes
     * the whole tree. */
    kill(pid){
        if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(pid), "/t", "/f"], { windowsHide: true });
        else try { process.kill(pid, "SIGTERM"); } catch { /* already gone */ }
    }

    relay(stream){
        this.child[stream]?.on("data", chunk => String(chunk).split("\n").forEach(line => {
            if (line.trim()) this.say(line.trim(), { stream });
        }));
    }

    say(msg, extra){
        this.said = msg;
        this.log?.append(this.name, { process: this.name, msg, ...extra }).catch(() => {});
        this.emit("say", msg);
    }

    settle(status, msg){
        this.status = status;
        this.say(msg);
        this.emit("status", status);
        return status;
    }

    logs(n = 50){
        return this.log.tail(this.name, n);
    }

    toJSON(){
        return {
            name: this.name, status: this.status, pid: this.child?.pid ?? null,
            port: this.port ?? null, restarts: this.restarts, said: this.said,
            command: [this.command, ...this.args].join(" "), cwd: this.cwd ?? null
        };
    }
}

/* WHISPER, SUPERVISED BY SERVEX INSTEAD OF BY THE DEV SERVER.
 *
 * Server/plugins/Whisper.js starts whisper-server for ux/Dictate, and it handles
 * exactly four boot cases. Servex has to handle the same four, because once
 * Servex owns the process the dev servers it starts get `NO_WHISPER=1` and stop
 * starting their own. Nothing is removed from the dev server — a dev server you
 * start by hand still brings up its own whisper, exactly as before.
 *
 *   1. not installed  — no exe or no model: nothing spawned, Dictate falls back
 *                       to the browser engine on its own.
 *   2. already running — something answers the port: LEFT ALONE, and never
 *                       stopped, because Servex only stops what it started.
 *   3. starts         — an ordinary supervised child from here down.
 *   4. skipped        — NO_WHISPER=1.
 *
 * Its stdout and stderr become log entries in `whisper.jsonl` like any other
 * child's, which is the point: whisper.cpp's startup banner goes to STDERR, and
 * a log file is a much better place for it than a terminal nobody is watching. */
Process.Whisper = class Whisper extends Process {

    async start(){
        if (process.env.NO_WHISPER) return this.settle("skipped", "NO_WHISPER=1 — Servex is not starting whisper-server.");

        if (!fs.existsSync(this.command) || !fs.existsSync(this.model)) return this.settle("not-installed",
            `whisper-server is not installed (looked for ${this.command}) — ux/Dictate will fall back to the browser engine.`);

        if (await this.stranger()) return this.settle("already-running",
            `whisper-server is already answering on 127.0.0.1:${this.port} — leaving it alone. Servex only ever stops a process it started.`);

        return this.spawn();
    }
};
