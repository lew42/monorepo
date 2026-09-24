/* THE KEEPER — the one thing that makes Servex actually always-on.
 *
 *   node Servex/sustain.mjs            start Servex and keep it up
 *   node Servex/sustain.mjs --status   is it up? which pids?
 *   node Servex/sustain.mjs --restart  load new Servex code: check it, restart, confirm it came back
 *   node Servex/sustain.mjs --stop     stop both, and the port-80 gate, for good
 *
 * Servex supervises everything else on this machine and, until now, nothing
 * supervised Servex: when it died — a crash, an `unhandledRejection`, a stray
 * kill — every dev server it was watching went unwatched, `/mcp` stopped
 * answering, and the next Claude session to call a tool got a connection
 * refused with no clue why. This script is the answer, and it is deliberately
 * the smallest one that works: spawn, wait, spawn again.
 *
 * Why not pm2. It is a daemon, it is a dependency, and Servex/readme.md already
 * argues against running a second daemon under the one whose whole job is to be
 * the process that stays up. Why not a Windows Scheduled Task instead: a task's
 * tightest repeat trigger is one minute, so a crash would cost up to a minute of
 * downtime against this script's one second. A Scheduled Task is still the right
 * NEXT step — one that runs THIS script at logon, so Servex survives a reboot
 * too — and that is the owner's own machine configuration to approve.
 *
 * WHAT IT DOES NOT DO. Nothing supervises the keeper. That is the honest floor
 * of any restart chain, and the trade is that this file does one thing —
 * `spawn`, wait for `exit`, `spawn` — so there is nearly nothing in it to fail.
 *
 * ⚠ On Windows a keeper killed with Stop-Process never runs an exit handler, so
 * it cannot take Servex down with it. That is why the pid file holds BOTH pids
 * and why `--stop` is the way to stop: it kills the keeper first (so it cannot
 * restart anything) and then the whole Servex process tree. */

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { place } from "./home.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.join(HERE, "index.js");
const PIDS = place("servex.pid.json");
const OUT = place("logs", "sustain.log");

const WAIT = 1000;          // a crash costs one second, not a minute
const CEILING = 30000;      // a crash LOOP backs off to this, so it cannot spin
const HEALTHY = 30000;      // stayed up this long? the next crash starts over

const stamp = () => new Date().toISOString().slice(11, 19);
const note = msg => { const line = `${stamp()} sustain: ${msg}\n`; process.stdout.write(line); try { fs.appendFileSync(OUT, line); } catch {} };

const GATE = place("gate.pid.json");                                     // gate.mjs writes it
const REPORTS = path.dirname(place("logs", "reports", "report.json"));   // a native crash's report lands here

const read = (file = PIDS) => { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; } };
const alive = pid => { try { process.kill(pid, 0); return true; } catch { return false; } };

/* ⚠ `child.kill()` on Windows leaves the GRANDCHILDREN — and Servex's
 * grandchildren are the dev servers and whisper, each holding a port. `/t` takes
 * the tree; this is the same call Process.js makes, for the same reason. */
const kill = pid => process.platform === "win32"
    ? spawnSync("taskkill", ["/pid", String(pid), "/t", "/f"], { windowsHide: true })
    : (() => { try { process.kill(pid, "SIGTERM"); } catch {} })();

/* ── the three commands ─────────────────────────────────────────────────── */

function status(){
    const pids = read(), gate = read(GATE);
    if (gate) console.log(`gate    pid ${gate.pid}  ${alive(gate.pid) ? "alive" : "GONE"}  (${gate.listen} -> ${gate.target})`);
    if (!pids) return console.log(`Servex is not running under a keeper — no ${PIDS}.`);

    console.log(`keeper  pid ${pids.keeper}  ${alive(pids.keeper) ? "alive" : "GONE"}`);
    console.log(`servex  pid ${pids.servex}  ${alive(pids.servex) ? "alive" : "GONE"}`);
    console.log(`started ${pids.started}\nstop it with  node Servex/sustain.mjs --stop`);
}

function stop(){
    const pids = read();
    if (pids){
        kill(pids.keeper);             // the keeper FIRST, or it restarts what we just killed
        kill(pids.servex);
        try { fs.unlinkSync(PIDS); } catch {}
        console.log(`Stopped keeper ${pids.keeper} and Servex ${pids.servex}.`);
    }

    /* The gate (gate.mjs) holds port 80 and outlives Servex on purpose, so the
     * tree kill above never reaches it. It goes LAST, once nothing is left that
     * could launch it again. */
    const gate = read(GATE);
    if (gate && alive(gate.pid)){ kill(gate.pid); console.log(`Stopped the gate ${gate.pid}.`); }
    try { fs.unlinkSync(GATE); } catch {}
    if (!pids && !gate) console.log("Nothing to stop.");
}

