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
import Subpages from "./Subpages.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };

// A real folder under public/, so resolve_file()'s "must stay under public/" gate passes —
// cleaned up at the end either way.
const REL = "public/framework/ai/sessions/2026/10/03/71eead80-a869-421f-83bb-eba7ff83510e/inbox-cards-work/.page-tools-test-" + process.pid;
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

	// ids: every id the tool stamped comes back, and page_read lists each card's type + id.
	{
		const out = await call("page_set", { path: URL, delta: { content: { add: { type: "part-heading", text: "Findings" } } } }, "t");
		ok(out.ok && out.ids.length === 1 && out.ids[0] === out.line.content.add.id, "page_set answers the ids it stamped");
		const md = await read_page({ path: URL });
		ok(md.includes(`[${out.ids[0]}] (part-heading) Findings`), "page_read shows each card's type and id");
	}

	// pages: add / rename / remove make real folders next to the page and link them.
	{
		const add = await call("page_set", { path: URL, delta: { pages: { add: { name: "notes", title: "Notes", icon: "N", description: "One line." } } } }, "t");
		ok(add.ok && add.pages[0].url === URL + "notes/", "pages.add answers the subpage url");
		ok(fs.existsSync(path.join(DIR, "notes", "page.jsonl")), "pages.add made the folder and its page.jsonl");
		ok(lines().some(l => l.file === "notes/page.jsonl"), "pages.add linked it with a file line");
		ok((await read_page({ path: URL })).includes(`- notes ${URL}notes/`), "page_read lists the subpage with its url");

		await call("page_set", { path: URL + "notes/", delta: { content: { add: { type: "part-text", text: "on the subpage" } } } }, "t");
		ok(fs.readFileSync(path.join(DIR, "notes", "page.jsonl"), "utf8").includes("on the subpage"), "a delta on the subpage url lands in the subpage's own page.jsonl");

		const ren = await call("page_set", { path: URL, delta: { pages: { rename: { name: "notes", to: "ideas" } } } }, "t");
		ok(ren.ok && fs.existsSync(path.join(DIR, "ideas", "page.jsonl")) && !fs.existsSync(path.join(DIR, "notes")), "pages.rename moved the folder");
		const md = await read_page({ path: URL });
		ok(md.includes("- ideas ") && !md.includes("- notes "), "page_read lists the new name only (gone line hides the old)");

		const dry = Subpages.at(URL, { dry: true }).remove("ideas");
		ok(dry.dry && fs.existsSync(path.join(DIR, "ideas")), "a dry remove touches nothing");
		const rem = await call("page_set", { path: URL, delta: { pages: { remove: "ideas" } } }, "t");
		ok(rem.ok && !fs.existsSync(path.join(DIR, "ideas")) && fs.readdirSync(path.join(DIR, "_removed")).some(n => n.startsWith("ideas-")), "pages.remove moves the folder to _removed/, never deletes");
		ok(!(await read_page({ path: URL })).includes("## Subpages"), "a removed subpage is no longer listed");

		const bad = await call("page_set", { path: URL, delta: { pages: { add: { name: "Bad Name", title: "x" } } } }, "t");
		ok(!bad.ok, "a bad subpage name is refused");
	}

	// page.js parent: a page.js is code and is never edited (17c696fa6); the child is noted in the parent's page.jsonl, which Page.child reads (645ccbe33).
	{
		const js = path.join(DIR, "pj");
		fs.mkdirSync(js);
		const src = 'export default { title: "P", children: "a/page.jsonl" };\n';
		fs.writeFileSync(path.join(js, "page.js"), src);
		const sub = new Subpages(js);
		sub.add({ name: "b", title: "B" });
		ok(Subpages.listed(path.join(js, "page.jsonl")).join() === "b" && fs.readFileSync(path.join(js, "page.js"), "utf8") === src, "page.js parent: the child is noted in page.jsonl, page.js untouched");
		sub.rename({ name: "b", to: "c" });
		ok(Subpages.listed(path.join(js, "page.jsonl")).join() === "c", "page.js parent: rename relinks");
		sub.remove("c");
		ok(Subpages.listed(path.join(js, "page.jsonl")).length === 0 && fs.readFileSync(path.join(js, "page.js"), "utf8") === src, "page.js parent: remove unlinks, page.js still untouched");
	}

	// a session route deeper than the page resolves to the session's own subpage folder.
	{
		const uuid = crypto.randomUUID(), sess = `/framework/ai/sessions/${uuid}/`;
		let folder;
		try {
			// A session folder is made by the hook, never by a typed path: the uuid is refused until its folder exists.
			const no = await call("page_set", { path: sess, delta: { title: "x" } }, "t");
			ok(!no.ok && /no folder, no transcript and no Servex agent/.test(no.why), "a uuid with no folder, transcript or agent is refused");
			const day = new Date().toISOString().slice(0, 10).replace(/-/g, "/");
			folder = path.join(ROOT, "public/framework/ai/sessions", day, "session-" + uuid.slice(0, 8));
			fs.mkdirSync(folder, { recursive: true });
			fs.writeFileSync(path.join(folder, "session.jsonl"), JSON.stringify({ session: { id: uuid, kind: "vscode-tab" } }) + "\n");   // what the SessionStart hook writes
			const { default: AISession } = await import("../../public/framework/ai/AISession/AISession.js"); AISession.scanned = false;
			const out = await call("page_set", { path: sess, delta: { pages: { add: { name: "notes", title: "Notes", icon: "N", description: "d" } } } }, "t");
			ok(out.ok, "pages.add on a session page");
			ok(path.join(ROOT, path.dirname(out.size.file)) === folder, "the hook's folder (session.jsonl only) is found, never a second one");
			ok(fs.existsSync(path.join(folder, "notes", "page.jsonl")), "the subpage sits in the session's own folder");
			const w = await call("page_set", { path: sess + "notes/", delta: { title: "Renamed" } }, "t");
			ok(w.size.file.endsWith("/notes/page.jsonl"), "a session route deeper than the page resolves to the subpage folder");
			const t = await call("page_set", { path: sess + "other/", delta: { title: "tab" } }, "t");
			ok(t.line.other?.title === "tab", "with no folder, the segment stays a tab target");
			// One character off: refused, and the answer names the real one.
			const typo = uuid.slice(0, -1) + (uuid.at(-1) === "0" ? "1" : "0");
			const t1 = await call("page_set", { path: `/framework/ai/sessions/${typo}/`, delta: { title: "x" } }, "t");
			ok(!t1.ok && t1.why.includes(uuid), "a uuid one character off is refused and the real id suggested");
			const rel = path.relative(path.join(ROOT, "public"), folder).split(path.sep).join("/");
			const t2 = await call("page_set", { path: "/" + rel.slice(0, -1) + "z/", delta: { title: "x" } }, "t");
			ok(!t2.ok && t2.why.includes(path.basename(folder)) && !fs.existsSync(path.join(ROOT, "public", rel.slice(0, -1) + "z")), "a dated folder one character off is refused, not created, and the real folder suggested");
			const t3 = await call("page_set", { path: "/" + rel + "/no-such-task/", delta: { title: "x" } }, "t");
			ok(!t3.ok && !fs.existsSync(path.join(folder, "no-such-task")), "a missing folder inside a session is refused, not created");
			const t4 = await call("page_set", { path: "/framework/ai/sessions/no-such-agent-x/", delta: { title: "x" } }, "t");
			ok(!t4.ok && /no session or Servex agent is called/.test(t4.why) && !fs.existsSync(path.join(ROOT, "public/framework/ai/sessions/no-such-agent-x")), "an unknown agent name is refused, not made a folder");
		} finally { if (folder) fs.rmSync(folder, { recursive: true, force: true }); }
	}

} finally {
	fs.rmSync(DIR, { recursive: true, force: true });
}

console.log(`page_tools: ${checks} checks passed`);
