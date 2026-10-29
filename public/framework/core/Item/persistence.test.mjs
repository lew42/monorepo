// The persistence matrix (data-shapes plan step 1b; the streaming seat's §10): every class that saves, as the root of its own
// file and nested inside another, for add, set, move, remove and replay, through a REAL Item.Store and a REAL file.
//   node public/framework/core/Item/persistence.test.mjs
//
// What is real: Item, List, Task, Prompt, Question, Session, Page, Item.Store's attach -> line_for -> hops -> wrap -> append
// -> skip_echo -> read. What is swapped: only the store's last step, flush(). In a browser it POSTs to Servex's item tool or
// sends over the dev socket; here it appends to a temp file and stamps by/ts, as the item tool's write_line does. A second
// "tab" tails the same file (Tail.js's read: whole lines past its offset) and must hold the same tree; a fresh replay of the
// file must too. The clock and ids are fixed, so a live stamp and a replayed one are equal.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { register } from "node:module";

register("../../../../Servex/agents/site-hooks.mjs", import.meta.url);
const FIXED = Date.parse("2026-10-28T12:00:00Z"), RealDate = Date;
globalThis.Date = class extends RealDate { constructor(...a){ a.length ? super(...a) : super(FIXED); } static now(){ return FIXED; } };
let uid = 0;
Object.defineProperty(globalThis.crypto, "randomUUID", { value: () => `u${++uid}`, configurable: true, writable: true });

const { default: Test } = await import("../Test/Test.js");
const { default: Item } = await import("./Item.js");
const { default: List } = await import("../List/List.js");
const { default: Task } = await import("../Task/Task.js");
const { default: Session } = await import("../Session/Session.js");
const { Prompt } = await import("../Task/Prompt.js");
const { default: Question } = await import("../Task/Question.js");
const { default: Page } = await import("../Page/Page.class.js");
await import("../Page/parts/kinds.js");
console.warn = () => {};

const t = new Test("core/Item: the persistence matrix, through a real Store and a real file");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "persist-"));
const J = x => JSON.stringify(x);
const tick = () => new Promise(r => setTimeout(r, 0));
const lines_of = file => fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));

// The one swapped piece: flush() appends to the file, stamped, the way the item tool's write_line does.
class DiskStore extends Item.Store {
	get writable(){ return true; }
	async flush(){
		const lines = this._queue.splice(0);
		this._flushing = false;
		for (const line of lines){
			(this.sent ??= []).push(J(line));
			fs.appendFileSync(this.file, J({ ...line, by: this.by, ts: new Date().toISOString() }) + "\n");
		}
	}
}

// What must be equal: the saved shape, and what only lives in memory (every item's class and state).
const shape = root => {
	const out = [];
	const visit = item => { out.push([item.constructor.name, item.id, item.get_one?.("state") ?? null]); for (const list of Object.values(item.lists?.() ?? {})) for (const kid of list) if (kid instanceof Item) visit(kid); };
	visit(root);
	out[0][1] = "root";   // a code-made root's id is not in its file (a Board, a bare List): the root is the root
	return J([{ ...root.toJSON(), id: "root" }, out]);
};

/* One file, two tabs. `make(lines)` builds the root from the file's lines (Class.replay), as a page load does. Tab A makes the
   changes; tab B tails the file and applies what A wrote; a fresh replay of the whole file is the third reader. */
