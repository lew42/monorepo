// Ref: references that resolve through a real Store and real files. Plain node: `node public/framework/core/Item/Ref.test.mjs`
// The files sit in a temp folder served over http, so Item.open fetches them exactly as a browser would (one load; the live
// tail is the browser's, shown on the session page).
//   1. another file: Item.open(url), one root per url, then get(path); a missing target is "gone", named
//   2. an id fallback: the path misses, the id is found through the root's index (built on that miss, never saved)
//   3. backlinks within one file: built from the replayed lines; "where is this shown"; a move re-paths each Ref, one line each
//   4. a forward across files: {moved_to:{url, path}} at the old place; an old Ref follows it and takes the new address
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import Test from "../Test/Test.js";
import Item from "./Item.js";
import "../List/List.js";
import Store from "./Store.js";
import "../Task/Task.js";
import "../Session/Session.js";
import Ref from "./Ref.js";

const t = new Test("core/Item/Ref");
const DIR = fs.mkdtempSync(path.join(os.tmpdir(), "ref-test-"));
const write = (file, lines) => { fs.mkdirSync(path.dirname(path.join(DIR, file)), { recursive: true }); fs.writeFileSync(path.join(DIR, file), lines.map(l => JSON.stringify(l)).join("\n") + "\n"); };
const read = file => fs.readFileSync(path.join(DIR, file), "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));

const server = http.createServer((req, res) => {
	const file = path.join(DIR, decodeURIComponent(new URL(req.url, "http://x").pathname));
	if (!file.startsWith(DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()){ res.writeHead(404); return res.end(); }
	res.writeHead(200, { "content-type": "application/x-ndjson" });
	res.end(req.method === "HEAD" ? undefined : fs.readFileSync(file));
});
await new Promise(ok => server.listen(0, "127.0.0.1", ok));
const BASE = `http://127.0.0.1:${server.address().port}`;

// A document attached to a real file the way Store.test does it: a change appends its one line to the file.
const attach = (host, file) => {
	const store = new Store({ url: BASE + "/" + file });
	store.append = line => fs.appendFileSync(path.join(DIR, file), JSON.stringify(line) + "\n");
	store.attach(host);
	return store;
};

const child = [
	{ session: { id: "child-1", kind: "agent", at: "2026-10-28T20:00:00-05:00" } },
	{ tasks: { add: { type: "Task", id: "t1", title: "Build the page" } } },
	{ tasks: { add: { type: "Task", id: "t2", title: "Write the doc" } } },
	{ tasks: { t2: { tasks: { add: { type: "Task", id: "t3", title: "Proofread" } } } } },
];

try {
	// 1. another file, one root per url, gone
	write("s/child-1/session.jsonl", child);
	const r1 = new Ref({ url: "/s/child-1/", path: "tasks.t1" });
	r1.url = BASE + "/s/child-1/";   // set after construction too: the field is the address, the line it writes is {set:{url}}
	const hit = await r1.resolve();
	t.eq(hit?.get_one("title"), "Build the page", "a Ref to another file resolves to the item at its path");
	t.ok(hit?.constructor.name === "Task" && r1._root_of_target?.constructor.name === "Session", "the file opens as what its lines say: a Session record, its tasks Tasks");
	t.eq(r1.label(), "child-1 › Build the page", "drawn in context: session › task");

	const r2 = new Ref({ url: BASE + "/s/child-1/", path: "tasks.t2.tasks.t3" });
	await r2.resolve();
	t.ok(r2._root_of_target === r1._root_of_target, "one root per url: two Refs to one file share the same live object");
	t.ok(await Item.open(BASE + "/s/child-1/session.jsonl") === r1._root_of_target, "and Item.open(url) answers that same root");
	t.eq(r2.target?.get_one("title"), "Proofread", "a nested path walks one get() per level");

	const gone = new Ref({ url: BASE + "/s/child-1/", path: "tasks.nope" });
	t.eq(await gone.resolve(), null, "a missing target resolves to null");
	t.ok(gone.gone && /tasks\.nope/.test(gone.why), `it is gone and says what it looked for (${gone.why})`);
	const nofile = new Ref({ url: BASE + "/s/never-made/", path: "tasks.t1" });
	t.eq(await nofile.resolve(), null, "a Ref to a folder with no record is gone too, not a throw");

	// 2. an id fallback
	const before = fs.readFileSync(path.join(DIR, "s/child-1/session.jsonl"), "utf8");
	const stale = new Ref({ url: BASE + "/s/child-1/", path: "tasks.t1.tasks.t3" });   // t3 was under t2, never t1
	t.eq((await stale.resolve())?.get_one("title"), "Proofread", "the path misses, the id (its last part) finds the item");
	const root = stale._root_of_target;
	t.ok(!Object.keys(root).includes("_deep") && !!Object.getOwnPropertyDescriptor(root, "_deep"), "the id index is built on the miss, kept off the item's keys");
	t.eq(fs.readFileSync(path.join(DIR, "s/child-1/session.jsonl"), "utf8"), before, "and never saved: the file is unchanged");

	// 3. backlinks within one file
	const doc = Item.hydrate({ id: "doc", title: "Doc", tasks: [{ id: "ui", title: "UI", tasks: [{ id: "c3", title: "C3" }] }, { id: "done", title: "Done", tasks: [] }], chat: [] });
	write("doc.jsonl", []);
	attach(doc, "doc.jsonl");
	doc.chat.add({ type: "Ref", id: "r1", path: "tasks.ui.tasks.c3" });
	doc.chat.add({ type: "Ref", id: "r2", path: "tasks.ui.tasks.c3" });
	doc.chat.add({ type: "Ref", id: "r3", path: "tasks.done" });
	const c3 = doc.get("tasks.ui.tasks.c3");
	t.eq(Ref.shown(c3).map(r => r.id), ["r1", "r2"], "where is C3 shown: the two Refs that point at it");
	t.eq(Ref.backlinks(doc).get("tasks.done").map(r => r.id), ["r3"], "the backlinks map holds every path a Ref names");

	const n = read("doc.jsonl").length;
	doc.get("tasks.done.tasks").move("c3", { after: null, from: doc.get("tasks.ui.tasks") });
	const moved = Ref.repath(c3, "tasks.ui.tasks.c3");
	t.eq(moved.map(r => r.id), ["r1", "r2"], "a move re-paths the Refs that named the old path");
	const added = read("doc.jsonl").slice(n + 1);   // after the move line itself
	t.eq(added, [{ chat: { r1: { set: { path: "tasks.done.tasks.c3" } } } }, { chat: { r2: { set: { path: "tasks.done.tasks.c3" } } } }], "one line per Ref, naming its new path");

	// Replayed from the file: the backlinks are rebuilt from the lines, and every Ref finds C3 at its new place.
	const again = Item.hydrate({ id: "doc", title: "Doc", tasks: [{ id: "ui", title: "UI", tasks: [{ id: "c3", title: "C3" }] }, { id: "done", title: "Done", tasks: [] }], chat: [] });
	const reader = new Store({ url: BASE + "/doc.jsonl" });
	reader.attach(again);
	reader.read(read("doc.jsonl"));
	const c3b = again.get("tasks.done.tasks.c3");
	t.ok(!!c3b, "the replayed file has C3 under Done");
	t.eq(Ref.shown(c3b).map(r => r.id), ["r1", "r2"], "the backlinks built from the replay point at the moved C3");
	t.ok((await again.chat.find("r1").resolve()) === c3b, "and a replayed Ref resolves straight to it");

	// 4. a forward across files
	write("s/old/session.jsonl", [
		{ session: { id: "old", kind: "agent", at: "2026-10-28T19:00:00-05:00" } },
		{ tasks: { add: { type: "Task", id: "w1", title: "Work, before it moved" } } },
	]);
	write("s/new/session.jsonl", [
		{ session: { id: "new", kind: "agent", at: "2026-10-28T19:30:00-05:00" } },
		{ tasks: { add: { type: "Task", id: "w1", title: "Work, in its new session" } } },
	]);
	// The mover leaves a forward at the old place (here as the line it writes; Ref.forward(item, to) is the call that makes it).
	fs.appendFileSync(path.join(DIR, "s/old/session.jsonl"), JSON.stringify({ tasks: { w1: { moved_to: { url: BASE + "/s/new/", path: "tasks.w1" } } } }) + "\n");
	const holder = Item.hydrate({ id: "holder", title: "Holder", chat: [] });
	write("holder.jsonl", []);
	attach(holder, "holder.jsonl");
	const old_ref = holder.chat.add({ type: "Ref", id: "o1", url: BASE + "/s/old/", path: "tasks.w1" });
	const followed = await old_ref.resolve();
	t.eq(followed?.get_one("title"), "Work, in its new session", "an old Ref follows the forward to the new file");
	t.eq([old_ref.url, old_ref.path], [BASE + "/s/new/", "tasks.w1"], "and takes the new address");
	t.eq(read("holder.jsonl").slice(1), [{ chat: { o1: { set: { url: BASE + "/s/new/" } } } }], "written as one line (what changed: the url; the path is the same), so the next load goes straight there");

	const loop = Item.hydrate({ id: "loop", chat: [] });
	write("s/a/session.jsonl", [{ session: { id: "a" } }, { tasks: { add: { type: "Task", id: "x" } } }, { tasks: { x: { moved_to: { url: BASE + "/s/b/", path: "tasks.x" } } } }]);
	write("s/b/session.jsonl", [{ session: { id: "b" } }, { tasks: { add: { type: "Task", id: "x" } } }, { tasks: { x: { moved_to: { url: BASE + "/s/a/", path: "tasks.x" } } } }]);
	const looped = loop.chat.add({ type: "Ref", id: "l1", url: BASE + "/s/a/", path: "tasks.x" });
	t.eq(await looped.resolve(), null, "two forwards pointing at each other end as gone, not a hang");

	// The writer half: Ref.forward leaves the forward on a live item.
	const left = Item.hydrate({ id: "left", title: "Left" });
	Ref.forward(left, { url: "/s/new/", path: "tasks.w1" });
	t.eq(left.get_one("moved_to"), { url: "/s/new/", path: "tasks.w1" }, "Ref.forward sets {moved_to:{url, path}} at the old place");
} finally {
	server.close();
	fs.rmSync(DIR, { recursive: true, force: true });
}

t.done();
