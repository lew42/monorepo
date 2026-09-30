/**
 * Logger — give any object its own nested log: `this.log("x")`, and
 * `this.log.group("method()", fn)` to make one call its own group that
 * contains every log made inside it, sync or async.
 *
 *   const logger = Logger.attach(counter);        // counter.log(...) now works
 *   counter.log("starting");
 *   counter.log.group("increment()", () => {
 *       counter.log("was", 0);
 *       counter.log("now", 1);
 *   });
 *
 *   Logger.wrap(counter, ["increment", "load"]);  // every call is its own group
 *   counter.increment();                          // logs inside land in that group
 *
 * An entry is `{ kind, t, depth, args, tag }` (a log line — `tag` is `null`
 * for a plain `log()`, or a word `note(tag, ...)` set, for a view to render
 * differently) or `{ kind: "group", t, depth, label, entries, duration }` (a
 * group, holding its own children — `duration` is the milliseconds between
 * open and close, set by `end()`, and missing while the group is still
 * open). `logger.entries` is the whole tree, root to leaf — that tree is
 * what `LogView` renders.
 *
 * Outputs are opt-in side effects, pushed onto `logger.outputs`: `Logger.Console`
 * (real `console.group`/`console.log`), `Logger.JSONL` (one line per event, for a
 * live stream). `Logger.Memory` is the one that is NOT opt-in — it IS the tree in
 * `logger.entries`, attached by the constructor, capped so a long-lived object
 * can't leak memory one log line at a time.
 *
 * Writing a JSONL stream to disk is the caller's job — `logger.outputs.push(new
 * Logger.JSONL())`, then whenever you want, write `output.text()` to a file
 * yourself. This module never touches the filesystem.
 */
export default class Logger {

	constructor(...args){
		this.depth = 0;
		this.stack = [];
		this.assign({ cap: 2000 }, ...args);
		this.memory = this.memory || new Logger.Memory({ cap: this.cap });
		this.outputs = [this.memory, ...(this.outputs || [])];
	}

	assign(...args){ return Object.assign(this, ...args); }

	get entries(){ return this.memory.entries; }

	// Where the next entry goes: the open group's own list, or the root.
	target(){
		return this.stack.length ? this.stack[this.stack.length - 1].entries : this.entries;
	}

	log(...args){
		return this.record(null, args);
	}

	// Same as `log()`, with one word attached (`entry.tag`) that a view can key
	// off to render the line differently — `LogView` reads "muted" (a skipped
	// step, shown dim) and "highlight" (a line worth catching the eye, shown
	// bright). Plain `log()` calls get `tag: null`, so nothing else changes.
	note(tag, ...args){
		return this.record(tag, args);
	}

	record(tag, args){
		const entry = { kind: "log", t: Date.now(), depth: this.depth, args, tag };
		this.target().push(entry);
		for (const out of this.outputs) out.write?.(entry, this);
		return entry;
	}

	// No `fn`: opens a group you close yourself with `end()`. With `fn`: opens,
	// runs it (its return value passed through, a promise awaited), and closes
	// it for you — so a group can wrap a sync OR an async call the same way.
	group(label, fn){
		const entry = { kind: "group", t: Date.now(), depth: this.depth, label, entries: [] };
		this.target().push(entry);
		this.stack.push(entry);
		this.depth++;
		for (const out of this.outputs) out.open?.(entry, this);

		if (!fn) return entry;

		const close = () => this.end();
		try {
			const result = fn(entry);
			if (result && typeof result.then === "function")
				return result.then(value => { close(); return value; }, error => { close(); throw error; });
			close();
			return result;
		} catch (error){
			close();
			throw error;
		}
	}

	// Closes the innermost open group. Pairs with `group(label)` called with no
	// `fn` — a group opened WITH a function closes itself.
	end(){
		const entry = this.stack.pop();
		if (!entry) return;
		this.depth--;
		entry.duration = Date.now() - entry.t;
		for (const out of this.outputs) out.close?.(entry, this);
	}

