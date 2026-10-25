#!/usr/bin/env node
// Server/FollowUp.mjs — WHAT FELL THROUGH THE CRACKS: a caller of the one state (Server/AIIndex.mjs) plus git and the asks file. Doc: public/framework/ai/doc/follow-up.md
//   node Server/FollowUp.mjs [--days 10]            print the flagged rows
//   node Server/FollowUp.mjs --write                write ai/doc/follow-up.md (under 100 lines) and follow-up-full.md (every task)
// Reads only; writes only those two files. Tasks and agents come from AIIndex (ai/index.json when under a minute old, else a fresh AIIndex snapshot).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import TaskDirs from "./TaskDirs.mjs";
import SessionIndex from "./SessionIndex.mjs";
import LandingCheck from "./LandingCheck.mjs";
import SessionRecord from "./SessionRecord.mjs";
import AIIndex from "./AIIndex.mjs";

const QUIET_H = 2, UNWORKED_D = 7, OPEN_ASK = new Set(["building", "routed", "queued", "stalled", undefined]), LIVE = new Set(["working", "idle", "dormant"]);
const DOC = path.join(TaskDirs.AI, "doc"), ts = s => { const t = Date.parse(s); return Number.isNaN(t) ? 0 : t; };
const git = (...a) => { try { return execFileSync("git", a, { cwd: TaskDirs.REPO, encoding: "utf8", windowsHide: true, maxBuffer: 1 << 26 }).trim(); } catch { return null; } };
const link = r => `[${path.basename(r.dir)}](${r.url})`;

export default class FollowUp {
	constructor({ days = 10, now = Date.now() } = {}){ this.days = days; this.now = now; this.rows = []; this.asks = []; this.agents = []; this.registry = false; this.source = ""; }

	async run(){
		await this.load_state();
		this.merged_cache = new Map();
		this.window = this.state.tasks.filter(t => this.in_window(t));   // the state's tasks touched in the window
		for (const t of this.window) this.rows.push(this.read_task(t));
		this.read_asks();
		this.unmerged_branches = (git("branch", "--no-merged", "michael/dev") ?? "").split("\n").map(s => s.replace(/^[*+ ]+/, "").trim()).filter(Boolean);
		return this;
	}

	in_window(t){ const cut = this.now - this.days * 864e5; return ts(t.last) >= cut || ts(t.started) >= cut; }

	/** The one state: ai/index.json when written under a minute ago, else a fresh snapshot (nothing written). */
	async load_state(){
		const st = new AIIndex(), file = st.out;
		try { if (this.now - fs.statSync(file).mtimeMs < 60000) { this.state = JSON.parse(fs.readFileSync(file, "utf8")); this.source = "ai/index.json (under a minute old)"; } } catch {}
		if (!this.state) { st.registry = await AIIndex.fetch_registry(); this.state = st.snapshot({ full: true }); this.source = "a fresh AIIndex snapshot"; }
		this.agents = this.state.agents;
		this.registry = this.agents.length > 0;   // an empty registry means Servex was down when the state was built
		this.by_id = new Map(this.agents.map(a => [a.id, a]));
		this.by_dir = new Map(this.agents.filter(a => a.task_dir).map(a => [path.relative(TaskDirs.REPO, path.resolve(a.task_dir)).split(path.sep).join("/"), a]));
	}

	/** Commits on `branch` not on michael/dev; null when the branch no longer exists. */
	ahead(branch){
		if (!this.merged_cache.has(branch)) {
			const ok = git("rev-parse", "--verify", "--quiet", "refs/heads/" + branch) !== null;
			this.merged_cache.set(branch, ok ? Number(git("rev-list", "--count", "michael/dev.." + branch)) : null);
		}
		return this.merged_cache.get(branch);
	}

