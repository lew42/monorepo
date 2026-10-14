// Smart compaction, DRY RUN ONLY: plans what a compacted task.jsonl would keep and fold.
// Rule and reasoning: public/framework/ai/doc/repo-size.md (Compaction); numbers: ai/sessions/doc/compaction.md.
// There is no --apply. Nothing here writes to a task log.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SESSIONS = path.join(ROOT, "public/framework/ai/sessions");
const DAY = 86400000;

export default class Compact {
	static QUIET_DAYS = 7;
	static KEEP = new Set(["decision", "verdict", "review", "agent", "ask"]); // kept verbatim
	static NOISE = new Set(["log", "action"]);                                // folded; so is every assign after the first
	static REVERSED = /revers|supersed|overrul/i;
	static OPEN_ASK = new Set(["open", "building"]);
	static MAX_FILES = 20;

	// Every parsed line: {raw, obj, key}. Unparseable lines are kept, never folded.
	static parse(text) {
		return text.split("\n").filter(l => l.trim()).map(raw => {
			try { const obj = JSON.parse(raw); return { raw, obj, key: Object.keys(obj)[0] }; }
			catch { return { raw, obj: null, key: null }; }
		});
	}

	static bytes(lines) { return lines.reduce((n, l) => n + Buffer.byteLength(l) + 1, 0); }
	static isLanding(l) { return !!l.obj && (l.key === "landed_at" || (l.key === "assign" && !!l.obj.assign?.landed_at)); }

	// The rule from repo-size.md, written once: why a log may NOT be compacted ([] = eligible).
	static blockers(lines, now) {
		const why = [];
		if (!lines.some(l => Compact.isLanding(l))) why.push("not landed");
		const asks = new Map();
		for (const l of lines) if (l.key === "ask" && l.obj.ask) asks.set(l.obj.ask.id ?? asks.size, l.obj.ask.status);
		const open = [...asks.values()].filter(s => Compact.OPEN_ASK.has(String(s).toLowerCase())).length;
		if (open) why.push(`${open} ask open`);
		const rev = lines.filter(l => l.key === "decision" && Compact.REVERSED.test(String(l.obj.decision?.status ?? ""))).length;
		if (rev) why.push(`${rev} decision reversed`);
		const last = Compact.lastActivity(lines);
		if (last === null) why.push("no timestamps");
		else if (now - last < Compact.QUIET_DAYS * DAY) why.push(`quiet only ${((now - last) / DAY).toFixed(1)} days`);
		return why;
	}

	static lastActivity(lines) {
		let max = null;
		const see = v => { const t = typeof v === "string" ? Date.parse(v) : NaN; if (!isNaN(t) && (max === null || t > max)) max = t; };
		for (const l of lines) {
			if (!l.obj) continue;
			const v = l.obj[l.key];
			see(l.key === "landed_at" ? v : v?.at); see(l.obj.at); see(v?.landed_at);
		}
		return max;
	}

	static at(l) { const v = l.obj?.[l.key]; return (typeof v === "object" && v?.at) || l.obj?.at || null; }

	// Which lines are folded: noise, in runs; the first assign, a decision, the line before a decision,
	// anything after the last landing line, and the landing line itself are always kept.
	static classify(lines) {
		const firstAssign = lines.findIndex(l => l.key === "assign");
		let lastLanding = -1;
		lines.forEach((l, i) => { if (Compact.isLanding(l)) lastLanding = i; });
		return lines.map((l, i) => {
			if (!l.obj) return "keep";
			if (i === firstAssign || Compact.isLanding(l)) return "keep";
			if (lastLanding >= 0 && i > lastLanding) return "keep";
			if (lines[i + 1]?.key === "decision") return "keep";
			if (Compact.KEEP.has(l.key)) return "keep";
			if (Compact.NOISE.has(l.key) || l.key === "assign") return "fold";
			return "keep";
		});
	}

	static fold(run) {
		const kinds = {}, files = new Set();
		for (const l of run) {
			kinds[l.key] = (kinds[l.key] || 0) + 1;
			const v = l.obj[l.key];
			if (Array.isArray(v?.files)) v.files.forEach(f => files.add(f));
		}
		const all = [...files];
		return JSON.stringify({ folded: {
			lines: run.length, kinds,
			from: Compact.at(run[0]), to: Compact.at(run[run.length - 1]),
			files: all.slice(0, Compact.MAX_FILES), files_total: all.length,
		} });
	}

	// The commit that holds the full log (the undo). Only looked up on request: one git call per task.
	static commitOf(file) {
		try { return execFileSync("git", ["log", "-1", "--format=%H", "--", file], { cwd: ROOT, encoding: "utf8", windowsHide: true }).trim() || null; }
		catch { return null; }
	}

