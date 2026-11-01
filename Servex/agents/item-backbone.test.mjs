// The item tool on THIS checkout's classes (the plan review, 2026-10-28): the live Servex runs the main tree's page_tools and
// Item, so a branch's server path is only proven by importing the branch's own copy. Scratch tree in the OS temp folder
// (SERVEX_PUBLIC points the item tool at it): nothing under the live public/ is touched.
//   node Servex/agents/item-backbone.test.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Test from "../../public/framework/core/Test/Test.js";

const ROOT = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "item-backbone-")));
process.env.SERVEX_PUBLIC = path.join(ROOT, "public");
const { run_item } = await import("./page_tools.js");

const REL = "public/framework/ai/sessions/2026/10/28/backbone-test", DIR = path.join(ROOT, REL), URL = "/" + REL.slice("public/".length) + "/";
const FILE = path.join(DIR, "session.jsonl");
const t = new Test("Servex/agents: the item tool on this branch's Item (lines that name their list, dotted keys, old id-only lines)");
const item = delta => run_item({ path: URL, delta }, { caller: "t" });
const lines = () => fs.readFileSync(FILE, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(FILE, JSON.stringify({ session: { id: "2b2b2b2b-aaaa-4bbb-8ccc-000000000028", kind: "vscode-tab", at: "2026-10-28T10:00:00.000Z" } }) + "\n");
try {
	let r = await item({ tasks: { add: [{ id: "ui", title: "UI" }, { id: "api", title: "API" }] } });
	t.ok(r.ok !== false, "two tasks added");
	r = await item({ tasks: { ui: { start: {} } } });
	t.ok(r.ok !== false, "a verb under its list's name (what the browser Store now writes) is accepted: " + (r.why ?? "ok"));
	r = await item({ "tasks.api": { start: {} } });
	t.ok(r.ok !== false, "a dotted key is accepted: " + (r.why ?? "ok"));
	t.eq(Object.keys(lines().at(-1)).filter(k => k !== "by" && k !== "ts"), ["tasks"], "and written nested, never dotted");
	r = await item({ ui: { pause: {} } });
	t.ok(r.ok !== false, "an old id-only line is still accepted (Item.member): " + (r.why ?? "ok"));
	r = await item({ set: { title: "A session" } });
	t.ok(r.ok !== false, "the browser Store's own field line {set:{title}} is accepted: " + (r.why ?? "ok"));

	const { default: Session } = await import("../../public/framework/core/Session/Session.js");
	const s = Session.replay(lines());
	t.eq([s._tasks.find("ui")?.state, s._tasks.find("api")?.state], ["paused", "running"], "replayed from the file: ui paused, api running");
	t.eq(s.get_one("title"), "A session", "the {set:{title}} line is the session's title, not a field named set");
	t.eq(s.get_one("set"), undefined, "nothing stored under \"set\"");
} finally { fs.rmSync(ROOT, { recursive: true, force: true }); }

t.done();
process.exit(process.exitCode ?? 0);