function keep(){
    const running = read();
    if (running && alive(running.keeper))
        return console.log(`Already kept alive by pid ${running.keeper} (Servex ${running.servex}).`
            + ` Stop it first: node Servex/sustain.mjs --stop`);

    note(`keeper ${process.pid} starting ${ENTRY}`);
    start(WAIT);
}

/* A RESTART ANYONE CAN RUN — an agent that changed Servex code, with nobody at
 * the keyboard (the owner, 2026-09-24: "I'd prefer not to have to manually
 * restart the server every time you change something"). It kills only the
 * Servex tree; the keeper sees the exit and starts the new code a second later.
 * Three guards, because a bad restart takes the MCP down for every session:
 *   1. every Servex .js must pass `node --check` first, or nothing is killed;
 *   2. an agent mid-turn (`working`) dies with the tree — refuse, name it, and
 *      let `--force` override;
 *   3. afterwards, wait for /api/agents to answer, and say so if it does not. */
const API = "http://127.0.0.1:8090/api/agents";

function sources(dir = HERE){
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
        e.name === "node_modules" || e.name.startsWith(".") ? []
        : e.isDirectory() ? sources(path.join(dir, e.name))
        : /\.(m?js)$/.test(e.name) ? [path.join(dir, e.name)] : []);
}

async function restart(force){
    const pids = read();
    if (!pids || !alive(pids.keeper))
        return console.log("No keeper is running, so nothing would start Servex again. Start one: node Servex/sustain.mjs");

    const bad = sources().filter(f => spawnSync(process.execPath, ["--check", f]).status !== 0);
    if (bad.length) return console.log(`Not restarting — these files do not parse:\n  ${bad.join("\n  ")}`);

    const agents = await fetch(API).then(r => r.json()).catch(() => []);
    const busy = agents.filter(a => a.state === "working").map(a => a.id);
    if (busy.length && !force)
        return console.log(`Not restarting — these agents are mid-turn and would die: ${busy.join(", ")}.`
            + ` Wait for them, or add --force.`);

    note(`restart asked for${busy.length ? ` (forced past ${busy.join(", ")})` : ""} — killing Servex ${pids.servex}`);
    kill(pids.servex);

    for (let i = 0; i < 30; i++){
        await new Promise(r => setTimeout(r, 1000));
        const now = read();
        if (now?.servex !== pids.servex && await fetch(API).then(r => r.ok).catch(() => false))
            return console.log(`Servex is back as pid ${now.servex}, running the new code.`);
    }
    console.log(`Servex did not answer within 30s. The keeper keeps retrying; see ${OUT}.`);
}

/* One generation of Servex. The backoff doubles only while it keeps dying
 * quickly; a child that stayed up past HEALTHY resets it, because one crash
 * after an hour of work is not a loop. */
function start(backoff){
    const began = Date.now();
    const out = fs.openSync(OUT, "a");

    const child = spawn(process.execPath, ["--report-on-fatalerror", `--report-directory=${REPORTS}`, ENTRY], {
        cwd: path.join(HERE, ".."),
        stdio: ["ignore", out, out]
        // ⚠ no windowsHide: Servex spawns agents and servers, and a process with no console makes
        // its children pop visible windows. The keeper is launched with a HIDDEN console
        // (PowerShell Start-Process -WindowStyle Hidden) and everything below inherits it.
    });

    fs.writeFileSync(PIDS, JSON.stringify({ keeper: process.pid, servex: child.pid, started: new Date().toISOString() }, null, 2));
    note(`Servex up as pid ${child.pid} — dashboard http://127.0.0.1:8090/ · proxy http://servex.localhost/`);

    child.on("exit", (code, signal) => {
        const lived = Date.now() - began;
        const next = lived > HEALTHY ? WAIT : Math.min(backoff * 2, CEILING);
        note(`Servex ${child.pid} exited (${signal ?? code}) after ${Math.round(lived / 1000)}s — restarting in ${next / 1000}s`);
        setTimeout(() => start(next), next);
    });
}

/* The keeper dying on purpose should not leave an orphan Servex behind. This
 * only fires for a polite death (Ctrl-C, SIGTERM); a hard kill is what `--stop`
 * is for. */
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => {
    const pids = read();
    if (pids) kill(pids.servex);
    try { fs.unlinkSync(PIDS); } catch {}
    process.exit(0);
});

const verb = process.argv[2];
if (verb === "--stop") stop();
else if (verb === "--status") status();
else if (verb === "--restart") restart(process.argv.includes("--force"));
else keep();
