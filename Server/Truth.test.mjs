// Truth's counts on a scratch store: with-tasks + no-tasks = sessions, and a two-folder session shows as a twin. `node Server/Truth.test.mjs`
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { measure } from "./Truth.mjs";

const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "truth-")), STORE = path.join(ROOT, "public/framework/ai/sessions");
const put = (rel, lines) => { const d = path.join(STORE, rel); fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, "session.jsonl"), lines.map(l => JSON.stringify(l)).join("\n") + "\n"); };
const A = "a0a0a0a0-0001-4a19-9b01-000000000001", B = "b0b0b0b0-0002-4a19-9b01-000000000002";
try {
	put("2026/01/01/session-a0a0a0a0", [{ session: { id: A } }, { commit: "abc", files: [] }]);
	put("2026/01/01/session-b0b0b0b0", [{ session: { id: B } }]);
	const m = await measure({ root: ROOT, now: new Date(2026, 0, 2) });
	assert.equal(m.all.sessions, 2, "two sessions");
	assert.equal(m.all.with_tasks + m.all.no_tasks, m.all.sessions, "with + without = total");
	assert.equal(m.all.no_commit, 1, "one session has a commit line");
	assert.equal(m.week.sessions, 2, "both inside the last 7 days");
	assert.equal(m.twins, 0);
	console.log("Truth.test: ok");
} finally { fs.rmSync(ROOT, { recursive: true, force: true }); }
