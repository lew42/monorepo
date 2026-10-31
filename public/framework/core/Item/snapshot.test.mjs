// Snapshots: an item loads from its last state plus the tail of its log, not from line 1.
//   node public/framework/core/Item/snapshot.test.mjs
// What a snapshot is, where it lives and why: core/Item/doc/snapshots.md. Short version: `task.snapshot.json` beside `task.jsonl`
// holds the item's saved shape (toJSON) and how much of the log it covers (lines and bytes). Item.open reads it, asks for only the
// bytes after that, and replays those. A snapshot that no longer matches the log (the log was rewritten) is ignored with a warning.
//
// Real parts: real files in a temp dir, a real HTTP server that answers byte-range requests (the way a static host does), the
// real Item.open / Item.Store / Task / List, and the real script (Server/Snapshots.mjs). Nothing is mocked. The dev server's
// socket tail (the browser, on localhost) cannot run in node; that half is checked in a real browser (see doc/snapshots.md).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import crypto from "node:crypto";
import { register } from "node:module";
import { test } from "../Test/Test.js";

register("../../../../Servex/agents/site-hooks.mjs", import.meta.url);
// A fixed clock: a replayed task stamps `ran_since` and friends from the wall clock, and two replays a millisecond apart must be equal.
const FIXED = Date.parse("2026-10-30T12:00:00Z"), RealDate = Date;
globalThis.Date = class extends RealDate { constructor(...a){ a.length ? super(...a) : super(FIXED); } static now(){ return FIXED; } };

const { default: Item } = await import("./Item.js");
const { default: List } = await import("../List/List.js");
const { default: Task } = await import("../Task/Task.js");
const Snapshots = (await import("../../../../Server/Snapshots.mjs").catch(() => ({}))).default;

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "snapshot-"));
const J = x => JSON.stringify(x);
const text_of = lines => lines.map(J).join("\n") + "\n";
const sha = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const quiet = async fn => { const w = console.warn, said = []; console.warn = (...a) => said.push(a.join(" ")); try { return { value: await fn(), said }; } finally { console.warn = w; } };

// A static host in miniature: files from a folder, 404 for a missing one, and `Range: bytes=a-b` answered with a 206.
// `hits` remembers every request, so a test can say how many bytes of the log a load really asked for.
function serve(dir){
	const hits = [];
	const server = http.createServer((req, res) => {
		const file = path.join(dir, decodeURIComponent(req.url.split("?")[0]));
		if (!fs.existsSync(file)){ hits.push({ url: req.url, status: 404 }); res.statusCode = 404; return res.end("no"); }
		const all = fs.readFileSync(file), m = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range ?? "");
		if (!m){ hits.push({ url: req.url, status: 200, sent: all.length }); return res.end(all); }
		const from = +m[1], to = m[2] === "" ? all.length - 1 : Math.min(+m[2], all.length - 1);
		if (from >= all.length){ hits.push({ url: req.url, status: 416, range: req.headers.range }); res.statusCode = 416; return res.end(); }
		const part = all.subarray(from, to + 1);
		hits.push({ url: req.url, status: 206, range: req.headers.range, sent: part.length });
		res.statusCode = 206;
		res.setHeader("Content-Range", `bytes ${from}-${to}/${all.length}`);
		res.end(part);
	});
	server.unref();   // a test that throws before close() must not keep node alive
	return new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve({ hits, url: name => `http://127.0.0.1:${server.address().port}/${name}`, close: () => server.close() })));
}

// A folder per test (Item.Store keeps one Store per url, so no two tests may share a url).
let n = 0;
const folder = async () => { const dir = path.join(TMP, "t" + ++n); fs.mkdirSync(dir); return { dir, ...(await serve(dir)) }; };

// What must be equal: the saved shape, and each item's class and state (the part only a live object has).
const shape = root => {
	const out = [];
	root.walk(item => out.push([item.constructor.name, item.id, item.get_one("state") ?? null, item._last_ts ?? null]));
	return J([root.toJSON(), out]);
};

class Table extends Item {
	static runs = 0;                       // how many times the hook ran, in this whole process
	constructor(...args){ super(...args); this.rows = new List({ owner: this, name: "rows" }); }
	set_qty(value){ Table.runs++; this.put("qty", value); this.doubled = value * 2; }   // a hook (D17) with a cache beside the data
	sort_by(key){
		return this.as_call("sort_by", [key], () => {
			this.rows.order([...this.rows].sort((a, b) => String(a.get(key)).localeCompare(String(b.get(key)))).map(row => row.id));
			this.set({ sorted_by: key });
		});
	}
}
Item.register(Table, "Table");

