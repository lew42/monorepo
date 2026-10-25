import fs from "node:fs";
import { workerData } from "node:worker_threads";

/* Lag watchdog thread (Crumbs.install): the main thread bumps a tick every second; if it stops for LAG_MS this thread, the only one
 * that can write during a synchronous stall, logs the last operation the main thread began, and how long the stall lasted (doc/restart.md). */
const { shared, text, file, LAG_MS } = workerData;
const ticks = new Int32Array(shared), bytes = new Uint8Array(text);
const line = msg => { try { fs.appendFileSync(file, `${new Date().toISOString().slice(11, 23)} ${msg}\n`); } catch {} };
let seen = Atomics.load(ticks, 0), at = Date.now(), stuck = false;
setInterval(() => {
    const now = Atomics.load(ticks, 0);
    if (now !== seen){
        if (stuck) line(`LAG over: the main thread was stuck ${((Date.now() - at) / 1000).toFixed(1)} s`);
        seen = now; at = Date.now(); stuck = false;
    } else if (!stuck && Date.now() - at > LAG_MS){
        stuck = true;
        const end = bytes.indexOf(0);
        line(`LAG ${(LAG_MS / 1000)}+ s: the main thread has not run since its last operation: ${new TextDecoder().decode(bytes.subarray(0, end < 0 ? bytes.length : end))}`);
    }
}, 1000);
