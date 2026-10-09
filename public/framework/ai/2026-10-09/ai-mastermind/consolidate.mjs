// consolidate.mjs — scripted move of the AI docs into subsystem folders (dry-run first, manifest, git mv).
// Usage: node consolidate.mjs --dry | node consolidate.mjs --run
// Single source = git mv. Several sources = one merged doc (sources concatenated verbatim, headings demoted),
// originals git-mv'd to <dir>/archive/ with a line in archive/moved.md. Every link to a moved file is rewritten.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = execSync("git rev-parse --show-toplevel").toString().trim();
const AI = "public/framework/ai";
const D = `${AI}/doc`, S = `${AI}/sessions/doc`;

// [target, ...sources]  (one source = plain move, several = merged doc)
const plan = [
	// ai/doc
	[`${D}/design/systems-overview.md`, `${D}/systems-overview.md`],
	[`${D}/design/tooling-architecture.md`, `${D}/tooling-architecture-2026-10-08.md`],
	[`${D}/design/module-ai-dirs.md`, `${D}/module-ai-dirs.md`],
	[`${D}/design/dictation-refine-connection-map.md`, `${D}/dictation-refine-connection-map-2026-10-08.md`],
	[`${D}/design/website-shows-everything.md`, `${D}/website-shows-everything-2026-10-08.md`],
	[`${D}/agents/autonomy.md`, `${D}/autonomy.md`],
	[`${D}/agents/concurrency.md`, `${D}/concurrency.md`],
	[`${D}/agents/interrupts.md`, `${D}/interrupts.md`],
	[`${D}/agents/pass-by-reference.md`, `${D}/pass-by-reference.md`],
	[`${D}/agents/eval-truth.md`, `${D}/eval-truth.md`],
	[`${D}/agents/mcp.md`, `${D}/mcp.md`],
	[`${D}/tokens/tokens.md`, `${D}/token-accounting.md`, `${D}/token-efficiency.md`],
	[`${D}/tokens/context-window.md`, `${D}/context-window.md`],
	[`${D}/logs/log-sources.md`, `${D}/log-sources.md`],
	[`${D}/logs/log-tool.md`, `${D}/log-tool.md`],
	[`${D}/logs/inbox-log-streaming.md`, `${D}/inbox-log-streaming-2026-10-08.md`, `${D}/inbox-log-streaming-findings-2026-10-08.md`],
	[`${D}/logs/conversations.md`, `${D}/conversations.md`],
	[`${D}/tasks/tasks.md`, `${D}/tasks.md`, `${D}/task-queue-2026-10-08.md`, `${D}/one-queue-2026-10-09.md`],
	[`${D}/tasks/priorities.md`, `${D}/priorities-2026-10-08.md`],
	[`${D}/ai2/ai2-vs-ai.md`, `${D}/ai2-and-date-layout-2026-10-08.md`, `${D}/ai2-merge-and-layout-proposal-2026-10-08.md`],
	[`${D}/ai2/branches.md`, `${D}/branches.md`],
	[`${D}/ai2/branches.mjs`, `${D}/branches.mjs`],
	[`${D}/meta/history.md`, `${D}/history.md`],
	[`${D}/meta/readme-system-status.md`, `${D}/readme-system-status-2026-10-08.md`],
	// ai/sessions/doc
	[`${S}/data/data-architecture.md`, `${S}/data-architecture-2026-10-08.md`],
	[`${S}/data/layout.md`, `${S}/layout.md`, `${S}/migration-dry-run-2026-10-09.md`],
	[`${S}/data/record-spec.md`, `${S}/record-spec.md`],
	[`${S}/data/patterns.md`, `${S}/patterns.md`],
	[`${S}/data/path-tags.md`, `${S}/path-tags-2026-10-09.md`],
	[`${S}/data/findings.md`, `${S}/findings.md`],
	[`${S}/ui/classes.md`, `${S}/classes.md`],
	[`${S}/ui/session-class.md`, `${S}/session-class.md`],
	[`${S}/ui/views.md`, `${S}/session-page-2026-10-09.md`, `${S}/session-cards.md`, `${S}/templates.md`, `${S}/grid-widths.md`],
	[`${S}/live/realtime.md`, `${S}/realtime.md`, `${S}/realtime-plan.md`],
	[`${S}/cost/context-cost.md`, `${S}/context-cost.md`],
	[`${S}/cost/spend-tree.md`, `${S}/spend-tree.md`],
	[`${S}/cost/openrouter-dollars.md`, `${S}/openrouter-dollars.md`],
	[`${S}/asks/asks.md`, `${S}/priorities.md`, `${S}/redesign-asks-2026-10-09.md`, `${S}/session-as-container-2026-10-08.md`],
	[`${S}/asks/stuck-sessions.md`, `${S}/stuck-sessions-2026-10-09.md`],
	[`${S}/asks/decisions.md`, `${S}/decisions.md`],
];

