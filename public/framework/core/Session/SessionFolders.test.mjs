// SessionFolders, the store's one finder: one instance on a scratch store, the top of its work, and the cases its saved map could get wrong.
// `node public/framework/core/Session/SessionFolders.test.mjs`. Doc: public/framework/ai/sessions/doc/one-folder.md.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import SessionFolders from "./SessionFolders.mjs";

const A = "a0a0a0a0-0001-4a19-9b01-000000000001", B = "b0b0b0b0-0002-4a19-9b01-000000000002";
const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "session-folders-"));
const put = (rel, file, obj) => { const d = path.join(ROOT, rel); fs.mkdirSync(d, { recursive: true }); if (file) fs.writeFileSync(path.join(d, file), JSON.stringify(obj) + "\n"); return d; };
const fresh = () => { SessionFolders.stores.delete(path.resolve(ROOT)); return SessionFolders.at(ROOT); };   // a new process: only the saved map is remembered
try {
	const slug = put("2026/10/03/a-slug", "session.jsonl", { session: { id: A } });
	let s = SessionFolders.at(ROOT);
	assert.equal(s.of(A), slug, "a slug folder is found by the id on its line 1");
	assert.equal(s.home(B, "2026/11/01"), path.join(ROOT, "2026/11/01/session-b0b0b0b0"), "an id with no folder gets session-<id8> on the day asked");
	assert.ok(!fs.existsSync(path.join(ROOT, "2026/11/01")), "home() never makes a folder");

	const later = put("2026/10/05/session-a0a0a0a0", "cache.jsonl", { summary: { v: 2, id: A } });
	assert.deepEqual(s.all(A), [slug, later], "two folders: the oldest day is the home");
	assert.deepEqual(s.twins().map(t => [t.id, t.home, t.others]), [[A, slug, [later]]], "twins() names it");
	fs.rmSync(later, { recursive: true });
	assert.deepEqual(s.twins(), [], "folded: no twin");

	// The saved map: a new process starts from session-folders.json and still sees what changed on disk since.
	assert.ok(fs.existsSync(path.join(ROOT, "session-folders.json")), "the map is saved");
	fs.renameSync(slug, path.join(ROOT, "2026/10/03/renamed"));
	assert.equal(fresh().of(A), path.join(ROOT, "2026/10/03/renamed"), "a folder renamed between processes is found under its new name");
	fs.rmSync(path.join(ROOT, "2026/10/03/renamed"), { recursive: true });
	put("2026/10/03/renamed", "session.jsonl", { session: { id: B } });   // the same name made again, now holding another session
	s = fresh();
	assert.equal(s.of(A), null, "the old id is not found in a folder that now holds another");
	assert.equal(s.of(B), path.join(ROOT, "2026/10/03/renamed"), "the new id is");

	const quiet = put("2026/10/07/session-c0c0c0c0");   // a folder made before anything says whose it is
	assert.equal(s.of("c0c0c0c0-0003-4a19-9b01-000000000003"), quiet, "an empty session-<id8> is the asker's");
	const D = "d0d0d0d0-0004-4a19-9b01-000000000004", named = put("2026/10/07/named-later");
	assert.equal(s.of(D), null);
	fs.writeFileSync(path.join(named, "page.jsonl"), JSON.stringify({ session: D }) + "\n");   // its claim arrives later, as a new file
	assert.equal(fresh().of(D), named, "a folder that named no id is read again once it changed");

	assert.equal(SessionFolders.owner(put("2026/09/04/flat-task", "session.jsonl", { assign: { session_id: A, tab: "monorepo" } })), null, "a tab-era task (assign, no agent) is not a session's folder");
	assert.equal(SessionFolders.owner(put("2026/10/16/voice-x", "session.jsonl", { assign: { session_id: A, agent: "mastermind-voice-x" } })), A, "a Servex record (assign with an agent) is");
	console.log("SessionFolders: 15 checks pass");
} finally { fs.rmSync(ROOT, { recursive: true, force: true }); }
