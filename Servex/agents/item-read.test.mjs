/* The item tool's `read` parameter and its two companions (requirements.md, "Item tool: read a dotted path, refuse read-only
 * verbs, build the page's own class"): a read with no write, a refusal of read-only method names as deltas, and a page.jsonl
 * that replays as the class its own line 1 names. `node Servex/agents/item-read.test.mjs` */
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { run_item } from "./page_tools.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REL = "public/framework/ai/sessions/2026/10/16/.item-read-test-" + process.pid;
const DIR = path.join(ROOT, REL), URL = "/" + REL.slice("public/".length) + "/";
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };

fs.mkdirSync(DIR, { recursive: true });
try {
	// 1. A READ OF AN ITEM: no write, the item's own data, not the whole file.
	const TFILE = path.join(DIR, "task.jsonl");
	fs.writeFileSync(TFILE, JSON.stringify({ assign: { title: "Root" } }) + "\n");
	let r = await run_item({ path: URL, delta: { tasks: { add: { title: "Child one" } } } }, { caller: "t" });
	const kid = r.ids[0];
	const after_add = fs.readFileSync(TFILE, "utf8").trim().split("\n").length;
	r = await run_item({ path: URL, read: `tasks.${kid}` }, { caller: "t" });
	ok(r.ok && r.read === `tasks.${kid}` && r.value.id === kid && r.value.data?.title === "Child one", "read of an item: its own data, by dotted path");
	ok(fs.readFileSync(TFILE, "utf8").trim().split("\n").length === after_add, "a read writes nothing: no new line after it");

	// 2. A READ OF A LIST: {total, rows:[{id,type,title}]}, never the raw members.
	r = await run_item({ path: URL, read: "tasks" }, { caller: "t" });
	ok(r.ok && r.value.total === 1 && r.value.rows[0].id === kid && r.value.rows[0].title === "Child one", "read of a list: total + rows, not the raw members");

	// 3. A MISSING PATH: {ok:false, why, here} naming what exists at the last good step.
	r = await run_item({ path: URL, read: `tasks.${kid}.tasks.nope` }, { caller: "t" });
	ok(r.ok === false && /no such path: nope/.test(r.why) && Array.isArray(r.here), "a missing path says so and names what is there instead");

	// 4. THE 4 KB CUT: many rows truncate, the real total still shows.
	{
		const lines = Array.from({ length: 300 }, (_, i) => JSON.stringify({ tasks: { add: { id: "blk" + String(i).padStart(5, "0"), title: `Bulk task number ${i} with some padding text to make it longer` } } }));
		fs.appendFileSync(TFILE, lines.join("\n") + "\n");
		r = await run_item({ path: URL, read: "tasks" }, { caller: "t" });
		ok(r.ok && r.value.total === 301 && r.value.truncated === true && r.value.rows.length < r.value.total, "past ~4 KB, rows are cut but the total stays the real count");
		ok(JSON.stringify(r).length < 4096 + 512, "the capped answer stays near the 4 KB cap");
	}

	// 5. A REFUSED READ-ONLY VERB: {"get":"content"} (the owner's actual bug report) never writes, points at `read`.
	const PDIR = path.join(DIR, "page"), PFILE = path.join(PDIR, "page.jsonl"), PURL = URL + "page/";
	fs.mkdirSync(PDIR); fs.writeFileSync(PFILE, JSON.stringify({ title: "A page" }) + "\n");
	r = await run_item({ path: PURL, delta: { get: "content" } }, { caller: "t" });
	ok(r.ok === false && /"get" only reads/.test(r.why) && /read:/.test(r.why), "a top-level read-only verb is refused before anything is written");
	ok(fs.readFileSync(PFILE, "utf8").trim().split("\n").length === 1, "nothing was appended to the page");
	r = await run_item({ path: PURL, delta: { content: { walk: {} } } }, { caller: "t" });
	ok(r.ok === false && /"walk" only reads/.test(r.why), "a read-only verb nested under a target is refused too");

	// 6a. THE PAGE'S OWN CLASS, RELATIVE SPEC: line 1 names "./Dummy.js" beside page.jsonl; a method only Dummy defines
	// shows in instructions, and the class name is Dummy, not Page.
	{
		const DDIR = path.join(DIR, "dummy"), DFILE = path.join(DDIR, "page.jsonl");
		fs.mkdirSync(DDIR);
		fs.writeFileSync(path.join(DDIR, "Dummy.js"), [
			'import Page from "/framework/core/Page/Page.class.js";',
			"export default class Dummy extends Page { ping(){ return \"pong\"; } }",
			"",
		].join("\n"));
		fs.writeFileSync(DFILE, JSON.stringify({ class: "./Dummy.js", title: "Dummy page" }) + "\n");
		r = await run_item({ path: URL + "dummy/" }, { caller: "t2" });   // first call: instructions included
		ok(r.ok && r.instructions?.class === "Dummy", "a relative class spec resolves to that module's own class, not plain Page");
		ok(r.instructions.methods.some(m => m.name === "ping"), "the resolved class's own method shows in instructions");
	}

	// 6b. THE PAGE'S OWN CLASS, SITE-ABSOLUTE SPEC, THE REAL BUG: a copy of /live/page.jsonl (never the real file) with its
	// line 1 rewritten to the site-absolute form ("/live/LivePage.js") a sub-page's class line can also use. The expected
	// methods are read off the real classes, never hardcoded: LivePage.js is a live file another agent may be editing.
	{
		const { default: Page } = await import(pathToFileURL(path.join(ROOT, "public/framework/core/Page/Page.class.js")).href);
		const { default: LivePage } = await import(pathToFileURL(path.join(ROOT, "public/live/LivePage.js")).href);
		const page_methods = new Set(Page.describe().methods.map(m => m.name));
		const live_only = LivePage.describe().methods.map(m => m.name).filter(m => !page_methods.has(m));
		ok(live_only.length > 0, "LivePage defines at least one method beyond plain Page (else this proof tests nothing)");

		const live_src = path.join(ROOT, "public/live/page.jsonl");
		const live_lines = fs.readFileSync(live_src, "utf8").trim().split("\n").map(l => JSON.parse(l));
		live_lines[0] = { ...live_lines[0], class: "/live/LivePage.js" };
		const LDIR = path.join(DIR, "live-copy"), LFILE = path.join(LDIR, "page.jsonl");
		fs.mkdirSync(LDIR);
		fs.writeFileSync(LFILE, live_lines.map(l => JSON.stringify(l)).join("\n") + "\n");
		r = await run_item({ path: URL + "live-copy/" }, { caller: "t3" });
		ok(r.ok && r.instructions?.class === "LivePage", "a site-absolute class spec (/live/LivePage.js) also resolves off the real module, not plain Page");
		// The help lists the DECLARED surface (static callable), with a doc each: LivePage's four, Page's two, Item's three; none of the ~140 render/log/column methods.
		const shown = r.instructions.methods.map(x => x.name);
		for (const m of ["flash", "alert", "save", "restore"]) ok(shown.includes(m), `LivePage's declared "${m}" shows in instructions, not just Page's`);
		for (const m of ["tab", "place", "set", "unset", "remove"]) ok(shown.includes(m), `the inherited declared "${m}" shows`);
		for (const m of ["draw_card", "paint_voice", "render", "column_host", "preview_card", "log_view", "toJSON", "emit", "walk"]) ok(!shown.includes(m), `plumbing "${m}" is not in the help`);
		ok(shown.length <= 12, `the help lists a handful of methods, not the whole prototype chain (${shown.length} listed)`);
		ok(r.instructions.methods.every(x => x.doc), "every listed method has a one-line doc");
	}

	console.log(`item-read: ${n} checks passed`);
} finally {
	fs.rmSync(DIR, { recursive: true, force: true });
}
process.exit(0);