	/** One row = one state task (its bucket, landed_at, line) plus the log facts the state does not hold (group, model, branch, steps): one read of the listed dir. */
	read_task(t){
		const file = SessionRecord.log_file(path.join(TaskDirs.REPO, t.dir)) ?? path.join(TaskDirs.REPO, t.dir, "task.jsonl");
		let x; try { x = SessionIndex.reduce(path.basename(t.dir), fs.readFileSync(file, "utf8")); } catch { x = SessionIndex.blank(t.dir); }   // metadata only: whether it landed is the state's call
		const landed = t.bucket === "landed", last = ts(t.last), r = { key: t.id, dir: t.dir, url: t.url, bucket: t.bucket, group: x.group, session: t.session ?? x.session, agent: t.agent ?? x.agent, model: x.model, branch: x.branch, started: ts(t.started) || last, last, step: x.step, steps: x.steps, landed, landed_at: t.landed_at, outcome: !!t.line };
		r.ahead = r.branch ? this.ahead(r.branch) : null;
		const ag = this.by_dir.get(t.dir) ?? this.by_id.get(r.agent);
		r.state = ag?.state ?? (this.registry ? "unknown" : "?");
		r.quiet_h = (this.now - r.last) / 36e5;
		r.flags = [];
		if (landed && r.ahead > 0 && !LandingCheck.verify(r.branch).landed) r.flags.push("unmerged");   // by file content, not commit count
		if (!landed && r.branch && !r.branch.startsWith("worktree/qf-") && r.ahead === 0) r.flags.push("merged-not-landed");
		if ((t.bucket === "in_flight" || t.bucket === "stale") && r.quiet_h > QUIET_H) r.flags.push("quiet");
		if (landed && !r.outcome) r.flags.push("no-outcome");
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
		"quiet": "the state calls it in_flight or stale and its log is silent for over 2 h: resume it or close it",
		"no-outcome": "landed with no outcome text: add one line saying what shipped",
	};
	flagged(kind){ return this.rows.filter(r => r.flags[0] === kind || (kind === "no-outcome" && r.flags.includes(kind) && r.flags.length === 1)).sort((a, b) => b.last - a.last); }   // newest first: the freshest are the most recoverable
	/** Open tasks nobody works: bucket idle, queued or waiting-on-no-owner whose last log line is over UNWORKED_D days old. Read from the whole state, not the days window, since the window drops exactly these. Newest first. */
	unworked(){
		if (!this._unworked) this._unworked = this.state.tasks.filter(t => ["idle", "queued", "waiting"].includes(t.bucket) && t.waiting_on !== "owner" && this.now - (ts(t.last) || ts(t.started)) > UNWORKED_D * 864e5)
			.map(t => ({ dir: t.dir, url: t.url, title: t.title, bucket: t.bucket, last: ts(t.last) || ts(t.started) })).sort((a, b) => b.last - a.last);
		return this._unworked;
	}
	counts(){ const c = {}; for (const k of FollowUp.ORDER) c[k] = this.rows.filter(r => r.flags.includes(k)).length; c.unworked = this.unworked().length; c.asks = this.asks.length; c.healthy = this.rows.filter(r => !r.flags.length).length; return c; }

	cell(r){
		const when = ms => new Date(ms).toISOString().slice(5, 16).replace("T", " ");
		return `| ${link(r)} | ${r.group || "-"} | ${(r.session ?? "").slice(0, 8) || "-"} | ${(r.model ?? "").replace("claude-", "") || "-"} | ${when(r.started)} | ${when(r.last)} | ${r.step}/${r.steps} | ${r.bucket} | ${r.outcome ? "yes" : "no"} | ${r.branch ? (r.ahead === null ? "branch gone" : r.ahead ? r.ahead + " ahead" : "merged") : "-"} | ${r.state} | ${r.flags.join(", ") || "ok"} |`;
	}
	static HEAD = "| task | group | session | model | started | last log | step | state bucket | outcome | branch | agent | flags |\n|---|---|---|---|---|---|---|---|---|---|---|---|";

