// Two session ids that share their first 8 hex never share a folder: DatedFiles.session_dir and Session.locate give the second one its full uuid.
// `node Server/session-dir-clash.test.mjs`. Doc: public/framework/core/Session/doc/identity.md.
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import DatedFiles from "./DatedFiles.mjs";
import Session from "../public/framework/core/Session/Session.js";

let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; console.log("ok", m); };
const A = "a1c1d1e1-0001-4a19-9b01-000000000001", B = "a1c1d1e1-0002-4a19-9b01-000000000002";
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "session-clash-")), ROOT = DatedFiles.ROOT;
try {
	DatedFiles.ROOT = TMP;
	const day = DatedFiles.sessions.day_dir("2026-09-19");
	const short = path.join(day, "session-a1c1d1e1");
	ok(DatedFiles.sessions.session_dir(A, "2026-09-19") === short, "a new id gets session-<id8>");
	fs.mkdirSync(short, { recursive: true });
	fs.writeFileSync(path.join(short, "cache.jsonl"), JSON.stringify({ summary: { v: 2, id: A } }) + "\n");
	ok(DatedFiles.sessions.session_dir(A, "2026-09-19") === short, "its own folder is found again");
	ok(DatedFiles.sessions.session_dir(B, "2026-09-19") === path.join(day, B), "a second id with the same first 8 hex gets its full uuid, not the first one's folder");
	ok(DatedFiles.sessions.session_dir(B, "2026-09-22") === path.join(DatedFiles.sessions.day_dir("2026-09-22"), "session-a1c1d1e1"), "on another day the short name is free");
	fs.mkdirSync(path.join(day, B));
	ok(DatedFiles.sessions.session_dir(B, "2026-09-20") === path.join(day, B), "and is found again days later");
	const quiet = path.join(DatedFiles.sessions.day_dir("2026-09-25"), "session-bbbbbbbb");
	fs.mkdirSync(quiet, { recursive: true });
	ok(DatedFiles.sessions.session_dir("bbbbbbbb-0000-4000-8000-000000000000", "2026-09-25") === quiet, "a folder that names no id is still taken to be the caller's (old folders)");
	ok(DatedFiles.owner(short) === A && DatedFiles.owner(quiet) === null, "owner() reads the id a folder holds");

	// Session.locate: the same rule from the class side (an AISessionIndex cache write).
	class S extends Session { static days = new Map(); static slugs = new Map(); static scanned = true; static root_url(){ return pathToFileURL(path.join(TMP, "sessions") + path.sep); } }
	S.days.set(A, "2026/09/19"); S.slugs.set(A, "session-a1c1d1e1");
	const url = await S.locate(B, "2026-09-19T18:00:00");
	ok(url.href.endsWith(`/2026/09/19/${B}/`), "locate gives the second id its full uuid");
	const C = "cccccccc-0001-4a19-9b01-000000000001";
	ok((await S.locate(C, "2026-09-19T18:00:00")).href.endsWith("/2026/09/19/session-cccccccc/"), "an id with no clash keeps session-<id8>");
} finally { DatedFiles.ROOT = ROOT; fs.rmSync(TMP, { recursive: true, force: true }); }
console.log(`${n} passing`);
