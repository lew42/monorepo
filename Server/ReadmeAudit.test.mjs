// node Server/ReadmeAudit.test.mjs — the computed fields of ReadmeAudit on a fixture folder in the OS temp dir.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import ReadmeAudit from "./ReadmeAudit.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "readme-audit-"));
const dir = path.join(root, "mod");
fs.mkdirSync(path.join(dir, "docs"), { recursive: true });
fs.mkdirSync(path.join(dir, "named"));
fs.writeFileSync(path.join(dir, "named.js"), "");
fs.writeFileSync(path.join(dir, "unmentioned.js"), "");
fs.writeFileSync(path.join(dir, "files.jsonl"), "");
fs.writeFileSync(path.join(dir, "readme.md"), [
	"# Mod",
	"See [gone](./missing.md) and [here](./named.js) and `named/`.",
	"2026-10-12: we moved it.",
	"A dated link [x](./2026-10-12-thing.md) does not count.",
].join("\n"));

const au = new ReadmeAudit(root);
const a = au.computed(path.join(dir, "readme.md"), new Set(["mod"]));
assert.equal(a.path, "mod/readme.md");
assert.deepEqual(a.unnamed, ["docs/", "unmentioned.js"]);
assert.deepEqual(a.dead_links, ["./missing.md", "./2026-10-12-thing.md"]);
assert.equal(a.dated_lines, 1);
assert.equal(a.docs_folder, true);
assert.equal(a.orphan, true);
assert.equal(a.crowded, false);
assert.ok(a.words > 10 && a.files === 6 && a.sha.length === 12);

fs.rmSync(root, { recursive: true, force: true });
console.log("ReadmeAudit.test: ok");
