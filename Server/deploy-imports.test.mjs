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

// .assetsignore: gitignore-style folder patterns ("a/b/" from the root, "name/" in any folder), with * globs.
const patterns = fs.readFileSync(path.join(PUBLIC, ".assetsignore"), "utf8")
	.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));
const glob = s => new RegExp("^" + s.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*") + "$");
const ignored = rel => patterns.some(p => {
	const parts = p.replace(/\/$/, "").split("/").map(glob);
	const dirs = rel.split("/").slice(0, -1);
	if (parts.length === 1) return dirs.some(d => parts[0].test(d));        // "shots/": any folder of that name
	return parts.length <= dirs.length && parts.every((re, i) => re.test(dirs[i]));  // anchored at public/
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

// Root-relative ("/framework/…") and relative ("../x.js") specifiers; bare names (npm) are not served from public/.
const IMPORT = /(?:^|[\s;])(?:import|export)\s[^'"`]*?from\s*["']((?:\/|\.\.?\/)[^"']+)["']|import\(\s*["']((?:\/|\.\.?\/)[^"']+)["']\s*\)|^\s*import\s*["']((?:\/|\.\.?\/)[^"']+)["']/gm;
const bad = [];
for (const file of files){
	const rel = path.relative(PUBLIC, file).split(path.sep).join("/");
	if (ignored(rel)) continue;
	const src = fs.readFileSync(file, "utf8");
	for (const m of src.matchAll(IMPORT)){
		const spec = (m[1] || m[2] || m[3]).split(/[?#]/)[0];
		const target = spec.startsWith("/") ? spec.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(rel), spec));
		if (ignored(target)) bad.push(`${rel} imports ${spec}`);
	}
}

const t = new Test("deploy: no uploaded module imports a file the deploy leaves out (.assetsignore)");
t.eq(bad, [], `every import resolves to an uploaded file (${files.length} files scanned)`);
t.done();
