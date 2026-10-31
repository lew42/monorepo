import Store from "../Store.js";

/* A saved log kept in memory: the lab's stand-in for one task.jsonl. Nothing touches a disk or a socket.
   `entries` is every line saved, with the tab that wrote it. `open(Class)` loads it the way a page load does:
   the real `Class.open(url)` (Item.js), whose Store is the LabTape.Store below. Doc: readme.md. */
export default class LabTape {

	static count = 0;
	static sources = new Map();   // url -> { tape, tab, write }: what LabTape.Store reads when Item.open asks it to open a url

	entries = [];
	opens = 0;

	// `first`: the file's first line (the object's starting values). `stamp`: add by/ts to every saved line, as the item tool does.
	constructor({ first, stamp = true, now = () => new Date().toISOString() } = {}){
		this.id = "tape-" + ++LabTape.count;
		this.stamp = stamp;
		this.now = now;
		if (first) this.entries.push({ line: first, tab: "file" });
	}

	get lines(){ return this.entries.map(e => e.line); }
	json(){ return JSON.parse(JSON.stringify(this.lines)); }   // the lines as a file read gives them back: parsed text

	// The writer: keep one line. `ts` is what a replayed Task pins its clock to (Task.replay_line).
	save(line, tab = "you"){
		const saved = this.stamp ? { ...line, by: "owner", ts: this.now() } : line;
		this.entries.push({ line: saved, tab });
		this.on_save?.(saved, tab);
		return saved;
	}

	// A fresh object built from the lines through the real Class.open. `write`: a live tab, whose later changes are saved here
	// under `tab`; otherwise a reader, whose changes go nowhere.
	open(Class, { tab = "reload", write = false } = {}){
		const url = `lab://${this.id}/open-${++this.opens}`;
		LabTape.sources.set(url, { tape: this, tab, write });
		return Class.open(url);
	}

	// Let every attached store flush the lines it queued this tick (a Store flushes one microtask after a change).
	static tick(){ return new Promise(resolve => queueMicrotask(resolve)); }
}

// The real Store (replay, attach, the nesting of each line) with only the disk and the network cut out: it opens from a
// LabTape instead of fetch(), and flushes into one instead of FsFile.
LabTape.Store = class LabStore extends Store {
	open(){
		return this.opening ??= Promise.resolve().then(() => {
			const { tape, tab, write } = LabTape.sources.get(this.url);
			this.assign({ tab, tape: write ? tape : null });
			return this.read(tape.json());
		});
	}
	flush(){
		const lines = this._queue.splice(0);
		this._flushing = false;
		for (const line of lines) this.tape?.save(line, this.tab);
	}
};
