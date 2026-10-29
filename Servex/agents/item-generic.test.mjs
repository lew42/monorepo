/* node Servex/agents/item-generic.test.mjs — the item tool, generic over every class (data-shapes build I, plan step 1e):
 * a page write applies one line to the page's live root (no whole-page replay), a task is added by a class verb, a dotted path
 * sets three levels deep, and an agent-made id is 8 random characters. Brief: core/Session/tasks/data-shapes/build/item-tool/. */
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { run_item, page_tools, record_lines } from "./page_tools.js";
import Item from "../../public/framework/core/Item/Item.js";
import Task from "../../public/framework/core/Task/Task.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REL = "public/framework/ai/sessions/2026/10/16/.item-generic-test-" + process.pid;
const DIR = path.join(ROOT, REL), URL = "/" + REL.slice("public/".length) + "/";
const read = file => fs.readFileSync(file, "utf8").trim().split("\n").map(l => JSON.parse(l));
const RANDOM = /^[a-z][a-z0-9]{7}$/;
let n = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); n++; };

fs.mkdirSync(DIR, { recursive: true });
try {
	// 1. A PAGE through its live root: set, add, call, log, each one line, and the page is never replayed again.
	{
		const PDIR = path.join(DIR, "page"), PFILE = path.join(PDIR, "page.jsonl"), PURL = URL + "page/";
		fs.mkdirSync(PDIR); fs.writeFileSync(PFILE, JSON.stringify({ title: "Generic" }) + "\n");
		let r = await run_item({ path: PURL }, { caller: "t" });   // the first read builds the live root
		ok(r.ok && /# Generic/.test(r.state), "a page reads through its live root");
		const { default: Page } = await import(pathToFileURL(path.join(ROOT, "public/framework/core/Page/Page.class.js")).href);
		const host = Item.Store.instances.get(PURL + "page.jsonl").host, replay = Page.replay;
		let replays = 0;
		Page.replay = function(...a){ replays++; return replay.apply(this, a); };
		try {
			const tool = name => page_tools().find(t => t.name === name).handler;
			r = await run_item({ path: PURL, delta: { title: "Renamed" } }, { caller: "t" });
			ok(r.ok && /# Renamed/.test(r.state), "page set: the answer is drawn from the live root");
			const added = JSON.parse(await tool("page_add")({ path: PURL, item: { type: "part-card", title: "Card one" } }, { caller: "t" }));
			ok(added.ok && RANDOM.test(added.id), "page add: the card gets an 8-character random id");
			const called = JSON.parse(await tool("page_call")({ path: PURL, target: ["content", added.id], method: "set", args: { text: "called" } }, { caller: "t" }));
			const logged = JSON.parse(await tool("page_log")({ path: PURL, text: "testing" }, { caller: "t" }));
			ok(called.ok && logged.ok, "page call and page log go through the same write");
			ok(replays === 0, `four page writes replayed the page ${replays} times (0: each line is applied to the live root)`);
			ok(Item.Store.instances.get(PURL + "page.jsonl").host === host, "it is the same live root object before and after");
			ok(host.title === "Renamed" && [...host.content].some(i => i.id === added.id && i.data.text === "called") && host.data.log?.text === "testing", "the live root holds every change");
			ok(read(PFILE).length === 5, "one line per write, nothing else");
			r = await run_item({ path: PURL, delta: { content: { add: { type: "part-nope" } } } }, { caller: "t" });
			ok(r.ok === false && read(PFILE).length === 5, "a page line its schema refuses writes nothing");
			// A browser's raw line (record_lines, the one writer) advances the same warm root; one node cannot apply is still kept.
			let w = record_lines(PFILE, [{ description: "from a tab", by: "owner", ts: new Date().toISOString() }]);
			ok(w.written === 1 && replays === 0 && host.get_one("description") === "from a tab", "a browser's page line advances the warm Page, no replay");
			host.replay_line = () => { throw new Error("a part only the browser registers"); };
			w = record_lines(PFILE, [{ icon: "x", by: "owner", ts: new Date().toISOString() }]);
			delete host.replay_line;
			ok(w.written === 1 && !w.refused.length && read(PFILE).length === 7 && !Item.Store.instances.get(PURL + "page.jsonl").host, "a browser page line node cannot apply is still written; the warm root is dropped, the next read replays");
		} finally { Page.replay = replay; }
		const fresh = await import(pathToFileURL(path.join(ROOT, "public/framework/core/Page/Page.class.js")).href).then(m => m.default.replay(read(PFILE)));
		ok(fresh.title === "Renamed" && fresh.get_one("description") === "from a tab" && [...fresh.content].length === 1, "a fresh replay of the file gives the same page");
	}

	// 2. A TASK ADDED BY VERB. The list's own `add` at a dotted target, and the Improvements class's `add`, which merges a repeated title:
	//    the tool writes each line as sent (it no longer rewrites an improvement into a reinforce).
	const TFILE = path.join(DIR, "task.jsonl");
	fs.writeFileSync(TFILE, JSON.stringify({ assign: { title: "Root" } }) + "\n");
	{
		let r = await run_item({ path: URL, delta: { tasks: { add: { title: "Level one" } } } }, { caller: "t" });
		const a = r.ids[0];
		ok(r.ok && RANDOM.test(a), "an agent-made task id is 8 random characters, not a slug of its title");
		r = await run_item({ path: URL, delta: { tasks: { add: { title: "Level one, again" } } } }, { caller: "t" });
		ok(r.ok && RANDOM.test(r.ids[0]) && r.ids[0] !== a, "a second add draws its own id");
		r = await run_item({ path: URL, target: [`tasks.${a}`], delta: { tasks: { add: { title: "Level two", id: "b" } } } }, { caller: "t" });
		ok(r.ok, "a task added by the list's own verb at a dotted target");
		r = await run_item({ path: URL, target: [`tasks.${a}.tasks.b`], delta: { tasks: { add: { title: "Level three" } } } }, { caller: "t" });
		const c = r.ids[0];
		ok(r.ok && RANDOM.test(c), "three deep, the add gets a random id too");

		// 3. A DOTTED PATH SET THREE LEVELS DEEP: written nested (the store writes nested), applied by each level's own get.
		r = await run_item({ path: URL, delta: { [`tasks.${a}.tasks.b.tasks.${c}.description`]: "set three deep" } }, { caller: "t" });
		ok(r.ok && read(TFILE).at(-1).tasks?.[a]?.tasks?.b?.tasks?.[c]?.description === "set three deep", "the line is written nested, never dotted");
		r = await run_item({ path: URL, target: `tasks.${a}.tasks.b.tasks.${c}`, delta: { start: {} } }, { caller: "t" });
		const t = Task.replay(read(TFILE));
		const deep = t.tasks.get(a).tasks.get("b").tasks.get(c);
		ok(deep.get_one("description") === "set three deep" && deep.state === "running", "a fresh replay finds it three levels down, set and started");
	}
	{
		const IFILE = path.join(DIR, "improvements.jsonl"), IURL = URL + "improvements.jsonl";
		let r = await run_item({ path: IURL, delta: { tasks: { add: { title: "Link the map", why: "a dead link" } } } }, { caller: "t" });
		const first = r.ids[0];
		r = await run_item({ path: IURL, delta: { tasks: { add: { title: "link the  MAP", why: "seen again" } } } }, { caller: "t" });
		ok(r.ok && !r.ids.length && r.merged?.[0]?.into === first && r.merged[0].weight === 2, "an improvement proposed again merges into the first (Improvements' own add)");
		ok(read(IFILE).some(l => l.tasks?.add?.title === "link the  MAP"), "the tool wrote the add as sent: the merge is the class's verb, on write and on replay");
		const { default: Improvements } = await import("../../public/framework/core/Task/Improvements.js");
		const fresh = Improvements.replay(read(IFILE));
		ok([...fresh.tasks].length === 1 && fresh.tasks.get(first).weight === 2, "a fresh replay merges the same way: one task, weight 2");
	}
	ok(RANDOM.test(Item.short_id()) && new Set(Array.from({ length: 1000 }, () => Item.short_id())).size === 1000, "Item.short_id: 8 characters, a letter first, 1000 draws all distinct");
	console.log(`item-generic: ${n} checks passed`);
} finally {
	fs.rmSync(DIR, { recursive: true, force: true });
}
process.exit(0);
