// Item.Store reset recovery (R4, doc/reset.md): `live.js`'s `jsonl_reset` handler re-reads the WHOLE file from
// byte 0. The store must apply exactly what it has not already applied — no verb twice — and end up identical to
// a fresh replay of the new file. Plain node: `node public/framework/core/Item/reset.test.mjs`
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Test from "../Test/Test.js";
import Item from "./Item.js";
import List from "../List/List.js";
import Store from "./Store.js";

const t = new Test("core/Item/Store: reset recovery after a rewritten log");
const DIR = fs.mkdtempSync(path.join(os.tmpdir(), "reset-test-"));
const FILE = path.join(DIR, "x.jsonl");

// A tiny real Item subclass: a field (will be rewritten in place), a List (an "add" is idempotent on id, so it is
// not the interesting case), and a non-idempotent verb (D14, as_call) — replaying "increment()" twice shows up at
// once as a wrong final count, exactly what double-applying a verb looks like in the wild.
class Counter extends Item {
	static fields = ["note", "n"];
	get things(){ return this._things ??= new List({ owner: this, name: "things" }); }
	increment(){ return this.as_call("increment", [], () => { this.calls = (this.calls ?? 0) + 1; this.set({ n: (this.n ?? 0) + 1 }); }); }
}
Item.register(Counter);

const parse = text => text.split("\n").filter(Boolean).map(l => JSON.parse(l));
const line = obj => JSON.stringify(obj) + "\n";

// A brand new host and store, fed the CURRENT file in one read — the independent "truth" the recovered host is
// checked against.
function fresh_replay(){
	const host = new Counter({ id: "root" });
	const store = new Store({ url: "/x.jsonl" });
	store.attach(host);
	store.read(parse(fs.readFileSync(FILE, "utf8")));
	return host;
}

try {
	// Opened from 3 lines: a field, a List add, one verb.
	fs.writeFileSync(FILE,
		line({ set: { note: "/old/path" } }) +
		line({ things: { add: { id: "a1", title: "A" } } }) +
		line({ "increment()": {} })
	);

	const host = new Counter({ id: "root" });
	const store = new Store({ url: "/x.jsonl" });
	store.attach(host);
	store.read(parse(fs.readFileSync(FILE, "utf8")));
	t.eq([host.note, host.n, host.calls, [...host.things].map(x => x.id)], ["/old/path", 1, 1, ["a1"]], "opened from 3 lines");

	// A live line arrives over the socket (an ordinary append, not a reset): one more increment.
	fs.appendFileSync(FILE, line({ "increment()": {} }));
	store.read(parse(fs.readFileSync(FILE, "utf8")).slice(-1));
	t.eq([host.n, host.calls], [2, 2], "a live append is applied once, on top");

	// The SessionConsolidate-style rewrite: the early line's text corrected in place (same length — "/old/path"
	// and "/new/path" are both 9 characters), the List add line unchanged, two more verb lines appended.
	fs.writeFileSync(FILE,
		line({ set: { note: "/new/path" } }) +
		line({ things: { add: { id: "a1", title: "A" } } }) +
		line({ "increment()": {} }) +
		line({ "increment()": {} }) +
		line({ "increment()": {} })
	);

	let resets = 0;
	host.on("reset", () => resets++);
	store.reset();
	store.read(parse(fs.readFileSync(FILE, "utf8")));

	t.eq(resets, 1, "reset() plus the recovery read that follows fire exactly one \"reset\" event on the host");
	t.eq(host.note, "/new/path", "the rewritten line's new text is applied — its hash changed, so it reads as new");
	t.eq([...host.things].map(x => x.id), ["a1"], "the add, re-seen, is not duplicated (idempotent on id, as it already was)");
	// 2 increments were already applied (one at open, one as a live line) before the rewrite; the rewritten file
	// carries 3 "increment()" lines, so the first 2 (already credited) are skipped and only the 3rd (genuinely
	// new) runs — every verb exactly once, none twice.
	t.eq(host.calls, 3, "every verb ran exactly once: the 2 increments already applied are skipped, the 3rd (genuinely new) runs");
	t.eq(host.n, 3, "n agrees with calls — nothing was double-applied");

	const replayed = fresh_replay();
	t.eq([replayed.note, replayed.n, replayed.calls, [...replayed.things].map(x => x.id)], [host.note, host.n, host.calls, [...host.things].map(x => x.id)],
		"the recovered host is identical to a fresh replay of the rewritten file");
} finally { fs.rmSync(DIR, { recursive: true, force: true }); }

t.done();
