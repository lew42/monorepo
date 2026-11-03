// node Server/Deprecated.test.mjs — Deprecated: parse a mark, find it above its definition, count callers outside the defining file.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Deprecated from "./Deprecated.mjs";

const ok = Deprecated.parse("// DEPRECATED (2026-10-28): use `page.pages`. Guide: /framework/core/Page/doc/migration-children-to-pages.md. Remove when: 0 callers.");
assert.deepEqual(ok, { date: "2026-10-28", use: "`page.pages`", guide: "/framework/core/Page/doc/migration-children-to-pages.md", remove_when: "0 callers" });
assert.equal(Deprecated.parse("// DEPRECATED (2026-10-28): use x."), null, "a mark with no guide or condition is incomplete");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "deprecated-"));
fs.mkdirSync(path.join(root, "public"));
fs.writeFileSync(path.join(root, "public", "a.js"), "// DEPRECATED (2026-10-28): use `page.pages`. Guide: /framework/x.md. Remove when: none left.\nexport default class PageChildren extends Map {}\nthis.children.get(1);\n");
fs.writeFileSync(path.join(root, "public", "b.js"), "page.children.get('a');\npage.children.size;\n// page.children.get('in a comment')\n");
const [mark, ...rest] = Deprecated.run(root);
assert.equal(rest.length, 0, "one mark");
assert.equal(mark.symbol, "page.children");
assert.equal(mark.callers, 2, "two caller lines outside the defining file; the comment and the definition's own file are not counted");
assert.equal(mark.guide_exists, false, "the guide path is checked");
fs.rmSync(root, { recursive: true });
console.log("Deprecated: 6 asserts ok");
