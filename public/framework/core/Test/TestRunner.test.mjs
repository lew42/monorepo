// node public/framework/core/Test/TestRunner.test.mjs — single-file runs and --near, on a scratch tree (no repo tests run).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import TestRunner from "./TestRunner.mjs";

const HERE = import.meta.dirname, RUNNER = path.join(HERE, "TestRunner.mjs");
const root = fs.mkdtempSync(path.join(os.tmpdir(), "trunner-"));
const put = (f, t) => { fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true }); fs.writeFileSync(path.join(root, f), t); };
put("pkg/a.mjs", "export const a = 1;\n");
put("pkg/a.test.mjs", "import { a } from './a.mjs'; if (a !== 1) process.exit(1);\n");
put("pkg/b.test.mjs", "process.exit(0);\n");
put("other/c.test.mjs", "import { a } from '../pkg/a.mjs'; if (a !== 1) process.exit(1);\n");
put("far/d.test.mjs", "import './mid.mjs';\n");
put("far/mid.mjs", "import '../pkg/a.mjs';\n");

const r = new TestRunner(); r.root = root; r.results = path.join(root, "results.jsonl");

assert.deepEqual(r.find(["pkg/b.test.mjs"]), ["pkg/b.test.mjs"], "a file path finds that file");
assert.deepEqual(r.find(["pkg"]), ["pkg/a.test.mjs", "pkg/b.test.mjs"], "a folder still finds its tests");

// near: own folder + direct importers; not a test that imports it only through another file
assert.deepEqual(r.near("pkg/a.mjs"), ["other/c.test.mjs", "pkg/a.test.mjs", "pkg/b.test.mjs"]);
assert.deepEqual(r.covers("pkg/a.mjs").sort(), ["far/d.test.mjs", "other/c.test.mjs", "pkg/a.test.mjs", "pkg/b.test.mjs"], "covers still goes transitive");

// the CLI: a single test file path runs that file (it used to run nothing)
const cli = spawnSync(process.execPath, [RUNNER, path.join(root, "pkg/b.test.mjs")], { encoding: "utf8", windowsHide: true, cwd: root, env: { ...process.env, TESTRUNNER_RESULTS: path.join(root, "cli-results.jsonl") } });
assert.match(cli.stdout, /PASS .*pkg\/b\.test\.mjs/, cli.stdout + cli.stderr);
assert.equal(cli.status, 0);

fs.rmSync(root, { recursive: true, force: true });
console.log("ok - TestRunner: a file path runs, --near is one level");
