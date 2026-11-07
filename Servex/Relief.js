import Events from "../Server/Events.js";
import { stamp } from "./home.js";

/* RELIEF — ease the machine at 70% commit, before Windows runs out of memory at 100% (resources,
 * 2026-11-06). The Games.js shape: `decide()` is the whole rule, exported and pure; the class reads
 * Processes.js's snapshot once a minute and, when the rule says so, runs `run()`.
 *
 * run(): Lifecycle sweep, stop finished worktrees' servers, put idle agents to sleep, count what the
 * monitor already reaped. Anything still over the line afterwards gets ONE owner_note (a suggestion
 * naming the biggest apps that are not ours). It NEVER ends a process of its own accord and never
 * touches `other`: only Lifecycle, Worktrees and Agent.sleep do the closing, each by its own path.
 * Doc: Servex/doc/processes.md, "Early relief at 70%". */

export const REARM_PCT = 65;
const STANDING = /^(assistant-|manager-|master-assistant|session-|dispatcher$)/;   // the same list as STANDING in agents/Agents.js; copied because importing that file loads the SDK

/** The rule. `armed`: may a note be posted for this episode. Returns { run, armed } (armed re-arms below 65%). */
export function decide({ commit_pct, last_run = 0, armed = true, now = Date.now(), threshold = 70, every_ms = 15 * 60000 } = {}){
	if (typeof commit_pct !== "number" || Number.isNaN(commit_pct)) return { run: false, armed };
	if (commit_pct < REARM_PCT) armed = true;
	const run = commit_pct >= threshold && now - last_run >= every_ms;
	return { run, armed };
}

export default class Relief extends Events {

	initialize(){
		this.threshold ??= Number(process.env.SERVEX_RELIEF_PCT) || 70;
		this.every ??= Number(process.env.SERVEX_RELIEF_EVERY_MS) || 60000;
		this.every_ms ??= 15 * 60000;
		this.idle_min ??= Number(process.env.SERVEX_RELIEF_IDLE_MIN) || 10;
		this.last_run = 0;
		this.armed = true;
		this.runs = [];            // the last 20 relief lines, newest last
	}

	start(){
		this.timer = setInterval(() => this.tick().catch(e => this.error = e.message), this.every);
		this.timer.unref?.();
		return this;
	}

	stop(){ clearInterval(this.timer); }

	log(entry){ return this.servex?.log?.append("processes", entry)?.catch?.(() => {}); }

	commit_pct(){
		const p = this.servex?.procmon;
		return p?.commit_limit_mb ? Math.round(1000 * p.commit_mb / p.commit_limit_mb) / 10 : null;
	}

	async tick(now = Date.now()){
		const pct = this.commit_pct();
		const d = decide({ commit_pct: pct, last_run: this.last_run, armed: this.armed, now, threshold: this.threshold, every_ms: this.every_ms });
		this.armed = d.armed;
		if (!d.run) return null;
		this.last_run = now;
		return this.run(pct, now);
	}

	step(step, detail){ return this.log({ type: "relief-step", at: stamp(), step, ...detail }); }

	async run(pct = this.commit_pct(), now = Date.now()){
		const sv = this.servex, closed = [], dormant = [];
		let freed = 0;

		try {
			const r = await sv.lifecycle.sweep();
			for (const row of r.close ?? []){ closed.push(`${row.kind}:${row.id}`); freed += row.mb ?? 0; }
			await this.step("sweep", { closed: (r.close ?? []).length, gone: (r.gone ?? []).length, kept: (r.kept ?? []).length });
		} catch (e){ await this.step("sweep", { error: e.message }); }

		try {
			const wt = sv.worktrees, items = (wt?.last?.items ?? []).filter(i => i.state === "finished");
			const n = wt && items.length ? await wt.stop_idle(items, wt.tasks()) : 0;
			if (n) closed.push(`servers:${n} worktree${n === 1 ? "" : "s"}`);
			await this.step("servers", { finished: items.length, stopped: n });
		} catch (e){ await this.step("servers", { error: e.message }); }

		try {
			for (const a of this.sleepers(now)){
				const mb = a.rss_mb ?? 0;
				if (!a.sleep("relief")) continue;
				try { sv.global?.mark_slept?.(a, this.idle_min * 60000); } catch {}
				dormant.push(a.id); freed += mb;
			}
			await this.step("dormant", { dormant });
		} catch (e){ await this.step("dormant", { error: e.message }); }

		const reaped = (sv.procmon?.reaped ?? []).filter(r => !(Date.parse(r.at) < now - this.every_ms));
		for (const r of reaped) freed += r.mb ?? 0;
		await this.step("reaped", { reaped: reaped.length });

		const entry = { type: "relief", at: stamp(), commit_pct: pct, closed, dormant, reaped: reaped.length, freed_mb_estimate: Math.round(freed) };
		await this.log(entry);
		this.runs.push(entry); if (this.runs.length > 20) this.runs.shift();

		const after = this.commit_pct();
		if (after !== null && after >= this.threshold && this.armed) await this.note(after);
		this.emit("run", entry);
		return entry;
	}

	/* Agents that may sleep now: idle past `idle_min`, not standing (front desk, voice seats, the fixer), not holding "session". */
	sleepers(now = Date.now()){
		const sv = this.servex, g = sv.global, out = [];
		for (const a of sv.agents?.live?.values?.() ?? []){
			if (a.state !== "idle" || typeof a.sleep !== "function") continue;
			if (STANDING.test(a.id ?? "") || /^fixer/.test(a.id ?? "") || a.dormant_after === "session") continue;
			if (g){
				if (g.wait_ms?.(a) === Infinity || g.has_working_child?.(a.id)) continue;
				if (now - g.last_active(a, now) < this.idle_min * 60000) continue;
			}
			out.push(a);
		}
		return out;
	}

	/* The five biggest apps that are NOT ours, as a suggestion. Never closed from here. */
	async note(pct){
		const top = (this.servex?.procmon?.now?.other_top ?? []).slice(0, 5);
		this.armed = false;
		if (!top.length) return;
		const list = top.map(t => `${t.name} (${t.mb} MB)`).join(", ");
		await this.log({ type: "relief-note", at: stamp(), commit_pct: pct, top });
		return this.servex?.cards?.owner_note?.({
			title: `Memory is at ${pct}% of the limit even after relief`,
			text: `Servex closed what it could. The biggest apps that are not Servex: ${list}. Closing one of them would help most; Servex will not touch them.`,
			kind: "risk", links: ["/Servex/doc/processes.md"], by: "relief"
		})?.catch?.(() => {});
	}
}
