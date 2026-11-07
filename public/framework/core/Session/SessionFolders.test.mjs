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
	// A spawned agent's record sits INSIDE its parent's folder; its id (a uuid) and its folder must still find each other.
	const P = "e0e0e0e0-0005-4a19-9b01-000000000005", K = "f0f0f0f0-0006-4a19-9b01-000000000006";
	const parent = put("2026/11/04/session-e0e0e0e0", "cache.jsonl", { summary: { v: 2, id: P } });
	const thin = put("2026/11/04/session-f0f0f0f0", "cache.jsonl", { summary: { v: 2, id: K } });   // the indexer's folder for the child
	const kid = put("2026/11/04/session-e0e0e0e0/the-child", "session.jsonl", { assign: { session_id: K, agent: "mastermind-the-child" } });
	s = fresh();
	assert.equal(s.of(K), thin, "of(): the day-level folder (where the indexer writes), as before");
	assert.equal(s.record_of(K), thin, "record_of() before any claim is of()");
	assert.equal(s.claim(K, kid), true, "claim() accepts a nested folder that names the id");
	assert.equal(s.claim(P, kid), false, "claim() refuses a folder that names another id");
	assert.equal(s.record_of(K), kid, "record_of(): the nested record folder");
	assert.equal(fresh().record_of(K), kid, "the claim is saved: a new process finds it");
	assert.equal(fresh().of(K), thin, "of() is unchanged by a claim");
	fs.rmSync(kid, { recursive: true });
	assert.equal(fresh().record_of(K), thin, "a claimed folder that is gone falls back to of()");
	const G = "a1a1a1a1-0007-4a19-9b01-000000000007", old = put("2026/11/04/session-e0e0e0e0/older-child", "task.jsonl", { assign: { session_id: G, agent: "minion-older" } });   // spawned before claim() existed
	assert.equal(fresh().record_of(G), null, "an unclaimed nested folder is not found by id");
	assert.equal(fresh().adopt_nested(), 1, "adopt_nested() claims the record folders below session folders");
	assert.equal(fresh().record_of(G), old, "and record_of() then finds it");

	// create(): the one creator. Made with line 1, found by the next writer whatever name it asks for, never a second folder.
	const C = "c1c1c1c1-0008-4a19-9b01-000000000008", line1 = { session: { id: C, kind: "vscode-tab" } };
	const made = fresh().create(C, { day: "2026/11/06", name: "minion-x-c1c1c1c1", first: line1 });
	assert.equal(made, path.join(ROOT, "2026/11/06/minion-x-c1c1c1c1"), "create() makes the named folder on the day asked");
	assert.deepEqual(JSON.parse(fs.readFileSync(path.join(made, "session.jsonl"), "utf8")), line1, "with `first` as line 1 of session.jsonl");
	assert.equal(fresh().create(C, { day: "2026/11/07", first: { session: { id: C, kind: "other" } } }), made, "a second creator asking another day and no name gets the same folder");
	assert.equal(fs.readFileSync(path.join(made, "session.jsonl"), "utf8").split("\n").filter(Boolean).length, 1, "and writes no second line 1");
	assert.deepEqual(fresh().twins(), [], "no twin");
	const N = "c2c2c2c2-0009-4a19-9b01-000000000009", nest = fresh().create(N, { parent: C, name: "minion-y", first: { assign: { session_id: N, agent: "minion-y" } }, file: "task.jsonl" });
	assert.equal(nest, path.join(made, "minion-y"), "`parent` nests the folder in that session's folder");
	assert.equal(fresh().record_of(N), nest, "and claims it, so record_of() finds it");
	assert.throws(() => fresh().create("v-voice01"), /not a session uuid/, "a non-uuid id with no `dir` is refused");
	console.log("SessionFolders: 33 checks pass");
} finally { fs.rmSync(ROOT, { recursive: true, force: true }); }
