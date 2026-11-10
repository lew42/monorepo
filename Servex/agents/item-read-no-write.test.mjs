/* A read never writes (2026-11-10): viewing a session page asks Servex for its cost with a query on the session's route, and that
 * once made a session folder (page_tools.js session_file) and, for an id that is not a uuid, threw a 500. Each read below must answer
 * (ok or a reason, never a throw) and leave the sessions tree exactly as it was. `node Servex/agents/item-read-no-write.test.mjs` */
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { run_item } from "./page_tools.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".."), SESSIONS = path.join(ROOT, "public/framework/ai/sessions");
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };
// Where a new folder would land: sessions/ itself and today's day folders (local and UTC), each listed with its files. session-folders.json is
// SessionFolders' own gitignored cache (written on its first refresh), not a session.
const days = () => { const d = new Date(), f = (y, m, dd) => path.join(SESSIONS, String(y), String(m).padStart(2, "0"), String(dd).padStart(2, "0"));
	return [SESSIONS, f(d.getFullYear(), d.getMonth() + 1, d.getDate()), f(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate())]; };
const tree = () => days().map(dir => { try { return dir + ":" + fs.readdirSync(dir).filter(n => n !== "session-folders.json").sort().join(","); } catch { return dir + ": none"; } }).join("\n");

const before = tree();
const reads = [
	["an agent whose session id is not a uuid", { path: "/framework/ai/sessions/voice-app/", delta: { summary: {} } }],
	["a uuid with no folder", { path: `/framework/ai/sessions/${crypto.randomUUID()}/`, delta: { summary: {} } }],
	["a name nobody has", { path: "/framework/ai/sessions/no-such-agent-xyz/", delta: { cost: {} } }],
	["a plain read of an agent route", { path: "/framework/ai/sessions/voice-app/", read: "title" }],
];
for (const [what, args] of reads){
	let r, threw = null;
	try { r = await run_item(args, { caller: "t" }); } catch (e) { threw = e; }
	ok(!threw, `${what}: answers, never throws (${threw?.message})`);
	ok(r && (r.ok !== undefined || r.why || r.value !== undefined), `${what}: an answer or a reason (${JSON.stringify(r)?.slice(0, 120)})`);
	const t = tree();
	ok(t === before, `${what}: the sessions tree is unchanged` + (t === before ? "" : `\nbefore ${before}\nafter  ${t}`));
}
// A non-uuid session that HAS a day folder (a cloud voice record) is found by its bare id, and read without a write.
const voice = await run_item({ path: "/framework/ai/sessions/cloud-voice-app-20261106/", read: "id" }, { caller: "t" });
ok(voice.ok !== false, "a non-uuid session with a folder is found by its bare id: " + JSON.stringify(voice).slice(0, 120));
ok(tree() === before, "and reading it changes nothing");
// A day-level folder that is not a session (spawned/, cards/) is never taken for one: a read there gives a reason.
const cards = await run_item({ path: "/framework/ai/sessions/spawned/", delta: { summary: {} } }, { caller: "t" });
ok(cards.ok === false && !/"summary"/.test(JSON.stringify(cards.answer ?? "")), "a folder that is not a session is not read as one: " + (cards.why ?? "").slice(0, 80));
ok(tree() === before, "and nothing changed");
// A write to a name nobody has is still refused, and still makes nothing.
const w = await run_item({ path: "/framework/ai/sessions/no-such-agent-xyz/", delta: { title: "x" } }, { caller: "t" });
ok(w.ok === false && /nothing was created/.test(w.why), "a write to an unknown name is refused: " + w.why);
ok(tree() === before, "and the tree is still unchanged");
console.log(`item-read-no-write: ${n} checks pass`);
