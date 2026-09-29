/* THE KEEPER — the one thing that makes Servex actually always-on.
 *
 *   node Servex/sustain.mjs            start Servex and keep it up
 *   node Servex/sustain.mjs --status   is it up? which pids?
 *   node Servex/sustain.mjs --restart  load new Servex code: check it, restart, confirm it came back
 *   node Servex/sustain.mjs --stop     stop both, the port-80 gate and the dev servers, for good
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
import { place, HOME } from "./home.js";
import { ensure_deps } from "./ensure-deps.mjs";

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
 * the tree; this is the same call Process.js makes, for the same reason.
 *
 * A blocking wait, no extra process: Atomics.wait is allowed on Node's main
 * thread (unlike a browser tab), so this blocks the caller for real seconds
 * without a busy loop or a spawned `sleep`. */
const sleepSync = ms => { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch {} };

/* taskkill can exit 0 and still leave the pid running (a handle held open, a
 * permission fluke) — 09-28/09-29's silent restarts were exactly this kind of
 * "it said it worked" failure, one layer up. So `kill` does not trust its own
 * exit code: it polls `alive()` for up to 5s, and only THEN, if the pid is
 * still there, logs loudly and tries once more with a plain (non-tree) kill. */
function kill(pid){
    if (process.platform !== "win32"){
        try { process.kill(pid, "SIGTERM"); } catch {}
        return;
    }
    const first = spawnSync("taskkill", ["/pid", String(pid), "/t", "/f"], { windowsHide: true });
    if (first.status !== 0)
        note(`kill: taskkill /pid ${pid} /t /f exited ${first.status} — ${(first.stderr || first.stdout || "").toString().trim()}`);

    for (let i = 0; i < 20 && alive(pid); i++) sleepSync(250);
    if (!alive(pid)) return first;

    note(`kill: pid ${pid} still alive 5s after taskkill (exit ${first.status}) — trying a plain taskkill /pid /f on the root`);
    const retry = spawnSync("taskkill", ["/pid", String(pid), "/f"], { windowsHide: true });
    for (let i = 0; i < 20 && alive(pid); i++) sleepSync(250);
    note(alive(pid) ? `kill: pid ${pid} STILL alive after the retry — giving up` : `kill: pid ${pid} gone after the retry`);
    return retry;
}

/* The dev servers Servex started detached (Process.js) — they outlive Servex,
 * so a tree kill of Servex never reaches them; each has a record here. */
const PROCS = path.dirname(place("procs", "x.json"));
const procs = () => { try { return fs.readdirSync(PROCS).filter(f => f.endsWith(".json"))
    .map(f => ({ name: f.slice(0, -5), file: path.join(PROCS, f), ...read(path.join(PROCS, f)) })).filter(p => p.pid); } catch { return []; } };

/* ── the three commands ─────────────────────────────────────────────────── */