	// plan(taskDir) -> what compaction would do. Reads one file, writes nothing.
	static plan(taskDir, { now = Date.now(), git = false } = {}) {
		const file = path.join(taskDir, "task.jsonl");
		const text = fs.readFileSync(file, "utf8");
		const lines = Compact.parse(text);
		const verdicts = Compact.classify(lines);
		const kept = [], folded = [], out = [];
		let run = [];
		const flush = () => { if (run.length) { const f = Compact.fold(run); folded.push(f); out.push(f); run = []; } };
		lines.forEach((l, i) => {
			if (verdicts[i] === "fold") run.push(l);
			else { flush(); kept.push(l.raw); out.push(l.raw); }
		});
		flush();
		const commit = git ? Compact.commitOf(file) : null;
		const marker = JSON.stringify({ compacted: { lines: lines.length, kept: kept.length, folded_runs: folded.length, commit: commit ?? "0".repeat(40),
			from: Compact.at(lines[0] ?? {}), to: Compact.lastActivity(lines) !== null ? new Date(Compact.lastActivity(lines)).toISOString() : null } });
		out.splice(1, 0, marker); // line 1 stays the assign launch line
		const blockers = Compact.blockers(lines, now);
		const count = k => lines.filter(l => l.key === k).length;
		const foldedLines = verdicts.filter(v => v === "fold").length;
		return {
			dir: taskDir, file, eligible: blockers.length === 0, blockers,
			linesBefore: lines.length, linesAfter: out.length,
			bytesBefore: Buffer.byteLength(text), bytesAfter: Compact.bytes(out),
			foldedLines, foldedRuns: folded.length, decisions: count("decision"),
			noiseLines: lines.filter(l => Compact.NOISE.has(l.key)).length,
			keptLines: kept, foldedSummaries: folded, marker, output: out,
			tailKept: out.length > 0 && out[out.length - 1] === lines[lines.length - 1]?.raw,
			undo: commit ? `git show ${commit}:${path.relative(ROOT, file).replaceAll("\\", "/")}` : "needs a commit that holds the full log first",
		};
	}

	// Every task dir (one holding a task.jsonl) under public/framework/ai/sessions/<ym>, e.g. "2026/09".
	static taskDirs(ym) {
		const found = [];
		const walk = d => {
			if (fs.existsSync(path.join(d, "task.jsonl"))) found.push(d);
			for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) walk(path.join(d, e.name));
		};
		walk(path.join(SESSIONS, ym));
		return found;
	}

	// The month: one plan per task dir; scanned and dirs must agree.
	static month(ym, opts) {
		const dirs = Compact.taskDirs(ym);
		const plans = dirs.map(d => Compact.plan(d, opts));
		return { ym, dirs: dirs.length, scanned: plans.length, plans, ...Compact.summarize(plans) };
	}

	static summarize(plans) {
		const sum = (a, f) => a.reduce((n, p) => n + f(p), 0);
		const ok = plans.filter(p => p.eligible);
		const lines = sum(plans, p => p.linesBefore);
		return {
			eligible: ok.length,
			bytesBefore: sum(plans, p => p.bytesBefore),
			bytesSaved: sum(ok, p => p.bytesBefore - p.bytesAfter),
			linesBefore: lines,
			noiseShare: lines ? sum(plans, p => p.noiseLines) / lines : 0,
			decisionShare: lines ? sum(plans, p => p.decisions) / lines : 0,
			foldedShare: lines ? sum(ok, p => p.foldedLines) / lines : 0,
		};
	}

	static table(m) {
		const rel = p => path.relative(path.join(SESSIONS, m.ym), p.dir).replaceAll("\\", "/");
		const head = `# Compaction dry run, ${m.ym}\n\nNot applied: this is a plan. Tasks scanned ${m.scanned}, task dirs ${m.dirs} (${m.scanned === m.dirs ? "agree" : "DISAGREE"}); eligible ${m.eligible}.\n\n`
			+ "| task | lines before | lines after | bytes before | bytes after | eligible |\n|---|---|---|---|---|---|\n";
		return head + m.plans.map(p => `| ${rel(p)} | ${p.linesBefore} | ${p.eligible ? p.linesAfter : p.linesBefore} | ${p.bytesBefore} | ${p.eligible ? p.bytesAfter : p.bytesBefore} | ${p.eligible ? "yes" : "no: " + p.blockers.join(", ")} |`).join("\n") + "\n";
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const args = process.argv.slice(2);
	const pct = x => (x * 100).toFixed(1) + "%";
	if (!args.includes("--dry")) { console.error("dry run only: node Server/Compact.mjs --dry <taskDir>  |  --dry --all <YYYY/MM> [--out file.md]"); process.exit(2); }
	const rest = args.filter(a => a !== "--dry");
	if (rest[0] === "--all") {
		const m = Compact.month(rest[1]);
		const oi = rest.indexOf("--out");
		const md = Compact.table(m);
		if (oi > 0) fs.writeFileSync(rest[oi + 1], md);
		else console.log(md);
		console.log(`${m.ym}: scanned ${m.scanned}, dirs ${m.dirs} ${m.scanned === m.dirs ? "(agree)" : "(DISAGREE)"}, eligible ${m.eligible}; ` +
			`bytes ${m.bytesBefore}, saved if applied ${m.bytesSaved}; log/action ${pct(m.noiseShare)} of lines, decisions ${pct(m.decisionShare)}`);
		if (m.scanned !== m.dirs) process.exit(1);
	} else {
		const p = Compact.plan(path.resolve(rest[0]), { git: true });
		const { output, keptLines, foldedSummaries, ...show } = p;
		console.log(JSON.stringify(show, null, 2));
		console.log(`keeps ${keptLines.length} lines verbatim, folds ${p.foldedLines} lines into ${p.foldedRuns} summaries; tail kept: ${p.tailKept}`);
	}
}