	/** The branch the owner is deciding on, shown only while it still has commits michael/dev lacks; null once merged or gone. */
	static DECIDE = "michael/property-of";
	diff_stat(){ return this.ahead(FollowUp.DECIDE) ? git("diff", "--stat", `michael/dev...${FollowUp.DECIDE}`)?.split("\n").slice(-12).join("\n") ?? null : null; }

	/** Healthy plus flagged must equal the state's own task count over the same window. */
	check(){
		const flagged = this.rows.filter(r => r.flags.length).length, healthy = this.rows.filter(r => !r.flags.length).length;
		const in_state = this.state.tasks.filter(t => this.in_window(t)).length;
		return { healthy, flagged, sum: healthy + flagged, in_state, ok: healthy + flagged === in_state, state_ok: this.state.check.ok };
	}

	page(){
		const c = this.counts(), L = [], day = new Date(this.now).toISOString().slice(0, 16).replace("T", " ");
		L.push(`# Follow-up: what fell through the cracks`, "", `Counted by the one state ([one-state.md](one-state.md), \`Server/AIIndex.mjs\`): every task below is a row of \`ai/index.json\`. Computed ${day} UTC by \`node Server/FollowUp.mjs --write\` from the state's tasks touched in the last ${this.days} days. Re-run it any time; the full table is [follow-up-full.md](follow-up-full.md), unused files are [unreferenced.md](unreferenced.md).`, "",
			`**${c.unmerged} landed with unmerged commits · ${c["merged-not-landed"]} merged but never landed · ${c.quiet} quiet over ${QUIET_H} h · ${c["no-outcome"]} landed with no outcome · ${c.unworked} open tasks untouched over ${UNWORKED_D} days · ${c.asks} open asks with no live owner · ${c.healthy} healthy of ${this.rows.length}.**` + (this.registry ? "" : " (Servex was down: agent states unknown.)"), "");
		const diff = this.diff_stat();
		if (diff) L.push(`## ⚠️ The owner decides: \`${FollowUp.DECIDE}\``, "", "Its commits are code and not on `michael/dev`; this task does not merge it.", "```", diff, "```", "");
		for (const k of FollowUp.ORDER) {
			const rows = this.flagged(k); if (!rows.length) continue;
			const shown = rows.slice(0, k === "quiet" ? 12 : 8);
			L.push(`## ${k}: ${rows.length}`, "", `${FollowUp.TODO[k]}.`, "");
			for (const r of shown) L.push(`- ${link(r)}${r.branch && r.ahead ? ` (\`${r.branch}\`, ${r.ahead} ahead)` : ""}: ${r.agent || (r.session ?? "").slice(0, 8) || "no agent"}, last log ${r.quiet_h > 48 ? Math.round(r.quiet_h / 24) + " d" : Math.round(r.quiet_h) + " h"} ago, step ${r.step}/${r.steps}, agent ${r.state}`);
			if (rows.length > shown.length) L.push(`- …${rows.length - shown.length} more in [follow-up-full.md](follow-up-full.md)`);
			L.push("");
		}
		const un = this.unworked();
		if (un.length) {
			L.push(`## unworked: ${un.length}`, "", `Open tasks (idle, queued or waiting, none on the owner) whose last log line is over ${UNWORKED_D} days old. Nothing runs from the queue by itself, so these only get done if someone looks: do it, group it into a real task, or stop it with a reason (through the item tool). Newest first.`, "");
			for (const u of un.slice(0, 10)) L.push(`- [${path.basename(u.dir)}](${u.url}): ${u.bucket}, last log ${Math.round((this.now - u.last) / 864e5)} d ago`);
			if (un.length > 10) L.push(`- …${un.length - 10} more in [follow-up-full.md](follow-up-full.md)`);
			L.push("");
		}
		if (this.asks.length) {
			L.push(`## open asks with no live owner: ${this.asks.length}`, "", "An ask in `asks.jsonl` still building, routed, queued or stalled whose owner agent is stopped or gone: re-route it or mark it dropped.", "");
			for (const a of this.asks.slice(0, 10)) L.push(`- ${a.title} (${a.status}, owner \`${a.owner}\` ${a.state})`);
			if (this.asks.length > 10) L.push(`- …${this.asks.length - 10} more in [follow-up-full.md](follow-up-full.md)`);
			L.push("");
		}
		const k = this.check();
		L.push("## Check", "", `${k.healthy} healthy + ${k.flagged} flagged = ${k.sum}; the state lists ${k.in_state} tasks in the same ${this.days} days: ${k.ok ? "agree" : "DISAGREE"}. The state's own self-check is ${k.state_ok ? "ok" : "FAILING"}. Source: ${this.source}. ${this.unmerged_branches.length} local branches are not merged into \`michael/dev\` (many are salvage or abandoned worktrees).`);
		L.push("", "## How each row is counted", "", ...FollowUp.RULES.map(r => `- ${r}`));
		return L.join("\n") + "\n";
	}

	/** Each follow-up kind is a reading of the state (Server/AIIndex.mjs, bucket + dir + landed + line); the only other inputs are git and asks.jsonl. */
	static RULES = [
		"**quiet**: the state's bucket is `in_flight` or `stale` and the last log line is over 2 h old. A `landed` task is never quiet.",
		"**closed as abandoned**: a `stale` task silent over 24 h gets a `stop` line from `Server/StaleClose.mjs` (run just before this, daily) and leaves `quiet`; the manifest is `ai/stale-closes.jsonl`: [stale-close.md](/Server/doc/stale-close.md).",
		"**landed with unmerged commits**: bucket `landed`, its branch (read from the state's listed dir) has commits and its files are not on `michael/dev` (`LandingCheck`).",
		"**merged but never landed**: any bucket but `landed`, its branch is already on `michael/dev`.",
		"**landed with no outcome**: bucket `landed` and the state's `line` is empty.",
		"**unworked**: the state's bucket is `idle`, `queued` or `waiting` (not on the owner) and the last log line is over "+UNWORKED_D+" days old. Counted over the whole state, not only the window, because a task nobody touches drops out of the window. The 133 stale queue tasks of 2026-10-24 (nothing picks tasks from the queue by itself) are what this exists to catch early; it also counts idle and waiting tasks outside the queue, so its number is larger.",
		"**open asks with no live owner**: `asks.jsonl` as before, joined on the state's `agents`.",
		"**an orphaned ask is re-filed, not reopened**: `node Server/OrphanAsks.mjs --plan` lists these same asks with the module home each belongs to; `--apply` makes (or matches) an idle task there and appends a `tracked` line to `asks.jsonl`, which drops it from this list (manifest `ai/asks/orphan-asks.jsonl`).",
		"First run 2026-10-18: of the 30 rows the old reader called quiet, 26 survive (all `stale`: no finish line, no working agent) and 4 drop out (bucket `stopped`, an explicit stop).",
	];

	full(){
		const L = ["# Follow-up: every task of the last " + this.days + " days", "", `${this.rows.length} tasks, flagged first. Summary: [follow-up.md](follow-up.md).`, "", FollowUp.HEAD];
		const rank = r => r.flags.length ? FollowUp.ORDER.indexOf(r.flags[0]) : 99;
		for (const r of [...this.rows].sort((a, b) => rank(a) - rank(b) || b.last - a.last)) L.push(this.cell(r));
		L.push("", "## Unworked tasks (open, untouched over " + UNWORKED_D + " days)", "");
		for (const u of this.unworked()) L.push(`- [${path.basename(u.dir)}](${u.url}): ${u.bucket}, ${new Date(u.last).toISOString().slice(0, 10)}`);
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
	const k = f.check();
	console.log(`healthy ${k.healthy} + flagged ${k.flagged} = ${k.sum} vs the state's ${k.in_state} tasks in the window: ${k.ok ? "agree" : "MISMATCH"}`);
	if (!k.ok) process.exit(1);
}
