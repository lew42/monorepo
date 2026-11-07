// SessionConsolidate's check: one scratch store, then the real one. A flat sessions/<uuid>/ folder fails it, loudly.
// `node Server/SessionConsolidate.test.mjs`. Doc: public/framework/ai/sessions/doc/one-folder.md.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import SessionConsolidate from "./SessionConsolidate.mjs";

const ID = "c0c0c0c0-0003-4a19-9b01-000000000003";
const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "session-consolidate-")), STORE = path.join(ROOT, "public/framework/ai/sessions");
const put = (rel, obj) => { const d = path.join(STORE, rel); fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, "session.jsonl"), JSON.stringify(obj) + "\n"); };
try {
	put("2026/11/03/session-c0c0c0c0", { session: { id: ID } });
	fs.mkdirSync(path.join(STORE, "tasks"), { recursive: true });   // a plain folder at the root is fine
	let r = await SessionConsolidate.check(ROOT);
	assert.equal(r.ok, true, "one dated folder: ok");
	assert.deepEqual(r.flat, []);

	fs.mkdirSync(path.join(STORE, ID));   // a writer went around SessionFolders
	r = await SessionConsolidate.check(ROOT);
	assert.equal(r.ok, false, "a flat sessions/<uuid>/ folder fails the check");
	assert.deepEqual(r.flat, [ID]);

	fs.rmSync(path.join(STORE, ID), { recursive: true });
	put("2026/11/04/" + ID, { session: { id: ID } });   // the same session held by a second dated folder: a twin
	r = await SessionConsolidate.check(ROOT);
	assert.equal(r.ok, false, "a twin fails the check (the CLI exits 1 on this)");
	assert.equal(r.count, 1);

	// The real store: no flat session folder may exist. If this fails, fold it into its dated folder (doc above).
	const real = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
	assert.deepEqual(SessionConsolidate.flat(real), [], "flat session folders in public/framework/ai/sessions/");
	console.log("SessionConsolidate.test: ok");
} finally { fs.rmSync(ROOT, { recursive: true, force: true }); }
