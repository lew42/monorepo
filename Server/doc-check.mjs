/* `node Server/doc-check.mjs <task dir>` — does every module a task touched have a
 * readme.md, a doc/ dir, and readme links that actually resolve? CLAUDE.md's rule for
 * every module under public/ is: `readme.md`, `page.js`, `doc/`. This is the machine
 * check of the first and third of those; on-landing.mjs imports `doc_check()` and logs
 * the one line, then nags the task's card when something is missing. Same discipline as
 * text-check.mjs beside it: no model, never throws, always returns a result.
 *
 * A MODULE is the nearest directory at or above a touched file, under `public/`, that
 * holds its own `page.js` — walking up from the file until one is found or the walk
 * runs out of `public/…` to climb. `public/framework/ai/**` (a task's own notebook, not
 * a code module — even though a day dir has a page.js too) is skipped before that walk
 * ever starts, so a task that only wrote to its own log never gets flagged for docs.
 *
 * A LINK counts when it is relative (resolved against the module's own directory) or a
 * `/site/path` (mapped to `public/site/path`, the same rule the framework's own router
 * uses); `http(s)://` links and bare `#anchor`s are never checked — this cannot know
 * whether the internet is up, and an anchor is a spot on the same page, never a file. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");

const lines = file => { try { return fs.readFileSync(file, "utf8").split("\n"); } catch { return []; } };

/** Every path any `action` line in this task's log touched, deduped, in the order first seen. */
function touched_files(dir){
	const files = [];
	const seen = new Set();
	for (const l of lines(path.join(dir, "task.jsonl"))) {
		if (!l.trim()) continue;
		let e; try { e = JSON.parse(l); } catch { continue; }
		for (const f of e.action?.files || []) if (!seen.has(f)) { seen.add(f); files.push(f); }
	}
	return files;
}

/** Climb from a touched file's own directory to the nearest one (itself included) that
 *  holds a `page.js`, never climbing above `public/`. Null when nothing under `public/`
 *  claims it (a file dropped straight in `public/` with no module of its own). */
function nearest_module(root, relFile){
	let dir = path.posix.dirname(relFile.replaceAll("\\", "/"));
	while (dir && dir !== "." && (dir === "public" || dir.startsWith("public/"))) {
		if (fs.existsSync(path.join(root, dir, "page.js"))) return dir;
		const up = path.posix.dirname(dir);
		if (up === dir) break;
		dir = up;
	}
	return null;
}

/** The readme's own links that go nowhere: relative ones resolved against the module's
 *  directory, `/site/path` ones resolved against `public/`. Ignores http(s) and `#…`. */
function dead_links(root, moduleAbs, md){
	const dead = [];
	const seen = new Set();
	for (const m of md.matchAll(/\]\(([^)]+)\)/g)) {
		let target = m[1].trim().split(/[#?]/)[0].trim();
		if (!target || seen.has(target) || /^(https?:)?\/\//i.test(target) || /^mailto:/i.test(target)) continue;
		seen.add(target);
		const abs = target.startsWith("/") ? path.join(root, "public", target.replace(/^\/+/, "")) : path.resolve(moduleAbs, target);
		if (!fs.existsSync(abs)) dead.push(target);
	}
	return dead;
}

/** `[]` when `module` (a `public/...` path, forward slashes) is clean. */
function module_issues(root, module){
	const issues = [];
	const abs = path.join(root, module);
	const readme = path.join(abs, "readme.md");
	const has_readme = fs.existsSync(readme);
	if (!has_readme) issues.push("no readme");
	if (!fs.existsSync(path.join(abs, "doc"))) issues.push("no doc/");
	if (has_readme) {
		let dead = [];
		try { dead = dead_links(root, abs, fs.readFileSync(readme, "utf8")); } catch {}
		if (dead.length) issues.push(`${dead.length} dead link${dead.length === 1 ? "" : "s"} (${dead.join(", ")})`);
	}
	return issues;
}

/** The one function on-landing.mjs calls. `dir` is the task's own directory (holding its
 *  task.jsonl); `root` defaults to this repo. Never throws — a failure becomes the same
 *  shape a real check would give, with the failure as its own module-less line. */
export function doc_check(dir, root = ROOT){
	try {
		const modules = new Set();
		for (const f of touched_files(dir)) {
			const rel = f.replaceAll("\\", "/");
			if (!rel.startsWith("public/") || rel.startsWith("public/framework/ai/")) continue;
			const m = nearest_module(root, rel);
			if (m) modules.add(m);
		}
		const dirty = [...modules].sort().map(module => ({ module, issues: module_issues(root, module) })).filter(d => d.issues.length);
		const line = dirty.length
			? "doc-check: " + dirty.map(d => `${d.module}: ${d.issues.join(", ")}`).join("; ")
			: `doc-check: ${modules.size} module${modules.size === 1 ? "" : "s"} — clean`;
		return { line, dirty, modules: modules.size };
	} catch (e) {
		return { line: "doc-check: not run — " + String(e && e.message || e).slice(0, 200), dirty: [], modules: 0 };
	}
}

// Only when run directly: `node Server/doc-check.mjs <task dir>` prints the JSON result.
if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url))
	console.log(JSON.stringify(doc_check(path.resolve(process.argv[2] || ".")), null, 1));
