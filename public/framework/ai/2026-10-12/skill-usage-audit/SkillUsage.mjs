// SkillUsage: counts Skill tool calls in Claude transcripts, per skill, per day, per role, and trigger coverage.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export default class SkillUsage {
	constructor(root = path.join(os.homedir(), ".claude", "projects"), skills_dir = path.resolve("../../../../../.claude/skills")) {
		this.root = root;
		this.skills = fs.readdirSync(skills_dir);
		this.by_skill = {}; this.by_day = {}; this.by_role = {};
		this.sessions = 0; this.sessions_with_skill = 0;
		this.triggers = { new_task: { opened: 0, loaded: 0 }, finish_task: { opened: 0, loaded: 0 }, new_page: { opened: 0, loaded: 0 }, minion: { opened: 0, loaded: 0 } };
		this.first_skill_turn = [];
	}
	files() {
		const out = [];
		for (const d of fs.readdirSync(this.root)) {
			const dir = path.join(this.root, d);
			if (!fs.statSync(dir).isDirectory()) continue;
			for (const f of fs.readdirSync(dir)) if (f.endsWith(".jsonl")) out.push(path.join(dir, f));
		}
		return out;
	}
	scan_file(file) {
		const txt = fs.readFileSync(file, "utf8");
		this.sessions++;
		const skills = [];
		let role = "tab";
		const m = /\[You are Servex agent ([\w-]+)\./.exec(txt.slice(0, 200000));
		if (m) role = m[1].replace(/-.*/, "") || "agent";
		let day = null;
		for (const line of txt.split("\n")) {
			if (!day) { const t = /"timestamp":"(\d{4}-\d\d-\d\d)/.exec(line); if (t) day = t[1]; }
			if (!line.includes('"name":"Skill"') || !line.includes('"input":{"skill"')) continue;
			const r = /"name":"Skill","input":\{"skill":"([^"]+)"/.exec(line);
			if (r) skills.push(r[1]);
		}
		for (const s of skills) {
			this.by_skill[s] = (this.by_skill[s] || 0) + 1;
			const d = day || "?"; (this.by_day[d] ||= {})[s] = ((this.by_day[d] || {})[s] || 0) + 1;
			(this.by_role[role] ||= {})[s] = ((this.by_role[role] || {})[s]) + 1 || 1;
		}
		if (skills.length) this.sessions_with_skill++;
		const has = n => skills.includes(n);
		const opened = (re) => re.test(txt);
		for (const [k, re, sk] of [
			["new_task", /new-task\b|"assign":\{/, "new-task"],
			["finish_task", /finish-task\b|"landed_at"/, "finish-task"],
			["new_page", /create_page|page\.jsonl/, "new-page"],
		]) {
			if (opened(re)) { this.triggers[k].opened++; if (has(sk)) this.triggers[k].loaded++; }
		}
		if (/You are Servex agent/.test(txt.slice(0, 200000))) { this.triggers.minion.opened++; if (has("minion") || has("mastermind") || has("servex-mastermind")) this.triggers.minion.loaded++; }
	}
	run() {
		for (const f of this.files()) { try { this.scan_file(f); } catch {} }
		this.never = this.skills.filter(s => !this.by_skill[s]);
		return this;
	}
	report() {
		const rows = Object.entries(this.by_skill).sort((a, b) => b[1] - a[1]);
		return { sessions: this.sessions, sessions_with_skill: this.sessions_with_skill, total_calls: rows.reduce((n, r) => n + r[1], 0), by_skill: Object.fromEntries(rows), never_invoked: this.never, triggers: this.triggers, by_role: this.by_role, by_day: this.by_day };
	}
}
if (import.meta.url === new URL(process.argv[1], "file://").href || process.argv[1]?.endsWith("SkillUsage.mjs")) {
	const r = new SkillUsage().run().report();
	fs.writeFileSync("data/usage.json", JSON.stringify(r, null, 1));
	const { by_day, by_role, ...short } = r; console.log(JSON.stringify(short, null, 1));
}
