#!/usr/bin/env node
// Server/ModuleLog.mjs — the work on ONE module/folder, by day/week/month, each item graded. Script only, no AI reads.
// Doc: .claude/skills/past-work/SKILL.md (part of the past-work system; reuses SessionIndex + LandingCheck, adds the git join).
//   node Server/ModuleLog.mjs <repo path> [--by day|week|month] [--since YYYY-MM-DD] [--json]     e.g. public/framework/core/Page
// Grades: landed-and-committed · committed-never-closed · never-started (not landed, no commit ties to it) · landed-no-path-commit (landed, but no commit of this path ties to it).
// A commit belongs to a task when a task action file it touches matches (time window), or its message names the task slug/branch.
// Commits that tie to no task are listed as orphans.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import SessionIndex from "./SessionIndex.mjs";
import LandingCheck from "./LandingCheck.mjs";
import PastWork from "./PastWork.mjs";

const REPO = LandingCheck.REPO, HOUR = 3600e3;
const norm = p => String(p).replaceAll("\\", "/").replace(/^[A-Za-z]:.*?monorepo\//, "").replace(/^\.?\//, "").replace(/\/+$/, "");
const inside = (f, p) => { f = norm(f); return f === p || f.startsWith(p + "/"); };

export default class ModuleLog {
	constructor(target, { since = "" } = {}) { this.path = norm(target); this.since = since; }

	/** Task records that touched the path: an action file inside it, a Fence/outcome/title naming it. Each carries its matched files. */
	tasks(msgs = "") {
		const out = [];
		for (const f of PastWork.walk(path.join(REPO, "public/framework/ai"))) {
			if (path.basename(f) !== "task.jsonl") continue;
			let text; try { text = fs.readFileSync(f, "utf8"); } catch { continue; }
			const dir = norm(path.relative(REPO, path.dirname(f))), r = SessionIndex.reduce(dir, text), files = new Set();
			for (const l of text.split("\n")) { if (!l.startsWith("{")) continue; try { for (const x of JSON.parse(l).action?.files ?? []) if (inside(x, this.path)) files.add(norm(x)); } catch {} }
			let how = files.size ? "files" : "";
			if (!how && r.slug.length > 8 && msgs.includes(r.slug)) how = "message";   // a commit on this path names the task
			if (!how) {
				let req = ""; try { req = fs.readFileSync(path.join(REPO, dir, "requirements.md"), "utf8").split("\n").find(l => /^\s*(\*\*)?Fence/i.test(l)) ?? ""; } catch {}
				if ([r.outcome, r.title, req].some(s => s.replaceAll("\\", "/").includes(this.path))) how = "named";
			}
			if (!how || dir === norm(path.relative(REPO, "."))) continue;
			Object.assign(r, { touched: [...files], how, when: r.landed_at || r.started || r.last });
			out.push(r);
		}
		return out;
	}

	/** Commits touching the path, newest first: { sha, at (ms), subject, body, files (inside the path) }. */
	commits() {
		const raw = LandingCheck.git("-c", "core.quotepath=off", "log", "--no-merges", "--name-only", "--format=\x01%h\x02%aI\x02%s\x02%b\x03", "--", this.path, ":(exclude,glob)**/files.jsonl") ?? "";
		return raw.split("\x01").filter(Boolean).map(c => {
			const [head, tail = ""] = c.split("\x03"), [sha, at, subject, body] = head.split("\x02");
			return { sha, at: Date.parse(at), subject, body: body ?? "", files: tail.split("\n").map(s => s.trim()).filter(Boolean).filter(f => inside(f, this.path)) };
		});
	}

	/** Tie each commit to a task (action file + time window, or slug/branch in the message). Returns the log rows. */
	build() {
		const commits = this.commits(), tasks = this.tasks(commits.map(c => c.subject + " " + c.body).join(" ")), rows = [], tied = new Set();
		for (const t of tasks) {
			t.commits = commits.filter(c => {
				const msg = c.subject + " " + c.body;
				const from = (t.started || t.last) - HOUR, to = Math.max(t.landed_at, t.last) + 2 * HOUR;
				if ((t.slug.length > 8 && msg.includes(t.slug) || t.branch && msg.includes(t.branch)) && c.at >= from && c.at <= to + 24 * HOUR) return true;   // a name in the message counts only near the task's own dates
				return t.touched.some(f => c.files.includes(f)) && c.at >= from && c.at <= to;
			});
			t.commits.forEach(c => tied.add(c.sha));
			let grade = !t.commits.length ? "never-started" : t.landed ? "landed-and-committed" : "committed-never-closed";
			if (grade === "never-started" && t.landed) grade = t.branch && LandingCheck.verify(t.dir).landed ? "landed-and-committed" : "landed-no-path-commit";   // landed, but no commit of this path ties to it (named only, or the merge applied the diff)
			rows.push({ kind: "task", at: t.when, grade, title: t.title || t.slug, url: t.url, how: t.how, commits: t.commits.map(c => c.sha), outcome: t.outcome });
		}
		for (const c of commits) if (!tied.has(c.sha)) rows.push({ kind: "orphan", at: c.at, grade: "orphan-commit", title: c.subject, url: "", how: "", commits: [c.sha], outcome: "" });
		return rows.filter(r => r.at && new Date(r.at).toISOString().slice(0, 10) >= this.since).sort((a, b) => b.at - a.at);
	}

	/** A new file or folder in `dir` (absolute) is one line in that folder's files.jsonl, the same line PageFiles.js writes ({"file":"kid/page.js"}).
	 *  Only a folder that already keeps a files.jsonl: PageFiles lists the rest itself. Repeat-safe: no line if the latest one for the name is the same. */
	static record(dir, rel) {
		const log = path.join(dir, "files.jsonl");
		if (!fs.existsSync(log)) return false;
		const key = rel.split("/")[0], text = fs.readFileSync(log, "utf8");
		let last = null;
		for (const l of text.split(String.fromCharCode(10))) { try { const o = JSON.parse(l); if (String(o.file ?? "").split("/")[0] === key) last = o; } catch {} }
		if (last && !last.gone) return false;
		fs.appendFileSync(log, JSON.stringify({ file: rel }) + String.fromCharCode(10));
		return true;
	}

	static bucket(ms, by) {
		const d = new Date(ms), day = d.toISOString().slice(0, 10);
		if (by === "day") return day;
		if (by === "month") return day.slice(0, 7);
		const mon = new Date(ms - ((d.getUTCDay() + 6) % 7) * 864e5);   // week starts Monday
		return "week of " + mon.toISOString().slice(0, 10);
	}

	format(rows, by = "week") {
		const n = g => rows.filter(r => r.grade === g).length, L = [`# ${this.path} — work log by ${by}`, "",
			`${rows.length} items: ${n("landed-and-committed")} landed-and-committed · ${n("committed-never-closed")} committed-never-closed · ${n("never-started")} never-started · ${n("landed-no-path-commit")} landed-no-path-commit · ${n("orphan-commit")} orphan commits (no task)`, ""];
		let last = "";
		for (const r of rows) {
			const b = ModuleLog.bucket(r.at, by);
			if (b !== last) L.push(`## ${b}`, ""), last = b;
			const mark = { "landed-and-committed": "✅", "committed-never-closed": "⚠️", "never-started": "⬜", "landed-no-path-commit": "◻️", "orphan-commit": "·" }[r.grade];
			L.push(`- ${mark} ${new Date(r.at).toISOString().slice(0, 10)} **${r.grade}** ${r.url ? `[${r.title.slice(0, 80)}](${r.url})` : r.title.slice(0, 90)}${r.commits.length ? ` — ${r.commits.slice(0, 4).join(" ")}${r.commits.length > 4 ? ` +${r.commits.length - 4}` : ""}` : ""}`);
		}
		return L.join("\n") + "\n";
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const a = process.argv.slice(2), opt = k => { const i = a.indexOf(k); return i < 0 ? null : a.splice(i, 2)[1]; };
	const by = opt("--by") ?? "week", since = opt("--since") ?? "", json = a.includes("--json"), target = a.find(x => !x.startsWith("--"));
	if (!target) { console.error("usage: node Server/ModuleLog.mjs <repo path> [--by day|week|month] [--since YYYY-MM-DD] [--json]"); process.exit(1); }
	const log = new ModuleLog(target, { since }), rows = log.build();
	console.log(json ? JSON.stringify(rows, null, 1) : log.format(rows, by));
}
