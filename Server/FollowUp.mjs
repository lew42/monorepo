#!/usr/bin/env node
// Server/FollowUp.mjs — WHAT FELL THROUGH THE CRACKS, computed from task.jsonl + git + the agent registry. Doc: public/framework/ai/doc/follow-up.md
//   node Server/FollowUp.mjs [--days 10]            print the flagged rows
//   node Server/FollowUp.mjs --write                write ai/doc/follow-up.md (under 100 lines) and follow-up-full.md (every task)
// Reads only; writes only those two files. Registry: GET :8090/agents (skipped with a note when Servex is down).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import TaskDirs from "./TaskDirs.mjs";
import SessionIndex from "./SessionIndex.mjs";

const QUIET_H = 2, OPEN_ASK = new Set(["building", "routed", "queued", "stalled", undefined]), LIVE = new Set(["working", "idle", "dormant"]);
const DOC = path.join(TaskDirs.AI, "doc"), ts = s => { const t = Date.parse(s); return Number.isNaN(t) ? 0 : t; };
const git = (...a) => { try { return execFileSync("git", a, { cwd: TaskDirs.REPO, encoding: "utf8", windowsHide: true, maxBuffer: 1 << 26 }).trim(); } catch { return null; } };
const link = k => `[${path.basename(k)}](/framework/ai/${k}/)`;

export default class FollowUp {
	constructor({ days = 10, now = Date.now() } = {}){ this.days = days; this.now = now; this.rows = []; this.asks = []; this.agents = []; this.registry = false; }

	async run(){
		await this.load_registry();
		this.list = TaskDirs.list(this.days);
		this.count = { counted: 0, listed: this.list.length };
		this.merged_cache = new Map();
		for (const t of this.list) this.rows.push(this.read_task(t));
		this.count.counted = this.rows.length;
		this.read_asks();
		this.unmerged_branches = (git("branch", "--no-merged", "michael/dev") ?? "").split("\n").map(s => s.replace(/^[*+ ]+/, "").trim()).filter(Boolean);
		return this;
	}

	async load_registry(){
		try { const r = await fetch("http://127.0.0.1:8090/agents", { signal: AbortSignal.timeout(4000) }); this.agents = await r.json(); this.registry = true; }
		catch { this.agents = []; this.registry = false; }
		this.by_id = new Map(this.agents.map(a => [a.id, a])); this.by_session = new Map(this.agents.map(a => [a.session_id, a]));
	}

	/** Commits on `branch` not on michael/dev; null when the branch no longer exists. */
	ahead(branch){
		if (!this.merged_cache.has(branch)) {
			const ok = git("rev-parse", "--verify", "--quiet", "refs/heads/" + branch) !== null;
			this.merged_cache.set(branch, ok ? Number(git("rev-list", "--count", "michael/dev.." + branch)) : null);
		}
		return this.merged_cache.get(branch);
	}

	read_task(t){
		const x = SessionIndex.reduce(t.key, fs.readFileSync(path.join(t.dir, "task.jsonl"), "utf8"));   // the one task.jsonl reader: Server/SessionIndex.mjs
		const r = { key: t.key, day: t.day, slug: t.slug, group: x.group, session: x.session, agent: x.agent, model: x.model, branch: x.branch, started: x.started, last: x.last, step: x.step, steps: x.steps, landed: x.landed, landed_at: x.landed_at, outcome: !!x.outcome };
		if (!r.last) r.last = fs.statSync(path.join(t.dir, "task.jsonl")).mtimeMs;
		r.started ||= r.last;
		r.ahead = r.branch ? this.ahead(r.branch) : null;
		const ag = this.by_id.get(r.agent) ?? this.by_session.get(r.session);
		r.state = ag?.state ?? (this.registry ? "unknown" : "?");
		r.quiet_h = (this.now - r.last) / 36e5;
		r.flags = [];
		if (r.landed && r.ahead > 0) r.flags.push("unmerged");
		if (!r.landed && r.branch && !r.branch.startsWith("worktree/qf-") && r.ahead === 0) r.flags.push("merged-not-landed");
		if (!r.landed && r.quiet_h > QUIET_H && r.state !== "working") r.flags.push("quiet");
		if (r.landed && !r.outcome) r.flags.push("no-outcome");
		return r;
	}

	read_asks(){
		const file = path.join(TaskDirs.AI, "asks.jsonl"), seen = new Map();
		if (!fs.existsSync(file)) return;
		for (const l of fs.readFileSync(file, "utf8").split("\n")) { try { const a = JSON.parse(l).ask; if (a) seen.set(a.card || a.title, a); } catch {} }
		for (const a of seen.values()) {
			if (!OPEN_ASK.has(a.status)) continue;
			if (!a.title || !a.owner) continue;
			const ag = this.by_id.get(a.owner), state = ag?.state ?? (this.registry ? "no such agent" : "?");
			if (this.registry && !LIVE.has(state)) this.asks.push({ ...a, state });
		}
	}

	/** Importance order: unmerged code, merged-not-landed, quiet, no outcome. */
	static ORDER = ["unmerged", "merged-not-landed", "quiet", "no-outcome"];
	static TODO = {
		"unmerged": "landed, but commits are not on michael/dev: review the diff, then `merge.mjs`",
		"merged-not-landed": "branch is merged: append the landing line",
		"quiet": "no log for over 2 h and no live agent: resume it or close it",
		"no-outcome": "landed with no outcome text: add one line saying what shipped",
	};
	flagged(kind){ return this.rows.filter(r => r.flags[0] === kind || (kind === "no-outcome" && r.flags.includes(kind) && r.flags.length === 1)); }
	counts(){ const c = {}; for (const k of FollowUp.ORDER) c[k] = this.rows.filter(r => r.flags.includes(k)).length; c.asks = this.asks.length; c.healthy = this.rows.filter(r => !r.flags.length).length; return c; }

