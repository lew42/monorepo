import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ROOTS = ["public/framework", "public", ""];   // a module name is tried under each; the first existing folder wins
const FILE = "inbox.jsonl";

/* A module's inbox: `<module folder>/inbox.jsonl`, append-only, one line per essence of an owner ask.
 * Lines: {id, at, essence, source, from, size?, fix?, repeat_of?, obvious?}; later {outcome:{id, at, state, note, by}}.
 * FEEDBACK (the owner, 2026-10-23): module `ai` is the AI system mastermind's feedback inbox: `essence` = a problem, `fix` = the
 * suggested fix, `repeat_of` = the first line of the same problem. `repeats(id)` counts them; the tool wakes the mastermind
 * on the third, or at once for `obvious` (FEEDBACK_WAKE).
 * Design: Servex/doc/module-inbox.md. The reader is ModuleReview (Server/ModuleReview.mjs). */
export default class ModuleInbox {
	constructor(module, { repo = REPO } = {}){
		this.module = String(module ?? "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
		this.repo = repo;
		if (!this.module || this.module.split("/").includes("..")) throw new Error("module is required: a folder like ux/Dictate or Servex/agents");
		this.dir = ModuleInbox.resolve(this.module, repo);
		this.file = path.join(this.dir, FILE);
	}

	static resolve(module, repo = REPO){
		for (const root of ROOTS){
			const d = path.join(repo, root, module);
			try { if (fs.statSync(d).isDirectory()) return d; } catch {}
		}
		throw new Error(`no module folder: ${module}`);
	}

	/** Append one essence. `source` links the prompt it came from; a line is never rewritten. */
	add(essence, source, { from = "owner", size = null, fix = null, repeat_of = null, obvious = false } = {}){
		essence = String(essence ?? "").trim();
		if (!essence) throw new Error("essence is required: the point of the ask, in a sentence or two");
		if (!source) throw new Error("source is required: link the prompt the essence came from");
		if (repeat_of && !this.lines().some(l => l.id === repeat_of)) throw new Error(`repeat_of: no inbox line ${repeat_of} in ${this.module}`);
		const row = { id: "i-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), at: new Date().toISOString(), essence, source: String(source), from,
			...(size ? { size } : {}), ...(fix ? { fix: String(fix) } : {}), ...(repeat_of ? { repeat_of } : {}), ...(obvious ? { obvious: true } : {}) };
		fs.appendFileSync(this.file, JSON.stringify(row) + "\n");
		return row;
	}

	/** Record what the reviewing mastermind did with a line; the essence line stays untouched. */
	outcome(id, { state = "decided", note = "", by = "module-review" } = {}){
		if (!this.lines().some(l => l.id === id)) throw new Error(`no inbox line ${id} in ${this.module}`);
		fs.appendFileSync(this.file, JSON.stringify({ outcome: { id, at: new Date().toISOString(), state, note, by } }) + "\n");
		return { ok: true, id, state };
	}

	lines(){
		let text = ""; try { text = fs.readFileSync(this.file, "utf8"); } catch { return []; }
		const rows = [], out = new Map();
		for (const l of text.split("\n")){
			let j; try { j = JSON.parse(l); } catch { continue; }
			if (j?.outcome?.id) out.set(j.outcome.id, j.outcome); else if (j?.id && j.essence) rows.push(j);
		}
		return rows.map(r => ({ ...r, state: out.get(r.id)?.state ?? "unread", outcome: out.get(r.id) ?? null }));
	}
	unread(){ return this.lines().filter(l => l.state === "unread"); }

	/** How many times a problem was logged: its first line plus every line whose `repeat_of` names it. */
	repeats(id){
		const all = this.lines(), first = all.find(l => l.id === id)?.repeat_of ?? id;
		return all.filter(l => l.id === first || l.repeat_of === first).length;
	}

	/** Every module folder (repo-relative) that has an inbox file. */
	static modules(repo = REPO){
		const found = [];
		const walk = (d, depth) => {
			let ents; try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
			if (ents.some(e => e.isFile() && e.name === FILE)) found.push(path.relative(repo, d).split(path.sep).join("/"));
			if (depth > 6) return;
			for (const e of ents) if (e.isDirectory() && !["node_modules", ".git", "sessions"].includes(e.name) && !e.name.startsWith(".")) walk(path.join(d, e.name), depth + 1);
		};
		for (const r of ["public/framework", "Servex", "Server"]) walk(path.join(repo, r), 0);
		return found;
	}

	/** The MCP tool, in `mcp.tool()`'s shape. */
	static FEEDBACK = "ai";              // the module whose inbox is the AI system mastermind's feedback inbox
	static FEEDBACK_AGENT = "ai-system-mastermind";   // the live old-style one, if it still runs; a new one is a `mastermind` at FEEDBACK_PATH
	static FEEDBACK_LIVE = /^(ai-system-mastermind|mastermind-ai(-\d+)?)$/;
	static FEEDBACK_PATH = "public/framework/ai";
	static FEEDBACK_WAKE = 3;            // the repeat that wakes it

	/** Should this new line wake the feedback agent? A feedback line (has a fix) that is obvious, the third repeat (once), or a repeat after an outcome. */
	wake_for(row){
		if (this.module !== ModuleInbox.FEEDBACK || !row.fix) return null;
		if (row.obvious) return "obvious";
		const n = this.repeats(row.id), first = this.lines().find(l => l.id === (row.repeat_of ?? row.id));
		if (row.repeat_of && first?.outcome) return `back after it was marked ${first.outcome.state}`;   // the fix did not hold
		return n === ModuleInbox.FEEDBACK_WAKE ? `logged ${n} times` : null;
	}

	/** `servex` (optional) lets the tool wake the feedback agent; without it the line still lands and waits. */
	static tools({ servex = null } = {}){
		const json = f => (args = {}, ctx) => { try { return JSON.stringify(f(args, ctx)); } catch (e){ return JSON.stringify({ ok: false, why: e.message }); } };
		return [{
			name: "module_inbox",
			description: "Drop the ESSENCE of an owner ask into a module's inbox instead of reading that module's docs yourself."
				+ " A fresh mastermind for that module reads it later with the cached readme chain and decides. One or two sentences in the owner's terms, plus `source`: the prompt it came from, as a link."
				+ " With no `essence`, lists the module's unread lines.",
			inputSchema: { type: "object", required: ["module"], properties: {
				module: { type: "string", description: "The module folder: `ux/Dictate`, `core/Page`, `Servex/agents`." },
				essence: { type: "string", description: "The point of the ask, 1-2 sentences. Omit to list unread." },
				source: { type: "string", description: "Link to the prompt or requirements file it came from." },
				size: { type: "string", enum: ["small", "architecture"], description: "small: a readme-level ask. architecture: classes, moves, hierarchy; the reviewer reads architecture docs too." },
				fix: { type: "string", description: "FEEDBACK (module `ai`, the AI system mastermind's inbox): your suggested fix for the problem in `essence`." },
				repeat_of: { type: "string", description: "The id of an earlier line about the same problem (list unread first). The third time wakes the AI system mastermind." },
				obvious: { type: "boolean", description: "An obvious problem with a clear fix (give `fix` too; a line with no fix is an ask and wakes nobody): wakes the AI system mastermind at once." } } },
			handler: json((a, ctx) => {
				const inbox = new ModuleInbox(a.module);
				if (!a.essence) return { ok: true, module: inbox.module, unread: inbox.unread() };
				const line = inbox.add(a.essence, a.source, { from: ctx?.caller ?? "owner", size: a.size, fix: a.fix, repeat_of: a.repeat_of, obvious: a.obvious });
				const why = inbox.wake_for(line);
				let woke = null;
				if (why && servex?.agents) try {
					const text = `Feedback inbox (${why}): ${line.id}. Problem: ${line.essence} Suggested fix: ${line.fix} Source: ${line.source}. Fix it, then record an outcome line.`;
					// a live one (the old id, or a mastermind already spawned at the AI folder) gets the line; otherwise a normal mastermind is spawned at the AI folder, parentless (this is Servex itself)
					const live = [...servex.agents.live.values()].find(x => ModuleInbox.FEEDBACK_LIVE.test(x.id) && x.state !== "stopped");
					if (live){ servex.agents.send(live.id, text); woke = live.id; }
					else woke = servex.agents.spawn({ role: "mastermind", path: ModuleInbox.FEEDBACK_PATH, parent: null, prompt: text }).id;
				} catch (e){ woke = `not woken: ${e.message || e}`; }
				return { ok: true, module: inbox.module, line, repeats: line.fix ? inbox.repeats(line.id) : undefined, woke };
			})
		}];
	}
}
