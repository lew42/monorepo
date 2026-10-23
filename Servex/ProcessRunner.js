import fs from "fs";
import path from "path";
import { stamp } from "./home.js";
import Process from "../public/framework/core/Task/Process.js";
import { move_home } from "./agents/page_tools.js";

/* THE PROCESS RUNNER: a process's phases run in order because node runs them, never because an agent remembers.
 * Process.next() (core/Task/Process.js) decides; this class writes the line it asks for and launches the phase's session.
 * Woken by the item tool after any write to a process (page_tools hooks.changed), by an agent's turn end (Agents.js),
 * and by the TaskLoop tick (the retry, and the resume after a restart). Doc: public/framework/core/Task/doc/process.md.
 * Not Processes.js, which watches OS processes. */
export default class ProcessRunner {

	constructor(...args){ Object.assign(this, ...args); this.initialize(); }

	initialize(){
		this.root ??= process.cwd();
		this.public ??= path.join(this.root, "public");
		this.chains = new Map();     // file -> the step in flight, so two wakes never step one file at once
		this.by_agent = new Map();   // agent id -> the process file whose running phase it holds
		this.files = new Set();      // every process file seen since boot
		this.pending = new Map();    // "<file>#<agent>" -> the after-turn wake already queued
		this.grace = new Set();      // "<file>#<phase>": sent to an agent mid-turn, so the turn that ends next is not this phase's
		this.pulse_after_ms ??= 1500;
	}

	// The same file, read fresh: null when it is not a process.
	read(file){
		let text; try { text = fs.readFileSync(file, "utf8"); } catch { return null; }
		const lines = text.split("\n").filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
		if (lines[0]?.class !== "Process") return null;
		return Process.replay(lines);
	}
	is_process(file){ try { return fs.readFileSync(file, "utf8").slice(0, 400).includes('"class":"Process"'); } catch { return false; } }

	url(file){ return "/" + path.relative(this.public, path.dirname(file)).split(path.sep).join("/") + "/"; }
	rel(p){ return path.relative(this.root, p).split(path.sep).join("/"); }

	// One appended line, stamped by node; through TaskLoop's per-file queue when there is one.
	write(file, line){
		const obj = { ...line, by: "ProcessRunner", at: stamp() };
		const tl = this.servex?.task_loop;
		return tl?.write_line ? tl.write_line(file, obj) : fs.promises.appendFile(file, JSON.stringify(obj) + "\n");
	}

	// Step a file until next() has nothing to do. Chained per file; never throws out.
	step(file){
		file = path.resolve(file);
		const next = (this.chains.get(file) ?? Promise.resolve()).then(() => this.run(file)).catch(e => this.say(`process-runner: ${this.rel(file)}: ${e.message || e}`));
		this.chains.set(file, next);
		return next;
	}

	async run(file){
		for (let i = 0; i < 20; i++){
			const p = this.read(file);
			if (!p) return;
			this.files.add(file);
			this.remember(p, file);
			const a = p.next();
			if (!a) return;
			if (a.start === true) await this.write(file, { start: {} });
			else if (a.complete){ await this.write(file, { complete: {} }); this.tell(p.creator, `Process ${this.url(file)} is complete: every phase is done.`); return; }
			else if (a.wait){
				const ph = p.phases.find(x => x.id === a.wait);
				await this.write(file, { [a.wait]: { wait: { on: "owner", what: ph?.get_one("do") ?? a.wait } } });
				this.tell(p.creator, `Process ${this.url(file)} waits on the owner: ${ph?.get_one("title") ?? a.wait}.`);
			}
			else if (a.halt){
				const agent = p.phases.find(x => x.id === a.halt)?.get_one("spawned")?.agent;
				try { if (agent) this.servex?.agents?.stop?.(agent, { by: "process-runner" }); } catch {}
				await this.write(file, { [a.halt]: { stop: { why: `the process was stopped${agent ? `; its agent ${agent} was stopped too` : ""}` } } });
			}
			else if (a.start) await this.write(file, { [a.start]: { start: {} } });
			else if (a.launch){ if (!(await this.launch(file, p, a.launch))) return; }
			else if (a.move){   // approved: the draft leaves the session for <module>/tasks/<id>/, and the run goes on from there
				const out = await move_home(file, a.move).catch(e => ({ why: e.message || String(e) }));
				if (out.why){ await this.write(file, { set: { home_refused: out.why } }); continue; }
				this.files.delete(file); this.files.add(out.file);
				for (const [k, v] of this.by_agent) if (v === file) this.by_agent.set(k, out.file);
				this.tell(p.creator, `Process ${out.from} moved home to ${out.to} (its plan is approved).`);
				this.step(out.file);
				return;
			}
		}
	}

