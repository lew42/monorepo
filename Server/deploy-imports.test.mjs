// No live module may import a file that the deploy does not upload.
// Cloudflare uploads public/ minus the patterns in public/.assetsignore. A missing module is answered with
// index.html (not_found_handling: single-page-application), the browser refuses HTML as a module, and the
// whole app stops: a blank page. Found 2026-10-31: ai/rail/inbox.js and ai/v/3/Prompts.js imported a fold.js
// kept inside a session record folder (framework/ai/sessions/, ignored), so every deploy showed a blank page.
// Run: node Server/deploy-imports.test.mjs
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import Test from "../public/framework/core/Test/Test.js";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(REPO, "public");

// .assetsignore: gitignore-style folder patterns ("a/b/" from the root, "name/" in any folder), with * globs,
// matched the way Cloudflare matches them: IGNORING CASE (so "shots/" also drops "ext/Shots/"; that blanked
// every page on 2026-10-31), in order, the last matching line wins, and "!pattern" re-includes.
const patterns = fs.readFileSync(path.join(PUBLIC, ".assetsignore"), "utf8")
	.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));
const glob = s => new RegExp("^" + s.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*") + "$", "i");
const matches = (p, rel) => {
	const parts = p.replace(/\/$/, "").split("/").map(glob);
	const dirs = rel.split("/").slice(0, -1);
	if (parts.length === 1) return dirs.some(d => parts[0].test(d));        // "shots/": any folder of that name
	return parts.length <= dirs.length && parts.every((re, i) => re.test(dirs[i]));  // anchored at public/
};
const ignored = rel => {
	let out = false;
	for (const p of patterns){
		const neg = p.startsWith("!");
		if (matches(neg ? p.slice(1) : p, rel)) out = !neg;
	}
	return out;
};

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
// The exact name of every .js / .mjs, keyed by lower case, so an import whose case differs from the file is
// caught here instead of on a case-sensitive host. Git's name wins over the disk's: Cloudflare builds from git,
// and on Windows a rename that only changes case (made outside `git mv`) changes the disk but not git.
const exact = new Map(files.map(f => { const r = path.relative(PUBLIC, f).split(path.sep).join("/"); return [r.toLowerCase(), r]; }));
try {
	for (const r of execFileSync("git", ["ls-files", "-z", "--", "*.js", "*.mjs"], { cwd: PUBLIC, encoding: "utf8", maxBuffer: 1 << 26 }).split("\0"))
		if (r && exact.has(r.toLowerCase())) exact.set(r.toLowerCase(), r);
} catch {}   // not a git checkout: the disk names stand
const bad = [], wrong_case = [];
for (const file of files){
	const rel = path.relative(PUBLIC, file).split(path.sep).join("/");
	if (ignored(rel)) continue;
	const src = fs.readFileSync(file, "utf8");
	for (const m of src.matchAll(IMPORT)){
		const spec = (m[1] || m[2] || m[3]).split(/[?#]/)[0];
		const target = spec.startsWith("/") ? spec.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(rel), spec));
		if (ignored(target)) bad.push(`${rel} imports ${spec}`);
		const real = exact.get(target.toLowerCase());
		if (real && real !== target) wrong_case.push(`${rel} imports ${spec}, but the file is ${real} (in git)`);
	}
}

const t = new Test("deploy: every import reaches an uploaded file, spelled with its exact case");
t.eq(bad, [], `no import resolves to a file .assetsignore leaves out (${files.length} files scanned)`);
// Windows forgives a wrong capital and Cloudflare does not: "ext/Markdown/md.js" for ext/markdown blanked every page (2026-10-31).
t.eq(wrong_case, [], "no import differs from its file's name only by case");
t.done();
