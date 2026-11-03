import fs from "node:fs";
import cp from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { Worker, isMainThread } from "node:worker_threads";
import { place } from "./home.js";

/* BREADCRUMBS — the last thing Servex did before a native fast-fail kills it with no stack, no report, no event.
 *
 *   node --import ./Servex/Crumbs.js Servex/index.js        (sustain.mjs launches Servex this way)
 *
 * Exit 3221226505 (0xC0000409) skips every JS handler, so the only evidence is what was already on disk. This writes, synchronously
 * (a sync write is on disk before the crash), one line before each child_process call and each fs.watch open/close, plus a
 * heartbeat every 5 s (memory, open handles, watchers). sustain.mjs copies the tail into `logs/crashes.jsonl` when Servex dies.
 * Two files, ~4 MB each, the older is replaced: bounded. Why, and what the 53 crashes showed: doc/restart.md. */
export default class Crumbs {
	static FILE = place("logs", "crumbs.log");
	static MAX = 4 * 1024 * 1024;
	static fd = null;
	static writes = 0;
	static watchers = 0;
	static LAG_MS = 5000;   // a main thread silent this long gets a LAG line (CrumbsWatch.js)
	static ticks = new Int32Array(new SharedArrayBuffer(4));
	static last = new Uint8Array(new SharedArrayBuffer(400));   // the last operation begun, for the watchdog thread
	static encoder = new TextEncoder();

	static open(){ this.fd = fs.openSync(this.FILE, "a"); }

	static drop(text){
		try {
			if (this.fd == null) this.open();
			fs.writeSync(this.fd, `${new Date().toISOString().slice(11, 23)} ${text}\n`);
			if (!/^(hb|req>|item>)/.test(text)){ const w = this.encoder.encodeInto(text, this.last.subarray(0, this.last.length - 1)); this.last[w.written] = 0; }
			if (++this.writes % 500 === 0 && fs.fstatSync(this.fd).size > this.MAX){   // rotate: keep one older file
				fs.closeSync(this.fd); this.fd = null;
				fs.renameSync(this.FILE, this.FILE.replace(/\.log$/, ".old.log"));
			}
		} catch { /* a breadcrumb must never be the crash */ }
	}

	static install(){
		if (!isMainThread) return;   // --import is inherited by every Worker: without this each watchdog spawns another watchdog, unbounded (OOM crash loop 2026-10-25)
		if (globalThis.__crumbs) return; globalThis.__crumbs = Crumbs;   // the class itself, so a caller drops a crumb without importing (an import installs)
		for (const name of ["spawn", "spawnSync", "exec", "execFile", "execSync", "execFileSync", "fork"]){
			const real = cp[name];
			cp[name] = function(...args){
				const shown = [args[0], Array.isArray(args[1]) ? args[1].join(" ") : typeof args[1] === "string" ? args[1] : ""].join(" ").replace(/\s+/g, " ");
				Crumbs.drop(`${name} len=${shown.length} ${shown.slice(0, 120)}`);
				return real.apply(this, args);
			};
		}
		const watch = fs.watch;
		fs.watch = function(target, ...rest){
			Crumbs.watchers++; Crumbs.drop(`watch+ ${target}`);
			const w = watch.call(this, target, ...rest);
			w.once("close", () => { Crumbs.watchers--; Crumbs.drop(`watch- ${target}`); });
			return w;
		};
		syncBuiltinESMExports();   // `import { spawn } from "node:child_process"` sees the wrapped functions
		setInterval(() => {
			const m = process.memoryUsage();
			Crumbs.drop(`hb rss=${Math.round(m.rss / 1048576)}M heap=${Math.round(m.heapUsed / 1048576)}M ext=${Math.round(m.external / 1048576)}M handles=${process.getActiveResourcesInfo().length} watchers=${Crumbs.watchers}`);
		}, 5000).unref();
		setInterval(() => Atomics.add(Crumbs.ticks, 0, 1), 1000).unref();
		try {
			new Worker(new URL("./CrumbsWatch.js", import.meta.url), { workerData: { shared: Crumbs.ticks.buffer, text: Crumbs.last.buffer, file: Crumbs.FILE, LAG_MS: Crumbs.LAG_MS } }).unref();
		} catch (e) { Crumbs.drop(`lag watchdog not started: ${e.message}`); }
		Crumbs.drop(`start pid=${process.pid}`);
	}
}

Crumbs.install();
