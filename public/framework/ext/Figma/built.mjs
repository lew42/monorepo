// Computes which framework page was built from which Figma node, so the browse page can link them.
// A built page declares its node in the first line of its spec (`# Spec N · Title (Figma node 115:2340, ...)`)
// or in a `(112:11362)` comment at the top of its page.js. Output: data/<key>/built.jsonl, one {node,path,title} per line.
//   node public/framework/ext/Figma/built.mjs [fileKey]
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const key = process.argv[2] || "QYN0G2URSBHYH5I06MOjxU";
const root = join(here, "..", ".."); // public/framework
const found = new Map();

const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() && e.name !== "data" && e.name !== "doc" ? walk(join(dir, e.name)) : [join(dir, e.name)]);
const add = (node, dir) => {
	const page = join(dir, "page.js");
	if (!existsSync(page)) return;
	const title = /title:\s*"([^"]+)"/.exec(readFileSync(page, "utf8"))?.[1] || node;
	found.set(node, { node, path: "/framework/" + relative(root, dir).replaceAll("\\", "/") + "/", title });
};
for (const f of walk(here)){
	const name = f.split(/[\\/]/).pop();
	if (/^spec-.*\.md$/.test(name)){
		const m = /Figma node (\d+:\d+)/.exec(readFileSync(f, "utf8").split("\n")[0]);
		m && add(m[1], dirname(f));
	} else if (name === "page.js"){
		const m = /Figma [^\n]*?\((\d+:\d+)\)/.exec(readFileSync(f, "utf8").split("\n").slice(0, 8).join("\n"));
		m && add(m[1], dirname(f));
	}
}
const out = join(here, "data", key, "built.jsonl");
writeFileSync(out, [...found.values()].map(o => JSON.stringify(o)).join("\n") + "\n");
console.log(`${found.size} built pages -> ${out}`);