const abs = p => path.join(ROOT, p);
const archiveOf = src => path.posix.join(path.posix.dirname(src), "archive", path.posix.basename(src));
const mapOld = new Map();
const moves = [];
for (const [to, ...from] of plan) {
	for (const f of from) {
		if (!fs.existsSync(abs(f))) throw new Error("missing " + f);
		mapOld.set(f, to);
		moves.push({ from: f, to, kind: from.length > 1 ? "merged" : "moved", archive: from.length > 1 ? archiveOf(f) : null });
	}
}

const TOKEN = /(?<![\w@])((?:\/|\.\.?\/)?(?:[\w.-]+\/)*[\w.-]+\.(?:md|mjs))(?=[)\s`'"#\]>,:;]|$)/g;
const BASES = [AI, "public/framework", "public", ""];
function rewrite(text, oldDir, newDir) {
	return text.replace(TOKEN, (tok, t) => {
		if (t.startsWith("/")) {
			const hit = mapOld.get(path.posix.join("public", t));
			return hit ? "/" + path.posix.relative("public", hit) : tok;
		}
		const own = mapOld.get(path.posix.normalize(path.posix.join(oldDir, t)));
		if (own) return path.posix.relative(newDir, own);
		for (const b of BASES) {
			const hit = mapOld.get(path.posix.normalize(path.posix.join(b, t)));
			if (hit) return b ? path.posix.relative(b, hit) : hit;
		}
		return tok;
	});
}
const demote = txt => { let fence = false; return txt.split("\n").map(l => { if (/^```/.test(l)) fence = !fence; return !fence && /^#{1,5} /.test(l) ? "#" + l : l; }).join("\n"); };

const dry = process.argv.includes("--dry");
const tracked = execSync("git ls-files", { cwd: ROOT, maxBuffer: 1 << 28 }).toString().split("\n")
	.filter(f => /\.(md|js|mjs|json|html)$/.test(f) && !/(^|\/)(node_modules|files\.json)/.test(f));
const movedSet = new Set(moves.map(m => m.from));
const sh = c => execSync(c, { cwd: ROOT, stdio: "pipe" });

let touched = 0;
for (const f of tracked) {
	if (movedSet.has(f) || !fs.existsSync(abs(f))) continue;
	if (/^public\/framework\/ai\/20\d\d-/.test(f) && !f.endsWith(".md")) continue; // dated task records: data stays untouched, only prose links are fixed
	const old = fs.readFileSync(abs(f), "utf8");
	const nu = rewrite(old, path.posix.dirname(f), path.posix.dirname(f));
	if (nu !== old) { touched++; if (dry) console.log("rewrite", f); else fs.writeFileSync(abs(f), nu); }
}
for (const [to, ...from] of plan) {
	if (dry) { console.log((from.length > 1 ? "MERGE " : "MOVE  ") + from.map(f => path.posix.basename(f)).join(" + ") + "  -> " + to.replace(AI + "/", "")); continue; }
	fs.mkdirSync(path.dirname(abs(to)), { recursive: true });
	if (from.length === 1) {
		const f = from[0], txt = fs.readFileSync(abs(f), "utf8");
		sh(`git mv "${f}" "${to}"`);
		fs.writeFileSync(abs(to), rewrite(txt, path.posix.dirname(f), path.posix.dirname(to)));
	} else {
		let out = "";
		from.forEach((f, i) => {
			const body = rewrite(fs.readFileSync(abs(f), "utf8"), path.posix.dirname(f), path.posix.dirname(to));
			out += (i ? "\n\n---\n\n" : "") + `<!-- merged from ${path.posix.basename(f)} (original kept in archive/) -->\n` + demote(body).trimEnd() + "\n";
			const a = archiveOf(f);
			fs.mkdirSync(path.dirname(abs(a)), { recursive: true });
			sh(`git mv "${f}" "${a}"`);
			const rel = path.posix.relative(path.posix.dirname(a), to);
			fs.appendFileSync(abs(path.posix.join(path.posix.dirname(a), "moved.md")),
				`- \`${path.posix.basename(f)}\`: content now in [${rel}](${rel}) (consolidated 2026-10-09; original kept here unchanged)\n`);
		});
		fs.writeFileSync(abs(to), out);
	}
}
console.log(`${dry ? "DRY: " : ""}${plan.length} targets, ${moves.length} sources, ${touched} other files with rewritten links`);
if (!dry) fs.writeFileSync(abs(`${AI}/2026-10-09/ai-mastermind/moves.jsonl`), moves.map(m => JSON.stringify(m)).join("\n") + "\n");
