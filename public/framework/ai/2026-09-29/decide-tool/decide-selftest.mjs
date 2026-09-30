#!/usr/bin/env node
// decide-selftest.mjs — drives Server/decide.mjs's command line against a throwaway log and
// checks every answer. Exit 0 = all pass.   node public/framework/ai/2026-09-29/decide-tool/decide-selftest.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "decide-test-"));
const F = path.join(dir, "page.jsonl");
fs.writeFileSync(F, JSON.stringify({ title: "test" }) + "\n");

const run = (...args) => {
	const r = spawnSync(process.execPath, [path.join(root, "Server/decide.mjs"), ...args, "--file", F], { encoding: "utf8", windowsHide: true });
	let out; try { out = JSON.parse(r.stdout); } catch { out = { raw: r.stdout + r.stderr }; }
	return { code: r.status, ...out };
};
let fails = 0;
const check = (name, ok, got) => { console.log((ok ? "pass " : "FAIL ") + name + (ok ? "" : "  → " + JSON.stringify(got))); if (!ok) fails++; };
const refused = (name, r, re) => check(name, r.code === 1 && r.ok === false && re.test(r.refused ?? ""), r);

run("create", "--id", "d-x", "--question", "Which one?", "--rank", "1");

// 1. An unknown flag is refused, with the known ones listed — for every verb.
refused("unknown flag on options", run("options", "--id", "d-x", "--opts", "A"), /unknown flag --opts.*known: .*--options/);
refused("unknown flag on create", run("create", "--question", "Why?", "--rank", "1", "--parent", "d-x"), /unknown flag --parent/);
refused("unknown flag on recommend", run("recommend", "--id", "d-x", "--confidance", "0.5"), /unknown flag --confidance/);

// 2. A JSON array of options is several options — the call from the bug report.
let r = run("options", "--id", "d-x", "--options", '[{"id":"a","text":"A"},{"id":"b","text":"B"}]');
check("--options JSON array = two options", r.ok && !r.missing.includes("options (at least two)") && r.missing.includes("caveats for a") && r.missing.includes("caveats for b"), r);
r = run("caveats", "--id", "d-x", "--json", '[{"option":"a","caveats":["costs a"]},{"option":"b","caveats":["costs b"]}]');
check("--json array of caveats", r.ok && !r.missing.some(m => m.startsWith("caveats")), r);
r = run("then", "--id", "d-x", "--then", '{"a":[],"b":[]}');
check("--then JSON object", r.ok && !r.missing.some(m => m.startsWith("then")), r);

// 3. Text that looks like JSON is never stripped into an id or an option.
run("create", "--id", "d-y", "--question", "Which other?", "--rank", "2");
refused("JSON-looking --option text", run("options", "--id", "d-y", "--option", '[{"id":"a","text":"A"}]'), /looks like JSON/);
refused("broken JSON in --options", run("options", "--id", "d-y", "--options", '[{"id":"a",'), /not valid JSON/);
refused("bad option id", run("options", "--id", "d-y", "--options", '[{"id":"a b","text":"A"},{"text":"B"}]'), /option id/);
check("a refused call adds nothing", run("status", "d-y").missing?.includes("options (at least two)"), run("show", "d-y"));

// The earlier rules still hold.
refused("two sentences", run("create", "--question", "Which? Really.", "--rank", "1"), /more than one sentence/);
refused("rank 0", run("create", "--question", "Which?", "--rank", "0"), /rank/);
refused("confidence 1.5", run("recommend", "--id", "d-x", "--option", "a", "--confidence", "1.5"), /confidence/);
refused("recommended not an option", run("recommend", "--id", "d-x", "--option", "zzz"), /no option "zzz"/);
refused("depends_on a missing option", run("create", "--question", "Next?", "--rank", "2", "--depends-on", "d-x:nope"), /option "nope"/);

// And a whole walk appends one line.
r = run("recommend", "--id", "d-x", "--option", "a", "--confidence", "0.7", "--why", "Because.", "--source", "s1");
check("complete → appended", r.ok && r.appended === true, r);
const line = fs.readFileSync(F, "utf8").trim().split("\n").map(l => JSON.parse(l)).find(l => l.decision?.id === "d-x");
check("record shape", line && line.decision.options.map(o => o.id).join() === "a,b" && line.decision.ask === "Which one?" && line.decision.options[0].say === "A", line);

// One truth for nesting: depends_on. A logged parent can't gain a child; `then` can't disagree.
refused("child of a logged parent", run("create", "--question", "Later?", "--rank", "2", "--depends-on", "d-x:a"), /already logged.*create children while the parent is a draft/);
run("create", "--id", "d-p", "--question", "Parent?", "--rank", "1");
run("options", "--id", "d-p", "--options", '[{"id":"a","text":"A"},{"id":"b","text":"B"}]');
r = run("create", "--id", "d-c", "--question", "Child?", "--rank", "2", "--depends-on", "d-p:a");
check("child of a draft parent is linked", run("show", "d-p").decision?.options?.[0]?.then?.includes("d-c"), run("show", "d-p"));
refused("then disagreeing with depends_on", run("then", "--id", "d-p", "--option", "b", "--child", "d-c"), /does not depend on d-p:b/);

// One way to record a choice: recommend no longer takes --status / --decided-by.
refused("recommend --status is gone", run("recommend", "--id", "d-p", "--status", "decided"), /unknown flag --status/);
check("decided by default", line.decision.status === "decided" && line.decision.decided_by === "system" && line.decision.owner_only === null, line.decision);

// An owner-only decision (a key, money, something destructive) stays open until a real chose line.
run("create", "--id", "d-k", "--question", "Which key?", "--rank", "1", "--owner-only", "key");
run("options", "--id", "d-k", "--options", '[{"id":"a","text":"A"},{"id":"b","text":"B"}]');
run("caveats", "--id", "d-k", "--json", '[{"option":"a","caveats":["x"]},{"option":"b","caveats":["y"]}]');
run("then", "--id", "d-k", "--then", '{"a":[],"b":[]}');
r = run("recommend", "--id", "d-k", "--option", "a", "--confidence", "0.6", "--why", "Because.", "--source", "s1");
const kline = fs.readFileSync(F, "utf8").trim().split("\n").map(l => JSON.parse(l)).find(l => l.decision?.id === "d-k");
check("owner-only stays open", kline && kline.decision.status === "open" && kline.decision.decided_by === null && kline.decision.owner_only === "key", kline);

fs.rmSync(dir, { recursive: true, force: true });
console.log(fails ? `${fails} failed` : "all passed");
process.exit(fails ? 1 : 0);
