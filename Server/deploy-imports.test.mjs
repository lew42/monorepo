// No live module may import a file that the deploy does not upload.
// Cloudflare uploads public/ minus the patterns in public/.assetsignore. A missing module is answered with
// index.html (not_found_handling: single-page-application), the browser refuses HTML as a module, and the
// whole app stops: a blank page. Found 2026-10-31: ai/rail/inbox.js and ai/v/3/Prompts.js imported a fold.js
// kept inside a session record folder (framework/ai/sessions/, ignored), so every deploy showed a blank page.
// Run: node Server/deploy-imports.test.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Test from "../public/framework/core/Test/Test.js";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(REPO, "public");

// .assetsignore: gitignore-style; this repo uses folder patterns only ("a/b/" from the root, "name/" anywhere).
const patterns = fs.readFileSync(path.join(PUBLIC, ".assetsignore"), "utf8")
	.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));
const ignored = rel => patterns.some(p => {
	const dir = p.replace(/\/$/, "");
	return dir.includes("/") ? (rel === dir || rel.startsWith(dir + "/")) : rel.split("/").slice(0, -1).includes(dir);
});

// Live code = every .js / .mjs under public/ that is itself uploaded (an ignored file's own imports don't matter).
const files = [];
(function walk(dir){
	for (const e of fs.readdirSync(dir, { withFileTypes: true })){
		if (e.name === "node_modules" || e.name.startsWith(".")) continue;
		const full = path.join(dir, e.name);
		if (e.isDirectory()) walk(full);
		else if (/\.m?js$/.test(e.name)) files.push(full);
	}
})(PUBLIC);

const IMPORT = /(?:^|[\s;])(?:import|export)\s[^'"`]*?from\s*["'](\/[^"']+)["']|import\(\s*["'](\/[^"']+)["']\s*\)|^\s*import\s*["'](\/[^"']+)["']/gm;
const bad = [];
for (const file of files){
	const rel = path.relative(PUBLIC, file).split(path.sep).join("/");
	if (ignored(rel)) continue;
	const src = fs.readFileSync(file, "utf8");
	for (const m of src.matchAll(IMPORT)){
		const url = (m[1] || m[2] || m[3]).split(/[?#]/)[0];
		if (ignored(url.slice(1))) bad.push(`${rel} imports ${url}`);
	}
}

const t = new Test("deploy: no uploaded module imports a file the deploy leaves out (.assetsignore)");
t.eq(bad, [], `every root-relative import resolves to an uploaded file (${files.length} files scanned)`);
t.done();
