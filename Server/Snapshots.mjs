// Snapshots: the "build step" for a log. Reads task.jsonl / session.jsonl files, replays each, and writes `<name>.snapshot.json`
// beside it: the item's final saved shape plus how much of the log that covers. The log itself is never touched. Doc: core/Item/doc/snapshots.md
//
//   node Server/Snapshots.mjs <file-or-folder>...            DRY RUN (the default): says what it would write, writes nothing
//   node Server/Snapshots.mjs <file-or-folder>... --write    writes the snapshots that pass the check below
//   node Server/Snapshots.mjs <folder> --names task.jsonl,session.jsonl    which file names a folder walk takes (the default)
//
// Before it writes anything it PROVES the snapshot: loading "snapshot + the lines after it" must give exactly the state a full
// replay gives (same saved shape, same class, id and state of every item, same in-memory fields), at the end of the log and at two
// cut points inside it. A log that fails, has an unreadable line in the middle, or is a page.jsonl is refused with the reason, and
// nothing is written for it. (Compute, don't recall: the check is the script, not a promise.)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Item from "../public/framework/core/Item/Item.js";
import Snapshot from "../public/framework/core/Item/Snapshot.js";
import "../public/framework/core/List/List.js";
import "../public/framework/core/Task/Task.js";
import "../public/framework/core/Session/Session.js";   // also registers Project, Prompt, Question, Process

const NEWLINE = 10;

export default class Snapshots {

	static NAMES = ["task.jsonl", "session.jsonl"];
	static SKIP = new Set(["node_modules", ".git"]);

