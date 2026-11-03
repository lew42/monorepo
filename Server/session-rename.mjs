// node Server/session-rename.mjs [--apply] — the one scripted rename of the Session classes into public/framework/ai/AISession/.
// Dry run by default: prints the moves. --apply does `git mv`, rewrites every importer by EXACT token, leaves one-line
// re-export shims at the old paths (removed in a later commit), and writes the old -> new manifest to
// public/framework/ai/AISession/rename-manifest.json. The old names it rewrites are listed in NAMES below.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apply = process.argv.includes("--apply");
const git = (...a) => execFileSync("git", ["-C", root, ...a], { encoding: "utf8" });
const NEW = "public/framework/ai/AISession/", S = "public/framework/ai/sessions/";

// old path -> new path. Every file moves; the old path becomes a shim (except the page pieces' shims are kept too: one release).
const MOVES = [
	[S + "Session.js", NEW + "AISession.js"],
	[S + "SessionView.js", NEW + "AISessionView.js"],
	[S + "SessionRows.js", NEW + "AISessionRows.js"],
	[S + "SessionDetail.js", NEW + "AISessionDetail.js"],
	[S + "SessionTrace.js", NEW + "AISessionTrace.js"],
	[S + "SessionLive.js", NEW + "AISessionLive.js"],
	[S + "SessionFollow.js", NEW + "AISessionFollow.js"],
	[S + "SessionsPage.js", NEW + "AISessionsPage.js"],
	["Server/SessionIndex.mjs", NEW + "AISessionIndex.mjs"],
	["Server/plugins/SessionTail.js", NEW + "AISessionTailer.mjs"],
	["Server/session-cost.mjs", NEW + "AISessionAudit.mjs"],
];

// identifier renames (exact tokens). `Session` alone is handled separately, only in code positions.
const NAMES = [["SessionsPage", "AISessionsPage"], ["SessionIndex", "AISessionIndex"], ["SessionRows", "AISessionRows"], ["SessionDetail", "AISessionDetail"],
	["SessionTrace", "AISessionTrace"], ["SessionView", "AISessionView"], ["SessionFollow", "AISessionFollow"], ["SessionLive", "AISessionLive"]];

// import paths: any specifier ending in one of these old module names points at the new file
const PATHS = MOVES.map(([o, n]) => [path.basename(o), path.basename(n)]);

const files = git("ls-files", "*.js", "*.mjs").split("\n").filter(f => f && !/^public\/framework\/ai\/(20\d\d|sessions\/20)/.test(f) && !f.includes("node_modules"));
const manifest = { at: new Date().toISOString(), moves: MOVES.map(([from, to]) => ({ from, to })), names: [["Session", "AISession"], ["SessionTail", "AISessionTailer"], ["SessionSub", "AISessionSub"], ...NAMES] };

console.log(`${MOVES.length} files move into ${NEW}; ${files.length} source files are scanned for importers.${apply ? "" : " (dry run — nothing changed; pass --apply)"}`);
if (!apply) { MOVES.forEach(([o, n]) => console.log("  " + o + "  ->  " + n)); process.exit(0); }

fs.mkdirSync(path.join(root, NEW), { recursive: true });
const has_default = new Set(MOVES.filter(([o]) => /export default|export {[^}]*default/.test(fs.readFileSync(path.join(root, o), "utf8"))).map(([o]) => o));
for (const [o, n] of MOVES) git("mv", o, n);

// the rewrite of one file's text
function rewrite(text, file){
	let t = text;
	for (const [o, n] of PATHS) t = t.replace(new RegExp(`(?<=[/"'])${o.replace(/\./g, "\\.")}(?=["'?])`, "g"), n);
	for (const [o, n] of NAMES) t = t.replace(new RegExp(`\\b${o}\\b`, "g"), n);
	// the class itself: only in code positions, so prose and UI labels that say "Session" stay as they are
	t = t.replace(/\bSession(?=\.[A-Za-z_])/g, "AISession").replace(/\b(new|extends|instanceof|class|import|typeof) Session\b/g, "$1 AISession")
		.replace(/\{ default: Session \}/g, "{ default: AISession }").replace(/\(Session\)/g, "(AISession)").replace(/\bSession(?=\)\.default)/g, "AISession");
	return t;
}
for (const f of files) {
	const p = path.join(root, MOVES.find(([o]) => o === f)?.[1] ?? f);
	if (!fs.existsSync(p)) continue;
	const text = fs.readFileSync(p, "utf8"), out = rewrite(text, f);
	if (out !== text) fs.writeFileSync(p, out);
}
// the old paths become one-line shims
for (const [o, n] of MOVES) {
	const rel = path.relative(path.dirname(o), n).replace(/\\/g, "/"), spec = rel.startsWith(".") ? rel : "./" + rel;
	fs.mkdirSync(path.join(root, path.dirname(o)), { recursive: true });
	fs.writeFileSync(path.join(root, o), `// Shim: moved to ${n} (rename-manifest.json). Removed one release after the rename.\nexport * from "${spec}";\nexport { default } from "${spec}";\n`);
}
fs.writeFileSync(path.join(root, NEW, "rename-manifest.json"), JSON.stringify(manifest, null, 1) + "\n");
console.log("done; now fix relative imports by hand and run the tests");