function file_of(name, first){
	const file = path.join(TMP, name);
	fs.writeFileSync(file, first ? J(first) + "\n" : "");
	return file;
}
function tab(file, make, by){
	const root = make(fs.existsSync(file) ? lines_of(file) : []);
	const store = new DiskStore({ url: "/test/" + path.basename(file), file, by });
	store.attach(root);
	const at = { offset: fs.statSync(file).size };
	return { root, store, pull(){
		const buf = fs.readFileSync(file).subarray(at.offset), end = buf.lastIndexOf(10) + 1;
		at.offset += end;
		store.read(buf.subarray(0, end).toString("utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)));
	} };
}

/* Run one cell: `step(A.root)` makes ONE change in tab A; it must write exactly `writes` lines (1 by default), tab B must then
   equal A, A must skip its own echo, and a fresh replay of the file must equal A too. */
async function cell(cls, mode, op, A, B, file, make, step, writes = 1){
	const before = lines_of(file).length;
	step(A.root);
	await tick();
	const wrote = lines_of(file).length - before;
	A.pull(); B.pull();
	const fresh = make(lines_of(file));
	const ok = wrote === writes && shape(A.root) === shape(B.root) && shape(A.root) === shape(fresh);
	if (!ok) console.log(`   ${cls} ${mode} ${op}: wrote ${wrote}/${writes}; tab B ${shape(A.root) === shape(B.root) ? "same" : "DIFFERS"}; replay ${shape(A.root) === shape(fresh) ? "same" : "DIFFERS"}\n     A ${shape(A.root).slice(0, 400)}\n     R ${shape(fresh).slice(0, 400)}`);
	t.ok(ok, `${cls} (${mode}): ${op} writes ${writes} line(s); the other tab and a fresh replay hold the same tree`);
	(matrix[`${cls} | ${mode}`] ??= {})[op] = ok ? "F" : "FAIL";
}
const matrix = {};

// A plain Item root with two lists: code builds the structure (the code-made rule), lines bring the items.
class Board extends Item {
	constructor(...args){ super(...args); this.cards = new List({ owner: this, name: "cards" }); this.done = new List({ owner: this, name: "done" }); }
}
class Card extends Item {
	get notes(){ return this._notes ??= new List({ owner: this, name: "notes" }); }
	set notes(list){ this._notes = list; }
	get(key){ return key === "notes" ? this.notes : super.get(key); }
	lists(){ const { _notes, ...rest } = super.lists(); return { ...rest, ...(_notes ? { notes: _notes } : {}) }; }
}
Item.register(Board, "Board");
Item.register(Card, "Card");
List.prototype.of = Item;

try {
	// ── Item, own file ──
	{
		const file = file_of("item.jsonl"), make = lines => Board.replay(lines);
		const A = tab(file, make, "a"), B = tab(file, make, "b");
		const c = (cls, op, step, n) => cell("Item", "own file", op, A, B, file, make, step, n);
		await c("Item", "add", r => r.cards.add(new Card({ id: "c1", data: { title: "one" } })));
		await c("Item", "add", r => r.cards.add(new Card({ id: "c2", data: { title: "two" } })));
		await c("Item", "set", r => r.set({ title: "Board" }));
		await c("Item", "move", r => r.cards.move("c2", { after: null }));
		await c("Item", "remove", r => r.cards.remove("c2"));
		await c("Item", "replay", r => r.cards.add({ id: "c3", title: "three" }));
	}
	// ── Item, nested two levels (card -> notes), the delta-flow demo's tree ──
	{
		const file = file_of("nested.jsonl"), make = lines => Board.replay(lines);
		const A = tab(file, make, "a"), B = tab(file, make, "b");
		const c = (op, step, n) => cell("Item", "nested", op, A, B, file, make, step, n);
		A.root.cards.add(new Card({ id: "c1" })); A.root.cards.add(new Card({ id: "c2" })); await tick(); A.pull(); B.pull();
		await c("add", r => r.cards.find("c1").notes.add({ id: "n1", text: "first" }));
		await c("set", r => r.cards.find("c1").notes.find("n1").set({ text: "edited" }));
		await c("move", r => r.cards.find("c2").notes.move("n1", { after: null, from: r.cards.find("c1").notes }));
		await c("remove", r => r.cards.find("c2").notes.remove("n1"));
		await c("replay", r => r.done.add(new Card({ id: "c1" })));   // the same id in another list: stays in "done", never "cards"
		t.ok(A.root.done.find("c1") && A.root.cards.find("c1") && J(lines_of(file).at(-1)).includes('"done"'), "Item (nested): a second list's member of the same id is written under its own list");
	}
	// ── List, own file (the root IS the list) ──
	{
		const file = file_of("list.jsonl"), make = lines => List.replay(lines);
		const A = tab(file, make, "a"), B = tab(file, make, "b");
		const c = (op, step, n) => cell("List", "own file", op, A, B, file, make, step, n);
		await c("add", r => r.add({ id: "a", title: "A" }));
		await c("add", r => r.add({ id: "b", title: "B" }));
		await c("set", r => r.find("a").set({ title: "A!" }));
		await c("move", r => r.move("b", { after: null }));
		await c("remove", r => r.remove("a"));
		await c("replay", r => r.order(["b"]));
	}
	// ── Task, own file (line 1 is the task's own {id, title}, as the item tool writes a home-made task) ──
	{
		const file = file_of("task.jsonl", { id: "t", title: "Task" }), make = lines => Task.replay(lines);
		const A = tab(file, make, "a"), B = tab(file, make, "b");
		const c = (op, step, n) => cell("Task", "own file", op, A, B, file, make, step, n);
		await c("add", r => r.tasks.add("First"));
		await c("add", r => r.tasks.add({ id: "second", title: "Second" }));
		await c("set", r => r.set({ title: "Task, renamed" }));
		await c("set", r => r.act("start"));
		await c("move", r => r.tasks.move("second", { after: null }));
		await c("remove", r => r.tasks.remove("first"));
		await c("replay", r => r.tasks.find("second").act("pause"));   // started already: the root's start() starts its children
	}
	// ── Task, nested in a Session (a subtask two levels down, a move between two tasks' lists) ──
	{
		const file = file_of("session-tasks.jsonl", { session: { id: "s1", kind: "test" } }), make = lines => Session.replay(lines);
		const A = tab(file, make, "a"), B = tab(file, make, "b");
		const c = (op, step, n) => cell("Task", "nested", op, A, B, file, make, step, n);
		A.root.tasks.add({ id: "ui", title: "UI" }); A.root.tasks.add({ id: "api", title: "API" }); await tick(); A.pull(); B.pull();
		await c("add", r => r.tasks.find("ui").tasks.add({ id: "c3", title: "Tab bar" }));
		await c("set", r => r.tasks.find("ui").tasks.find("c3").set({ title: "Tab bar, fixed" }));
		await c("set", r => r.tasks.find("ui").tasks.find("c3").act("start"));
		await c("move", r => r.tasks.find("api").tasks.move("c3", { after: null, from: r.tasks.find("ui").tasks }));
		await c("remove", r => r.tasks.find("api").tasks.remove("c3"));
		await c("replay", r => r.tasks.find("ui").act("start"));
		const verb = lines_of(file).at(-1);
		t.eq(J({ tasks: verb.tasks }), J({ tasks: { ui: { start: {} } } }), "Task (nested): a verb on a session's task names the list: {\"tasks\":{\"ui\":{\"start\":{}}}}");
	}
	// ── Prompt, own file and nested in a Session ──
	{
		const file = file_of("prompt.jsonl", { id: "p", title: "Prompt" }), make = lines => Prompt.replay(lines);
		const A = tab(file, make, "a"), B = tab(file, make, "b");
		const c = (op, step, n) => cell("Prompt", "own file", op, A, B, file, make, step, n);
		await c("add", r => r.paragraphs.add({ id: "p1", text: "Fix the bar." }));
		await c("add", r => r.paragraphs.add({ id: "p2", text: "Then ship." }));
		await c("set", r => r.paragraphs.find("p1").set({ text: "Fix the tab bar." }));
		await c("move", r => r.paragraphs.move("p2", { after: null }));
		await c("remove", r => r.paragraphs.remove("p2"));
		await c("replay", r => r.replies.add({ id: "r1", text: "On it." }));
	}
	{
		const file = file_of("session-prompt.jsonl", { session: { id: "s2", kind: "test" } }), make = lines => Session.replay(lines);
		const A = tab(file, make, "a"), B = tab(file, make, "b");
		const c = (op, step, n) => cell("Prompt", "nested", op, A, B, file, make, step, n);
		await c("add", r => r.tasks.add({ type: "Prompt", id: "p1", title: "A prompt" }));
		await c("add", r => r.tasks.find("p1").paragraphs.add({ id: "a", text: "Words." }));
		await c("set", r => r.tasks.find("p1").paragraphs.find("a").set({ text: "Better words." }));
		await c("move", r => { const ps = r.tasks.find("p1").paragraphs; ps.add({ id: "b", text: "More." }); }); await c("move", r => r.tasks.find("p1").paragraphs.move("b", { after: null }));
		await c("remove", r => r.tasks.find("p1").paragraphs.remove("a"));
		await c("replay", r => r.tasks.find("p1").replies.add({ id: "r", text: "Reply." }));
	}
	// ── Question, own file and nested under a Prompt in a Session ──
	{
		const file = file_of("question.jsonl", { id: "q", title: "Which one?" }), make = lines => Question.replay(lines);
		const A = tab(file, make, "a"), B = tab(file, make, "b");
		const c = (op, step, n) => cell("Question", "own file", op, A, B, file, make, step, n);
		await c("add", r => r.tasks.add({ id: "look", title: "Look it up" }));
		await c("set", r => r.set({ answer: "The first." }));
		await c("move", r => r.tasks.add({ id: "two", title: "Two" })); await c("move", r => r.tasks.move("two", { after: null }));
		await c("remove", r => r.tasks.remove("two"));
		await c("replay", r => r.tasks.find("look").act("start"));
	}
	{
		const file = file_of("session-question.jsonl", { session: { id: "s3", kind: "test" } }), make = lines => Session.replay(lines);
		const A = tab(file, make, "a"), B = tab(file, make, "b");
		const c = (op, step, n) => cell("Question", "nested", op, A, B, file, make, step, n);
		A.root.tasks.add({ type: "Prompt", id: "p1", title: "P" }); A.root.tasks.add({ type: "Prompt", id: "p2", title: "P2" }); await tick(); A.pull(); B.pull();
		await c("add", r => r.tasks.find("p1").tasks.add({ type: "Question", id: "q1", text: "Why?" }));
		await c("set", r => r.tasks.find("p1").tasks.find("q1").set({ answer: "Because." }));
		await c("move", r => r.tasks.find("p2").tasks.move("q1", { after: null, from: r.tasks.find("p1").tasks }));
		await c("remove", r => r.tasks.find("p2").tasks.remove("q1"));
		await c("replay", r => r.tasks.find("p1").tasks.add({ type: "Question", id: "q2", text: "And?" }));
	}
	// ── Session, own file, and a Session nested in a Session (in the same file, not a reference) ──
	{
		const file = file_of("session.jsonl", { session: { id: "s4", kind: "test" } }), make = lines => Session.replay(lines);
		const A = tab(file, make, "a"), B = tab(file, make, "b");
		const c = (op, step, n) => cell("Session", "own file", op, A, B, file, make, step, n);
		await c("add", r => r.tasks.add("Write the plan"));
		await c("add", r => r.tasks.add({ id: "build", title: "Build it" }));
		await c("set", r => r.set({ title: "A session" }));
		await c("move", r => r.tasks.move("build", { after: null }));
		await c("remove", r => r.tasks.remove("write-the-plan"));
		await c("replay", r => r.tasks.find("build").act("start"));
	}
	{
		const file = file_of("session-session.jsonl", { session: { id: "s5", kind: "test" } }), make = lines => Session.replay(lines);
		const A = tab(file, make, "a"), B = tab(file, make, "b");
		const c = (op, step, n) => cell("Session", "nested", op, A, B, file, make, step, n);
		await c("add", r => r.tasks.add({ type: "Session", id: "child", title: "Child session" }));
		await c("add", r => r.tasks.find("child").tasks.add({ id: "k", title: "Its task" }));
		await c("set", r => r.tasks.find("child").set({ title: "Child, renamed" }));
		await c("move", r => r.tasks.find("child").tasks.add({ id: "k0", title: "First" })); await c("move", r => r.tasks.find("child").tasks.move("k0", { after: null }));
		await c("remove", r => r.tasks.find("child").tasks.remove("k"));
		await c("replay", r => r.tasks.find("child").tasks.find("k0").act("start"));
	}
	// ── Page, own file, and a content part nested in it (a Page in a Page is its own file: it never bubbles) ──
	{
		const file = file_of("page.jsonl", { title: "Page" }), make = lines => Page.replay(lines);
		const A = tab(file, make, "a"), B = tab(file, make, "b");
		const c = (op, step, n) => cell("Page", "own file", op, A, B, file, make, step, n);
		await c("add", r => r.content.add({ id: "one", type: "part-text", text: "First." }));
		await c("add", r => r.content.add({ id: "two", type: "part-text", text: "Second." }));
		await c("set", r => r.set({ title: "Page, renamed" }));
		await c("move", r => r.content.move("two", { after: null }));
		await c("remove", r => r.content.remove("one"));
		await c("replay", r => r.content.add({ id: "three", type: "part-text", text: "Third." }));
	}
	{
		const file = file_of("page-part.jsonl", { title: "Page" }), make = lines => Page.replay(lines);
		const A = tab(file, make, "a"), B = tab(file, make, "b");
		const c = (op, step, n) => cell("Page", "nested part", op, A, B, file, make, step, n);
		await c("add", r => r.content.add({ id: "card", type: "part-card", title: "A card", text: "Body." }));
		await c("set", r => r.content.find("card").set({ text: "New body." }));
		await c("move", r => r.content.add({ id: "head", type: "part-heading", text: "Top" })); await c("move", r => r.content.move("head", { after: null }));
		await c("remove", r => r.content.remove("head"));
		await c("replay", r => r.content.find("card").set({ title: "Renamed card" }));
		t.eq(J(lines_of(file).at(-1).content), J({ card: { set: { title: "Renamed card" } } }), "Page (nested part): a part's change names the content list");
	}
} finally { fs.rmSync(TMP, { recursive: true, force: true }); }

console.log("\n   class | mode            add  set  move remove replay");
for (const [row, ops] of Object.entries(matrix)) console.log(`   ${row.padEnd(22)} ${["add", "set", "move", "remove", "replay"].map(op => (ops[op] ?? "—").padEnd(4)).join(" ")}`);
t.done();
