// node Server/UndoneVerify.test.mjs — UndoneVerify on a throwaway repo: batches, the "done needs a real path" rule, merge, and carry-by-id.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import UndoneVerify from "./UndoneVerify.mjs";
import UndoneAsks from "./UndoneAsks.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "uverify-"));
const put = (p, t) => { fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true }); fs.writeFileSync(path.join(root, p), t); };
put("public/framework/ux/Dictate/readme.md", "# Dictate\nMic stuff.\n");
put("public/framework/ux/Dictate/Dictate.js", "export default class Dictate {}\n");
const asks = n => Array.from({ length: n }, (_, i) => ({ id: "id" + i, kind: "refined", state: "undone", text: "ask number " + i, days: i, source: "/s", where: {}, evidence: null }));
put(UndoneVerify.DATA, JSON.stringify({ modules: [{ module: "ux/Dictate", asks: [...asks(30), { id: "gone", state: "done", text: "x" }] }] }));

const u = new UndoneVerify({ root }), out = path.join(root, "batches");
const m = u.write_batches(out);
assert.equal(m.length, 2, "30 asks make two batches of 15");
assert.deepEqual(m.map(b => b.asks), [15, 15]);
assert.ok(fs.readFileSync(path.join(out, m[0].batch, "brief.md"), "utf8").includes("Mic stuff"), "the module readme is inlined");

const ids = JSON.parse(fs.readFileSync(path.join(out, m[0].batch, "asks.json"), "utf8"));
fs.writeFileSync(path.join(out, m[0].batch, "results.json"), JSON.stringify([
	{ id: ids[0], verdict: "done", evidence: "public/framework/ux/Dictate/Dictate.js:1 - export default class Dictate", looked: ["Dictate.js"] },
	{ id: ids[1], verdict: "done", evidence: "it is surely built somewhere" },
	{ id: ids[2], verdict: "undone", evidence: "grep 'mic' in readme.md, doc/, git log -S: nothing", looked: ["readme.md"] },
	{ id: "gone", verdict: "done", evidence: "x.js" },
	{ id: ids[3], verdict: "maybe", evidence: "x" }]));
const r = u.merge(out, { at: "T" });
assert.equal(r.verified, 4, "the unknown id and the done-state ask are ignored");
assert.deepEqual([r.done, r.undone, r.unclear], [1, 1, 2], "a done with no real path becomes unclear; a bad verdict becomes unclear");
assert.ok(r.agree, "verified = done + undone + unclear");
assert.deepEqual(u.write_batches(path.join(root, "again")).map(b => b.asks), [13, 13], "a second run batches only the unverified asks");

// carry: a rebuild keeps verdicts by id
const fresh = { modules: [{ module: "ux/Dictate", asks: [{ id: ids[0], state: "undone" }, { id: "new" }] }] };
assert.equal(UndoneAsks.carry(fresh, u.file), 1);
assert.equal(fresh.modules[0].asks[0].verified, "done");
assert.equal(fresh.modules[0].asks[1].verified, undefined);
assert.equal(UndoneAsks.ask_id({ kind: "a", source: "s", text_full: "t" }), UndoneAsks.ask_id({ kind: "a", source: "s", text_full: "t" }));
console.log("UndoneVerify: ok");