	// Every file to look at: a file as given, or a folder walked for NAMES.
	static find(paths, names = Snapshots.NAMES){
		const files = [];
		const walk = at => {
			const stat = fs.statSync(at);
			if (stat.isFile()) return void files.push(at);
			for (const entry of fs.readdirSync(at, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))){
				if (Snapshots.SKIP.has(entry.name)) continue;
				const full = path.join(at, entry.name);
				if (entry.isDirectory()) walk(full);
				else if (names.includes(entry.name)) files.push(full);
			}
		};
		for (const p of paths) walk(path.resolve(p));
		return files;
	}

	/* Run over `paths`. Answers one result per file: {file, ok, why, lines, bytes, ms, wrote}. `ok` means the snapshot passed the
	   check (so a dry run says ok and wrote:false). `log` prints the report line by line. */
	static async run({ paths, write = false, log = console.log, names } = {}){
		const results = [];
		const files = Snapshots.find(paths, names);
		for (const file of files){
			const result = Snapshots.make(file, { write });
			results.push(result);
			const rel = path.relative(process.cwd(), file);
			log(result.ok
				? `${result.wrote ? "wrote " : result.current ? "current" : "would write"}  ${rel}  ${result.lines} lines, ${result.bytes} bytes covered, snapshot ${result.snapshot_bytes} bytes (${result.ms} ms)`
				: `refused  ${rel}: ${result.why}`);
		}
		const ok = results.filter(r => r.ok).length;
		log(`${write ? "" : "dry run: nothing written. "}${files.length} logs, ${ok} snapshottable, ${files.length - ok} refused.${write ? "" : " Add --write to write them."}`);
		return results;
	}

	// One log: read, replay, prove, and (with `write`) write the sidecar. Never throws for a bad log: the result says why.
	static make(file, { write = false } = {}){
		const started = performance.now();
		const result = { file, ok: false, wrote: false };
		const sidecar = Snapshot.url_for(file);
		try {
			if (path.basename(file) === "page.jsonl") return { ...result, why: "a page.jsonl loads through Page.Reader (it keeps every line for its inbox and log), not Item.open, so a snapshot would not be read" };
			if (!sidecar) return { ...result, why: "not a .jsonl file" };

			const buf = fs.readFileSync(file);
			const bytes = buf.lastIndexOf(NEWLINE) + 1;   // only whole lines: a half-written last line is left for the tail
			if (!bytes) return { ...result, why: "no complete line yet" };
			const entries = [];
			let from = 0, number = 0;
			for (let at = buf.indexOf(NEWLINE); at !== -1 && at < bytes; at = buf.indexOf(NEWLINE, from)){
				const text = buf.subarray(from, at).toString("utf8");
				from = at + 1;
				number++;
				if (!text.trim()) continue;
				try { entries.push(JSON.parse(text)); } catch { return { ...result, why: `line ${number} is unreadable (a torn line in the middle): a snapshot would bake the skip in` }; }
			}
			if (!entries.length) return { ...result, why: "no lines" };
			const lines = entries.length;

			// A frozen clock: two replays a millisecond apart must not differ in a field stamped from the wall clock.
			const made_at = new Date().toISOString();
			const proved = Snapshots.frozen(() => Snapshots.prove(entries, { log: path.basename(file), lines, bytes, covered: buf.subarray(0, bytes), made_at }));
			if (proved.why) return { ...result, lines, bytes, why: proved.why };

			const text = JSON.stringify(proved.snapshot);
			const existing = fs.existsSync(sidecar) ? (() => { try { return JSON.parse(fs.readFileSync(sidecar, "utf8")); } catch { return null; } })() : null;
			const current = !!existing && existing.snapshot === Snapshot.VERSION && existing.code === proved.snapshot.code && existing.bytes === bytes && existing.anchor === proved.snapshot.anchor;   // same log AND same replay code
			const out = { ...result, ok: true, lines, bytes, snapshot_bytes: text.length, current, ms: Math.round(performance.now() - started) };
			if (write && !current){
				const tmp = sidecar + ".tmp-" + process.pid;   // written whole, then renamed: a reader never sees half a snapshot
				fs.writeFileSync(tmp, text);
				fs.renameSync(tmp, sidecar);
				out.wrote = true;
			}
			return out;
		} catch (error){
			return { ...result, why: `could not snapshot: ${error?.message ?? error}` };
		}
	}

	/* The proof. Replay the whole log (the truth), snapshot the result, then check that starting from the snapshot gives the same
	   thing at the end of the log (no lines left) and from two cuts inside it (a snapshot of the lines before the cut, then replay
	   only the lines after). Answers {snapshot} or {why}. */
	static prove(entries, { log, lines, bytes, covered, made_at }){
		const quiet = console.warn;
		console.warn = () => {};   // old logs warn about old line shapes; that is not this script's news
		try {
			const Class = Item.class_for(entries);
			const full = Class.replay(entries);
			const snapshot = Snapshot.of(full, { log, lines, bytes, covered_end: covered, made_at });
			if (snapshot.memory.some(([, props]) => props._own_file)) return { why: "a child lives in its own file (a reference line): a snapshot would copy it and lose the link" };

			const unsafe = full.snapshot_unsafe?.();   // the item itself knows when its state could not be continued from a snapshot
			if (unsafe) return { why: unsafe };

			const truth = Snapshot.fingerprint(full, { root_id: false });
			const same = (rebuilt, where) => Snapshot.fingerprint(rebuilt, { root_id: false }) === truth ? null : `loading from a snapshot ${where} gives a different item than a full replay (${Snapshots.first_difference(truth, Snapshot.fingerprint(rebuilt, { root_id: false }))})`;

			const wrong = same(Class.replay([], snapshot), "at the end of the log");
			if (wrong) return { why: wrong };
			const probed = Snapshots.probe_slots(Class, entries, snapshot);
			if (probed) return { why: probed };
			for (const cut of new Set([Math.floor(entries.length / 2), entries.length - 1])){
				if (cut < 1) continue;
				const prefix = Class.replay(entries.slice(0, cut));
				if (prefix.snapshot_unsafe?.()) continue;   // a cut too early to be a snapshot anyone could take: not a case to prove
				const early = Snapshot.of(prefix, { log, lines: cut, bytes: 1, covered_end: covered, made_at });
				const off = same(Class.replay(entries.slice(cut), early), `after line ${cut}`);
				if (off) return { why: off };
			}
			return { snapshot };
		} finally { console.warn = quiet; }
	}

	/* One more line, written into every Item held in a data slot (`{"box": {"snapshot_probe": 1}}`, what a later log line would do):
	   the full replay and the one from the snapshot must still match. A restore that turns a slot Item into plain data replaces
	   it here instead of writing into it, and the two differ. Answers a reason or null. */
	static probe_slots(Class, entries, snapshot){
		const truth = Class.replay(entries), rebuilt = Class.replay([], snapshot);
		const wanted = Snapshot.slots(truth);   // [[index of the owner in Snapshot.items, key], …]
		if (!wanted.length) return null;
		for (const host of [truth, rebuilt]){
			const items = Snapshot.items(host);
			Item.Store.replay_depth++;   // a probe is never saved
			try { for (const [index, key] of wanted) items[index]?.set({ [key]: { snapshot_probe: 1 } }); } finally { Item.Store.replay_depth--; }
		}
		const a = Snapshot.fingerprint(truth, { root_id: false }), b = Snapshot.fingerprint(rebuilt, { root_id: false });
		return a === b ? null : `a line written into a slot Item gives a different item after loading from a snapshot (${Snapshots.first_difference(a, b)})`;
	}

	// A short pointer to where two fingerprints first differ.
	static first_difference(a, b){
		let i = 0;
		while (i < a.length && a[i] === b[i]) i++;
		return `at character ${i}: …${a.slice(Math.max(0, i - 20), i + 40)}… vs …${b.slice(Math.max(0, i - 20), i + 40)}…`;
	}

	// Run `fn` with `new Date()` and Date.now() fixed at one instant.
	static frozen(fn){
		const Real = Date, at = Real.now();
		globalThis.Date = class extends Real { constructor(...a){ a.length ? super(...a) : super(at); } static now(){ return at; } };
		try { return fn(); } finally { globalThis.Date = Real; }
	}
}

// ---- the command line ----
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const args = process.argv.slice(2);
	const write = args.includes("--write");
	const at = args.indexOf("--names");
	const names = at === -1 ? undefined : args[at + 1]?.split(",");
	const paths = args.filter((arg, i) => arg !== "--write" && arg !== "--names" && !(at !== -1 && i === at + 1));
	if (!paths.length){ console.log("usage: node Server/Snapshots.mjs <file-or-folder>... [--write] [--names task.jsonl,session.jsonl]"); process.exit(1); }
	const results = await Snapshots.run({ paths, write, names });
	process.exit(results.some(r => !r.ok) ? 2 : 0);
}