// ---- 1. snapshot + tail equals the full replay: a Task with children, a #id line ----
const ledger_head = [
	{ assign: { slug: "ledger", title: "Ledger", at: "2026-10-01T09:00:00Z" } },
	{ tasks: { add: { id: "a", title: "first" } }, ts: "2026-10-01T09:01:00Z" },
	{ tasks: { add: { id: "b", title: "second" } }, ts: "2026-10-01T09:02:00Z" },
	{ start: {}, ts: "2026-10-01T09:03:00Z" },
	{ tasks: { "#a": { set: { title: "first, renamed" } } }, ts: "2026-10-01T09:04:00Z" },
];
const ledger_tail = [
	{ tasks: { "#b": { set: { title: "second, renamed" } } }, ts: "2026-10-01T09:05:00Z" },
	{ tasks: { add: { id: "c", title: "third" } }, ts: "2026-10-01T09:06:00Z" },
	{ tasks: { "#c": { set: { title: "third, renamed" } } }, ts: "2026-10-01T09:07:00Z" },
	{ set: { note: "after the snapshot" }, ts: "2026-10-01T09:08:00Z" },
];

test.node("a Task opened from its snapshot plus the tail equals a full replay, and asks only for the tail", async t => {
	t.ok(typeof Snapshots?.run === "function", "Server/Snapshots.mjs exists and has run()");
	const { dir, url, hits, close } = await folder();
	const log = path.join(dir, "task.jsonl");
	fs.writeFileSync(log, text_of(ledger_head));
	const made = await Snapshots.run({ paths: [log], write: true, log: () => {} });
	t.ok(made[0]?.wrote, "the script wrote a snapshot: " + J(made[0]));
	t.ok(fs.existsSync(path.join(dir, "task.snapshot.json")), "task.snapshot.json sits beside task.jsonl");
	fs.appendFileSync(log, text_of(ledger_tail));
	const size = fs.statSync(log).size;

	hits.length = 0;
	const opened = await Item.open(url("task.jsonl"));
	const full = Task.replay([...ledger_head, ...ledger_tail]);
	t.eq(shape(opened), shape(full), "snapshot + tail gives the state a full replay gives");
	t.eq(opened.tasks.find("c")?.get("title"), "third, renamed", "a child added in the tail is there");
	t.eq(opened.get("note"), "after the snapshot", "and a field set in the tail");
	t.eq(opened.store.snapshot?.lines, ledger_head.length, "the store started from the snapshot (it covers the head's lines)");

	const log_hits = hits.filter(h => h.url.includes("task.jsonl"));
	t.ok(log_hits.length > 0 && log_hits.every(h => h.status === 206), "the log was only ever asked for by byte range: " + J(log_hits));
	t.ok(log_hits.every(h => h.sent < size / 2 + 200), "and a lot less than the whole log came back (" + log_hits.map(h => h.sent) + " of " + size + " bytes)");
	close();
});

// ---- 1b. the same, for an Item with a list, a set_<key> hook and an as_call line ----
const table_head = [
	{ type: "Table", id: "table" },
	{ rows: { add: { id: "r1", title: "pear" } } },
	{ rows: { add: { id: "r2", title: "apple" } } },
	{ rows: { add: { id: "r3", title: "fig" } } },
	...[1, 2, 3, 4, 5].map(qty => ({ qty })),
	{ rows: { "#r2": { set: { title: "apricot" } } } },
	{ "sort_by()": "title" },
];
const table_tail = [
	{ rows: { add: { id: "r4", title: "banana" } } },
	{ "sort_by()": "title" },
	{ qty: 6 },
];

test.node("an Item with a list, a hook and an as_call line: same state, and each hook runs once per key from a snapshot", async t => {
	const { dir, url, close } = await folder();
	const log = path.join(dir, "table.jsonl");
	fs.writeFileSync(log, text_of(table_head));
	const made = await Snapshots.run({ paths: [log], write: true, log: () => {} });
	t.ok(made[0]?.wrote, "the script wrote a snapshot: " + J(made[0]));
	fs.appendFileSync(log, text_of(table_tail));

	Table.runs = 0;
	const full = Table.replay([...table_head, ...table_tail]);
	const full_runs = Table.runs;
	Table.runs = 0;
	const opened = await Item.open(url("table.jsonl"));
	const snap_runs = Table.runs;
	t.eq(shape(opened), shape(full), "snapshot + tail equals the full replay (rows, their order, the sorted_by field)");
	t.eq([...opened.rows].map(r => r.id), [...full.rows].map(r => r.id), "the rows are in the replayed order");
	t.eq(opened.doubled, 12, "the hook's cache is right (qty 6, doubled)");
	t.eq(full_runs, 6, "a full replay runs set_qty once per qty line (6)");
	t.eq(snap_runs, 2, "from a snapshot it runs once for the saved value, and once for the one qty line in the tail");
	close();
});