	cell(r){
		const when = ms => new Date(ms).toISOString().slice(5, 16).replace("T", " ");
		return `| ${link(r.key)} | ${r.group || "-"} | ${r.session.slice(0, 8) || "-"} | ${r.model.replace("claude-", "") || "-"} | ${when(r.started)} | ${when(r.last)} | ${r.step}/${r.steps} | ${r.landed ? "yes" : "no"} | ${r.outcome ? "yes" : "no"} | ${r.branch ? (r.ahead === null ? "branch gone" : r.ahead ? r.ahead + " ahead" : "merged") : "-"} | ${r.state} | ${r.flags.join(", ") || "ok"} |`;
	}
	static HEAD = "| task | group | session | model | started | last log | step | landed | outcome | branch | agent | flags |\n|---|---|---|---|---|---|---|---|---|---|---|---|";

	diff_stat(){ return git("diff", "--stat", "michael/dev...michael/property-of")?.split("\n").slice(-12).join("\n") ?? "(branch michael/property-of not found)"; }

	page(){
		const c = this.counts(), L = [], day = new Date(this.now).toISOString().slice(0, 16).replace("T", " ");
		L.push(`# Follow-up: what fell through the cracks`, "", `Computed ${day} UTC by \`node Server/FollowUp.mjs --write\` from every task folder of the last ${this.days} days. Re-run it any time; the full table is [follow-up-full.md](follow-up-full.md), unused files are [unreferenced.md](unreferenced.md).`, "",
			`**${c.unmerged} landed with unmerged commits · ${c["merged-not-landed"]} merged but never landed · ${c.quiet} quiet over ${QUIET_H} h · ${c["no-outcome"]} landed with no outcome · ${c.asks} open asks with no live owner · ${c.healthy} healthy of ${this.rows.length}.**` + (this.registry ? "" : " (Servex was down: agent states unknown.)"), "");
		L.push("## ⚠️ The owner decides: `michael/property-of`", "", "Its commits are code and not on `michael/dev`; this task does not merge it.", "```", this.diff_stat(), "```", "");
		for (const k of FollowUp.ORDER) {
			const rows = this.flagged(k); if (!rows.length) continue;
			const shown = rows.slice(0, k === "quiet" ? 12 : 8);
			L.push(`## ${k}: ${rows.length}`, "", `${FollowUp.TODO[k]}.`, "");
			for (const r of shown) L.push(`- ${link(r.key)}${r.branch && r.ahead ? ` (\`${r.branch}\`, ${r.ahead} ahead)` : ""}: ${r.agent || r.session.slice(0, 8) || "no agent"}, last log ${r.quiet_h > 48 ? Math.round(r.quiet_h / 24) + " d" : Math.round(r.quiet_h) + " h"} ago, step ${r.step}/${r.steps}, agent ${r.state}`);
			if (rows.length > shown.length) L.push(`- …${rows.length - shown.length} more in [follow-up-full.md](follow-up-full.md)`);
			L.push("");
		}
		if (this.asks.length) {
			L.push(`## open asks with no live owner: ${this.asks.length}`, "", "An ask in `asks.jsonl` still building, routed, queued or stalled whose owner agent is stopped or gone: re-route it or mark it dropped.", "");
			for (const a of this.asks.slice(0, 10)) L.push(`- ${a.title} (${a.status}, owner \`${a.owner}\` ${a.state})`);
			if (this.asks.length > 10) L.push(`- …${this.asks.length - 10} more in [follow-up-full.md](follow-up-full.md)`);
			L.push("");
		}
		L.push("## Check", "", `Tasks counted ${this.count.counted}, \`TaskDirs --list ${this.days}\` ${this.count.listed}: ${this.count.counted === this.count.listed ? "agree" : "DISAGREE"}. ${this.unmerged_branches.length} local branches are not merged into \`michael/dev\` (many are salvage or abandoned worktrees).`);
		return L.join("\n") + "\n";
	}

	full(){
		const L = ["# Follow-up: every task of the last " + this.days + " days", "", `${this.rows.length} tasks, flagged first. Summary: [follow-up.md](follow-up.md).`, "", FollowUp.HEAD];
		const rank = r => r.flags.length ? FollowUp.ORDER.indexOf(r.flags[0]) : 99;
		for (const r of [...this.rows].sort((a, b) => rank(a) - rank(b) || b.last - a.last)) L.push(this.cell(r));
		L.push("", "## Open asks with no live owner", "");
		for (const a of this.asks) L.push(`- ${a.title} (${a.status}, owner \`${a.owner}\` ${a.state}, card ${a.card ?? "-"})`);
		return L.join("\n") + "\n";
	}

	write(){
		fs.mkdirSync(DOC, { recursive: true });
		fs.writeFileSync(path.join(DOC, "follow-up.md"), this.page()); fs.writeFileSync(path.join(DOC, "follow-up-full.md"), this.full());
	}
}

if (import.meta.url === new URL(process.argv[1], "file://").href || process.argv[1]?.endsWith("FollowUp.mjs")) {
	const argv = process.argv.slice(2), days = Number(argv[argv.indexOf("--days") + 1]) || 10;
	const f = await new FollowUp({ days }).run();
	if (argv.includes("--write")) { f.write(); console.log("wrote follow-up.md + follow-up-full.md", f.counts()); }
	else console.log(f.page());
	console.log(`tasks counted ${f.count.counted} vs TaskDirs --list ${f.count.listed}`);
}
