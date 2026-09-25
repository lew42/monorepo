/* THE GATE — port 80 never refuses, even while Servex is down.
 *
 *   node Servex/gate.mjs [listen=80] [target=8079]
 *
 * When Servex died (a crash, or a `sustain.mjs --restart`), port 80 had no
 * listener for a second or two, and a reload in that window drew Chrome's own
 * "connection refused" page. This process holds port 80 instead and does
 * nothing but pass bytes to Servex's proxy on `target`. While the proxy is
 * down, a new visitor simply waits: the gate retries every 200 ms, for up to
 * 20 s, and the page loads late instead of breaking.
 *
 * It is a plain TCP pipe on purpose — no HTTP, no routing, no dependencies —
 * so there is nearly nothing in it that can crash, and it never needs a
 * restart when Servex changes.
 *
 * ⚠ It must outlive Servex, so `launch()` starts it through orphan.mjs — the
 * same launcher the dev servers use, which says why a plain child would die
 * with Servex.
 *
 * Launching twice is safe: a second gate finds the port taken and exits 0. */

import net from "node:net";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { place } from "./home.js";
import { orphan } from "./orphan.mjs";

const SELF = fileURLToPath(import.meta.url);
const RETRY = 200, GIVE_UP = 20000;

/* Start a gate that survives whatever started it. */
export function launch(listen = 80, target = 8079){
    return orphan({ command: process.execPath, args: [SELF, String(listen), String(target)], out: place("logs", "gate.log") })
        .catch(e => console.error(`gate: launch failed — ${e.message}`));
}

/* One visitor. Its bytes wait (paused) until the proxy answers, then flow both
 * ways; either side closing or failing closes the other. */
function serve(client, target){
    const began = Date.now();
    let up = null, done = false;
    const end = () => { done = true; client.destroy(); up?.destroy(); };
    client.pause();
    client.on("error", end).on("close", end);

    const attempt = () => {
        if (done) return;
        const socket = net.connect(target, "127.0.0.1");
        socket.once("connect", () => {
            if (done) return socket.destroy();
            up = socket;
            socket.on("error", end).on("close", end);
            client.pipe(socket); socket.pipe(client); client.resume();
        });
        socket.once("error", () => {
            if (up === socket) return;           // after connecting, `end` handles it
            socket.destroy();
            if (Date.now() - began > GIVE_UP) return end();
            setTimeout(attempt, RETRY);
        });
    };
    attempt();
}

function gate(listen, target){
    const server = host => net.createServer(client => serve(client, target)).listen(listen, host);

    /* ⚠ Both loopbacks — Chrome tries [::1] first for `*.localhost` (see
     * ReverseProxy.js). 127.0.0.1 is the one that matters: taken means another
     * gate is already here, so this one leaves quietly. */
    server("127.0.0.1").on("error", err => {
        if (err.code === "EADDRINUSE") process.exit(0);
        console.error(`gate: could not listen on 127.0.0.1:${listen} — ${err.code}`); process.exit(1);
    }).on("listening", () => {
        server("::1").on("error", () => {});
        fs.writeFileSync(place("gate.pid.json"),
            JSON.stringify({ pid: process.pid, listen, target, started: new Date().toISOString() }, null, 2));
        console.log(`${new Date().toISOString()} gate ${process.pid}: ${listen} -> 127.0.0.1:${target}`);
    });
}

if (process.argv[1] && fs.realpathSync(process.argv[1]).toLowerCase() === SELF.toLowerCase()){   // run, not imported
    const [mode, ...rest] = process.argv[2]?.startsWith("--") ? process.argv.slice(2) : [null, ...process.argv.slice(2)];
    const [listen = 80, target = 8079] = rest.map(Number);
    if (mode === "--launch") launch(listen, target);            // the same launch, from a shell
    else gate(listen, target);
}
