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

// the CLI: --near prints the near tests of a real repo file and runs nothing
const nearCli = spawnSync(process.execPath, [RUNNER, "--near", RUNNER], { encoding: "utf8", windowsHide: true });
assert.ok(nearCli.stdout.split(/\s+/).includes("public/framework/core/Test/TestRunner.test.mjs"), nearCli.stdout + nearCli.stderr);
assert.doesNotMatch(nearCli.stdout, /PASS|FAIL/);

// the fake mic file: a checkout that has jfk.wav uses it; one without (a worktree: recordings/ is git-ignored) is not handed a missing path when the main checkout has it
put("public/framework/ai/recordings/jfk.wav", "x");
assert.equal(r.wav_path(), path.join(root, "public/framework/ai/recordings/jfk.wav"));
const real = new TestRunner(); const w = real.wav_path();
assert.ok(path.isAbsolute(w) && w.endsWith("jfk.wav"), w);
// a real worktree without the wav takes the main checkout's copy
const main = fs.mkdtempSync(path.join(os.tmpdir(), "wavmain-")), wt = main + "-wt";
const git = (...a) => spawnSync("git", a, { cwd: main, windowsHide: true, encoding: "utf8" });
git("init", "-q", "-b", "main"); fs.writeFileSync(path.join(main, "x.txt"), "x"); git("add", "."); git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "x");
git("worktree", "add", "-q", wt, "-b", "wt");
fs.mkdirSync(path.join(main, "public/framework/ai/recordings"), { recursive: true }); fs.writeFileSync(path.join(main, "public/framework/ai/recordings/jfk.wav"), "w");
const fromWt = Object.assign(new TestRunner(), { root: wt }).wav_path();
assert.equal(fs.realpathSync(fromWt), fs.realpathSync(path.join(main, "public/framework/ai/recordings/jfk.wav")), "the worktree has no wav, so the main checkout's is used: " + fromWt);
git("worktree", "remove", "--force", wt); fs.rmSync(main, { recursive: true, force: true });

fs.rmSync(root, { recursive: true, force: true });
console.log("ok - TestRunner: a file path runs, --near is one level");