// ---- 2. a stale snapshot is ignored with a warning ----
test.node("a snapshot whose log was rewritten before its offset is ignored with a warning", async t => {
	const { dir, url, close } = await folder();
	const log = path.join(dir, "task.jsonl");
	fs.writeFileSync(log, text_of(ledger_head));
	await Snapshots.run({ paths: [log], write: true, log: () => {} });
	// The log is rewritten: an early line is different and longer, so the old offset now lands somewhere else in the file.
	const rewritten = [ledger_head[0], { tasks: { add: { id: "a", title: "a much longer first title than before" } } }, ...ledger_head.slice(2), ...ledger_tail];
	fs.writeFileSync(log, text_of(rewritten));

	const { value: opened, said } = await quiet(() => Item.open(url("task.jsonl")));
	t.eq(shape(opened), shape(Task.replay(rewritten)), "the item is what a full replay of the rewritten log gives");
	t.ok(said.some(s => /snapshot/i.test(s) && /task\.snapshot\.json|task\.jsonl/.test(s)), "and a warning names the snapshot: " + J(said));
	close();
});

test.optional("edge: a log cut shorter than the snapshot's offset is stale too", async t => {
	const { dir, url, close } = await folder();
	const log = path.join(dir, "task.jsonl");
	fs.writeFileSync(log, text_of(ledger_head));
	await Snapshots.run({ paths: [log], write: true, log: () => {} });
	fs.writeFileSync(log, text_of(ledger_head.slice(0, 2)));
	const { value: opened, said } = await quiet(() => Item.open(url("task.jsonl")));
	t.eq(shape(opened), shape(Task.replay(ledger_head.slice(0, 2))), "a shorter log replays in full");
	t.ok(said.some(s => /snapshot/i.test(s)), "with a warning: " + J(said));
	close();
});

// ---- 3. no snapshot: loads as before ----
test.node("a log with no snapshot loads as it always did: one plain request, no byte range", async t => {
	const { dir, url, hits, close } = await folder();
	fs.writeFileSync(path.join(dir, "task.jsonl"), text_of([...ledger_head, ...ledger_tail]));
	const opened = await Item.open(url("task.jsonl"));
	t.eq(shape(opened), shape(Task.replay([...ledger_head, ...ledger_tail])), "equals a full replay");
	const log_hits = hits.filter(h => h.url.includes("task.jsonl") && !h.url.includes("snapshot"));
	t.ok(log_hits.length === 1 && log_hits[0].status === 200 && !log_hits[0].range, "the log was fetched whole, once: " + J(log_hits));
	close();
});

// ---- 4. the script's dry run writes nothing; a real run never touches the log ----
test.node("the script's dry run writes nothing, and writing a snapshot leaves the log byte for byte as it was", async t => {
	const { dir, close } = await folder();
	const log = path.join(dir, "task.jsonl");
	fs.writeFileSync(log, text_of(ledger_head));
	const before = sha(log);

	const said = [];
	const dry = await Snapshots.run({ paths: [dir], log: line => said.push(line) });
	t.eq(fs.readdirSync(dir).sort(), ["task.jsonl"], "after a dry run the folder holds only the log");
	t.ok(dry[0]?.ok && !dry[0].wrote, "the dry run says it would write: " + J(dry[0]));
	t.ok(said.some(l => /dry run/i.test(l)), "and the printed report says it was a dry run: " + J(said));

	const real = await Snapshots.run({ paths: [dir], write: true, log: () => {} });
	t.ok(real[0]?.wrote, "a real run writes");
	t.eq(sha(log), before, "the log is byte for byte the same");
	const sidecar = JSON.parse(fs.readFileSync(path.join(dir, "task.snapshot.json"), "utf8"));
	t.eq([sidecar.lines, sidecar.bytes], [ledger_head.length, fs.statSync(log).size], "the snapshot says it covers every line and every byte");
	close();
});

test.optional("edge: the script refuses a log with an unreadable line in the middle, and a page.jsonl", async t => {
	const { dir, close } = await folder();
	const log = path.join(dir, "task.jsonl");
	fs.writeFileSync(log, J(ledger_head[0]) + "\n{ this line is torn\n" + text_of(ledger_head.slice(1)));
	const bad = await Snapshots.run({ paths: [log], write: true, log: () => {} });
	t.ok(!bad[0].ok && /unreadable|torn|parse/i.test(bad[0].why) && !fs.existsSync(path.join(dir, "task.snapshot.json")), "a torn middle line: refused, nothing written: " + J(bad[0]));
	const page = path.join(dir, "page.jsonl");
	fs.writeFileSync(page, text_of([{ title: "A page" }]));
	const refused = await Snapshots.run({ paths: [page], write: true, log: () => {} });
	t.ok(!refused[0].ok && /page/i.test(refused[0].why), "a page.jsonl: refused (it loads through Page.Reader): " + J(refused[0]));
	close();
});
