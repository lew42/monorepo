// One session, one folder: the two ways a session got a second folder (session-twins-fix, 2026-11-01), each a case that failed before the fix.
// `node Server/session-twins.test.mjs`. Doc: public/framework/ai/sessions/doc/one-folder.md.
//   1. a session whose only folder is a slug got a new session-<id8> folder from DatedFiles.session_dir (TaskDirs --new, open_task);
//   2. a cached folder that was moved or removed came back: Session.locate kept its scan, AISessionIndex.dir_of its map, and write() made it again.
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import DatedFiles from "./DatedFiles.mjs";
import Session from "../public/framework/core/Session/Session.js";
import AISessionIndex from "../public/framework/ai/AISession/AISessionIndex.mjs";

let n = 0;
const SOFT = process.env.SOFT === "1", bad = [];   // SOFT=1: report every case instead of stopping at the first (how the failing-first proof was run)
const ok = (c, m) => { if (SOFT && !c){ bad.push(m); console.log("FAIL", m); return; } assert.ok(c, m); n++; console.log("ok", m); };
const A = "5e55a0f1-0001-4a19-9b01-000000000001", B = "5e55b0f2-0002-4a19-9b01-000000000002", T = "7ab7ab70-0003-4a19-9b01-000000000003";
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "session-twins-")), ROOT = DatedFiles.ROOT;
const put = (dir, file, obj) => { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, file), JSON.stringify(obj) + "\n"); };
try {
	DatedFiles.ROOT = TMP;
	const S = DatedFiles.sessions, store = path.join(TMP, "public/framework/ai/sessions");

	// 1. A slug folder is found by the id it holds, on any later day.
	const slug = path.join(S.day_dir("2026-10-03"), "mastermind-servex-10");
	put(slug, "session.jsonl", { session: { id: A, kind: "vscode-tab", at: "2026-10-03T10:00:00" } });
	ok(S.session_dir(A, "2026-11-01") === slug, "a session whose only folder is a slug gets that slug, not a new session-<id8>");
	const voice = path.join(S.day_dir("2026-10-16"), "voice-20261016");
	put(voice, "session.jsonl", { assign: { session_id: B, agent: "mastermind-voice-20261016" } });
	ok(S.session_dir(B, "2026-10-16") === voice, "a Servex record folder (line 1 assign with an agent) is its session's folder");
	const flat = path.join(S.day_dir("2026-09-04"), "decision-data");
	put(flat, "session.jsonl", { assign: { session_id: T, tab: "monorepo", request: "a task the tab ran" } });
	ok(S.session_dir(T, "2026-09-04") === path.join(S.day_dir("2026-09-04"), "session-7ab7ab70"), "a tab-era task folder (assign with no agent) is a task of that session, not its folder");

	// 2a. Session.locate: a folder renamed after the scan is found again where it is now, never made again where it was.
	class TS extends Session { static days = new Map(); static slugs = new Map(); static scanned = false; static root_url(){ return pathToFileURL(store + path.sep); } }
	const C = "c0ffee00-0004-4a19-9b01-000000000004", was = path.join(S.day_dir("2026-10-09"), C), now = path.join(S.day_dir("2026-10-09"), "a-slug-for-c");
	put(was, "cache.jsonl", { summary: { v: 2, id: C, first_at: "2026-10-09T09:00:00" } });
	ok(fileURLToPath(await TS.locate(C, "2026-10-09T09:00:00")) === was + path.sep, "locate finds the uuid folder");
	fs.renameSync(was, now);
	ok(fileURLToPath(await TS.locate(C, "2026-10-09T09:00:00")) === now + path.sep, "after a rename under a running process, locate gives the new folder");
	ok(!fs.existsSync(was), "and the old path is not made again");

	// 2b. AISessionIndex: the cached folder is gone (a cleanup removed the twin); the write goes to the folder that holds the id now.
	const D = "d0d0d0d0-0005-4a19-9b01-000000000005", gone = path.join(S.day_dir("2026-10-09"), D), keeper = path.join(S.day_dir("2026-10-09"), "keeper-for-d");
	put(keeper, "index.json", { id: D, first_at: "2026-10-09T09:00:00" });
	const ix = Object.assign(Object.create(AISessionIndex.prototype), { root: store, dirs: new Map([[D, gone]]), snaps: new Map([[D, { id: D, first_at: "2026-10-09T09:00:00", usd: 1 }]]), writes: new Map(), log(){} });
	await ix.write(D);
	ok(!fs.existsSync(gone), "AISessionIndex.write never brings a vanished cached folder back");
	ok(JSON.parse(fs.readFileSync(path.join(keeper, "index.json"), "utf8")).usd === 1, "it writes into the folder that holds the id");

	// 3. Two folders holding one id are reported, the home first; a tab's flat tasks are not.
	const twin = path.join(S.day_dir("2026-10-03"), "session-5e55a0f1");
	put(twin, "cache.jsonl", { summary: { v: 2, id: A } });
	const { default: SessionFolders } = await import("../public/framework/core/Session/SessionFolders.mjs");
	const tw = SessionFolders.at(store).twins();
	ok(tw.length === 1 && tw[0].id === A && tw[0].home === slug && tw[0].others[0] === twin, "twins() names the one id held twice, its home first (the record beats a cache-only folder on the same day)");
	ok(S.session_dir(A, "2026-11-01") === slug, "every writer still picks the same home while the twin waits to be folded");
} finally { DatedFiles.ROOT = ROOT; fs.rmSync(TMP, { recursive: true, force: true }); }
console.log(`${n} passing${bad.length ? `, ${bad.length} failing` : ""}`); if (bad.length) process.exit(1);
