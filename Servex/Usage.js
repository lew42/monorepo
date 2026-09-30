/* Usage.js — keeps the usage bars fresh, so no agent has to.
 * Every 15 minutes (never more often: the endpoint answers 429) it runs
 * `python ~/.claude/bin/claude-usage.py --json`, hidden, writes the answer to
 * public/framework/ai/usage.json and appends one line to usage.jsonl — the same
 * shape the check-claude-usage skill wrote by hand. At boot it runs at once only
 * if usage.json is already older than the interval, so a restart loop cannot hammer
 * the endpoint. `SERVEX_NO_USAGE=1` boots without it. */
import fs from "fs";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { fileURLToPath } from "url";

const EVERY_MS = 15 * 60 * 1000;

const stamp = () => {
	const d = new Date(), o = -d.getTimezoneOffset(), p = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${o < 0 ? "-" : "+"}${p(o / 60)}:${p(o % 60)}`;
};

export default class Usage {
	constructor({ repo, every = EVERY_MS } = {}){
		this.dir = path.join(repo, "public/framework/ai");
		this.every = every;
		this.script = path.join(os.homedir(), ".claude/bin/claude-usage.py");
	}

	start(){
		let age = Infinity;
		try { age = Date.now() - fs.statSync(path.join(this.dir, "usage.json")).mtimeMs; } catch {}
		this.first = setTimeout(() => this.tick(), Math.max(0, this.every - age));
		this.timer = setInterval(() => this.tick(), this.every);
		this.first.unref?.(); this.timer.unref?.();
		return this;
	}

	stop(){ clearTimeout(this.first); clearInterval(this.timer); }

	/* Opus when the week is over 60% gone and weekly use is under the elapsed share (usage to spare); else Sonnet. `fast` is always Sonnet. */
	static pick(role, repo = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")){
		const SONNET = "claude-sonnet-5", OPUS = "claude-opus-5-5", WEEK = 7 * 24 * 3600 * 1000;
		if (role === "fast") return SONNET;
		try {
			const j = JSON.parse(fs.readFileSync(path.join(repo, "public/framework/ai/usage.json"), "utf8"));
			const week = (j.utilization?.limits ?? []).find(l => l.kind === "weekly_all");
			const used = week?.percent ?? j.utilization?.seven_day?.utilization;
			const resets = Date.parse(week?.resets_at ?? j.utilization?.seven_day?.resets_at ?? "");
			const elapsed = 100 * (1 - (resets - Date.now()) / WEEK);
			return elapsed > 60 && used < elapsed ? OPUS : SONNET;
		} catch { return SONNET; }
	}

	tick(){
		if (this.busy) return;
		this.busy = true;
		execFile("python", [this.script, "--json"], { windowsHide: true, timeout: 60000, maxBuffer: 4 << 20 }, (err, out) => {
			this.busy = false;
			if (err) { this.error = String(err.message).slice(0, 200); return; }
			let j; try { j = JSON.parse(out); } catch { this.error = "not JSON"; return; }
			const limits = j?.utilization?.limits ?? [];
			const pct = kind => limits.find(l => l.kind === kind)?.percent ?? null;
			try {
				fs.writeFileSync(path.join(this.dir, "usage.json"), JSON.stringify(j, null, 2));
				fs.appendFileSync(path.join(this.dir, "usage.jsonl"), JSON.stringify({ log: {
					at: stamp(), session: pct("session"), weekly_all: pct("weekly_all"), weekly_scoped: pct("weekly_scoped"),
					resets_at: limits.find(l => l.kind === "session")?.resets_at ?? null
				} }) + "\n");
				this.error = null; this.last = stamp();
			} catch (e) { this.error = String(e.message).slice(0, 200); }
		});
	}
}
