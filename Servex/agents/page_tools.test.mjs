// page_tools.js's six tools, against a real temp page.jsonl. Plain node:
// `node Servex/agents/page_tools.test.mjs`
//
// Written for bug 2 (2026-10-03, inbox-cards-work): `page_set` called with an `id` instead
// of a `target` path silently dropped the id and overwrote the PAGE's own fields (it once
// set a real page's `title` to null). The fix is in page_tools.js (the tool only ever took
// `target`) and in Echo.js (its `page_set()` wrapper was sending `id`, not `target: [id]`) —
// this test pins the tool's own contract so a future caller can't make the same mistake.
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { page_tools } from "./page_tools.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };

// A real folder under public/, so resolve_file()'s "must stay under public/" gate passes —
// cleaned up at the end either way.
const REL = "public/framework/ai/2026-10-03/inbox-cards-work/.page-tools-test-" + process.pid;
const DIR = path.join(ROOT, REL);
const FILE = path.join(DIR, "page.jsonl");
const URL = "/" + REL.slice("public/".length) + "/";

const tools = Object.fromEntries(page_tools().map(t => [t.name, t]));
// page_add/page_set/page_log/page_call answer one JSON string; page_read answers plain
// markdown or HTML (its own format, never wrapped) — two helpers, never one guessing which.
const call = async (name, args, caller) => JSON.parse(await tools[name].handler(args, { caller }));
const read_page = async (args) => tools.page_read.handler(args);
const lines = () => fs.readFileSync(FILE, "utf8").trim().split("\n").map(l => JSON.parse(l));

fs.mkdirSync(DIR, { recursive: true });
try {

	// page_add makes the page and an item; page_read sees both.
	{
		const out = await call("page_add", { path: URL, item: { title: "First item" } }, "test-agent");
		ok(out.ok && out.id, "page_add returns an id");
		const html = await read_page({ path: URL, format: "html" });
		ok(html.includes(`data-id="${out.id}"`), "page_read (html) shows the new item");
	}

	// page_set with a TARGET PATH changes the item, never the page's own fields — the exact
	// shape Echo.js's page_set(page, id, delta, as) must send (`target: [id]`).
	{
		await call("page_set", { path: URL, target: [], delta: { title: "A page with a real title" } }, "owner");
		const add = await call("page_add", { path: URL, item: { title: "Step one" } }, "echo");
		await call("page_set", { path: URL, target: [add.id], delta: { sections: ["a"] } }, "echo");
		const html = await read_page({ path: URL, format: "html" });
		ok(html.includes(`data-id="${add.id}"`), "the item is still on the page");
		ok(html.includes("<h1>A page with a real title</h1>"), "the PAGE's own title was never touched by an item-targeted page_set");
	}

	// The bug itself (vscode-mastermind, bug 2): a caller that still sends `id` instead of
	// `target` — Echo.js's old shape — must never be silently read as "target the page" and
	// wipe the page's own title. `page_set`'s only path keyword is `target`; an `id` field
	// is simply not part of its contract and must be inert.
	{
		await call("page_set", { path: URL, target: [], delta: { title: "A real page title" } }, "owner");
		const add = await call("page_add", { path: URL, item: { title: "Another item" } }, "echo");
		await call("page_set", { path: URL, id: add.id, delta: { done: true } }, "echo");   // the old, wrong shape
		const md = await read_page({ path: URL });
		ok(md.startsWith("# A real page title"), "an `id` field with no `target` leaves the page's own title alone");
	}

	// `by` is the CALLER's id, never the literal string "agent" (bug 3).
	{
		const add = await call("page_add", { path: URL, item: { title: "Whose line" } }, "task-mastermind-inbox-cards-work");
		const line = lines().find(l => l.content?.add?.id === add.id);
		ok(line?.content.add.by === "task-mastermind-inbox-cards-work", "page_add stamps the real caller, not \"agent\"");
	}
	{
		const add = await call("page_add", { path: URL, item: { title: "Set by whom" } }, "echo");
		await call("page_set", { path: URL, target: [add.id], delta: { flag: true } }, "task-mastermind-inbox-cards-work");
		const line = lines().find(l => l[add.id]?.flag === true);
		ok(line?.[add.id]?.by === "task-mastermind-inbox-cards-work", "page_set stamps the real caller, not \"agent\"");
	}

} finally {
	fs.rmSync(DIR, { recursive: true, force: true });
}

console.log(`page_tools: ${checks} checks passed`);
