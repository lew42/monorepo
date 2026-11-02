// node Server/IgnoredImageLinks.test.mjs — a scratch repo: a .md linking an ignored png is flagged, a tracked one is not.
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import IgnoredImageLinks from "./IgnoredImageLinks.mjs";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ignimg-"));
const git = (...a) => execFileSync("git", a, { cwd: dir, windowsHide: true, stdio: "pipe" }).toString();
const write = (f, t) => { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), t); };
git("init", "-q", "-b", "main");
write(".gitignore", "public/framework/ai/**/*.png\n!public/framework/ai/**/doc/**/*.png\n");
const task = "public/framework/ai/sessions/2026/11/02/session-x/t";
write(task + "/shots/400.png", "x"); write(task + "/doc/screens/400.png", "x");
write(task + "/outcome.md", "![a](shots/400.png)\n![b](doc/screens/400.png)\n![c](https://example.com/x.png)\n![gone](shots/missing.png)\n");
const hits = IgnoredImageLinks.find(dir, [task + "/outcome.md", task + "/shots/400.png"]);
assert.deepEqual(hits.map(h => h.link), ["shots/400.png"], "only the ignored, existing, local picture");
assert.match(IgnoredImageLinks.sentence(hits), /doc\/screens/);
assert.equal(IgnoredImageLinks.target("a/b.md", "/framework/x.png"), "public/framework/x.png", "a site path maps under public/");
fs.rmSync(dir, { recursive: true, force: true });
console.log("IgnoredImageLinks: 3 cases ok");
