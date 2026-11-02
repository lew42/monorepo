// Typing does not bloat the log (phase-1 design §11): rapid sets on one item are held and saved as ONE line, sent after a pause,
// at most every `max` ms, on blur, or before any other line. Node: `node public/framework/core/Item/coalesce.test.mjs`.
// Store.coalesce is on in a browser ({idle: 300, max: 2000}) and off in node (null), so every other test keeps its one-tick
// timing; these tests switch it on with short times.
//  1. Eleven keystrokes 5 ms apart save one line, with the last text, after the pause; a replay gives the same text.
//  2. Typing without a pause is still saved every `max` ms.
//  3. Any other line (a list add) sends what is held first, in order.
//  4. Blur (Store.flush_typing, what focusout and pagehide call) sends at once.
//  5. (edge) Off (null): every set goes on the next tick, as before.
import { test } from "../Test/Test.js";
import Item from "./Item.js";
import Store from "./Store.js";
import List from "../List/List.js";

const J = x => JSON.stringify(x);
const wait = ms => new Promise(r => setTimeout(r, ms));
let n = 0;
const wired = host => {
	const store = new Store({ url: `/coalesce-test/${++n}.jsonl` }), sent = [];
	Object.defineProperty(store, "writable", { value: true });
	store.deliver = async (path, lines) => { sent.push(...JSON.parse(J(lines))); return true; };
	store.attach(host);
	return { store, sent };
};
class Note extends Item { constructor(...a){ super(...a); this.tags = new List({ owner: this, name: "tags" }); } }
Item.register(Note, "CoalesceNote");
const on = async (opts, fn) => { const was = Store.coalesce; Store.coalesce = opts; try { await fn(); } finally { Store.coalesce = was; } };

test("eleven keystrokes save one line, after the pause", async t => on({ idle: 40, max: 1000 }, async () => {
	const note = new Note({ id: "n" }), { sent } = wired(note);
	let text = "";
	for (const ch of "hello there"){ text += ch; note.set({ text }); await wait(5); }
	t.eq(sent.length, 0, "nothing sent while typing");
	t.eq(note.get("text"), "hello there", "the item has every key at once");
	await wait(80);
	t.eq(J(sent), J([{ set: { text: "hello there" } }]), "one line, the last text");
	t.eq(Note.replay([{ id: "n" }, ...sent]).get("text"), "hello there", "it replays");
}));

test("typing without a pause is still saved every max ms", async t => on({ idle: 40, max: 100 }, async () => {
	const note = new Note({ id: "n" }), { sent } = wired(note);
	for (let i = 0; i < 25; i++){ note.set({ text: "x".repeat(i + 1) }); await wait(10); }
	await wait(80);
	t.ok(sent.length >= 2 && sent.length <= 5, `a few lines, not 25 and not 1 (got ${sent.length})`);
	t.eq(sent.at(-1)?.set?.text, "x".repeat(25), "the last line has the last text");
}));

test("any other line sends what is held first, in order", async t => on({ idle: 1000, max: 5000 }, async () => {
	const note = new Note({ id: "n" }), { sent } = wired(note);
	note.set({ text: "a" }); await wait(5);
	note.set({ text: "ab" }); await wait(5);
	note.tags.add({ id: "t1", data: { name: "red" } });
	await wait(10);
	t.eq(sent.length, 2, "two lines");
	t.eq(J(sent[0]), J({ set: { text: "ab" } }), "the held text first");
	t.ok(!!sent[1]?.tags?.add, "then the add");
}));

test("blur sends at once", async t => on({ idle: 1000, max: 5000 }, async () => {
	const note = new Note({ id: "n" }), { sent } = wired(note);
	note.set({ text: "typed" });
	await wait(5);
	t.eq(sent.length, 0, "held");
	Store.flush_typing();
	await wait(5);
	t.eq(J(sent), J([{ set: { text: "typed" } }]), "sent on blur");
}));

test.optional("edge: off (null) saves on the next tick as before", async t => on(null, async () => {
	const note = new Note({ id: "n" }), { sent } = wired(note);
	note.set({ text: "a" }); await wait(2);
	note.set({ text: "ab" }); await wait(2);
	t.eq(sent.length, 2, "two lines");
}));
