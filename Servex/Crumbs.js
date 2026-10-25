import fs from "node:fs";
import cp from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
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

	static open(){ this.fd = fs.openSync(this.FILE, "a"); }

	static drop(text){
		try {
			if (this.fd == null) this.open();
			fs.writeSync(this.fd, `${new Date().toISOString().slice(11, 23)} ${text}\n`);
			if (++this.writes % 500 === 0 && fs.fstatSync(this.fd).size > this.MAX){   // rotate: keep one older file
				fs.closeSync(this.fd); this.fd = null;
				fs.renameSync(this.FILE, this.FILE.replace(/\.log$/, ".old.log"));
			}
		} catch { /* a breadcrumb must never be the crash */ }
	}

	static install(){
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
		Crumbs.drop(`start pid=${process.pid}`);
	}
}

Crumbs.install();