	// Start the phase's session: fresh (spawn), same (the previous phase's agent), owner (the process's creator). False = held back.
	async launch(file, p, id){
		const ph = p.phases.find(x => x.id === id), s = ph.get_one("session") ?? {}, run = p.run_of(ph);
		const prompt = p.prompt(id, this.url(file)), agents = this.servex?.agents;
		if (!agents) return false;
		if (run === "fresh"){
			const hot = this.servex.monitor?.flag?.reason;
			if (hot){ if (!ph.get_one("queued")) await this.write(file, { queue: { phase: id, why: hot } }); return false; }
			const agent = agents.spawn({
				role: s.role ?? "helper", name: `${p.id}-${id}`.slice(0, 40), model: s.model, effort: s.effort,
				permission_mode: s.permission_mode ?? "bypassPermissions", prompt,
				task: { dir: this.rel(path.join(path.dirname(file), id)), title: `${p.get_one("title") ?? p.id}: ${ph.get_one("title") ?? id}`, ...(p.get_one("brief") ? { brief: p.get_one("brief") } : {}) },
			});
			await this.write(file, { spawn: { phase: id, run, agent: agent.id, session_id: agent.session_id ?? null, cost_before: 0 } });
			this.by_agent.set(agent.id, file);
			return true;
		}
		const to = run === "same" ? this.previous_agent(p, id) : p.creator;
		try {
			if (!to) throw new Error(run === "same" ? "no earlier phase has an agent" : "the process names no creator");
			if (agents.live?.get?.(to)?.state === "working") this.grace.add(`${file}#${id}`);   // run 1: the plan phase was pulsed by the investigate turn's own end
			agents.send(to, prompt, { from: "process-runner" });
		} catch (e){   // nobody to send it to: the phase waits on whoever made the process, and says why
			await this.write(file, { [id]: { wait: { on: p.creator ?? "owner", what: `run the ${id} phase (${e.message || e})` } } });
			return false;
		}
		await this.write(file, { spawn: { phase: id, run, agent: to, session_id: null, cost_before: this.cost_of(to) } });
		this.by_agent.set(to, file);
		return true;
	}

	previous_agent(p, id){
		const at = p.phases.findIndex(x => x.id === id);
		return p.phases.slice(0, at).reverse().find(x => x.get_one("spawned")?.agent)?.get_one("spawned").agent ?? null;
	}

	remember(p, file){ for (const ph of p.phases){ const a = ph.get_one("spawned")?.agent; if (a && ph.state === "running") this.by_agent.set(a, file); } }

	cost_of(id){
		const live = this.servex?.agents?.live?.get?.(id);
		const n = Number(live?.cost ?? this.servex?.agents?.registry_list?.().find(r => r.id === id)?.cost);
		return Number.isFinite(n) ? n : 0;
	}

	// An agent ended a turn (Agents.js result). Measure what it finished; pulse a phase it left open.
	turn_ended(agent){
		const file = this.by_agent.get(agent?.id);
		if (!file) return;
		setTimeout(() => this.queue_turn(file, agent.id), this.pulse_after_ms).unref?.();
	}

	// After-turn work joins the file's chain, so two turn ends never both measure one phase (run 1 wrote review's cost twice).
	// A second wake for the same agent while one is still queued is the same turn end (run 1 got two): it joins the first.
	queue_turn(file, id){
		file = path.resolve(file);
		const key = `${file}#${id}`;
		if (this.pending.has(key)) return this.pending.get(key);
		const next = (this.chains.get(file) ?? Promise.resolve()).then(() => { this.pending.delete(key); return this.after_turn(file, id, { chained: true }); }).catch(e => this.say(`process-runner: ${e.message || e}`));
		this.pending.set(key, next);
		this.chains.set(file, next);
		return next;
	}

	async after_turn(file, id, { chained = false } = {}){
		const p = this.read(file);
		if (!p) return;
		const url = this.url(file);
		// Still working: a message queued during the turn (the next phase's prompt, a pulse) starts another turn, which ends here again.
		const busy = this.servex?.agents?.live?.get?.(id)?.state === "working";
		let holds = false;
		for (const ph of p.phases){
			const sp = ph.get_one("spawned");
			if (sp?.agent !== id) continue;
			if (ph.state === "complete" && !ph.get_one("measure")){
				const usd = Math.max(0, this.cost_of(id) - (Number(sp.cost_before) || 0));
				await this.write(file, { measure: { phase: ph.id, agent: id, usd: Number(usd.toFixed(4)), shared: sp.run !== "fresh" } });
			}
			if (ph.state !== "running") continue;
			holds = true;
			if (busy) continue;
			if (this.grace.delete(`${path.resolve(file)}#${ph.id}`)) continue;   // that turn began before this phase was sent
			const n = Number(ph.get_one("pulses")) || 0;
			if (n < 1){
				const line = `item({path: "${url}", delta: {"${ph.id}": {"complete": {"outcome": "…", "evidence": ["…"]}}}})`;
				try { this.servex.agents.send(id, `The ${ph.id} phase of ${url} is not recorded as complete. If it is done, record it: ${line}. If something blocks it, write {"${ph.id}": {"wait": {"on": "<who>", "what": "<what you need>"}}} with the same tool.`, { from: "process-runner" }); } catch {}
				await this.write(file, { pulse: { phase: ph.id, n: n + 1, agent: id } });
			} else {
				await this.write(file, { [ph.id]: { wait: { on: p.creator ?? "owner", what: `the ${ph.id} agent (${id}) ended ${n + 1} turns without completing the phase` } } });
				this.tell(p.creator, `Process ${url}: the ${ph.id} phase stalled (${id} ended ${n + 1} turns without completing it). It now waits on you.`);
			}
		}
		if (!holds) this.by_agent.delete(id);
		if (chained) await this.run(file); else await this.step(file);   // inside the chain, step() would wait on itself
	}

	// The retry and the resume: every process in today's and yesterday's sessions, plus any seen since boot.
	async tick(){
		const found = this.servex?.task_loop?.find_task_files?.() ?? [];
		for (const file of new Set([...found.filter(f => this.is_process(f)), ...this.files])) await this.step(file);
	}

	tell(to, text){ if (!to || to === "owner") return; try { this.servex?.agents?.send(to, text, { from: "process-runner" }); } catch {} }
	say(text){ try { this.servex?.say?.(text); } catch {} }
}
