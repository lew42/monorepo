/* THE PROOFS — `node Servex/proof/proof.mjs` with Servex already running.
 *
 * Every claim Servex makes about surviving something is checked here, out loud,
 * and each one prints PASS or FAIL with the numbers it measured. Run it after
 * any change to Process.js or Log.js. It takes about fifteen seconds.
 *
 * The process proofs run against a throwaway SERVEX_HOME so they never write
 * into the real log folder. The log proof runs against the REAL running Servex
 * on 127.0.0.1:8090, because the thing being proven is precisely that two other
 * processes appending THROUGH Servex cannot tear a line. */

import fs from "fs";
import net from "net";
import os from "os";
import path from "path";
import { spawn } from "child_process";

const BASE = process.argv[2] || "http://127.0.0.1:8090";
const SCRATCH = path.join(os.tmpdir(), `servex-proof-${process.pid}`);
process.env.SERVEX_HOME = SCRATCH;

const { default: Log } = await import("../Log.js");
const { default: Process } = await import("../Process.js");

const log = new Log();
const wait = ms => new Promise(done => setTimeout(done, ms));
let failures = 0;

function check(n, claim, ok, detail){
    if (!ok) failures++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${n}. ${claim}\n      ${detail}`);
}

/* 1. restart() when the child is ALREADY DEAD. The 2026-09-19 incident was a
 *    restart that waited forever for an exit event from a process that had
 *    already exited. */
{
    const p = new Process({ name: "dead", log, autorestart: false, command: process.execPath, args: ["-e", "setTimeout(()=>{},80)"] });
    await p.start();
    await wait(600);

    const was = p.child;
    const t0 = Date.now();
    await p.restart();
    const took = Date.now() - t0;

    check(1, "restart() on an already-dead child spawns a fresh one instead of waiting forever",
        was === null && !!p.child && took < 2000,
        `child was ${was === null ? "already null" : "still set"}; restart took ${took}ms; new pid ${p.child?.pid}`);
    await p.stop();
}

/* 2. A child that exits the instant it starts. Must back off, and must give up. */
{
    const p = new Process({ name: "crashy", log, backoff_min: 50, backoff_max: 200,
        command: process.execPath, args: ["-e", "process.exit(3)"] });

    const t0 = Date.now();
    await p.start();
    while (p.status !== "errored" && Date.now() - t0 < 15000) await wait(100);
    const took = Date.now() - t0;

    check(2, "a child that crashes on boot backs off and then gives up — never a tight loop",
        p.status === "errored" && p.restarts === 9 && took > 800,
        `status ${p.status} after ${p.restarts} restarts in ${took}ms (a tight loop would be thousands in that time)`);
}

/* 3. The port is already held by somebody else. Must not spawn at all. */
{
    const squatter = net.createServer(s => s.end());
    await new Promise(done => squatter.listen(0, "127.0.0.1", done));
    const port = squatter.address().port;

    const p = new Process({ name: "squatted", log, port, command: process.execPath, args: ["-e", "setInterval(()=>{},1000)"] });
    const status = await p.start();

    check(3, "a port already held by a stranger is detected BEFORE spawning",
        status === "port-taken" && p.child === null,
        `status ${status}, child ${p.child === null ? "never spawned" : "spawned anyway"} on port ${port}`);
    squatter.close();
}

/* 4. A process that was healthy for a while and then crashes restarts at once,
 *    rather than serving the backoff its last crash-loop earned. */
{
    const p = new Process({ name: "settled", log, backoff_min: 50, backoff_max: 200, settled_after: 300,
        command: process.execPath, args: ["-e", "setTimeout(()=>process.exit(1),500)"] });
    await p.start();
    await wait(900);

    check(4, "a crash after a healthy run resets the backoff — one crash is not a loop",
        p.restarts === 1,
        `restarts counted back to ${p.restarts} after the child stayed up past settled_after`);
    await p.stop();
}

/* 5. stop() kills GRANDCHILDREN too. Every dev server here is `node server.js`,
 *    a supervisor that forks the real server; killing only the parent on Windows
 *    leaves the real one holding the port forever. */
{
    const grandchild = `const {spawn}=require("child_process");`
        + `const c=spawn(process.execPath,["-e","require('net').createServer().listen(PORT_HERE,'127.0.0.1')"],{stdio:"ignore"});`
        + `setInterval(()=>{},1000);`;

    const held = await new Promise(done => { const s = net.createServer(); s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => done(p)); }); });

    const p = new Process({ name: "tree", log, autorestart: false,
        command: process.execPath, args: ["-e", grandchild.replace("PORT_HERE", held)] });
    await p.start();
    await wait(1200);

    const before = await listening(held);
    await p.stop();
    await wait(600);
    const after = await listening(held);

    check(5, "stop() takes the whole process tree, not just the child it spawned",
        before && !after,
        `the grandchild's port ${held} was ${before ? "held" : "NOT held"} before stop and ${after ? "STILL HELD" : "free"} after`);
}

/* 6. THE SINGLE WRITER. Two separate OS processes, 200 appends each, all of them
 *    going through Servex's own HTTP door. 400 lines, every one parseable, and
 *    each poster's own 200 in the order it sent them. */
{
    const name = `proof-${Date.now().toString(36)}`;
    const before = Date.now();

    const posters = ["a", "b"].map(who => new Promise((done, fail) => {
        const child = spawn(process.execPath, [path.join(import.meta.dirname, "proof-poster.mjs"), BASE, name, who, "200"], { stdio: "inherit" });
        child.on("exit", code => code === 0 ? done(who) : fail(new Error(`poster ${who} exited ${code}`)));
    }));

    try {
        await Promise.all(posters);
    } catch (e){
        check(6, "two concurrent posters produce 400 parseable lines with no torn line", false, e.message);
    }

    const lines = await (await fetch(`${BASE}/log/${name}?n=1000`)).json();
    const ordered = who => {
        const mine = lines.filter(l => l.who === who).map(l => l.i);
        return mine.length === 200 && mine.every((n, k) => n === k);
    };
    const torn = lines.filter(l => l.bad).length;

    check(6, "two concurrent posters produce 400 parseable lines, in order, with no torn line",
        lines.length === 400 && torn === 0 && ordered("a") && ordered("b"),
        `${lines.length} lines in ${Date.now() - before}ms, ${torn} unparseable, poster a ${ordered("a") ? "in order" : "OUT OF ORDER"}, poster b ${ordered("b") ? "in order" : "OUT OF ORDER"} — log "${name}"`);
}

function listening(port){
    return new Promise(done => {
        const s = net.connect({ host: "127.0.0.1", port });
        const answer = hit => { s.destroy(); done(hit); };
        s.on("connect", () => answer(true));
        s.on("error", () => answer(false));
        s.setTimeout(700, () => answer(false));
    });
}

log.close();
try { fs.rmSync(SCRATCH, { recursive: true, force: true }); } catch { /* it is a temp dir */ }

console.log(failures ? `\n${failures} FAILED` : "\nall proofs passed");
process.exit(failures ? 1 : 0);