	// Gives ANY object `this.log(...)`, `this.log.group(...)`, `this.log.end()`.
	// `opts` (name, cap, outputs) become the new Logger's own fields.
	static attach(obj, opts = {}){
		const logger = new Logger(opts);

		const log = (...args) => logger.log(...args);
		log.group = (label, fn) => logger.group(label, fn);
		log.note = (tag, ...args) => logger.note(tag, ...args);
		log.end = () => logger.end();
		log.logger = logger;

		obj.log = log;
		obj.logger = logger;
		return logger;
	}

	// Wraps each named method so every CALL becomes its own group, holding
	// every log the call makes — sync or async. Attaches a Logger first if
	// `obj` doesn't have one yet.
	static wrap(obj, methods){
		const logger = obj.logger || Logger.attach(obj);

		for (const name of methods){
			const original = obj[name];
			if (typeof original !== "function") continue;

			obj[name] = function(...args){
				return logger.group(`${name}(${args.map(a => Logger.short(a)).join(", ")})`, () => original.apply(this, args));
			};
		}

		return logger;
	}

	// A short, safe one-liner for an argument inside a group's own label —
	// never throws on a circular object, never floods the label with JSON.
	static short(value){
		if (typeof value === "string") return value.length > 30 ? value.slice(0, 27) + "…" : value;
		try {
			const text = JSON.stringify(value);
			return text.length > 30 ? text.slice(0, 27) + "…" : text;
		} catch {
			return String(value);
		}
	}

	// Reads a JSONL stream (one `Logger.JSONL` line per event) back into the
	// same nested tree `logger.entries` holds, for `LogView` to render. The
	// inverse of `Logger.JSONL`'s own `write`/`open`/`close` lines.
	static from_jsonl(text){
		const root = { entries: [] };
		const stack = [root];

		for (const line of text.split("\n")){
			if (!line.trim()) continue;
			const row = JSON.parse(line);
			const parent = stack[stack.length - 1];

			if (row.kind === "open"){
				const group = { kind: "group", t: row.t, depth: row.depth, label: row.label, entries: [] };
				parent.entries.push(group);
				stack.push(group);
			} else if (row.kind === "close"){
				if (stack.length > 1) stack.pop().duration = row.duration;
			} else {
				parent.entries.push({ kind: "log", t: row.t, depth: row.depth, args: row.args, tag: row.tag ?? null });
			}
		}

		return root.entries;
	}
}

// In memory — the default, always-on output. `logger.entries` (the getter
// above) just reads `logger.memory.entries`, so this class doubles as the
// live data structure every other output only observes.
//
// ⚠ `cap` bounds the number of TOP-LEVEL entries only, dropping the oldest
// once there are too many — a group that is still open keeps growing inside
// itself regardless. Good enough for a first version; a truly unbounded
// stream of long-lived groups wants a real ring buffer, not built here.
Logger.Memory = class LoggerMemory {
	constructor(...args){
		this.cap = 1000;
		this.entries = [];
		this.assign(...args);
	}
	assign(...args){ return Object.assign(this, ...args); }

	write(entry, logger){ this.keep(logger); }
	open(entry, logger){ this.keep(logger); }
	close(){}

	keep(logger){
		while (logger.entries.length > this.cap) logger.entries.shift();
	}
};

// Real `console.group`/`console.groupEnd`, so a logged object's calls show up
// nested in the browser console exactly the way they render in `LogView`.
Logger.Console = class LoggerConsole {
	write(entry){ console.log(...entry.args); }
	open(entry){ console.group(entry.label); }
	close(){ console.groupEnd(); }
};

// One JSON line per event (`open` / `log` / `close`), in the order they
// happened — a flat log that still carries the nesting, via `depth`.
// `Logger.from_jsonl(text)` is the read-back half.
Logger.JSONL = class LoggerJSONL {
	constructor(...args){
		this.lines = [];
		this.assign(...args);
	}
	assign(...args){ return Object.assign(this, ...args); }

	write(entry){ this.lines.push(JSON.stringify({ kind: "log", t: entry.t, depth: entry.depth, args: entry.args, tag: entry.tag })); }
	open(entry){ this.lines.push(JSON.stringify({ kind: "open", t: entry.t, depth: entry.depth, label: entry.label })); }
	close(entry){ this.lines.push(JSON.stringify({ kind: "close", t: Date.now(), depth: entry.depth, duration: entry.duration })); }

	text(){ return this.lines.join("\n"); }
};

export { Logger };
