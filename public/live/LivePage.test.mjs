/* LivePage as a tiny app, through the real item tool (run_item), on a throwaway LivePage folder: a real Item subclass (a
 * Task) in content, its own methods and subtasks, reorder, save and restore a screen, and nothing lost on remove or clear
 * (LiveContent.js). `node public/live/LivePage.test.mjs` */
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run_item } from "../../Servex/agents/page_tools.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const NAME = ".test-" + process.pid, DIR = path.join(HERE, NAME), URL = `/live/${NAME}/`;
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };
const go = async delta => { const r = await run_item({ path: URL, delta }, { caller: "LivePage.test" }); assert.ok(r.ok, JSON.stringify(delta) + " refused: " + r.why); return r; };
const read = async p => (await run_item({ path: URL, read: p }, { caller: "LivePage.test" })).value;
const ids = async p => (await read(p))?.rows?.map(r => r.id) ?? [];

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(path.join(DIR, "page.jsonl"), JSON.stringify({ class: "/live/LivePage.js", title: "Test" }) + "\n");
try {
	// 1. A Task lives in content as a Task: its methods run, it takes subtasks.
	await go({ content: { add: { type: "Task", id: "ship", title: "Ship it" } } });
	await go({ content: { add: { type: "part-card", id: "c1", title: "Card", text: "hi" } } });
	await go({ content: { add: { type: "live-checklist", id: "list", title: "L", items: [{ id: "a", text: "A" }] } } });
	ok((await read("content.ship")).type === "Task", "a Task added to content is a Task");
	await go({ content: { ship: { start: {} } } });
	ok((await read("content.ship")).data.state === "running", "its own method runs (start)");
	await go({ content: { ship: { tasks: { add: { id: "sub", title: "Step" } } } } });
	ok((await ids("content.ship.tasks")).join() === "sub", "it takes a subtask");

	// 2. Reorder: move and order.
	await go({ content: { move: { id: "ship", after: "c1" } } });
	ok((await ids("content")).join() === "c1,ship,list", "move after");
	await go({ content: { order: ["list", "ship", "c1"] } });
	ok((await ids("content")).join() === "list,ship,c1", "order");

	// 3. Remove keeps the card in `removed`; restore brings it back, still a Task.
	await go({ content: { remove: "ship" } });
	ok((await ids("content")).join() === "list,c1" && (await ids("removed")).join() === "ship", "a removed card is kept in removed");
	await go({ restore: "ship" });
	ok((await ids("content")).join() === "list,c1,ship" && !(await ids("removed")).length, "restore <id> brings it back at the end");
	ok((await read("content.ship")).type === "Task" && (await ids("content.ship.tasks")).join() === "sub", "still a Task with its subtask");

	// 4. Save a screen: the cards go into it, not into removed. A clear keeps them.
	await go({ save: { name: "s1", title: "Saved" } });
	ok(!(await ids("content")).length && (await ids("screens.s1.content")).join() === "list,c1,ship" && !(await ids("removed")).length, "save moves the cards into the screen, nothing into removed");
	ok((await read("screens.s1.content.ship")).type === "Task", "a Task inside a saved screen is a Task");
	await go({ content: { add: { type: "part-text", id: "t1", text: "x" } } });
	await go({ content: { clear: true } });
	ok((await ids("removed")).join() === "t1", "clear keeps what it took");
	await go({ restore: "s1" });
	ok((await ids("content")).join() === "list,c1,ship", "restore a screen");

	// 5. A removed screen is kept too, and comes back as a screen.
	await go({ screens: { remove: "s1" } });
	ok(!(await ids("screens")).length && (await ids("removed")).includes("s1"), "a removed screen is kept in removed");
	await go({ restore: "s1" });
	ok((await ids("screens")).join() === "s1" && !(await ids("removed")).includes("s1"), "restore brings the screen back to screens");

	// 6. A fresh replay of the whole log gives the same state (removed is part of the page's saved shape).
	const before = JSON.stringify(await read("removed"));
	ok(JSON.stringify(await read("removed")) === before && (await read("screens.s1.content.ship")).type === "Task", "replay is stable");
	// 7. Every card is a page: /live/<id>/ takes the same deltas as /live/, nested in the one page.jsonl, at any depth.
	const at = (u, delta) => run_item({ path: URL + u, delta }, { caller: "LivePage.test" });
	ok((await at("c1/", { content: { add: { type: "part-card", id: "inner", title: "Inner" } } })).ok, "write to /<page>/c1/ (a card, no folder)");
	ok((await ids("content.c1.content")).join() === "inner" && !fs.existsSync(path.join(DIR, "c1")), "the card holds it, and no folder was made");
	ok((await at("c1/inner/", { content: { add: { type: "part-text", id: "deep", text: "two down" } } })).ok && (await ids("content.c1.content.inner.content")).join() === "deep", "at any depth");
	await at("c1/inner/", { content: { remove: "deep" } });
	ok((await ids("removed")).includes("deep"), "a card removed deep down is kept in the page's removed");
	await at("s1/c1/", { title: "Renamed in the screen" });
	ok((await read("screens.s1.content.c1")).data.title === "Renamed in the screen", "a card inside a saved screen: /<page>/s1/c1/");
	await at("nope/", { title: "x" });
	ok(fs.existsSync(path.join(DIR, "nope", "page.jsonl")), "a segment naming no card keeps the old answer (a new page there)");
	// 8. A sub-page is never a tab by default: only the parent's {"tab": {"name", "tab"}} line (the last one wins) picks it.
	const { default: LivePage } = await import("./LivePage.js");   // after run_item: its loader resolves /framework/ imports
	const picks = LivePage.picks_of([{ tab: { name: "a", tab: true } }, { tab: { name: "b", tab: true } }, { tab: { name: "b", tab: false } }, { title: "x" }]);
	ok(picks.get("a") === true && picks.get("b") === false && !picks.has("c"), "tab picks: opt-in only, the last line wins");
	console.log(`LivePage.test: ${n} passed`);
} finally {
	fs.rmSync(DIR, { recursive: true, force: true });
}
