// RecordWriter, the caller's side of the one writer: stamps, the twin check, the fallback append. `node RecordWriter.test.mjs`
// The entry point itself (two writers at once, the hook measure, a slow and a down entry point): Servex/agents/one-writer.test.mjs.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Test from "../Test/Test.js";
import RecordWriter from "./RecordWriter.js";

const t = new Test("RecordWriter");
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "record-writer-")), file = path.join(dir, "public", "x", "task.jsonl");
try {
	t.ok(RecordWriter.is_record("C:\\a\\public\\x\\session.jsonl") && RecordWriter.is_record("/x/page.jsonl") && !RecordWriter.is_record("/x/log.jsonl"), "record files: session, page (either slash); not log.jsonl");
	const a = RecordWriter.stamp(), b = RecordWriter.stamp();
	t.ok(a < b, "two stamps in one millisecond still differ, in order");

	const line = { log: { msg: "hi" }, by: "t", ts: a };
	t.eq(RecordWriter.fresh([line], [line, { ...line, ts: b }, { log: { msg: "no ts" } }]).length, 2, "fresh: a line whose by|ts is in the tail is dropped; a new ts and a line with no ts stay");
	t.eq(RecordWriter.fresh([{ ...line, by: "other" }], [line]).length, 1, "fresh: same ts from another writer is a different line");

	t.eq(await RecordWriter.append_once(file, [line]), 1, "append_once writes a new line (and makes the folder)");
	t.eq(await RecordWriter.append_once(file, [line]), 0, "append_once again: already in the tail, nothing written");
	fs.appendFileSync(file, JSON.stringify({ log: { msg: "no newline" } }));
	await RecordWriter.append_once(file, [{ ...line, ts: b }]);
	t.eq(fs.readFileSync(file, "utf8").trim().split("\n").length, 3, "a file ending without a newline gets one before the next line");
} finally { fs.rmSync(dir, { recursive: true, force: true }); }
t.done();
