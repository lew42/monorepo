import fs from "fs";
import path from "path";

const PUBLIC = path.resolve("public");

/* ONE recursive fs.watch handle on public/, shared by everything in the process
 * that wants to know a file changed — `LiveReload` and `Directory` both come
 * through here.
 *
 * ⚠ WHY IT IS ONE HANDLE, AND WHY THAT MATTERS. chokidar opens one fs.watch
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
 * per-directory readdir diffing was more thorough and cost a core to be so. */

const listeners = new Set();
let watcher = null;

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
		 * write into an existing file. Directory.js only cares about the first. */
		const kind = event === "rename" ? "rename" : "change";
		for (const listener of listeners) listener(file, kind);
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
