/* node Servex/agents/log-tool.test.mjs — the `log` tool on a private fake host (no live Servex), and the append.mjs CLI against LogLine. */
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const { tools } = await import("./tools.js");

// 1. the tool: a task line into a temp session.jsonl, by + session filled
const host = { live: new Map([["minion-t", { session_id: "sess-123" }]]) };
const log = tools(host).find(t => t.name === "log");
assert.ok(log, "log tool is registered");
const dir = fs.mkdtempSync(path.join(ROOT, "log-tool-test-"));
try {
	const file = path.join(dir, "session.jsonl");
	fs.writeFileSync(file, JSON.stringify({ assign: { session_id: "sess-123", agent: "minion-t", title: "t" } }) + "\n");
	const rel = path.relative(ROOT, file).replaceAll("\\", "/");
	const r = JSON.parse(await log.handler({ path: rel, line: { task: { title: "build it", state: "open" } }, origin: "/framework/x/" }, { caller: "minion-t" }));
	assert.equal(r.ok, true, JSON.stringify(r));
	const last = JSON.parse(fs.readFileSync(file, "utf8").trim().split("\n").pop());
	assert.equal(last.by, "minion-t"); assert.equal(last.session, "sess-123"); assert.equal(last.origin, "/framework/x/");
	assert.ok(last.task.at && last.task.title === "build it", "stamped task line");
	// a folder works too, and a bad shape is refused with a reason
	const f = JSON.parse(await log.handler({ path: path.relative(ROOT, dir), line: { log: { msg: "via folder" } } }, { caller: "minion-t" }));
	assert.equal(f.ok, true, JSON.stringify(f));
	const bad = JSON.parse(await log.handler({ path: rel, line: { nonsense: { a: 1 } } }, { caller: "minion-t" }));
	assert.equal(bad.ok, false); assert.match(bad.why, /unknown verb|flat/);

	// 2. the CLI: old (git HEAD) vs new append.mjs on copies of three file kinds, same input, same result but `at`
	const lines = path.join(dir, "lines.json");
	fs.writeFileSync(lines, JSON.stringify([{ log: { at: "NOW", task: "x", msg: "same" } }, { action: { at: "NOW", did: "edit" } }, { log: { task: "y", msg: "no at" } }]));
	const old_cli = path.join(dir, "append-old.mjs");
	const intro = execFileSync("git", ["-C", ROOT, "log", "--diff-filter=A", "--format=%H", "-1", "--", "Server/LogLine.mjs"], { encoding: "utf8", windowsHide: true }).trim();
	const rev = intro ? intro + "~1" : "HEAD";   // the last append.mjs from before LogLine existed
	const U = "file:///" + ROOT.replaceAll("\\", "/");
	const src = execFileSync("git", ["-C", ROOT, "show", rev + ":.claude/hooks/append.mjs"], { encoding: "utf8", windowsHide: true })
		.replaceAll('"./jsonl-schema.mjs"', `"${U}/.claude/hooks/jsonl-schema.mjs"`)
		.replaceAll("../../Server/", U + "/Server/");
	fs.writeFileSync(old_cli, src);
	const seed = { "session.jsonl": '{"assign":{"session_id":"a","agent":"b"}}\n', "task.jsonl": '{"assign":{"title":"t"}}\n', "day.jsonl": '{"assign":{"title":"d"}}\n' };
	const norm = s => s.replace(/\d{4}-\d\d-\d\dT[\d:]+[-+]\d\d:\d\d/g, "T");
	for (const [name, text] of Object.entries(seed)){
		const out = [];
		for (const cli of [old_cli, path.join(ROOT, ".claude/hooks/append.mjs")]){
			const sub = fs.mkdtempSync(path.join(dir, "c-")); const target = path.join(sub, name);
			fs.writeFileSync(target, text);
			const res = execFileSync(process.execPath, [cli, target, lines], { encoding: "utf8", windowsHide: true }).replaceAll(sub, "SUB");
			out.push(norm(res) + "\n" + norm(fs.readFileSync(target, "utf8")));
		}
		assert.equal(out[1], out[0], `CLI output differs for ${name}`);
	}
	console.log("log-tool: tool + folder + refusal + CLI diff (3 files) ok");
} finally { fs.rmSync(dir, { recursive: true, force: true }); }
process.exit(0);
