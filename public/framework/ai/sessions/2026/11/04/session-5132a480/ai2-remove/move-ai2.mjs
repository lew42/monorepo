#!/usr/bin/env node
// Retire public/framework/ai2/. Dry run by default; --apply moves. Writes manifest.json beside this script.
// Kept (archived, not live): page.js, ai2.css, readme.md -> public/framework/ai/archive/ai2/ (page.js is renamed so it never routes).
// Removed (git keeps them): the 18 one-line shims and the generated files.jsonl listings.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../../../../../../../../..");
const OLD = path.join(REPO, "public/framework/ai2");
const ARC = path.join(REPO, "public/framework/ai/archive/ai2");
const apply = process.argv.includes("--apply");
const KEEP = { "page.js": "page.js.archived", "ai2.css": "ai2.css", "readme.md": "readme.md" };

const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : files.push(p); } })(OLD);

const manifest = files.map(f => {
	const rel = path.relative(OLD, f).split(path.sep).join("/");
	const keep = KEEP[rel];
	const body = fs.readFileSync(f, "utf8");
	const why = keep ? "archived" : /^\/\/ Moved to /.test(body) || /^\/\*\s*Moved to /.test(body) || rel.endsWith("files.jsonl") ? "removed: " + (rel.endsWith("files.jsonl") ? "generated listing" : "one-line shim") : "UNKNOWN";
	return { old: "public/framework/ai2/" + rel, new: keep ? "public/framework/ai/archive/ai2/" + keep : null, action: why };
});
fs.writeFileSync(path.join(HERE, "manifest.json"), JSON.stringify(manifest, null, 1));
console.log(manifest.map(m => `${m.action.padEnd(28)} ${m.old} -> ${m.new ?? "-"}`).join("\n"));
const unknown = manifest.filter(m => m.action === "UNKNOWN");
if (unknown.length) { console.error("UNKNOWN files, stopping:", unknown.map(u => u.old)); process.exit(1); }
if (!apply) { console.log("\ndry run; --apply to move"); process.exit(0); }
fs.mkdirSync(ARC, { recursive: true });
for (const m of manifest) {
	const from = path.join(REPO, m.old);
	if (m.new) fs.copyFileSync(from, path.join(REPO, m.new));
	fs.rmSync(from);
}
(function prune(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) prune(path.join(d, e.name)); if (!fs.readdirSync(d).length) fs.rmdirSync(d); })(OLD);
console.log("\nmoved; ai2 exists:", fs.existsSync(OLD));