function status(){
    const pids = read(), gate = read(GATE);
    if (gate) console.log(`gate    pid ${gate.pid}  ${alive(gate.pid) ? "alive" : "GONE"}  (${gate.listen} -> ${gate.target})`);
    for (const p of procs()) console.log(`${p.name.padEnd(7)} pid ${p.pid}  ${alive(p.pid) ? "alive" : "GONE"}  (port ${p.port}, detached dev server)`);
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

    /* The gate (gate.mjs) and the detached dev servers outlive Servex on
     * purpose, so the tree kill above never reaches them. They go LAST, once
     * nothing is left that could launch them again. */
    const gate = read(GATE);
    if (gate && alive(gate.pid)){ kill(gate.pid); console.log(`Stopped the gate ${gate.pid}.`); }
    try { fs.unlinkSync(GATE); } catch {}
    const servers = procs();
    for (const p of servers){
        if (alive(p.pid)){ kill(p.pid); console.log(`Stopped ${p.name} ${p.pid} (port ${p.port}).`); }
        try { fs.unlinkSync(p.file); } catch {}
    }
    if (!pids && !gate && !servers.length) console.log("Nothing to stop.");
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
 *   2. an agent mid-turn (`working`) is revived by the new Servex (Agents.revive)
 *      unless it has no session, is a fork, or is not `revivable` — refuse only
 *      for those, name them, and let `--force` override;
 *   3. afterwards, wait for /api/agents to answer, and say so if it does not.
 *
 * ⚠ WHY THIS RUNS DETACHED FROM WMI, NOT FROM THIS PROCESS. `--restart` is
 * usually run BY an agent Servex itself spawned: Servex → claude → bash → this
 * script. `kill(pids.servex)` below is a `taskkill /t` — a TREE kill — and that
 * tree is rooted above Servex, so it took out the whole chain, including the
 * caller, before "restarting Servex" ever ran (09-28 1:44pm, 09-29 1:27pm;
 * `sustain.log` shows "killing Servex" and no "back as pid" line after it).
 * `spawn(..., {detached:true})` does NOT fix this on Windows: Windows records a
 * child's parent pid at CreateProcess time and never updates it, so `taskkill
 * /t` still finds it by walking that (dead) lineage. The one thing that
 * actually reparents a new process to something OTHER than the caller is
 * asking a different process to create it: WMI's `Win32_Process.Create` is
 * called BY the WMI provider host (WmiPrvSE.exe), so the process it creates is
 * WmiPrvSE's child, never ours — a `taskkill /t` on Servex can never reach it,
 * no matter who called `--restart` or how deep. */
// SERVEX_API_PORT is the same idea as SERVEX_HOME: a private proof (or a private Servex on
// another port) points this here instead of guessing whether 8090 is the real one or a stand-in.
const API = `http://127.0.0.1:${process.env.SERVEX_API_PORT || 8090}/api/agents`;

/* Launch `sustain.mjs --restart-detached [extra...]` via WMI so it lands
 * outside whatever tree called us, wait for CIM to hand back its new pid
 * (this is a local, sub-second round trip — not the restart itself), and
 * return it. `null` means the launch itself failed; the caller logs why.
 *
 * ⚠ Win32_Process.Create runs as WmiPrvSE, and hands the new process WHATEVER
 * environment WmiPrvSE itself has — not ours. `HOME` above is where THIS
 * process resolved its state (SERVEX_HOME if set, else %LOCALAPPDATA%\lew42\
 * servex); if the detached copy re-resolves it from WmiPrvSE's own, possibly
 * quite different, environment, it can read and write a DIFFERENT
 * servex.pid.json than the one this Servex actually uses — silently
 * "restarting" nothing, or (found while proving this fix) the real Servex
 * when only a private test one was meant. So the launch pins SERVEX_HOME
 * explicitly via `cmd.exe /c set "SERVEX_HOME=...">, which overrides just
 * that one variable and leaves every other env var (PATH, etc.) as WmiPrvSE
 * would have given it — `taskkill` and friends still resolve normally. */
function relaunch_detached(extra){
    // `set "SERVEX_HOME=...">` sits on a cmd.exe command line, unquoted from cmd's own point of
    // view (only the value after `=` is quoted, not the whole `set` statement) — `&`, `|`, `^` or
    // a stray `%` in HOME would be read as cmd syntax, not text. HOME is always a fixed,
    // machine-chosen path (SERVEX_HOME or %LOCALAPPDATA%\lew42\servex), never anything typed
    // in this session, but this still fails loudly instead of silently mis-launching Servex.
    if (/[&|^%<>]/.test(HOME)) throw new Error(`HOME contains a cmd.exe metacharacter, refusing to relaunch: ${HOME}`);
    if (/[&|^%<>]/.test(process.env.SERVEX_API_PORT || "")) throw new Error(`SERVEX_API_PORT contains a cmd.exe metacharacter, refusing to relaunch: ${process.env.SERVEX_API_PORT}`);
    const inner = [process.execPath, path.join(HERE, "sustain.mjs"), "--restart-detached", ...extra]
        .map(a => `"${a}"`).join(" ");
    // Same reasoning for SERVEX_API_PORT as for SERVEX_HOME just above — it is also only an env
    // var, so it is also invisible to WmiPrvSE unless pinned the same way.
    const port = process.env.SERVEX_API_PORT ? ` "SERVEX_API_PORT=${process.env.SERVEX_API_PORT}"&& set` : "";
    const cmdline = `cmd.exe /c set${port} "SERVEX_HOME=${HOME}"&& ${inner}`.replace(/'/g, "''");
    // ShowWindow must be typed [uint16] — CIM infers a type for every property
    // in -Property, and a bare `0` there fails with "Could not infer CimType".
    const ps = `$ErrorActionPreference='Stop'; `
        + `$si = New-CimInstance -ClassName Win32_ProcessStartup -ClientOnly -Property @{ShowWindow=[uint16]0}; `
        + `$r = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{CommandLine='${cmdline}'; ProcessStartupInformation=$si}; `
        + `if ($r.ReturnValue -ne 0) { Write-Error "Win32_Process.Create returned $($r.ReturnValue)"; exit 1 } `
        + `Write-Output $r.ProcessId`;
    const res = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", ps], { windowsHide: true, encoding: "utf8" });
    const pid = Number((res.stdout || "").trim());
    return res.status === 0 && pid ? pid : null;
}

/* The in-tree entry point for `--restart` on win32: check the one thing that
 * would make a relaunch pointless (no keeper), then hand off to WMI and get
 * out of the way. The detached copy — running as `--restart-detached`, same
 * argv otherwise — does the actual `restart()` below, parented to WmiPrvSE. */
function restart_outside_tree(){
    const pids = read();
    if (!pids || !alive(pids.keeper))
        return console.log("No keeper is running, so nothing would start Servex again. Start one: node Servex/sustain.mjs");
    if (process.argv.includes("--dry-run"))
        return restart(process.argv.includes("--force")); // nothing gets killed, no need to leave the tree

    const extra = process.argv.slice(3); // pass --force / --dry-run / anything else through unchanged
    let pid;
    try { pid = relaunch_detached(extra); }
    catch (e){
        note(`restart: refusing to relaunch — ${e.message}`);
        console.log(String(e.message));
        process.exitCode = 1;
        return;
    }
    if (!pid){
        note("restart: WMI relaunch failed — see the console output above");
        console.log("Could not relaunch outside the process tree (Win32_Process.Create failed); nothing was touched.");
        process.exitCode = 1;
        return;
    }
    note(`restart: relaunched detached as pid ${pid} (parent WmiPrvSE, not this chain) — it does the actual restart`);
    console.log(`Restarting outside the tree (pid ${pid}). Watch ${OUT} for "back as pid".`);
}

function sources(dir = HERE){
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
        e.name === "node_modules" || e.name.startsWith(".") ? []
        : e.isDirectory() ? sources(path.join(dir, e.name))
        : /\.(m?js)$/.test(e.name) ? [path.join(dir, e.name)] : []);
}

/* ⚠ Every message below is `note()`, never a bare `console.log`. On win32 this
 * whole function usually runs in the WMI-detached copy (see
 * `restart_outside_tree` above), which has no console at all — `console.log`
 * there is not "quiet", it is GONE, along with every refusal reason
 * (`restart_servex`'s own description used to promise "a refusal is written
 * in that log", which was false for exactly this reason; found in review).
 * `note()` always also writes to `sustain.log`, so every caller — a console,
 * this file's own OUT, or `ops.js`'s spawn (whose fd redirection only
 * captures the in-tree hop's few lines, not this) — can read what happened. */
async function restart(force){
    const pids = read();
    if (!pids || !alive(pids.keeper))
        return note("No keeper is running, so nothing would start Servex again. Start one: node Servex/sustain.mjs");

    const bad = sources().filter(f => spawnSync(process.execPath, ["--check", f], { windowsHide: true }).status !== 0);
    if (bad.length) return note(`Not restarting — these files do not parse:\n  ${bad.join("\n  ")}`);

    const agents = await fetch(API).then(r => r.json()).catch(() => []);
    const working = agents.filter(a => a.state === "working");
    const comesBack = a => !!a.session_id && a.role !== "fork" && a.revivable !== false;
    const revived = working.filter(comesBack).map(a => a.id);
    const busy = working.filter(a => !comesBack(a)).map(a => a.id);
    if (revived.length) note(`Mid-turn, will be revived after the restart: ${revived.join(", ")}.`);
    if (busy.length) note(`Mid-turn, would NOT come back: ${busy.join(", ")}.`);
    if (busy.length && !force)
        return note(`Not restarting — wait for those, or add --force.`);
    if (process.argv.includes("--dry-run"))
        return note(`Dry run: would restart${busy.length ? " (forced)" : ""}; nothing killed.`);

    note(`restart asked for${busy.length ? ` (forced past ${busy.join(", ")})` : ""} — killing Servex ${pids.servex}`);
    kill(pids.servex);

    for (let i = 0; i < 30; i++){
        await new Promise(r => setTimeout(r, 1000));
        const now = read();
        if (now?.servex !== pids.servex && await fetch(API).then(r => r.ok).catch(() => false))
            return note(`Servex is back as pid ${now.servex}, running the new code.`);
    }
    note(`Servex did not answer within 30s. The keeper keeps retrying; see ${OUT}.`);
}

/* One generation of Servex. The backoff doubles only while it keeps dying
 * quickly; a child that stayed up past HEALTHY resets it, because one crash
 * after an hour of work is not a loop. */
function start(backoff){
    /* Guard (2026-09-29): a missing express or agent SDK is a crash loop no restart can fix —
     * reinstall it first (rate-limited; Servex/ensure-deps.mjs says why). */
    try { ensure_deps(path.join(HERE, ".."), note); } catch (e) { note(`dependency check failed: ${e.message}`); }
    const began = Date.now();
    const out = fs.openSync(OUT, "a");

    const child = spawn(process.execPath, ["--report-on-fatalerror", `--report-directory=${REPORTS}`, ENTRY], {
        cwd: path.join(HERE, ".."),
        stdio: ["ignore", out, out],
        windowsHide: true
        // ⚠ no windowsHide: Servex spawns agents and servers, and a process with no console makes
        // its children pop visible windows. The keeper is launched with a HIDDEN console
        // (PowerShell Start-Process -WindowStyle Hidden) and everything below inherits it.
        // (2026-09-28 windowsHide sweep: added windowsHide: true above anyway, belt-and-braces —
        // a safe no-op here since the parent's console is already hidden, and a real fix if this
        // ever runs from a parent that has a visible console. The reasoning above still holds.)
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
// `--restart`: on win32, hop out of the caller's tree first (see the comment
// above `restart_outside_tree`). `--restart-detached` is that hop's landing
// spot — the same code path, just not reachable by `taskkill /t` anymore —
// and is not meant to be typed by hand.
else if (verb === "--restart") process.platform === "win32" ? restart_outside_tree() : restart(process.argv.includes("--force"));
else if (verb === "--restart-detached") restart(process.argv.includes("--force"));
else keep();
