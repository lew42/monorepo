// node Server/PageNav.test.mjs — one temp folder per source kind, plus the PageFiles write rule (nav differs -> a new line).
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import PageNav from "./PageNav.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "pagenav-"));
const make = (name, files) => {
	const dir = path.join(root, name);
	fs.mkdirSync(dir, { recursive: true });
	for (const [file, text] of Object.entries(files)) fs.writeFileSync(path.join(dir, file), text);
	return dir;
};
let checks = 0;
const eq = (a, b, msg) => { assert.deepStrictEqual(a, b, msg); checks++; };

eq(PageNav.of(make("jsonl", { "page.jsonl": '{"title":"One","icon":"x"}\n{"cmd":"hi"}\n{"title":"Two","description":"d \\"q\\""}\n' })),
	{ title: "Two", icon: "x", description: 'd "q"' }, "page.jsonl: latest wins");
eq(PageNav.of(make("js", { "page.js": 'export default new Page({\n\ttitle: "Core",\n\tdescription: \'It\\\'s core\',\n\ticon: "dashboard",\n\tchildren: "a b"\n});' })),
	{ title: "Core", description: "It's core", icon: "dashboard" }, "page.js literals");
eq(PageNav.of(make("computed", { "page.js": "new Page({ title: `T ${x}`, label: 'x' })" })), {}, "a template literal is not read");
eq(PageNav.of(make("readme", { "readme.md": "# Item — an arbitrary `thing`\n\nbody" })),
	{ title: "Item", description: "an arbitrary thing" }, "readme heading");
eq(PageNav.of(make("mixed", { "page.js": 'new Page({ title: "From js" })', "readme.md": "# Other — desc" })),
	{ title: "From js", description: "desc" }, "each field takes the first source that has it");
eq(PageNav.of(make("empty", {})), {}, "nothing found: no keys");
eq(PageNav.same({ title: "a" }, { title: "a", icon: undefined }), true, "same ignores missing");
eq(PageNav.same({ title: "a" }, { title: "b" }), false, "different title");

// PageFiles: a line carries nav; it is written again only when nav (or the file) changes
const parent = make("parent", {});
const kid = make("parent/kid", { "page.js": 'new Page({ title: "Kid" })' });
fs.writeFileSync(path.join(parent, "files.jsonl"), "");
const { default: PageFiles } = await import("./plugins/PageFiles.js");
const files = Object.create(PageFiles.prototype);
files.pending = new Map();
const read = () => fs.readFileSync(path.join(parent, "files.jsonl"), "utf8").split("\n").filter(Boolean).map(JSON.parse);
const sync = () => files.sync(parent, "kid");

sync();
eq(read(), [{ file: "kid/page.js", nav: { title: "Kid" } }], "first line carries nav");
sync(); sync();
eq(read().length, 1, "unchanged nav: no new line");
fs.writeFileSync(path.join(kid, "page.js"), 'new Page({ title: "Kid", /* edited */ })');
sync();
eq(read().length, 1, "page.js changed but nav did not: no new line");
fs.writeFileSync(path.join(kid, "page.js"), 'new Page({ title: "Kid 2" })');
sync();
eq(read().at(-1), { file: "kid/page.js", nav: { title: "Kid 2" } }, "nav changed: a new line");
eq(files.state(path.join(parent, "files.jsonl")).get("kid").nav, { title: "Kid 2" }, "state replays the latest nav");

fs.rmSync(root, { recursive: true, force: true });
console.log(`PageNav.test: ${checks} checks ok`);
