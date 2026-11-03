import fs from "fs";

/* Shared by watch.js (public/) and server.js's supervisor (Server/ + server.js):
 * turns a raw fs.watch "change" event into a REAL change. On Windows, with
 * last-access tracking on, just READING a file (over an hour since its last
 * read) touches its access time and fs.watch reports that exactly like a
 * write — same "change" event, same file, nothing to tell them apart at the
 * event itself. The trap and the measurement: Server/doc/watch.md.
 *
 * One instance owns one Map of file → last known mtimeMs, so one process can
 * run two of these (the public/ watcher and the supervisor's Server/ watcher)
 * without their maps mixing. */
export default class MtimeFilter {
	constructor(){
		this.mtimes = new Map();
	}

	// A "rename" (Windows' name for create/delete/rename alike) always passes —
	// call this to keep the map current so the "change" events that follow it
	// compare against the right mtime.
	remember(file){
		fs.stat(file, (err, stat) => {
			if (err) this.mtimes.delete(file);         // gone — nothing to compare next time
			else this.mtimes.set(file, stat.mtimeMs);
		});
	}

	// A "change" passes only when the mtime really moved. `done(true|false)` —
	// async because it costs one stat(); there is no cheaper correct answer.
	passes(file, done){
		fs.stat(file, (err, stat) => {
			if (err) { this.mtimes.delete(file); return done(true); }   // deleted mid-flight — let it through
			const seen = this.mtimes.get(file);
			this.mtimes.set(file, stat.mtimeMs);
			// Never seen this file before: only a write racing us — one that just
			// landed in the last 10s — looks like a real change; anything older is
			// a stale file's first READ under this process, the exact trap above.
			if (seen === undefined) return done(Date.now() - stat.mtimeMs <= MtimeFilter.RECENT_MS);
			done(stat.mtimeMs !== seen);
		});
	}
}

MtimeFilter.RECENT_MS = 10_000;
