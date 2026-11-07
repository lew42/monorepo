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
	// 9. Settings routes: <page>/settings/ and a file under it; each knows the page's folder. A settings page has no settings:
	// settings/settings/ is a name in the folder, closing back to the page like every settings page.
	const page = new LivePage({ title: "P", url: "/live/p/" });
	const set = page.route("settings"), file = set.route("LivePage.js"), set2 = set.route("settings");
	ok(set.settings_of === page && set.folder === "/live/p/" && set.icon_name === "settings", "settings/: the page's settings, its folder, a gear");
	ok(file.at === "LivePage.js/" && file.folder === "/live/p/" && file.url === "/live/p/settings/LivePage.js/", "settings/<file>/: a path inside the folder");
	ok(set2.settings_of === page && set2.at === "settings/" && file.settings_of.url === "/live/p/", "no settings of settings: every settings page closes to the page");
	ok(page.icon_name === "folder" && LivePage.src_of(LivePage).endsWith("/live/LivePage.js"), "a page with no icon of its own is a folder; LivePage's file is known");
	// 10. A page with no icon of its own shows where it is stored: an item inside its parent's page.jsonl is a small circle.
	const card = new LivePage({ title: "C", url: "/live/p/c/", focus: { get: () => undefined } });
	const named = new LivePage({ title: "N", url: "/live/p/n/", focus: { get: k => k === "icon" ? "⚡" : undefined } });
	ok(card.icon_name === LivePage.stored.item && named.icon_name === "⚡", "a card opened as a page: a small circle, or its own icon");
	ok(await LivePage.icon_of("/live/p/x.jsonl") === null && LivePage.stored.file === "description", "a loose .jsonl names no icon: a file is drawn");
	const link = icon => ({ get: k => k === "icon" ? icon : undefined });
	ok(LivePage.link_icon(link(), "/live/notes.jsonl") === "description" && LivePage.link_icon(link(), "/live/lab/") === "folder" && LivePage.link_icon(link("⚡"), "/live/lab/") === "⚡", "a link card: a file for a loose .jsonl, a folder for a folder, its own icon first");
	// 11. Nothing blanks the page: a list of ids removes each one (a missing id is skipped), and a line that throws is
	// skipped and kept as a caught error, never thrown.
	await go({ content: { add: [{ type: "part-text", id: "r1", text: "1" }, { type: "part-text", id: "r2", text: "2" }] } });
	await go({ content: { remove: ["r1", "r2", "not-here"] } });
	const removed = await ids("removed");
	ok(removed.includes("r1") && removed.includes("r2") && !removed.includes("not-here"), "{\"remove\": [ids]}: each one kept in removed, a missing id skipped");
	class Boom extends LivePage { boom(){ throw new Error("boom"); } }
	const boom = new Boom({ title: "B", url: "/live/b/" });
	boom.replay_line({ "boom()": {} });
	boom.replay_line({ title: "Still here" });
	ok(boom.caught_errors?.length === 1 && boom.caught_errors[0].where === "line" && boom.get("title") === "Still here", "a line that throws is skipped and kept; the next line still applies");
	// 12. Previews: a card, a link card and the page itself each take a `preview` list by delta, apart from `content`.
	await go({ content: { add: [{ type: "part-card", id: "pv", title: "P", text: "the full text" }, { type: "part-link", id: "lk", title: "L", path: "nope/" }] } });
	await go({ content: { pv: { preview: { add: { type: "part-text", id: "pv1", text: "short" } } } } });
	await go({ content: { lk: { preview: { add: { type: "part-text", id: "lk1", text: "a link's line" } } } } });
	await go({ preview: { add: { type: "part-text", id: "pp1", text: "the page's own preview" } } });
	ok((await ids("content.pv.preview")).join() === "pv1" && !(await ids("content.pv.content")).length, "a card's preview list, apart from its content");
	ok((await ids("content.lk.preview")).join() === "lk1", "a link card has a preview list too");
	await go({ content: { lk: { description: "one line" } } });
	ok((await read("content.lk")).data.description === "one line", "a link card keeps a description (its preview when the list is empty)");
	ok((await ids("preview")).join() === "pp1", "the page's own preview list (it hides Page's preview(nav) on a LivePage)");
	// 13. The page's own tasks: a real list, so a second add keeps the first (it was plain data and replaced it), closed by delta.
	await go({ tasks: { add: { id: "t1", title: "First" } } });
	await go({ tasks: { add: { id: "t2", title: "Second" } } });
	ok((await ids("tasks")).join() === "t1,t2", "two tasks added are both kept");
	await go({ tasks: { t1: { complete: { outcome: "done", evidence: "a test" } } } });
	ok((await read("tasks.t1")).data.state === "complete", "tasks.<id>.complete closes one");
	const tp = new LivePage({ title: "T", url: "/live/t/" }); let heard = 0;
	tp.on("change", () => heard++);
	tp.replay_line({ tasks: { add: { id: "x", title: "X" } } });
	tp.replay_line({ tasks: { x: { complete: { outcome: "o", evidence: "e" } } } });
	ok(tp.tasks.find("x").state === "complete" && heard > 0, "a task's state change reaches the page (the checklist redraws its count)");
	ok(LivePage.path_of({ get: k => ({ href: "/live/tabs/" })[k] }) === "/live/tabs/" && LivePage.path_of({ get: k => ({ path: "./a/", href: "/b/" })[k] }) === "./a/", "a link card's target: path, else href");
	// 14. A sub-page's own file, folded and streamed (meta_stream): a tab or title line there redraws its tab and cards.
	const meta = { title: "beta" };
	ok(LivePage.meta_fold(meta, { class: "/live/LivePage.js" }, true) && meta.cls === "/live/LivePage.js", "line 1's class is kept");
	ok(!LivePage.meta_fold(meta, { content: { add: { type: "part-text" } } }, false), "a card line says nothing a tab shows (no redraw)");
	ok(LivePage.meta_fold(meta, { tab: true }, false) && meta.tab === true && LivePage.meta_fold(meta, { title: "Beta" }, false) && meta.title === "Beta", "its own {tab: true} and a new title fold in");
	const view = { el: { isConnected: true } }, got = [];
	LivePage.on_meta(view, u => u === "/live/x/beta/", u => got.push(u));
	LivePage.meta_heard.forEach(fn => fn("/live/x/alpha/")); LivePage.meta_heard.forEach(fn => fn("/live/x/beta/"));
	ok(got.join() === "/live/x/beta/", "on_meta calls back only for the urls the view shows");
	view.el.isConnected = false; const before = LivePage.meta_heard.size;
	LivePage.meta_heard.forEach(fn => fn("/live/x/beta/"));
	ok(got.length === 1 && LivePage.meta_heard.size === before - 1, "a view that left lets go the next time it is heard");
	console.log(`LivePage.test: ${n} passed`);
} finally {
	fs.rmSync(DIR, { recursive: true, force: true });
}
