// A session folder's first line names what ran it. A cloud session (Claude Code on the web, the voice app's
// cloud agent) has no VS Code tab; labeling it "vscode-tab" mislabeled cloud session e3fd9043 (2026-10-31).
// Run: node Server/SessionRecord.kind.test.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import SessionRecord from "./SessionRecord.mjs";
import Test from "../public/framework/core/Test/Test.js";

const t = new Test("a new session record says whether a cloud session or a VS Code tab made it");
const kind_of = (remote, id8) => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "kind-"));
	const task = path.join(root, "public/framework/ai/sessions/2026/10/31", `session-${id8}`, "a-task");
	fs.mkdirSync(task, { recursive: true });
	const before = process.env.CLAUDE_CODE_REMOTE;
	if (remote) process.env.CLAUDE_CODE_REMOTE = "true"; else delete process.env.CLAUDE_CODE_REMOTE;
	try { SessionRecord.link_parent(task, "test", { session_id: id8 + "-0000-4000-8000-000000000000" }); }
	finally { if (before === undefined) delete process.env.CLAUDE_CODE_REMOTE; else process.env.CLAUDE_CODE_REMOTE = before; }
	const first = fs.readFileSync(path.join(path.dirname(task), SessionRecord.NEW), "utf8").split("\n")[0];
	return JSON.parse(first).session.kind;
};
t.eq(kind_of(true, "abcdef12"), "cloud", "CLAUDE_CODE_REMOTE=true (a cloud session): kind is cloud");
t.eq(kind_of(false, "abcdef13"), "vscode-tab", "on the PC: kind stays vscode-tab");
t.done();
