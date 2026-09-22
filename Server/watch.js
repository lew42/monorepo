import fs from "fs";
import path from "path";
import MtimeFilter from "./MtimeFilter.js";

const PUBLIC = path.resolve("public");

/* ONE recursive fs.watch handle on public/, shared by everything in the process
 * that wants to know a file changed — `LiveReload` and `Directory` both come
 * through here.
 *
 * ⚠ WHY IT IS ONE HANDLE, AND WHY THAT MATTERS. chokidar opened one fs.watch
 * handle PER DIRECTORY (8,532 of them here, because two chokidars each covered
 * all 1,865 dirs). On Windows a handle whose directory is deleted underneath it
 * does not close and does not go quiet — it fires `change` events in a tight
 * loop, for ever, measured at ~6,400 a second. Six such stranded handles were
 * 38,212 events/s and a pinned core. `recursive: true` opens a single handle on
 * public/ itself, which nothing deletes, so the whole class is gone — and as a
 * bonus, directories under public/ are no longer locked against renaming.
 * Measurements and the profile: doc/spin.md.
 *
 * ⚠ Windows' ReadDirectoryChangesW has a fixed buffer. A burst larger than it
 * (thousands of files at once — a `git checkout` of the whole tree) can overflow
 * and drop events; the page you reload after one of those is on you. chokidar's
 * per-directory readdir diffing was more thorough and cost a core to be so.
 *
 * ⚠ READING A FILE FIRES A "change" EVENT TOO — this machine has Windows'
 * last-access tracking ON (`fsutil behavior query DisableLastAccess` → 2), and
 * libuv asks for LAST_ACCESS notifications along with writes. The first read of
 * a file whose access time is over an hour stale touches that timestamp and
 * fs.watch reports it exactly like a write: same "change" event, same file.
 * Serving a page reads every file it needs, so loading a page fires a "change"
 * for each one — LiveReload used to forward every one of those, so the SECOND
 * load of a page (now fresh) was quiet but the FIRST looked like a live edit
 * and reloaded the tab it had just opened. chokidar never had this problem
 * because it diffed mtime before telling anyone; raw fs.watch (this file, for
 * the reasons above) does not, on its own.
 *   Measured on the mastermind's own server (port 8123): a plain `grep -r` over
 * core/ — no file written — produced one 471-path "Changed" batch.
 *   Fix: `MtimeFilter` (`./MtimeFilter.js`) keeps a Map of file → last known
 * mtimeMs and only lets a "change" through when the mtime actually moved. A
 * file we haven't seen yet passes only if its mtime is very fresh (within
 * 10s) — that is a real write racing us, not a stale read. `rename`
 * (Windows' name for create/delete/rename alike) always passes and refreshes
 * the map, so a legitimate edit is never held back by this. One `stat` per
 * event; no readdir. The same class watches `Server/` for server.js's own
 * supervisor, below in this doc's sibling — Server/doc/watch.md. */

const listeners = new Set();
let watcher = null;
const filter = new MtimeFilter();

/* `.json` covers the two directory.json files this server writes itself — without
 * it, every rebuild feeds its own watcher. */
const ignored = file =>
	file.endsWith(".json") || file.includes(".git") || file.includes("node_modules");

function start(){
	console.log(`Watching ${PUBLIC} (one recursive fs.watch handle)`);

	watcher = fs.watch(PUBLIC, { recursive: true, persistent: true }, (event, name) => {
		if (!name) return;                                  // an event about public/ itself
		const file = path.join(PUBLIC, name);
		if (ignored(file)) return;

		/* Windows says "rename" for anything that changes the SHAPE of the tree —
		 * a file or directory created, deleted or renamed — and "change" for a
		 * write into an existing file (or, spuriously, a read — see above).
		 * Directory.js only cares about the first. */
		const kind = event === "rename" ? "rename" : "change";

		if (kind === "rename") {
			filter.remember(file);
			for (const listener of listeners) listener(file, kind);
		} else {
			filter.passes(file, ok => {
				if (!ok) return;
				for (const listener of listeners) listener(file, kind);
			});
		}
	});

	// Unobserved, a watcher error throws and takes the dev server down with it.
	watcher.on("error", err => console.error("watch(public) error:", err));
}

/* watch(fn) → fn(absolute file path, "rename" | "change"). Returns an unsubscribe. */
export default function watch(listener){
	listeners.add(listener);
	if (!watcher) start();
	return () => listeners.delete(listener);
}
